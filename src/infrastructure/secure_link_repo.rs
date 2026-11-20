use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

use crate::domain::ports::{ConsumedSecureLink, NewSecureLink, SecureLinkRepository};
use crate::domain::value_objects::TenantId;
use crate::error::{VaultError, VaultResult};

/// PostgreSQL adapter for `secure_links`. Logs only SQLSTATE codes, never bound values
/// (target URLs may contain customer-specific query parameters).
#[derive(Clone)]
pub struct PostgresSecureLinkRepository {
    pool: PgPool,
}

impl PostgresSecureLinkRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    fn storage_err(operation: &'static str, err: &sqlx::Error) -> VaultError {
        let sqlstate = err
            .as_database_error()
            .and_then(|db| db.code().map(|c| c.into_owned()))
            .unwrap_or_else(|| "N/A".to_owned());
        tracing::error!(operation, sqlstate = %sqlstate, "secure_links storage failure");
        VaultError::StorageFailure
    }
}

#[derive(FromRow)]
struct ConsumedRow {
    tenant_id: Uuid,
    account_blind_index: Vec<u8>,
    target_url: String,
    institution_name: String,
    max_resolutions: i16,
    resolution_count: i16,
    expires_at: DateTime<Utc>,
}

#[async_trait]
impl SecureLinkRepository for PostgresSecureLinkRepository {
    async fn tenant_allowed_link_domains(&self, tenant_id: TenantId) -> VaultResult<Vec<String>> {
        let row: Option<(Vec<String>,)> = sqlx::query_as(
            "SELECT allowed_link_domains FROM institution_tenants WHERE id = $1 AND is_active = TRUE",
        )
        .bind(tenant_id.0)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| Self::storage_err("tenant_allowed_link_domains", &e))?;

        Ok(row.map(|r| r.0).unwrap_or_default())
    }

    async fn insert_secure_links(&self, links: &[NewSecureLink<'_>]) -> VaultResult<()> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| Self::storage_err("insert_secure_links.begin", &e))?;

        for link in links {
            sqlx::query(
                r#"
                INSERT INTO secure_links
                    (id, token_sha256, tenant_id, account_blind_index, target_url,
                     max_resolutions, expires_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                "#,
            )
            .bind(link.id)
            .bind(&link.token_sha256[..])
            .bind(link.tenant_id.0)
            .bind(&link.account_blind_index[..])
            .bind(link.target_url)
            .bind(link.max_resolutions)
            .bind(link.expires_at)
            .execute(&mut *tx)
            .await
            .map_err(|e| Self::storage_err("insert_secure_links.insert", &e))?;
        }

        tx.commit()
            .await
            .map_err(|e| Self::storage_err("insert_secure_links.commit", &e))
    }

    async fn consume_secure_link(
        &self,
        token_sha256: &[u8; 32],
    ) -> VaultResult<Option<ConsumedSecureLink>> {
        // Single atomic statement: no TOCTOU race between "check budget" and "increment".
        let row = sqlx::query_as::<_, ConsumedRow>(
            r#"
            UPDATE secure_links AS l
            SET resolution_count = l.resolution_count + 1,
                last_resolved_at = NOW()
            FROM institution_tenants AS t
            WHERE l.token_sha256 = $1
              AND t.id = l.tenant_id
              AND t.is_active = TRUE
              AND l.is_revoked = FALSE
              AND l.expires_at > NOW()
              AND l.resolution_count < l.max_resolutions
            RETURNING l.tenant_id, l.account_blind_index, l.target_url,
                      t.institution_name, l.max_resolutions, l.resolution_count, l.expires_at
            "#,
        )
        .bind(&token_sha256[..])
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| Self::storage_err("consume_secure_link", &e))?;

        row.map(|r| {
            let account_blind_index: [u8; 32] = r
                .account_blind_index
                .try_into()
                .map_err(|_| VaultError::StorageFailure)?;
            Ok(ConsumedSecureLink {
                tenant_id: TenantId(r.tenant_id),
                account_blind_index,
                target_url: r.target_url,
                institution_name: r.institution_name,
                remaining_resolutions: r.max_resolutions - r.resolution_count,
                expires_at: r.expires_at,
            })
        })
        .transpose()
    }
}
