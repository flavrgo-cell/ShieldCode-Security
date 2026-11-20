use chrono::{DateTime, Utc};
use secrecy::SecretString;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

use crate::domain::api_key::ApiKeyEnvironment;
use crate::domain::entities::PublicInstitutionSummary;

/// OpenAPI schema for a public Algerian financial/postal institution item.
#[derive(Serialize, ToSchema)]
pub struct PublicInstitutionDto {
    #[schema(example = "01933f00-0000-7000-8000-000000000001")]
    pub id: Uuid,
    #[schema(example = "Algérie Poste (CCP / Baridimob)")]
    pub name: String,
    #[serde(rename = "type")]
    #[schema(example = "Postal")]
    pub institution_type: String,
}

impl From<&PublicInstitutionSummary> for PublicInstitutionDto {
    fn from(summary: &PublicInstitutionSummary) -> Self {
        Self {
            id: summary.id,
            name: summary.name.clone(),
            institution_type: summary.institution_type.as_db_str().to_owned(),
        }
    }
}

/// Cached JSON response payload for `GET /api/v1/institutions/active`.
#[derive(Serialize, ToSchema)]
pub struct ActiveInstitutionsResponse {
    #[schema(example = 6)]
    pub count: usize,
    pub institutions: Vec<PublicInstitutionDto>,
}

/// JSON request payload for `POST /register` (and `/api/v1/auth/register`).
/// Both `email` and `phone_number` are wrapped in `SecretString` so raw PII
/// never leaks into `Debug` logs.
#[derive(Deserialize)]
pub struct RegisterUserRequest {
    pub email: SecretString,
    pub phone_number: SecretString,
}

/// JSON response payload for `POST /register`.
#[derive(Serialize)]
pub struct RegisterUserResponse {
    pub user_id: Uuid,
    pub email_masked: String,
    pub phone_masked: String,
    pub email_verified: bool,
    pub phone_verified: bool,
    pub otp_expires_in_secs: u64,
    pub status: &'static str,
}

/// JSON request payload for `POST /verify-otp` (and `/api/v1/auth/verify-otp`).
#[derive(Deserialize)]
pub struct VerifyDualOtpRequest {
    pub user_id: Uuid,
    pub email_otp: SecretString,
    pub phone_otp: SecretString,
}

/// JSON response payload for `POST /verify-otp` once both Email and Phone OTPs are verified.
#[derive(Serialize)]
pub struct VerifyDualOtpResponse {
    pub user_id: Uuid,
    pub access_token: String,
    pub token_type: &'static str,
    pub expires_in_secs: u64,
    pub email_verified: bool,
    pub phone_verified: bool,
}

/// JSON request payload for `POST /api/v1/security/code`.
/// Both `anti_phishing_code` and `otp_code` are wrapped in `SecretString` so deserialized
/// payloads never leak secrets in `Debug` traces.
#[derive(Deserialize)]
pub struct SetAntiPhishingCodeRequest {
    /// External customer account identifier (optional when authenticated via SaaS Bearer JWT).
    #[serde(default = "default_account_ref")]
    pub external_account_ref: String,
    /// User-chosen 4-20 character alphanumeric anti-phishing code (`^[A-Za-z0-9]{4,20}$`).
    pub anti_phishing_code: SecretString,
    /// 6-digit 2FA OTP token (`^[0-9]{6}$`) required to authorize setting or rotating the code.
    pub otp_code: SecretString,
}

fn default_account_ref() -> String {
    "default_account".to_owned()
}

/// Optional query parameters for `GET /api/v1/security/code/status?external_account_ref=...`.
#[derive(Deserialize, Default)]
pub struct CodeStatusQuery {
    pub external_account_ref: Option<String>,
}

/// JSON response payload for `POST /api/v1/security/code` and `GET /api/v1/security/code/status`.
/// Never contains the full plain-text anti-phishing code.
#[derive(Serialize, ToSchema)]
pub struct CodeStatusResponse {
    pub is_enabled: bool,
    #[schema(example = "Bac***")]
    pub masked_code: Option<String>,
    pub key_version: Option<i16>,
    pub updated_at: Option<DateTime<Utc>>,
}

/// Request payload for `POST /api/v1/security/dispatch/stamp`.
#[derive(Deserialize)]
pub struct StampNotificationRequest {
    pub external_account_ref: String,
    pub template_body: String,
    pub fallback_notice: Option<String>,
    /// Secure Interstitial Link Wrapper; defaults to `true` (opt-out, never opt-in).
    #[serde(default = "default_wrap_links")]
    pub wrap_links: bool,
}

const fn default_wrap_links() -> bool {
    true
}

/// Response payload for `GET /api/v1/verify-link/:hash` (consumed by the `/go/:hash` page).
#[derive(Serialize, ToSchema)]
pub struct VerifyLinkResponse {
    #[schema(example = "https://www.poste.dz/track/84920")]
    pub target_url: String,
    #[schema(example = "Algérie Poste (CCP / Baridimob)")]
    pub institution_name: String,
    #[schema(example = "Bachir34")]
    pub secret_word: Option<String>,
    pub secret_word_configured: bool,
    #[schema(example = 4)]
    pub remaining_resolutions: i16,
    pub expires_at: DateTime<Utc>,
}

/// Response payload for `POST /api/v1/security/dispatch/stamp`.
#[derive(Serialize)]
pub struct StampNotificationResponse {
    pub stamped_payload: String,
    pub code_applied: bool,
    pub masked_code: Option<String>,
    pub wrapped_links: usize,
}

/// API Key Environment enum exposed in OpenAPI schemas (`live` -> `sc_live_`, `test` -> `sc_test_`).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum ApiKeyEnvironmentSchema {
    Live,
    Test,
}

impl From<ApiKeyEnvironmentSchema> for ApiKeyEnvironment {
    fn from(val: ApiKeyEnvironmentSchema) -> Self {
        match val {
            ApiKeyEnvironmentSchema::Live => ApiKeyEnvironment::Live,
            ApiKeyEnvironmentSchema::Test => ApiKeyEnvironment::Test,
        }
    }
}

impl From<ApiKeyEnvironment> for ApiKeyEnvironmentSchema {
    fn from(val: ApiKeyEnvironment) -> Self {
        match val {
            ApiKeyEnvironment::Live => ApiKeyEnvironmentSchema::Live,
            ApiKeyEnvironment::Test => ApiKeyEnvironmentSchema::Test,
        }
    }
}

/// Request payload for generating or rotating a bank API key (`POST /api/v1/institutions/api-keys`).
#[derive(Deserialize, ToSchema)]
pub struct GenerateApiKeyRequest {
    /// Target environment (`"live"` yields `sc_live_...`, `"test"` yields `sc_test_...`).
    pub environment: ApiKeyEnvironmentSchema,
}

/// One-time response returned when generating or rotating an API key.
/// The server stores ONLY the SHA-256 hash in PostgreSQL `institutions.api_key_hash`.
#[derive(Serialize, ToSchema)]
pub struct GenerateApiKeyResponse {
    #[schema(example = "01933f00-0000-7000-8000-000000000002")]
    pub institution_id: Uuid,
    #[schema(example = "CPA (Crédit Populaire d'Algérie)")]
    pub institution_name: String,
    /// Full plaintext secret API key shown ONCE. Store securely; cannot be retrieved later.
    #[schema(example = "sc_live_9vK2mP7xQ4nB8wR1tL5zJ0cH6yF3dA2eG7sM4kN8pT")]
    pub api_key: String,
    #[schema(example = "sc_live_9vK2mP7x")]
    pub key_prefix: String,
    pub environment: ApiKeyEnvironmentSchema,
    pub issued_at: DateTime<Utc>,
    #[schema(example = "Store this key securely now. Only its SHA-256 hash is persisted in PostgreSQL.")]
    pub notice: &'static str,
}

/// B2B Bank Request payload for `POST /api/v1/sms/send-secure`.
/// Requires `x-api-key` header (`sc_live_...` or `sc_test_...`).
#[derive(Deserialize, ToSchema)]
pub struct SendSecureSmsRequest {
    /// Customer account identifier or masked card tail at the partner bank.
    #[schema(example = "EDAHABIA-6280-4821")]
    pub external_account_ref: String,
    /// Algerian national mobile number strictly matching `^\+213[567][0-9]{8}$` (Law 18-07).
    #[schema(example = "+213550123456")]
    pub recipient_phone: String,
    /// Outbound SMS text. `{{ANTI_PHISHING_CODE}}` is auto-prepended if omitted, and HTTPS links are wrapped.
    #[schema(example = "CPA Alert: Transfer of 45,000 DZD. OTP: 849201. Confirm at https://cpa-bank.dz/verify")]
    pub message_body: String,
    /// Intercepts outbound HTTPS URLs and wraps them into `https://shieldcode.dz/go/<hash>`. Defaults to `true`.
    #[serde(default = "default_wrap_links")]
    #[schema(default = true)]
    pub wrap_links: bool,
}

/// B2B Bank Response payload for `POST /api/v1/sms/send-secure`.
#[derive(Serialize, ToSchema)]
pub struct SendSecureSmsResponse {
    pub message_id: Uuid,
    #[schema(example = "CPA (Crédit Populaire d'Algérie)")]
    pub institution_name: String,
    pub environment: ApiKeyEnvironmentSchema,
    #[schema(example = "+2135*****456")]
    pub recipient_masked: String,
    pub code_applied: bool,
    #[schema(example = "Bac***")]
    pub masked_code: Option<String>,
    #[schema(example = 1)]
    pub wrapped_links: usize,
    #[schema(example = "dispatched_live")]
    pub delivery_status: &'static str,
    pub dispatched_at: DateTime<Utc>,
}

/// Standard API Error response documented in OpenAPI.
#[derive(Serialize, ToSchema)]
pub struct ApiErrorResponse {
    #[schema(example = "UNAUTHORIZED")]
    pub error_code: String,
    #[schema(example = "Missing x-api-key header")]
    pub message: String,
}

#[derive(Serialize, ToSchema)]
pub struct HealthResponse {
    #[schema(example = "ok")]
    pub status: &'static str,
    #[schema(example = "shieldcode-vault-api")]
    pub service: &'static str,
    #[schema(example = "0.1.0")]
    pub version: &'static str,
}
