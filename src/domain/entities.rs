use std::fmt;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::domain::api_key::ApiKeyEnvironment;
use crate::domain::value_objects::TenantId;
use crate::error::{VaultError, VaultResult};

/// PostgreSQL Enum representation (`institution_sector_type`: `'Bank'`, `'Postal'`, `'E-commerce'`).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum InstitutionSectorType {
    #[serde(rename = "Bank")]
    Bank,
    #[serde(rename = "Postal")]
    Postal,
    #[serde(rename = "E-commerce")]
    Ecommerce,
}

impl InstitutionSectorType {
    pub const fn as_db_str(&self) -> &'static str {
        match self {
            Self::Bank => "Bank",
            Self::Postal => "Postal",
            Self::Ecommerce => "E-commerce",
        }
    }

    pub fn from_db_str(raw: &str) -> VaultResult<Self> {
        match raw {
            "Bank" => Ok(Self::Bank),
            "Postal" => Ok(Self::Postal),
            "E-commerce" => Ok(Self::Ecommerce),
            _ => Err(VaultError::StorageFailure),
        }
    }
}

/// Multi-tenant Algerian Financial, Postal, or E-Commerce Institution entity (`institutions` table).
/// Custom `Debug` redacts `api_key_hash` so SHA-256 digests never leak to logs.
#[derive(Clone)]
pub struct AlgerianInstitution {
    pub id: Uuid,
    pub name: String,
    pub institution_type: InstitutionSectorType,
    pub is_active: bool,
    pub api_key_prefix: Option<String>,
    pub key_environment: ApiKeyEnvironment,
    pub api_key_hash: String,
}

impl fmt::Debug for AlgerianInstitution {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("AlgerianInstitution")
            .field("id", &self.id)
            .field("name", &self.name)
            .field("type", &self.institution_type)
            .field("is_active", &self.is_active)
            .field("api_key_prefix", &self.api_key_prefix)
            .field("key_environment", &self.key_environment)
            .field("api_key_hash", &"[REDACTED]")
            .finish()
    }
}

/// Public, cache-friendly projection returned by `GET /api/v1/institutions/active`.
/// Strictly omits `api_key_hash` and internal audit metadata.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PublicInstitutionSummary {
    pub id: Uuid,
    pub name: String,
    #[serde(rename = "type")]
    pub institution_type: InstitutionSectorType,
}

/// Authenticated B2B Financial Institution Tenant entity.
/// Custom `Debug` redacts `api_key_hash` so Argon2id hashes never leak to logs.
#[derive(Clone)]
pub struct InstitutionTenant {
    pub id: TenantId,
    pub institution_name: String,
    pub api_key_prefix: String,
    pub api_key_hash: String,
    pub is_active: bool,
}

impl fmt::Debug for InstitutionTenant {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("InstitutionTenant")
            .field("id", &self.id)
            .field("institution_name", &self.institution_name)
            .field("api_key_prefix", &self.api_key_prefix)
            .field("api_key_hash", &"[REDACTED]")
            .field("is_active", &self.is_active)
            .finish()
    }
}

/// Public SaaS User entity with dual-channel (Email + Phone) verification state.
/// Custom `Debug` redacts blind indexes and OTP HMAC hashes so PII/secrets never leak to logs.
#[derive(Clone)]
pub struct SaasUser {
    pub id: Uuid,
    pub tenant_id: TenantId,
    pub email_blind_index: [u8; 32],
    pub email_masked: String,
    pub phone_blind_index: [u8; 32],
    pub phone_masked: String,
    pub email_verified: bool,
    pub phone_verified: bool,
    pub email_otp_hash: Option<[u8; 32]>,
    pub phone_otp_hash: Option<[u8; 32]>,
    pub otp_expires_at: Option<DateTime<Utc>>,
    pub otp_failed_attempts: i16,
    pub last_otp_sent_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl SaasUser {
    /// Returns `true` only if BOTH Email and Phone OTP verifications have succeeded.
    #[inline]
    pub fn is_fully_verified(&self) -> bool {
        self.email_verified && self.phone_verified
    }
}

impl fmt::Debug for SaasUser {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("SaasUser")
            .field("id", &self.id)
            .field("tenant_id", &self.tenant_id)
            .field("email_blind_index", &"[REDACTED]")
            .field("email_masked", &self.email_masked)
            .field("phone_blind_index", &"[REDACTED]")
            .field("phone_masked", &self.phone_masked)
            .field("email_verified", &self.email_verified)
            .field("phone_verified", &self.phone_verified)
            .field("email_otp_hash", &"[REDACTED]")
            .field("phone_otp_hash", &"[REDACTED]")
            .field("otp_failed_attempts", &self.otp_failed_attempts)
            .finish()
    }
}

/// Encrypted Anti-Phishing Code record persisted in the vault.
/// Custom `Debug` redacts `account_blind_index`, `nonce`, and `ciphertext`.
#[derive(Clone)]
pub struct VaultEntry {
    pub id: Uuid,
    pub tenant_id: TenantId,
    pub account_blind_index: [u8; 32],
    pub masked_preview: String,
    pub nonce: [u8; 12],
    pub ciphertext: Vec<u8>,
    pub key_version: i16,
    pub is_enabled: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl fmt::Debug for VaultEntry {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("VaultEntry")
            .field("id", &self.id)
            .field("tenant_id", &self.tenant_id)
            .field("account_blind_index", &"[REDACTED_BLIND_INDEX]")
            .field("masked_preview", &self.masked_preview)
            .field("key_version", &self.key_version)
            .field("is_enabled", &self.is_enabled)
            .finish()
    }
}

/// Security audit record for every enrollment, rotation, registration, and dispatch operation.
#[derive(Clone)]
pub struct AuditRecord<'a> {
    pub tenant_id: TenantId,
    pub account_blind_index: &'a [u8; 32],
    pub event_type: &'a str,
    pub actor_ip: &'a str,
    pub succeeded: bool,
    pub reason: Option<&'a str>,
}
