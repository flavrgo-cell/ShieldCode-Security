use std::fmt;
use std::sync::LazyLock;

use regex::Regex;
use serde::{Deserialize, Serialize};
use subtle::ConstantTimeEq;
use uuid::Uuid;
use zeroize::{Zeroize, ZeroizeOnDrop};

use crate::error::{VaultError, VaultResult};

/// Default tenant UUID for the public SaaS platform (`00000000-0000-0000-0000-000000000001`).
pub const PUBLIC_SAAS_TENANT_UUID: Uuid = Uuid::from_u128(1);

/// Strict Regex for Anti-Phishing Codes: 4 to 20 ASCII alphanumeric characters only.
/// Blocks SQLi, XSS, template injection (`{{...}}`), CRLF header injection, and whitespace.
static CODE_ALPHANUMERIC_REGEX: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[A-Za-z0-9]{4,20}$").expect("Valid static regex"));

/// Strict Regex for 2FA OTP tokens: exactly 6 ASCII digits.
static OTP_SIX_DIGIT_REGEX: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[0-9]{6}$").expect("Valid static regex"));

/// Strict Regex for external account identifiers: 1 to 64 safe identifier characters.
static ACCOUNT_REF_REGEX: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[A-Za-z0-9_\-:.]{1,64}$").expect("Valid static regex"));

/// Strict RFC-5322-safe Email Regex blocking SMTP header/command injection (`\r`, `\n`, spaces, quotes).
static EMAIL_STRICT_REGEX: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,24}$")
        .expect("Valid static email regex")
});

/// Strict Algerian Mobile Number Regex (Law 18-07 National Sovereignty Compliance):
/// Exclusively accepts `+213` followed by `5` (Ooredoo), `6` (Mobilis), or `7` (Djezzy)
/// and exactly 8 digits (e.g., `+213550123456`, `+213661987654`, `+213770112233`).
/// All foreign/international country codes and landlines are strictly rejected.
static ALGERIAN_MOBILE_REGEX: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^\+213[567][0-9]{8}$").expect("Valid static Algerian mobile regex"));

/// Strongly-typed identifier for a B2B financial institution or Public SaaS tenant.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct TenantId(pub Uuid);

impl TenantId {
    pub const fn public_saas() -> Self {
        Self(PUBLIC_SAAS_TENANT_UUID)
    }

    #[inline]
    pub fn as_bytes(&self) -> &[u8; 16] {
        self.0.as_bytes()
    }
}

/// Validated, canonicalized user email address (`ZeroizeOnDrop`).
#[derive(Clone, PartialEq, Eq, Zeroize, ZeroizeOnDrop)]
pub struct EmailAddress(String);

impl EmailAddress {
    pub fn parse(raw: &str) -> VaultResult<Self> {
        let normalized = raw.trim().to_ascii_lowercase();
        if normalized.len() > 254 || !EMAIL_STRICT_REGEX.is_match(&normalized) {
            return Err(VaultError::Validation(
                "email must be a valid address matching ^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,24}$"
                    .to_owned(),
            ));
        }
        Ok(Self(normalized))
    }

    #[inline]
    pub fn as_str(&self) -> &str {
        &self.0
    }

    /// Produces a privacy-safe masked representation (e.g., `"a***@example.com"`).
    pub fn to_masked_preview(&self) -> String {
        if let Some((local, domain)) = self.0.split_once('@') {
            let first = local.chars().next().unwrap_or('*');
            format!("{}***@{}", first, domain)
        } else {
            "***".to_owned()
        }
    }
}

impl fmt::Debug for EmailAddress {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("EmailAddress([REDACTED_PII])")
    }
}

/// Validated Algerian National Mobile Phone Number (`+213[567][0-9]{8}`, `ZeroizeOnDrop`).
/// Enforces Law 18-07 territorial restriction by rejecting all non-Algerian phone numbers.
#[derive(Clone, PartialEq, Eq, Zeroize, ZeroizeOnDrop)]
pub struct PhoneNumber(String);

impl PhoneNumber {
    pub fn parse(raw: &str) -> VaultResult<Self> {
        let trimmed = raw.trim();
        if !ALGERIAN_MOBILE_REGEX.is_match(trimmed) {
            return Err(VaultError::Validation(
                "phone_number must be a valid Algerian mobile number matching ^\\+213[567][0-9]{8}$ (Ooredoo +2135, Mobilis +2136, or Djezzy +2137); international numbers are rejected under Law 18-07"
                    .to_owned(),
            ));
        }
        Ok(Self(trimmed.to_owned()))
    }

    #[inline]
    pub fn as_str(&self) -> &str {
        &self.0
    }

    /// Identifies the Algerian mobile network operator from the prefix digit (`5`, `6`, or `7`).
    pub fn operator_name(&self) -> &'static str {
        match self.0.as_bytes().get(4) {
            Some(b'5') => "Ooredoo Algeria",
            Some(b'6') => "ATM Mobilis",
            Some(b'7') => "Optimum Telecom Algeria (Djezzy)",
            _ => "Algerian National Carrier",
        }
    }

    /// Produces a privacy-safe masked representation (e.g., `"+2135*****456"`).
    pub fn to_masked_preview(&self) -> String {
        if self.0.len() == 13 {
            format!("{}*****{}", &self.0[..5], &self.0[10..])
        } else {
            "+213********".to_owned()
        }
    }
}

impl fmt::Debug for PhoneNumber {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("PhoneNumber([REDACTED_PII])")
    }
}

/// Cryptographically signed JWT session claims for a verified SaaS user.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct VerifiedJwtClaims {
    /// Subject (`saas_users.id` UUID).
    pub sub: Uuid,
    /// Tenant UUID (`saas_users.tenant_id`).
    pub tid: Uuid,
    /// Must be `true` for Code Vault access.
    pub email_verified: bool,
    /// Must be `true` for Code Vault access.
    pub phone_verified: bool,
    /// Issued-at UNIX timestamp (seconds).
    pub iat: usize,
    /// Expiration UNIX timestamp (seconds).
    pub exp: usize,
    /// Unique token identifier.
    pub jti: String,
}

impl VerifiedJwtClaims {
    /// Enforces the security invariant that a user CANNOT access the Code Vault
    /// unless both Email and Phone OTP verifications have completed.
    pub fn ensure_fully_verified(&self) -> VaultResult<()> {
        if !self.email_verified || !self.phone_verified {
            return Err(VaultError::AccountNotVerified(
                "Access to the Anti-Phishing Code Vault requires both Email and Phone OTP verification",
            ));
        }
        Ok(())
    }
}

/// Validated external customer account reference supplied by a financial institution or SaaS user ID.
#[derive(Clone, PartialEq, Eq, Zeroize, ZeroizeOnDrop)]
pub struct ExternalAccountRef(String);

impl ExternalAccountRef {
    pub fn parse(raw: &str) -> VaultResult<Self> {
        let trimmed = raw.trim();
        if !ACCOUNT_REF_REGEX.is_match(trimmed) {
            return Err(VaultError::Validation(
                "external_account_ref must match ^[A-Za-z0-9_\\-:.]{1,64}$".to_owned(),
            ));
        }
        Ok(Self(trimmed.to_owned()))
    }

    #[inline]
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

/// Strictly validated 6-digit 2FA OTP value object (`ZeroizeOnDrop`).
#[derive(Clone, Zeroize, ZeroizeOnDrop)]
pub struct TwoFactorOtp(String);

impl TwoFactorOtp {
    pub fn parse(raw: &str) -> VaultResult<Self> {
        if !OTP_SIX_DIGIT_REGEX.is_match(raw) {
            return Err(VaultError::Validation(
                "otp_code must be a 6-digit numeric string matching ^[0-9]{6}$".to_owned(),
            ));
        }
        Ok(Self(raw.to_owned()))
    }

    #[inline]
    pub fn expose_str(&self) -> &str {
        &self.0
    }

    /// Constant-time comparison against an expected 6-digit OTP to prevent timing side-channels.
    pub fn verify_constant_time(&self, expected_otp: &str) -> bool {
        self.0.as_bytes().ct_eq(expected_otp.as_bytes()).into()
    }
}

impl fmt::Debug for TwoFactorOtp {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("TwoFactorOtp([REDACTED])")
    }
}

/// User-defined Anti-Phishing Code value object.
///
/// Enforced invariants:
/// - Matches `^[A-Za-z0-9]{4,20}$` (prevents injection vectors and whitespace).
/// - Contains at least one ASCII letter (`A-Z`/`a-z`) and at least one digit (`0-9`).
/// - Automatically zeroized in RAM when dropped (`ZeroizeOnDrop`).
#[derive(Clone, Zeroize, ZeroizeOnDrop)]
pub struct AntiPhishingCode(String);

impl AntiPhishingCode {
    pub fn parse(candidate: &str) -> VaultResult<Self> {
        if !CODE_ALPHANUMERIC_REGEX.is_match(candidate) {
            return Err(VaultError::Validation(
                "anti_phishing_code must be 4-20 alphanumeric characters (^[A-Za-z0-9]{4,20}$)"
                    .to_owned(),
            ));
        }

        let has_letter = candidate.bytes().any(|b| b.is_ascii_alphabetic());
        let has_digit = candidate.bytes().any(|b| b.is_ascii_digit());

        if !has_letter || !has_digit {
            return Err(VaultError::Validation(
                "anti_phishing_code must include at least one letter and at least one digit"
                    .to_owned(),
            ));
        }

        Ok(Self(candidate.to_owned()))
    }

    /// Borrowed view of the secret bytes for AEAD encryption or template stamping.
    #[inline]
    pub fn expose_str(&self) -> &str {
        &self.0
    }

    /// Produces a masked version of the code (e.g., `"MyC***"`) that reveals only the first
    /// 3 characters (or 1 character for 4-char codes) and never exposes the full plaintext.
    pub fn to_masked_preview(&self) -> String {
        if self.0.len() <= 4 {
            format!("{}***", &self.0[..1])
        } else {
            format!("{}***", &self.0[..3])
        }
    }
}

impl fmt::Debug for AntiPhishingCode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("AntiPhishingCode([REDACTED])")
    }
}
