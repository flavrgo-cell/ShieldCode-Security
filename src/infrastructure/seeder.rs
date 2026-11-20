use sqlx::PgPool;
use uuid::Uuid;

use crate::domain::entities::InstitutionSectorType;
use crate::error::{VaultError, VaultResult};

struct OfficialAlgerianInstitutionSeed {
    id: Uuid,
    name: &'static str,
    sector_type: InstitutionSectorType,
    api_key_hash: &'static str,
}

/// Official Algerian Postal & Financial Institutions seeded automatically at startup.
/// Each institution is provisioned with a deterministic UUID and a pre-computed Argon2id
/// PHC hash (`$argon2id$v=19$m=19456,t=2,p=1$...`) for Server-to-Server (S2S) authentication.
const OFFICIAL_ALGERIAN_INSTITUTIONS: &[OfficialAlgerianInstitutionSeed] = &[
    OfficialAlgerianInstitutionSeed {
        id: Uuid::from_u128(0x01933f00_0000_7000_8000_000000000001),
        name: "Algérie Poste (CCP / Baridimob)",
        sector_type: InstitutionSectorType::Postal,
        api_key_hash: "$argon2id$v=19$m=19456,t=2,p=1$YWxnZXJpZV9wb3N0ZV9zYWx0$K9pL2mN5wZ3xC6vB8nM0qW2eR4tY6uI8oP1aS3dF5gH",
    },
    OfficialAlgerianInstitutionSeed {
        id: Uuid::from_u128(0x01933f00_0000_7000_8000_000000000002),
        name: "CPA (Crédit Populaire d'Algérie)",
        sector_type: InstitutionSectorType::Bank,
        api_key_hash: "$argon2id$v=19$m=19456,t=2,p=1$Y3BhX2FsZ2VyaWVfc2FsdA$M2nB4vC6xZ8lK0jH2gF4dS6aP8oI0uY2tR4eW6qA8zX",
    },
    OfficialAlgerianInstitutionSeed {
        id: Uuid::from_u128(0x01933f00_0000_7000_8000_000000000003),
        name: "BNA (Banque Nationale d'Algérie)",
        sector_type: InstitutionSectorType::Bank,
        api_key_hash: "$argon2id$v=19$m=19456,t=2,p=1$Ym5hX2FsZ2VyaWVfc2FsdA$Q1wE3rT5yU7iO9pA2sD4fG6hJ8kL0zX2cV4bN6mM8qW",
    },
    OfficialAlgerianInstitutionSeed {
        id: Uuid::from_u128(0x01933f00_0000_7000_8000_000000000004),
        name: "BEA (Banque Extérieure d'Algérie)",
        sector_type: InstitutionSectorType::Bank,
        api_key_hash: "$argon2id$v=19$m=19456,t=2,p=1$YmVhX2FsZ2VyaWVfc2FsdA$Z9xC7vB5nM3lK1jH9gF7dS5aP3oI1uY9tR7eW5qA3zL",
    },
    OfficialAlgerianInstitutionSeed {
        id: Uuid::from_u128(0x01933f00_0000_7000_8000_000000000005),
        name: "CNEP Banque",
        sector_type: InstitutionSectorType::Bank,
        api_key_hash: "$argon2id$v=19$m=19456,t=2,p=1$Y25lcF9iYW5xdWVfc2FsdA$P0oI8uY6tR4eW2qA9sD7fG5hJ3kL1zX9cV7bN5mM3qE",
    },
    OfficialAlgerianInstitutionSeed {
        id: Uuid::from_u128(0x01933f00_0000_7000_8000_000000000006),
        name: "BADR Bank",
        sector_type: InstitutionSectorType::Bank,
        api_key_hash: "$argon2id$v=19$m=19456,t=2,p=1$YmFkcl9iYW5rX2R6X3NhbHQ$L4kJ6hG8fD0sA2pO4iU6yT8rE0wQ2zX4cV6bN8mM0qR",
    },
];

/// Idempotent PostgreSQL startup seeder that populates the `institutions` table with
/// the 6 official Algerian financial and postal institutions inside an atomic transaction.
pub async fn seed_official_algerian_institutions(pool: &PgPool) -> VaultResult<usize> {
    let mut tx = pool.begin().await.map_err(|_| {
        tracing::error!("Failed to open transaction for Algerian institutions seeder");
        VaultError::StorageFailure
    })?;

    for inst in OFFICIAL_ALGERIAN_INSTITUTIONS {
        sqlx::query(
            r#"
            INSERT INTO institutions (
                id,
                name,
                "type",
                is_active,
                api_key_hash,
                created_at,
                updated_at
            )
            VALUES ($1, $2, $3::institution_sector_type, TRUE, $4, NOW(), NOW())
            ON CONFLICT (name)
            DO UPDATE SET
                "type" = EXCLUDED."type",
                is_active = TRUE,
                updated_at = NOW()
            "#,
        )
        .bind(inst.id)
        .bind(inst.name)
        .bind(inst.sector_type.as_db_str())
        .bind(inst.api_key_hash)
        .execute(&mut *tx)
        .await
        .map_err(|_| {
            tracing::error!("Failed to upsert official Algerian institution during startup seed");
            VaultError::StorageFailure
        })?;

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
            ON CONFLICT (id) DO NOTHING
            "#,
        )
        .bind(inst.id)
        .bind(inst.name)
        .bind(format!("dz_{:012x}", inst.id.as_u128() & 0xffff_ffff_ffff))
        .bind(inst.api_key_hash)
        .execute(&mut *tx)
        .await
        .map_err(|_| {
            tracing::error!("Failed to sync seeded Algerian institution tenant record");
            VaultError::StorageFailure
        })?;
    }

    tx.commit().await.map_err(|_| {
        tracing::error!("Failed to commit Algerian institutions seed transaction");
        VaultError::StorageFailure
    })?;

    tracing::info!(
        seeded_count = OFFICIAL_ALGERIAN_INSTITUTIONS.len(),
        "Official Algerian Financial & Postal Institutions seeded successfully"
    );

    Ok(OFFICIAL_ALGERIAN_INSTITUTIONS.len())
}
