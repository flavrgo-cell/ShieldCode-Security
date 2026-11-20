use std::fmt;
use std::sync::Arc;

use chrono::{DateTime, Utc};
use uuid::Uuid;
use zeroize::Zeroizing;

use crate::domain::api_key::{
    constant_time_hash_matches, generate_api_key, parse_and_hash_api_key, ApiKeyEnvironment,
};
use crate::domain::entities::AlgerianInstitution;
use crate::domain::ports::VaultRepository;
use crate::error::{VaultError, VaultResult};

/// Output returned ONCE when an Algerian bank/institution generates or rotates its API key.
/// Custom `Debug` strictly redacts `raw_api_key`.
pub struct ProvisionedApiKeyOutput {
    pub institution_id: Uuid,
    pub institution_name: String,
    pub raw_api_key: Zeroizing<String>,
    pub key_prefix: String,
    pub environment: ApiKeyEnvironment,
    pub issued_at: DateTime<Utc>,
}

impl fmt::Debug for ProvisionedApiKeyOutput {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("ProvisionedApiKeyOutput")
            .field("institution_id", &self.institution_id)
            .field("institution_name", &self.institution_name)
            .field("raw_api_key", &"[REDACTED]")
            .field("key_prefix", &self.key_prefix)
            .field("environment", &self.environment)
            .field("issued_at", &self.issued_at)
            .finish()
    }
}

/// Application Service responsible for generating `sc_live_` / `sc_test_` B2B API keys,
/// persisting ONLY their SHA-256 hash in PostgreSQL `institutions`, and authenticating
/// incoming `x-api-key` headers.
pub struct ApiKeyManagementService {
    repo: Arc<dyn VaultRepository>,
}

impl ApiKeyManagementService {
    pub fn new(repo: Arc<dyn VaultRepository>) -> Self {
        Self { repo }
    }

    /// Generates a new CSPRNG key (`sc_live_...` or `sc_test_...`) using `OsRng`, persists ONLY
    /// its SHA-256 hex digest into `institutions.api_key_hash`, and returns the plaintext key
    /// once (wrapped in `Zeroizing<String>`).
    pub async fn provision_institution_key(
        &self,
        institution_id: Uuid,
        env: ApiKeyEnvironment,
    ) -> VaultResult<ProvisionedApiKeyOutput> {
        let generated = generate_api_key(env);

        let institution = self
            .repo
            .update_institution_api_key_hash(
                institution_id,
                &generated.prefix,
                &generated.sha256_hash_hex,
                generated.environment,
            )
            .await?;

        tracing::info!(
            institution_id = %institution.id,
            key_prefix = %generated.prefix,
            environment = generated.environment.as_db_str(),
            "Provisioned SHA-256 hashed B2B institution API key"
        );

        Ok(ProvisionedApiKeyOutput {
            institution_id: institution.id,
            institution_name: institution.name,
            raw_api_key: generated.raw_key,
            key_prefix: generated.prefix,
            environment: generated.environment,
            issued_at: Utc::now(),
        })
    }

    /// Validates an incoming `x-api-key` header value:
    /// 1. Validates `sc_live_` / `sc_test_` syntax.
    /// 2. Computes SHA-256 digest of the incoming key.
    /// 3. Queries active institution in PostgreSQL by SHA-256 hex digest.
    /// 4. Performs constant-time verification against the stored SHA-256 hash.
    pub async fn authenticate_x_api_key(
        &self,
        raw_header_value: &str,
    ) -> VaultResult<(AlgerianInstitution, ApiKeyEnvironment)> {
        let (env, sha256_hex, digest_bytes) = parse_and_hash_api_key(raw_header_value)?;

        let institution = self
            .repo
            .find_active_institution_by_api_key_hash(&sha256_hex)
            .await?
            .ok_or(VaultError::Unauthorized(
                "Invalid, revoked, or unrecognized x-api-key",
            ))?;

        if !constant_time_hash_matches(&digest_bytes, &institution.api_key_hash) {
            return Err(VaultError::Unauthorized("x-api-key verification failed"));
        }

        if institution.key_environment != env {
            return Err(VaultError::Unauthorized(
                "x-api-key prefix environment does not match active institution credential",
            ));
        }

        Ok((institution, env))
    }
}
