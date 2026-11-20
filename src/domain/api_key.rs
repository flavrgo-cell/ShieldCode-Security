//! B2B Bank API Key generation & SHA-256 verification (pure domain primitives).
//!
//! * Secret keys are generated with 256 bits of CSPRNG entropy (`OsRng`) and prefixed with
//!   `sc_live_` (production carrier dispatch) or `sc_test_` (sandbox simulation).
//! * Only the SHA-256 hex digest is stored in `institutions.api_key_hash`; raw keys are
//!   zeroized from memory on drop and never persisted or written to logs.

use std::fmt;

use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine;
use rand::rngs::OsRng;
use rand::RngCore;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use subtle::ConstantTimeEq;
use zeroize::Zeroizing;

use crate::error::{VaultError, VaultResult};

pub const LIVE_API_KEY_PREFIX: &str = "sc_live_";
pub const TEST_API_KEY_PREFIX: &str = "sc_test_";
const API_KEY_ENTROPY_BYTES: usize = 32;
const MIN_RAW_KEY_LEN: usize = 24;
const MAX_RAW_KEY_LEN: usize = 128;

/// Environment scope embedded in the API key prefix (`sc_live_` vs `sc_test_`).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ApiKeyEnvironment {
    Live,
    Test,
}

impl ApiKeyEnvironment {
    pub const fn prefix(self) -> &'static str {
        match self {
            Self::Live => LIVE_API_KEY_PREFIX,
            Self::Test => TEST_API_KEY_PREFIX,
        }
    }

    pub const fn as_db_str(self) -> &'static str {
        match self {
            Self::Live => "live",
            Self::Test => "test",
        }
    }

    pub fn from_db_str(raw: &str) -> VaultResult<Self> {
        match raw {
            "live" => Ok(Self::Live),
            "test" => Ok(Self::Test),
            _ => Err(VaultError::StorageFailure),
        }
    }

    pub fn detect_from_raw_key(raw: &str) -> Option<Self> {
        if raw.starts_with(LIVE_API_KEY_PREFIX) {
            Some(Self::Live)
        } else if raw.starts_with(TEST_API_KEY_PREFIX) {
            Some(Self::Test)
        } else {
            None
        }
    }
}

/// Newly generated B2B institution API key.
/// Custom `Debug` strictly redacts `raw_key` and `sha256_hash_hex`.
pub struct GeneratedApiKey {
    /// Full key (`sc_live_...` / `sc_test_...`) to display ONCE to the bank; zeroized on drop.
    pub raw_key: Zeroizing<String>,
    /// Non-secret truncated identifier (e.g., `sc_live_9f8e7d6c`) safe for logs & dashboards.
    pub prefix: String,
    /// Lowercase 64-char hex SHA-256 digest persisted in `institutions.api_key_hash`.
    pub sha256_hash_hex: String,
    pub environment: ApiKeyEnvironment,
}

impl fmt::Debug for GeneratedApiKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("GeneratedApiKey")
            .field("raw_key", &"[REDACTED]")
            .field("prefix", &self.prefix)
            .field("sha256_hash_hex", &"[REDACTED_SHA256]")
            .field("environment", &self.environment)
            .finish()
    }
}

/// Generates a 256-bit cryptographically random API key (`sc_live_...` or `sc_test_...`)
/// along with its SHA-256 hash for PostgreSQL storage.
pub fn generate_api_key(env: ApiKeyEnvironment) -> GeneratedApiKey {
    let mut secret_bytes = Zeroizing::new([0u8; API_KEY_ENTROPY_BYTES]);
    OsRng.fill_bytes(&mut *secret_bytes);

    let encoded = URL_SAFE_NO_PAD.encode(&*secret_bytes);
    let raw_key = Zeroizing::new(format!("{}{}", env.prefix(), encoded));
    let prefix: String = raw_key.chars().take(16).collect();
    let sha256_hash_hex = hash_api_key_sha256_hex(raw_key.as_str());

    GeneratedApiKey {
        raw_key,
        prefix,
        sha256_hash_hex,
        environment: env,
    }
}

/// Computes the raw 32-byte SHA-256 digest of a B2B API key.
#[inline]
pub fn hash_api_key_sha256(raw_key: &str) -> [u8; 32] {
    Sha256::digest(raw_key.as_bytes()).into()
}

/// Computes the lowercase hex SHA-256 digest stored in PostgreSQL `institutions.api_key_hash`.
#[inline]
pub fn hash_api_key_sha256_hex(raw_key: &str) -> String {
    hex::encode(hash_api_key_sha256(raw_key))
}

/// Validates syntax (`sc_live_` / `sc_test_`, length, ASCII printable) and hashes `raw_key`
/// using SHA-256 so malformed keys are rejected before hitting PostgreSQL.
pub fn parse_and_hash_api_key(
    raw_key: &str,
) -> VaultResult<(ApiKeyEnvironment, String, [u8; 32])> {
    let trimmed = raw_key.trim();
    if trimmed.len() < MIN_RAW_KEY_LEN || trimmed.len() > MAX_RAW_KEY_LEN || !trimmed.is_ascii() {
        return Err(VaultError::Unauthorized("Malformed x-api-key format"));
    }

    let env = ApiKeyEnvironment::detect_from_raw_key(trimmed)
        .ok_or(VaultError::Unauthorized("x-api-key must be prefixed with sc_live_ or sc_test_"))?;

    let token_body = &trimmed[env.prefix().len()..];
    if token_body.is_empty()
        || !token_body
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_')
    {
        return Err(VaultError::Unauthorized("Invalid characters in x-api-key"));
    }

    let digest = hash_api_key_sha256(trimmed);
    let digest_hex = hex::encode(digest);
    Ok((env, digest_hex, digest))
}

/// Constant-time verification comparing an incoming SHA-256 digest against the stored hex digest.
pub fn constant_time_hash_matches(incoming_digest: &[u8; 32], stored_hash_hex: &str) -> bool {
    let Ok(stored_bytes) = hex::decode(stored_hash_hex.trim()) else {
        return false;
    };
    stored_bytes.len() == 32 && bool::from(incoming_digest.ct_eq(&stored_bytes))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn generates_prefixed_keys_and_verifies_sha256() {
        let live = generate_api_key(ApiKeyEnvironment::Live);
        assert!(live.raw_key.starts_with(LIVE_API_KEY_PREFIX));
        assert_eq!(live.sha256_hash_hex.len(), 64);

        let (env, hex_hash, digest) = parse_and_hash_api_key(&live.raw_key).expect("valid live key");
        assert_eq!(env, ApiKeyEnvironment::Live);
        assert_eq!(hex_hash, live.sha256_hash_hex);
        assert!(constant_time_hash_matches(&digest, &live.sha256_hash_hex));

        let test = generate_api_key(ApiKeyEnvironment::Test);
        assert!(test.raw_key.starts_with(TEST_API_KEY_PREFIX));
    }

    #[test]
    fn rejects_invalid_prefixes() {
        assert!(parse_and_hash_api_key("pk_live_invalid_prefix_value_123456").is_err());
        assert!(parse_and_hash_api_key("sc_live_short").is_err());
    }
}
