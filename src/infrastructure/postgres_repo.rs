use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

use crate::domain::api_key::ApiKeyEnvironment;
use crate::domain::entities::{
    AlgerianInstitution, AuditRecord, InstitutionSectorType, InstitutionTenant,
    PublicInstitutionSummary, SaasUser, VaultEntry,
};
use crate::domain::ports::VaultRepository;
use crate::domain::value_objects::TenantId;
use crate::error::{VaultError, VaultResult};

/// PostgreSQL adapter implementing `VaultRepository`.
/// Logs only sanitized SQLSTATE codes on failure — never raw `sqlx::Error` Display strings.
#[derive(Clone)]
pub struct PostgresVaultRepository {
    pool: PgPool,
}

impl PostgresVaultRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    #[inline]
    pub fn pool(&self) -> &PgPool {
        &self.pool
    }

    /// Extracts only the non-sensitive PostgreSQL SQLSTATE code (e.g. `"23505"`) for telemetry,
    /// preventing raw SQL errors or bound values from leaking into structured logs.
    fn log_sanitized_db_error(operation: &'static str, err: &sqlx::Error) {
        let sql_state = match err {
            sqlx::Error::Database(db_err) => db_err.code().map(|c| c.into_owned()),
            sqlx::Error::PoolTimedOut => Some("POOL_TIMED_OUT".to_owned()),
            sqlx::Error::PoolClosed => Some("POOL_CLOSED".to_owned()),
            _ => Some("DB_IO_OR_PROTOCOL_ERROR".to_owned()),
        };
        tracing::error!(
            operation = operation,
            sql_state = sql_state.as_deref().unwrap_or("UNKNOWN"),
            "Vault database operation failed"
        );
    }
}

#[derive(FromRow)]
struct ActiveInstitutionRow {
    id: Uuid,
    name: String,
    sector_type: String,
}

#[derive(FromRow)]
struct InstitutionAuthRow {
    id: Uuid,
    name: String,
    sector_type: String,
    is_active: bool,
    api_key_prefix: Option<String>,
    key_environment: String,
    api_key_hash: String,
}

impl TryFrom<InstitutionAuthRow> for AlgerianInstitution {
    type Error = VaultError;

    fn try_from(row: InstitutionAuthRow) -> Result<Self, Self::Error> {
        Ok(AlgerianInstitution {
            id: row.id,
            name: row.name,
            institution_type: InstitutionSectorType::from_db_str(&row.sector_type)?,
            is_active: row.is_active,
            api_key_prefix: row.api_key_prefix,
            key_environment: ApiKeyEnvironment::from_db_str(&row.key_environment)?,
            api_key_hash: row.api_key_hash,
        })
    }
}

#[derive(FromRow)]
struct TenantRow {
    id: Uuid,
    institution_name: String,
    api_key_prefix: String,
    api_key_hash: String,
    is_active: bool,
}

#[derive(FromRow)]
struct SaasUserRow {
    id: Uuid,
    tenant_id: Uuid,
    email_blind_index: Vec<u8>,
    email_masked: String,
    phone_blind_index: Vec<u8>,
    phone_masked: String,
    email_verified: bool,
    phone_verified: bool,
    email_otp_hash: Option<Vec<u8>>,
    phone_otp_hash: Option<Vec<u8>>,
    otp_expires_at: Option<DateTime<Utc>>,
    otp_failed_attempts: i16,
    last_otp_sent_at: Option<DateTime<Utc>>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl TryFrom<SaasUserRow> for SaasUser {
    type Error = VaultError;

    fn try_from(row: SaasUserRow) -> Result<Self, Self::Error> {
        let email_blind_index: [u8; 32] = row
            .email_blind_index
            .try_into()
            .map_err(|_| VaultError::StorageFailure)?;

        let phone_blind_index: [u8; 32] = row
            .phone_blind_index
            .try_into()
            .map_err(|_| VaultError::StorageFailure)?;

        let email_otp_hash = match row.email_otp_hash {
            Some(vec) => Some(vec.try_into().map_err(|_| VaultError::StorageFailure)?),
            None => None,
        };

        let phone_otp_hash = match row.phone_otp_hash {
            Some(vec) => Some(vec.try_into().map_err(|_| VaultError::StorageFailure)?),
            None => None,
        };

        Ok(SaasUser {
            id: row.id,
            tenant_id: TenantId(row.tenant_id),
            email_blind_index,
            email_masked: row.email_masked,
            phone_blind_index,
            phone_masked: row.phone_masked,
            email_verified: row.email_verified,
            phone_verified: row.phone_verified,
            email_otp_hash,
            phone_otp_hash,
            otp_expires_at: row.otp_expires_at,
            otp_failed_attempts: row.otp_failed_attempts,
            last_otp_sent_at: row.last_otp_sent_at,
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
    }
}

#[derive(FromRow)]
struct VaultEntryRow {
    id: Uuid,
    tenant_id: Uuid,
    account_blind_index: Vec<u8>,
    masked_preview: String,
    nonce: Vec<u8>,
    ciphertext: Vec<u8>,
    key_version: i16,
    is_enabled: bool,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl TryFrom<VaultEntryRow> for VaultEntry {
    type Error = VaultError;

    fn try_from(row: VaultEntryRow) -> Result<Self, Self::Error> {
        let account_blind_index: [u8; 32] = row
            .account_blind_index
            .try_into()
            .map_err(|_| VaultError::StorageFailure)?;

        let nonce: [u8; 12] = row
            .nonce
            .try_into()
            .map_err(|_| VaultError::StorageFailure)?;

        Ok(VaultEntry {
            id: row.id,
            tenant_id: TenantId(row.tenant_id),
            account_blind_index,
            masked_preview: row.masked_preview,
            nonce,
            ciphertext: row.ciphertext,
            key_version: row.key_version,
            is_enabled: row.is_enabled,
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
    }
}

#[async_trait]
impl VaultRepository for PostgresVaultRepository {
    async fn list_active_institutions(&self) -> VaultResult<Vec<PublicInstitutionSummary>> {
        let rows = sqlx::query_as::<_, ActiveInstitutionRow>(
            r#"
            SELECT id, name, "type"::TEXT AS sector_type
            FROM institutions
            WHERE is_active = TRUE
            ORDER BY name ASC
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| {
            Self::log_sanitized_db_error("list_active_institutions", &e);
            VaultError::StorageFailure
        })?;

        let mut list = Vec::with_capacity(rows.len());
        for row in rows {
            let institution_type = InstitutionSectorType::from_db_str(&row.sector_type)?;
            list.push(PublicInstitutionSummary {
                id: row.id,
                name: row.name,
                institution_type,
            });
        }

        Ok(list)
    }

    async fn find_active_institution_by_api_key_hash(
        &self,
        api_key_sha256_hex: &str,
    ) -> VaultResult<Option<AlgerianInstitution>> {
        let row = sqlx::query_as::<_, InstitutionAuthRow>(
            r#"
            SELECT
                id,
                name,
                "type"::TEXT AS sector_type,
                is_active,
                api_key_prefix,
                key_environment,
                api_key_hash
            FROM institutions
            WHERE api_key_hash = $1 AND is_active = TRUE
            "#,
        )
        .bind(api_key_sha256_hex)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| {
            Self::log_sanitized_db_error("find_active_institution_by_api_key_hash", &e);
            VaultError::StorageFailure
        })?;

        row.map(AlgerianInstitution::try_from).transpose()
    }

    async fn update_institution_api_key_hash(
        &self,
        institution_id: Uuid,
        api_key_prefix: &str,
        api_key_sha256_hex: &str,
        environment: ApiKeyEnvironment,
    ) -> VaultResult<AlgerianInstitution> {
        let mut tx = self.pool.begin().await.map_err(|e| {
            Self::log_sanitized_db_error("update_institution_api_key_hash.begin", &e);
            VaultError::StorageFailure
        })?;

        let row = sqlx::query_as::<_, InstitutionAuthRow>(
            r#"
            UPDATE institutions
            SET
                api_key_prefix = $2,
                api_key_hash = $3,
                key_environment = $4,
                last_api_key_rotated_at = NOW(),
                updated_at = NOW()
            WHERE id = $1 AND is_active = TRUE
            RETURNING
                id,
                name,
                "type"::TEXT AS sector_type,
                is_active,
                api_key_prefix,
                key_environment,
                api_key_hash
            "#,
        )
        .bind(institution_id)
        .bind(api_key_prefix)
        .bind(api_key_sha256_hex)
        .bind(environment.as_db_str())
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| {
            Self::log_sanitized_db_error("update_institution_api_key_hash.update", &e);
            VaultError::StorageFailure
        })?;

        let Some(row) = row else {
            return Err(VaultError::NotFound);
        };

        let institution = AlgerianInstitution::try_from(row)?;

        // Synchronize into `institution_tenants` so vault/audit/link foreign keys stay valid
        sqlx::query(
            r#"
            INSERT INTO institution_tenants (
                id,
                institution_name,
                api_key_prefix,
                api_key_hash,
                hmac_signing_key_encrypted,
                is_active,
                created_at,
                updated_at
            )
            VALUES ($1, $2, $3, $4, decode(repeat('00', 32), 'hex'), TRUE, NOW(), NOW())
            ON CONFLICT (id)
            DO UPDATE SET
                institution_name = EXCLUDED.institution_name,
                api_key_prefix = EXCLUDED.api_key_prefix,
                api_key_hash = EXCLUDED.api_key_hash,
                is_active = TRUE,
                updated_at = NOW()
            "#,
        )
        .bind(institution.id)
        .bind(&institution.name)
        .bind(api_key_prefix)
        .bind(api_key_sha256_hex)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            Self::log_sanitized_db_error("update_institution_api_key_hash.sync_tenant", &e);
            VaultError::StorageFailure
        })?;

        tx.commit().await.map_err(|e| {
            Self::log_sanitized_db_error("update_institution_api_key_hash.commit", &e);
            VaultError::StorageFailure
        })?;

        Ok(institution)
    }

    async fn find_active_tenant_by_prefix(
        &self,
        api_key_prefix: &str,
    ) -> VaultResult<Option<InstitutionTenant>> {
        let row = sqlx::query_as::<_, TenantRow>(
            r#"
            SELECT id, institution_name, api_key_prefix, api_key_hash, is_active
            FROM institution_tenants
            WHERE api_key_prefix = $1 AND is_active = TRUE
            "#,
        )
        .bind(api_key_prefix)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| {
            Self::log_sanitized_db_error("find_active_tenant_by_prefix", &e);
            VaultError::StorageFailure
        })?;

        Ok(row.map(|r| InstitutionTenant {
            id: TenantId(r.id),
            institution_name: r.institution_name,
            api_key_prefix: r.api_key_prefix,
            api_key_hash: r.api_key_hash,
            is_active: r.is_active,
        }))
    }

    async fn find_saas_user_by_id(&self, user_id: Uuid) -> VaultResult<Option<SaasUser>> {
        let row = sqlx::query_as::<_, SaasUserRow>(
            r#"
            SELECT
                id,
                tenant_id,
                email_blind_index,
                email_masked,
                phone_blind_index,
                phone_masked,
                email_verified,
                phone_verified,
                email_otp_hash,
                phone_otp_hash,
                otp_expires_at,
                otp_failed_attempts,
                last_otp_sent_at,
                created_at,
                updated_at
            FROM saas_users
            WHERE id = $1
            "#,
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| {
            Self::log_sanitized_db_error("find_saas_user_by_id", &e);
            VaultError::StorageFailure
        })?;

        row.map(SaasUser::try_from).transpose()
    }

    async fn find_saas_user_by_contact_index(
        &self,
        email_blind_index: &[u8; 32],
        phone_blind_index: &[u8; 32],
    ) -> VaultResult<Option<SaasUser>> {
        let row = sqlx::query_as::<_, SaasUserRow>(
            r#"
            SELECT
                id,
                tenant_id,
                email_blind_index,
                email_masked,
                phone_blind_index,
                phone_masked,
                email_verified,
                phone_verified,
                email_otp_hash,
                phone_otp_hash,
                otp_expires_at,
                otp_failed_attempts,
                last_otp_sent_at,
                created_at,
                updated_at
            FROM saas_users
            WHERE email_blind_index = $1 OR phone_blind_index = $2
            LIMIT 1
            "#,
        )
        .bind(&email_blind_index[..])
        .bind(&phone_blind_index[..])
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| {
            Self::log_sanitized_db_error("find_saas_user_by_contact_index", &e);
            VaultError::StorageFailure
        })?;

        row.map(SaasUser::try_from).transpose()
    }

    async fn upsert_pending_saas_user(&self, user: &SaasUser) -> VaultResult<SaasUser> {
        let email_otp_slice = user.email_otp_hash.as_ref().map(|h| &h[..]);
        let phone_otp_slice = user.phone_otp_hash.as_ref().map(|h| &h[..]);

        let row = sqlx::query_as::<_, SaasUserRow>(
            r#"
            INSERT INTO saas_users (
                id,
                tenant_id,
                email_blind_index,
                email_masked,
                phone_blind_index,
                phone_masked,
                email_verified,
                phone_verified,
                email_otp_hash,
                phone_otp_hash,
                otp_expires_at,
                otp_failed_attempts,
                last_otp_sent_at,
                created_at,
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, FALSE, FALSE, $7, $8, $9, 0, $10, $11, $12)
            ON CONFLICT (email_blind_index)
            DO UPDATE SET
                phone_blind_index = EXCLUDED.phone_blind_index,
                phone_masked = EXCLUDED.phone_masked,
                email_otp_hash = EXCLUDED.email_otp_hash,
                phone_otp_hash = EXCLUDED.phone_otp_hash,
                otp_expires_at = EXCLUDED.otp_expires_at,
                otp_failed_attempts = 0,
                last_otp_sent_at = EXCLUDED.last_otp_sent_at,
                updated_at = EXCLUDED.updated_at
            RETURNING
                id,
                tenant_id,
                email_blind_index,
                email_masked,
                phone_blind_index,
                phone_masked,
                email_verified,
                phone_verified,
                email_otp_hash,
                phone_otp_hash,
                otp_expires_at,
                otp_failed_attempts,
                last_otp_sent_at,
                created_at,
                updated_at
            "#,
        )
        .bind(user.id)
        .bind(user.tenant_id.0)
        .bind(&user.email_blind_index[..])
        .bind(&user.email_masked)
        .bind(&user.phone_blind_index[..])
        .bind(&user.phone_masked)
        .bind(email_otp_slice)
        .bind(phone_otp_slice)
        .bind(user.otp_expires_at)
        .bind(user.last_otp_sent_at)
        .bind(user.created_at)
        .bind(user.updated_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| {
            Self::log_sanitized_db_error("upsert_pending_saas_user", &e);
            VaultError::StorageFailure
        })?;

        SaasUser::try_from(row)
    }

    async fn mark_saas_user_fully_verified(&self, user_id: Uuid) -> VaultResult<SaasUser> {
        let row = sqlx::query_as::<_, SaasUserRow>(
            r#"
            UPDATE saas_users
            SET
                email_verified = TRUE,
                phone_verified = TRUE,
                email_otp_hash = NULL,
                phone_otp_hash = NULL,
                otp_expires_at = NULL,
                otp_failed_attempts = 0,
                updated_at = NOW()
            WHERE id = $1
            RETURNING
                id,
                tenant_id,
                email_blind_index,
                email_masked,
                phone_blind_index,
                phone_masked,
                email_verified,
                phone_verified,
                email_otp_hash,
                phone_otp_hash,
                otp_expires_at,
                otp_failed_attempts,
                last_otp_sent_at,
                created_at,
                updated_at
            "#,
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| {
            Self::log_sanitized_db_error("mark_saas_user_fully_verified", &e);
            VaultError::StorageFailure
        })?
        .ok_or(VaultError::NotFound)?;

        SaasUser::try_from(row)
    }

    async fn increment_saas_user_otp_failures(&self, user_id: Uuid) -> VaultResult<i16> {
        let attempts: Option<(i16,)> = sqlx::query_as(
            r#"
            UPDATE saas_users
            SET
                otp_failed_attempts = otp_failed_attempts + 1,
                -- Automatically wipe active OTP hashes on 5th failed attempt to defeat brute-force
                email_otp_hash = CASE WHEN otp_failed_attempts + 1 >= 5 THEN NULL ELSE email_otp_hash END,
                phone_otp_hash = CASE WHEN otp_failed_attempts + 1 >= 5 THEN NULL ELSE phone_otp_hash END,
                updated_at = NOW()
            WHERE id = $1
            RETURNING otp_failed_attempts
            "#,
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| {
            Self::log_sanitized_db_error("increment_saas_user_otp_failures", &e);
            VaultError::StorageFailure
        })?;

        Ok(attempts.map(|t| t.0).unwrap_or(5))
    }

    async fn upsert_vault_entry(&self, entry: &VaultEntry) -> VaultResult<VaultEntry> {
        let row = sqlx::query_as::<_, VaultEntryRow>(
            r#"
            INSERT INTO anti_phishing_vault_entries (
                id,
                tenant_id,
                account_blind_index,
                masked_preview,
                nonce,
                ciphertext,
                key_version,
                is_enabled,
                created_at,
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (tenant_id, account_blind_index)
            DO UPDATE SET
                masked_preview = EXCLUDED.masked_preview,
                nonce = EXCLUDED.nonce,
                ciphertext = EXCLUDED.ciphertext,
                key_version = EXCLUDED.key_version,
                is_enabled = TRUE,
                updated_at = EXCLUDED.updated_at
            RETURNING
                id,
                tenant_id,
                account_blind_index,
                masked_preview,
                nonce,
                ciphertext,
                key_version,
                is_enabled,
                created_at,
                updated_at
            "#,
        )
        .bind(entry.id)
        .bind(entry.tenant_id.0)
        .bind(&entry.account_blind_index[..])
        .bind(&entry.masked_preview)
        .bind(&entry.nonce[..])
        .bind(&entry.ciphertext)
        .bind(entry.key_version)
        .bind(entry.is_enabled)
        .bind(entry.created_at)
        .bind(entry.updated_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| {
            Self::log_sanitized_db_error("upsert_vault_entry", &e);
            VaultError::StorageFailure
        })?;

        VaultEntry::try_from(row)
    }

    async fn find_vault_entry(
        &self,
        tenant_id: TenantId,
        account_blind_index: &[u8; 32],
    ) -> VaultResult<Option<VaultEntry>> {
        let row = sqlx::query_as::<_, VaultEntryRow>(
            r#"
            SELECT
                id,
                tenant_id,
                account_blind_index,
                masked_preview,
                nonce,
                ciphertext,
                key_version,
                is_enabled,
                created_at,
                updated_at
            FROM anti_phishing_vault_entries
            WHERE tenant_id = $1 AND account_blind_index = $2
            "#,
        )
        .bind(tenant_id.0)
        .bind(&account_blind_index[..])
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| {
            Self::log_sanitized_db_error("find_vault_entry", &e);
            VaultError::StorageFailure
        })?;

        row.map(VaultEntry::try_from).transpose()
    }

    async fn append_audit_log<'a>(&self, record: AuditRecord<'a>) -> VaultResult<()> {
        sqlx::query(
            r#"
            INSERT INTO vault_audit_logs (
                id,
                tenant_id,
                account_blind_index,
                event_type,
                actor_ip,
                succeeded,
                reason
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            "#,
        )
        .bind(Uuid::now_v7())
        .bind(record.tenant_id.0)
        .bind(&record.account_blind_index[..])
        .bind(record.event_type)
        .bind(record.actor_ip)
        .bind(record.succeeded)
        .bind(record.reason)
        .execute(&self.pool)
        .await
        .map_err(|e| {
            Self::log_sanitized_db_error("append_audit_log", &e);
            VaultError::StorageFailure
        })?;

        Ok(())
    }
}
