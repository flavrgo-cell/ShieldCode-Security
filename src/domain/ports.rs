use async_trait::async_trait;
use uuid::Uuid;

use crate::domain::api_key::ApiKeyEnvironment;
use crate::domain::entities::{
    AlgerianInstitution, AuditRecord, InstitutionTenant, PublicInstitutionSummary, SaasUser,
    VaultEntry,
};
use crate::domain::value_objects::{
    AntiPhishingCode, EmailAddress, ExternalAccountRef, PhoneNumber, TenantId, TwoFactorOtp,
    VerifiedJwtClaims,
};
use crate::error::VaultResult;

/// Outbound port for real Email SMTP OTP delivery (`lettre`).
#[async_trait]
pub trait EmailDeliveryPort: Send + Sync {
    async fn send_verification_otp(
        &self,
        recipient: &EmailAddress,
        otp: &TwoFactorOtp,
    ) -> VaultResult<()>;
}

/// Outbound port for external HTTP SMS Gateway OTP delivery (`reqwest`).
#[async_trait]
pub trait SmsGatewayPort: Send + Sync {
    async fn send_verification_otp(
        &self,
        recipient: &PhoneNumber,
        otp: &TwoFactorOtp,
    ) -> VaultResult<()>;

    /// Dispatches a stamped B2B anti-phishing SMS for an authenticated bank/institution.
    async fn send_stamped_sms(
        &self,
        recipient: &PhoneNumber,
        sender_name: &str,
        stamped_body: &str,
    ) -> VaultResult<()>;
}

/// Outbound port for cryptographic & JWT operations (Hexagonal Architecture).
pub trait VaultCryptoPort: Send + Sync {
    /// Computes a deterministic 32-byte HMAC-SHA256 blind index for `(tenant_id, account_ref)`.
    fn compute_account_blind_index(
        &self,
        tenant_id: TenantId,
        account_ref: &ExternalAccountRef,
    ) -> VaultResult<[u8; 32]>;

    /// Computes a deterministic 32-byte HMAC-SHA256 blind index for a user contact field
    /// (`domain_tag` = `"email"` or `"phone"`), preventing raw PII storage in PostgreSQL.
    fn compute_contact_blind_index(
        &self,
        domain_tag: &str,
        normalized_contact: &str,
    ) -> VaultResult<[u8; 32]>;

    /// Generates a cryptographically secure, unbiased 6-digit numeric OTP using `OsRng`.
    fn generate_csprng_six_digit_otp(&self) -> VaultResult<TwoFactorOtp>;

    /// Computes a keyed HMAC-SHA256 hash of a 6-digit OTP bound to `(user_id, channel)`.
    fn hash_verification_otp(
        &self,
        user_id: Uuid,
        channel: &str,
        otp: &TwoFactorOtp,
    ) -> VaultResult<[u8; 32]>;

    /// Verifies a submitted 6-digit OTP against its stored keyed HMAC-SHA256 hash in constant time.
    fn verify_hashed_otp(
        &self,
        user_id: Uuid,
        channel: &str,
        submitted_otp: &TwoFactorOtp,
        expected_hash: &[u8; 32],
    ) -> VaultResult<bool>;

    /// Issues an `HS256` JSON Web Token signed with a dedicated HKDF-derived JWT signing key.
    /// Rejects issuance unless `user.is_fully_verified()` (`email_verified && phone_verified`).
    fn issue_verified_user_jwt(&self, user: &SaasUser, ttl_secs: u64) -> VaultResult<String>;

    /// Verifies and decodes a Bearer JWT into `VerifiedJwtClaims`.
    fn verify_user_jwt(&self, token: &str) -> VaultResult<VerifiedJwtClaims>;

    /// Encrypts the user's `AntiPhishingCode` using a per-(tenant, account, key_version)
    /// AES-256-GCM key derived via HKDF-SHA256, binding `(tenant_id || account_blind_index || key_version)`
    /// as Associated Authenticated Data (AAD).
    fn encrypt_code(
        &self,
        tenant_id: TenantId,
        account_blind_index: &[u8; 32],
        key_version: i16,
        code: &AntiPhishingCode,
    ) -> VaultResult<([u8; 12], Vec<u8>)>;

    /// Decrypts and authenticates a stored `VaultEntry` back into an `AntiPhishingCode`
    /// that zeroizes itself on drop.
    fn decrypt_code(
        &self,
        tenant_id: TenantId,
        account_blind_index: &[u8; 32],
        key_version: i16,
        nonce: &[u8; 12],
        ciphertext: &[u8],
    ) -> VaultResult<AntiPhishingCode>;

    /// Verifies a 6-digit 2FA TOTP token using a secret key derived via HKDF-SHA256 from the
    /// Vault master key (never using the database-stored `account_blind_index` as the secret key).
    fn verify_account_totp(
        &self,
        tenant_id: TenantId,
        account_blind_index: &[u8; 32],
        submitted_otp: &TwoFactorOtp,
    ) -> VaultResult<bool>;

    /// Verifies a B2B tenant API key against its stored Argon2id PHC string hash.
    fn verify_tenant_api_key(&self, raw_api_key: &str, expected_phc_hash: &str)
        -> VaultResult<bool>;
}

/// Outbound port for PostgreSQL persistence.
#[async_trait]
pub trait VaultRepository: Send + Sync {
    async fn list_active_institutions(&self) -> VaultResult<Vec<PublicInstitutionSummary>>;

    async fn find_active_institution_by_api_key_hash(
        &self,
        api_key_sha256_hex: &str,
    ) -> VaultResult<Option<AlgerianInstitution>>;

    async fn update_institution_api_key_hash(
        &self,
        institution_id: Uuid,
        api_key_prefix: &str,
        api_key_sha256_hex: &str,
        environment: ApiKeyEnvironment,
    ) -> VaultResult<AlgerianInstitution>;

    async fn find_active_tenant_by_prefix(
        &self,
        api_key_prefix: &str,
    ) -> VaultResult<Option<InstitutionTenant>>;

    async fn find_saas_user_by_id(&self, user_id: Uuid) -> VaultResult<Option<SaasUser>>;

    async fn find_saas_user_by_contact_index(
        &self,
        email_blind_index: &[u8; 32],
        phone_blind_index: &[u8; 32],
    ) -> VaultResult<Option<SaasUser>>;

    async fn upsert_pending_saas_user(&self, user: &SaasUser) -> VaultResult<SaasUser>;

    async fn mark_saas_user_fully_verified(&self, user_id: Uuid) -> VaultResult<SaasUser>;

    async fn increment_saas_user_otp_failures(&self, user_id: Uuid) -> VaultResult<i16>;

    async fn upsert_vault_entry(&self, entry: &VaultEntry) -> VaultResult<VaultEntry>;

    async fn find_vault_entry(
        &self,
        tenant_id: TenantId,
        account_blind_index: &[u8; 32],
    ) -> VaultResult<Option<VaultEntry>>;

    async fn append_audit_log<'a>(&self, record: AuditRecord<'a>) -> VaultResult<()>;
}

/// New wrapped link to persist (only the token's SHA-256 digest is stored).
pub struct NewSecureLink<'a> {
    pub id: Uuid,
    pub token_sha256: [u8; 32],
    pub tenant_id: TenantId,
    pub account_blind_index: &'a [u8; 32],
    pub target_url: &'a str,
    pub max_resolutions: i16,
    pub expires_at: chrono::DateTime<chrono::Utc>,
}

/// Result of atomically consuming one resolution of a live link.
pub struct ConsumedSecureLink {
    pub tenant_id: TenantId,
    pub account_blind_index: [u8; 32],
    pub target_url: String,
    pub institution_name: String,
    pub remaining_resolutions: i16,
    pub expires_at: chrono::DateTime<chrono::Utc>,
}

/// Outbound port for the Secure Interstitial Link Wrapper.
#[async_trait]
pub trait SecureLinkRepository: Send + Sync {
    /// Returns the tenant's approved outbound link domains.
    async fn tenant_allowed_link_domains(&self, tenant_id: TenantId) -> VaultResult<Vec<String>>;

    /// Inserts all links of one message in a single transaction.
    async fn insert_secure_links(&self, links: &[NewSecureLink<'_>]) -> VaultResult<()>;

    /// Atomically increments the resolution counter of a live (not expired, not revoked,
    /// budget not exhausted, tenant active) link and returns it. `None` = unknown or dead link.
    async fn consume_secure_link(
        &self,
        token_sha256: &[u8; 32],
    ) -> VaultResult<Option<ConsumedSecureLink>>;
}
