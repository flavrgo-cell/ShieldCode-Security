use std::sync::Arc;
use std::time::{Duration, Instant};

use chrono::{DateTime, Duration as ChronoDuration, Utc};
use tokio::sync::RwLock;
use uuid::Uuid;
use zeroize::Zeroize;

use crate::application::api_keys::{ApiKeyManagementService, ProvisionedApiKeyOutput};
use crate::application::link_wrapper::SecureLinkService;
use crate::domain::api_key::ApiKeyEnvironment;
use crate::domain::entities::{
    AlgerianInstitution, AuditRecord, PublicInstitutionSummary, SaasUser, VaultEntry,
};
use crate::domain::ports::{
    EmailDeliveryPort, SmsGatewayPort, VaultCryptoPort, VaultRepository,
};
use crate::domain::secure_link::SecureLinkToken;
use crate::domain::value_objects::{
    AntiPhishingCode, EmailAddress, ExternalAccountRef, PhoneNumber, TenantId, TwoFactorOtp,
    VerifiedJwtClaims,
};
use crate::error::{VaultError, VaultResult};

const CURRENT_KEY_VERSION: i16 = 1;
const OTP_TTL_MINUTES: i64 = 10;
const OTP_RESEND_COOLDOWN_SECS: i64 = 60;
const MAX_OTP_FAILED_ATTEMPTS: i16 = 5;
const ACTIVE_INSTITUTIONS_CACHE_TTL: Duration = Duration::from_secs(300);

type InstitutionsCacheState = Option<(Instant, Arc<Vec<PublicInstitutionSummary>>)>;

#[derive(Clone, Debug)]
pub struct RegistrationInitiatedOutput {
    pub user_id: Uuid,
    pub email_masked: String,
    pub phone_masked: String,
    pub email_verified: bool,
    pub phone_verified: bool,
    pub otp_expires_in_secs: u64,
    pub status: &'static str,
}

#[derive(Clone, Debug)]
pub struct VerifiedSessionOutput {
    pub user_id: Uuid,
    pub access_token: String,
    pub token_type: &'static str,
    pub expires_in_secs: u64,
    pub email_verified: bool,
    pub phone_verified: bool,
}

#[derive(Clone, Debug)]
pub struct CodeStatusOutput {
    pub is_enabled: bool,
    pub masked_code: Option<String>,
    pub key_version: Option<i16>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Clone, Debug)]
pub struct StampedNotificationOutput {
    pub stamped_payload: String,
    pub code_applied: bool,
    pub masked_code: Option<String>,
    pub wrapped_links: usize,
}

/// Output of B2B `POST /api/v1/sms/send-secure`.
/// Omits raw plaintext customer secret codes so only the recipient sees them on their handset.
#[derive(Clone, Debug)]
pub struct SendSecureSmsOutput {
    pub message_id: Uuid,
    pub institution_name: String,
    pub environment: ApiKeyEnvironment,
    pub recipient_masked: String,
    pub code_applied: bool,
    pub masked_code: Option<String>,
    pub wrapped_links: usize,
    pub delivery_status: &'static str,
    pub dispatched_at: DateTime<Utc>,
}

/// Output of `GET /api/v1/verify-link/:hash`. `Debug` is intentionally NOT derived
/// so the decrypted secret word can never be logged by accident.
pub struct ResolvedSecureLinkOutput {
    pub target_url: String,
    pub institution_name: String,
    /// `None` when the account has no active anti-phishing word. Zeroized on drop.
    pub secret_word: Option<AntiPhishingCode>,
    pub remaining_resolutions: i16,
    pub expires_at: DateTime<Utc>,
}

/// Core Application Service implementing all Public SaaS & B2B Anti-Phishing Code Vault use cases.
pub struct AntiPhishingVaultService {
    repo: Arc<dyn VaultRepository>,
    crypto: Arc<dyn VaultCryptoPort>,
    email_mailer: Option<Arc<dyn EmailDeliveryPort>>,
    sms_gateway: Option<Arc<dyn SmsGatewayPort>>,
    jwt_ttl_secs: u64,
    institutions_cache: RwLock<InstitutionsCacheState>,
    secure_links: Option<Arc<SecureLinkService>>,
}

impl AntiPhishingVaultService {
    pub fn new(repo: Arc<dyn VaultRepository>, crypto: Arc<dyn VaultCryptoPort>) -> Self {
        Self {
            repo,
            crypto,
            email_mailer: None,
            sms_gateway: None,
            jwt_ttl_secs: 3600,
            institutions_cache: RwLock::new(None),
            secure_links: None,
        }
    }

    pub fn with_saas_gateways(
        repo: Arc<dyn VaultRepository>,
        crypto: Arc<dyn VaultCryptoPort>,
        email_mailer: Arc<dyn EmailDeliveryPort>,
        sms_gateway: Arc<dyn SmsGatewayPort>,
        jwt_ttl_secs: u64,
    ) -> Self {
        Self {
            repo,
            crypto,
            email_mailer: Some(email_mailer),
            sms_gateway: Some(sms_gateway),
            jwt_ttl_secs,
            institutions_cache: RwLock::new(None),
            secure_links: None,
        }
    }

    /// Fast, read-through cached query for `GET /api/v1/institutions/active`.
    /// Serves concurrent reads from RAM via `tokio::sync::RwLock` for 300 seconds before
    /// refreshing from PostgreSQL.
    pub async fn get_cached_active_institutions(
        &self,
    ) -> VaultResult<Arc<Vec<PublicInstitutionSummary>>> {
        {
            let read_guard = self.institutions_cache.read().await;
            if let Some((cached_at, ref cached_list)) = *read_guard {
                if cached_at.elapsed() < ACTIVE_INSTITUTIONS_CACHE_TTL {
                    return Ok(Arc::clone(cached_list));
                }
            }
        }

        let fresh_list = Arc::new(self.repo.list_active_institutions().await?);
        {
            let mut write_guard = self.institutions_cache.write().await;
            *write_guard = Some((Instant::now(), Arc::clone(&fresh_list)));
        }

        Ok(fresh_list)
    }

    #[inline]
    pub fn repo(&self) -> &Arc<dyn VaultRepository> {
        &self.repo
    }

    #[inline]
    pub fn api_keys(&self) -> ApiKeyManagementService {
        ApiKeyManagementService::new(Arc::clone(&self.repo))
    }

    /// Generates & rotates a `sc_live_` or `sc_test_` API key for an active Algerian bank,
    /// storing only its SHA-256 hash in `institutions.api_key_hash`.
    pub async fn provision_institution_api_key(
        &self,
        institution_id: Uuid,
        env: ApiKeyEnvironment,
    ) -> VaultResult<ProvisionedApiKeyOutput> {
        self.api_keys()
            .provision_institution_key(institution_id, env)
            .await
    }

    /// Authenticates a B2B request via SHA-256 hashed `x-api-key`.
    pub async fn authenticate_institution_x_api_key(
        &self,
        raw_api_key: &str,
    ) -> VaultResult<(AlgerianInstitution, ApiKeyEnvironment)> {
        self.api_keys()
            .authenticate_x_api_key(raw_api_key)
            .await
    }

    /// Enables the Secure Interstitial Link Wrapper on outbound dispatches.
    pub fn with_secure_links(mut self, secure_links: Arc<SecureLinkService>) -> Self {
        self.secure_links = Some(secure_links);
        self
    }

    fn secure_links(&self) -> VaultResult<&Arc<SecureLinkService>> {
        self.secure_links
            .as_ref()
            .ok_or_else(|| VaultError::Config("Secure link wrapper is not configured".to_owned()))
    }

    /// Public Use Case: resolve `/go/:token` for the interstitial page.
    /// Consumes one unit of the link's resolution budget, then decrypts the target user's
    /// anti-phishing word in memory (zeroized on drop) and returns it with the destination.
    pub async fn resolve_secure_link(
        &self,
        raw_token: &str,
        actor_ip: &str,
    ) -> VaultResult<ResolvedSecureLinkOutput> {
        let token = SecureLinkToken::parse(raw_token)?;
        let link = self.secure_links()?.consume(&token).await?;

        let secret_word = match self
            .repo
            .find_vault_entry(link.tenant_id, &link.account_blind_index)
            .await?
        {
            Some(entry) if entry.is_enabled => {
                let code = self.crypto.decrypt_code(
                    link.tenant_id,
                    &link.account_blind_index,
                    entry.key_version,
                    &entry.nonce,
                    &entry.ciphertext,
                )?;
                Some(code)
            }
            _ => None,
        };

        self.repo
            .append_audit_log(AuditRecord {
                tenant_id: link.tenant_id,
                account_blind_index: &link.account_blind_index,
                event_type: "SECURE_LINK_RESOLVED",
                actor_ip,
                succeeded: true,
                reason: secret_word
                    .is_none()
                    .then_some("No active anti-phishing word for account"),
            })
            .await?;

        Ok(ResolvedSecureLinkOutput {
            target_url: link.target_url,
            institution_name: link.institution_name,
            secret_word,
            remaining_resolutions: link.remaining_resolutions,
            expires_at: link.expires_at,
        })
    }

    #[inline]
    pub fn crypto(&self) -> &Arc<dyn VaultCryptoPort> {
        &self.crypto
    }

    /// SaaS Use Case 1: Register a new user with real Email + E.164 Phone Number (`POST /register`).
    /// Generates two distinct CSPRNG 6-digit OTPs, stores only their keyed HMAC-SHA256 digests,
    /// enforces per-account SMS-bombing cooldowns, and dispatches via `lettre` SMTP and `reqwest` SMS Gateway.
    pub async fn register_saas_user(
        &self,
        raw_email: &str,
        raw_phone: &str,
        actor_ip: &str,
    ) -> VaultResult<RegistrationInitiatedOutput> {
        let email = EmailAddress::parse(raw_email)?;
        let phone = PhoneNumber::parse(raw_phone)?;

        let email_blind_index = self
            .crypto
            .compute_contact_blind_index("email", email.as_str())?;
        let phone_blind_index = self
            .crypto
            .compute_contact_blind_index("phone", phone.as_str())?;

        let now = Utc::now();
        let existing_user = self
            .repo
            .find_saas_user_by_contact_index(&email_blind_index, &phone_blind_index)
            .await?;

        let user_id = match existing_user {
            Some(ref existing) if existing.is_fully_verified() => {
                return Err(VaultError::Conflict(
                    "An account with this email or phone number is already registered and verified",
                ));
            }
            Some(ref existing) => {
                // Enforce per-contact cooldown in PostgreSQL to defeat multi-IP SMS bombing attacks
                if let Some(last_sent) = existing.last_otp_sent_at {
                    let elapsed_secs = (now - last_sent).num_seconds();
                    if elapsed_secs < OTP_RESEND_COOLDOWN_SECS {
                        let retry_after_secs =
                            (OTP_RESEND_COOLDOWN_SECS - elapsed_secs).max(1) as u64;
                        return Err(VaultError::RateLimitExceeded { retry_after_secs });
                    }
                }
                existing.id
            }
            None => Uuid::now_v7(),
        };

        // Generate two independent CSPRNG 6-digit OTPs (ZeroizeOnDrop)
        let email_otp = self.crypto.generate_csprng_six_digit_otp()?;
        let phone_otp = self.crypto.generate_csprng_six_digit_otp()?;

        let email_otp_hash = self
            .crypto
            .hash_verification_otp(user_id, "email", &email_otp)?;
        let phone_otp_hash = self
            .crypto
            .hash_verification_otp(user_id, "sms", &phone_otp)?;

        let otp_expires_at = now + ChronoDuration::minutes(OTP_TTL_MINUTES);
        let tenant_id = TenantId::public_saas();

        let pending_user = SaasUser {
            id: user_id,
            tenant_id,
            email_blind_index,
            email_masked: email.to_masked_preview(),
            phone_blind_index,
            phone_masked: phone.to_masked_preview(),
            email_verified: false,
            phone_verified: false,
            email_otp_hash: Some(email_otp_hash),
            phone_otp_hash: Some(phone_otp_hash),
            otp_expires_at: Some(otp_expires_at),
            otp_failed_attempts: 0,
            last_otp_sent_at: Some(now),
            created_at: now,
            updated_at: now,
        };

        let saved_user = self.repo.upsert_pending_saas_user(&pending_user).await?;

        let mailer = self.email_mailer.as_ref().ok_or_else(|| {
            VaultError::Config("SMTP Email gateway is not configured".to_owned())
        })?;
        let sms_gateway = self.sms_gateway.as_ref().ok_or_else(|| {
            VaultError::Config("HTTP SMS gateway is not configured".to_owned())
        })?;

        // Dispatch Email OTP (lettre SMTP) and Phone OTP (reqwest SMS Gateway) concurrently
        tokio::try_join!(
            mailer.send_verification_otp(&email, &email_otp),
            sms_gateway.send_verification_otp(&phone, &phone_otp),
        )?;

        let _ = self
            .repo
            .append_audit_log(AuditRecord {
                tenant_id,
                account_blind_index: &email_blind_index,
                event_type: "SAAS_REGISTRATION_DUAL_OTP_SENT",
                actor_ip,
                succeeded: true,
                reason: None,
            })
            .await;

        Ok(RegistrationInitiatedOutput {
            user_id: saved_user.id,
            email_masked: saved_user.email_masked,
            phone_masked: saved_user.phone_masked,
            email_verified: false,
            phone_verified: false,
            otp_expires_in_secs: (OTP_TTL_MINUTES * 60) as u64,
            status: "PENDING_DUAL_OTP_VERIFICATION",
        })
    }

    /// SaaS Use Case 2: Verify BOTH Email OTP and SMS Phone OTP, mark user verified, and issue JWT (`POST /verify-otp`).
    pub async fn verify_saas_user_otps_and_issue_jwt(
        &self,
        user_id: Uuid,
        raw_email_otp: &str,
        raw_phone_otp: &str,
        actor_ip: &str,
    ) -> VaultResult<VerifiedSessionOutput> {
        let submitted_email_otp = TwoFactorOtp::parse(raw_email_otp)?;
        let submitted_phone_otp = TwoFactorOtp::parse(raw_phone_otp)?;

        let user = self
            .repo
            .find_saas_user_by_id(user_id)
            .await?
            .ok_or(VaultError::NotFound)?;

        if user.otp_failed_attempts >= MAX_OTP_FAILED_ATTEMPTS {
            return Err(VaultError::InvalidTwoFactorOtp(
                "Maximum OTP verification attempts exceeded; please request new OTPs via /register",
            ));
        }

        let now = Utc::now();
        let expires_at = user.otp_expires_at.ok_or(VaultError::InvalidTwoFactorOtp(
            "No active OTP challenge found for this user; please register again",
        ))?;

        if now > expires_at {
            return Err(VaultError::InvalidTwoFactorOtp(
                "Verification OTPs have expired; please request fresh codes",
            ));
        }

        let expected_email_hash = user.email_otp_hash.ok_or(VaultError::InvalidTwoFactorOtp(
            "Email OTP challenge is no longer active",
        ))?;
        let expected_phone_hash = user.phone_otp_hash.ok_or(VaultError::InvalidTwoFactorOtp(
            "Phone SMS OTP challenge is no longer active",
        ))?;

        let email_ok = self.crypto.verify_hashed_otp(
            user.id,
            "email",
            &submitted_email_otp,
            &expected_email_hash,
        )?;
        let phone_ok = self.crypto.verify_hashed_otp(
            user.id,
            "sms",
            &submitted_phone_otp,
            &expected_phone_hash,
        )?;

        if !email_ok || !phone_ok {
            let _ = self.repo.increment_saas_user_otp_failures(user.id).await;
            let _ = self
                .repo
                .append_audit_log(AuditRecord {
                    tenant_id: user.tenant_id,
                    account_blind_index: &user.email_blind_index,
                    event_type: "SAAS_DUAL_OTP_VERIFICATION_FAILED",
                    actor_ip,
                    succeeded: false,
                    reason: Some("Invalid Email OTP or Phone SMS OTP"),
                })
                .await;

            return Err(VaultError::InvalidTwoFactorOtp(
                "Invalid Email OTP or Phone SMS OTP; both codes must match",
            ));
        }

        let verified_user = self.repo.mark_saas_user_fully_verified(user.id).await?;
        let access_token = self
            .crypto
            .issue_verified_user_jwt(&verified_user, self.jwt_ttl_secs)?;

        let _ = self
            .repo
            .append_audit_log(AuditRecord {
                tenant_id: verified_user.tenant_id,
                account_blind_index: &verified_user.email_blind_index,
                event_type: "SAAS_DUAL_OTP_VERIFIED_JWT_ISSUED",
                actor_ip,
                succeeded: true,
                reason: None,
            })
            .await;

        Ok(VerifiedSessionOutput {
            user_id: verified_user.id,
            access_token,
            token_type: "Bearer",
            expires_in_secs: self.jwt_ttl_secs,
            email_verified: verified_user.email_verified,
            phone_verified: verified_user.phone_verified,
        })
    }

    /// Enforces that a Bearer JWT is cryptographically valid AND that the backing `SaasUser`
    /// in PostgreSQL has BOTH `email_verified = true` and `phone_verified = true`.
    pub async fn authenticate_verified_saas_jwt(
        &self,
        bearer_token: &str,
    ) -> VaultResult<(SaasUser, VerifiedJwtClaims)> {
        let claims = self.crypto.verify_user_jwt(bearer_token)?;
        claims.ensure_fully_verified()?;

        let user = self
            .repo
            .find_saas_user_by_id(claims.sub)
            .await?
            .ok_or(VaultError::Unauthorized("Unknown SaaS user account"))?;

        if !user.is_fully_verified() {
            return Err(VaultError::AccountNotVerified(
                "Code Vault access denied: both Email and Phone must be verified",
            ));
        }

        Ok((user, claims))
    }

    /// Use Case 3: Enroll or rotate an account's Anti-Phishing Code (`POST /api/v1/security/code`)
    /// with strict Regex validation and HKDF-backed 2FA TOTP verification.
    pub async fn enroll_or_rotate_code_with_2fa(
        &self,
        tenant_id: TenantId,
        raw_account_ref: &str,
        raw_code: &str,
        raw_otp: &str,
        actor_ip: &str,
    ) -> VaultResult<CodeStatusOutput> {
        let account_ref = ExternalAccountRef::parse(raw_account_ref)?;
        let blind_index = self
            .crypto
            .compute_account_blind_index(tenant_id, &account_ref)?;

        let otp = TwoFactorOtp::parse(raw_otp)?;

        let code = match AntiPhishingCode::parse(raw_code) {
            Ok(valid) => valid,
            Err(err) => {
                let _ = self
                    .repo
                    .append_audit_log(AuditRecord {
                        tenant_id,
                        account_blind_index: &blind_index,
                        event_type: "CODE_ENROLL_REGEX_VALIDATION_FAILED",
                        actor_ip,
                        succeeded: false,
                        reason: Some("Payload failed strict Regex validation"),
                    })
                    .await;
                return Err(err);
            }
        };

        // Verify 2FA OTP using the HKDF-derived per-account secret key inside `VaultCryptoPort`
        if !self
            .crypto
            .verify_account_totp(tenant_id, &blind_index, &otp)?
        {
            let _ = self
                .repo
                .append_audit_log(AuditRecord {
                    tenant_id,
                    account_blind_index: &blind_index,
                    event_type: "CODE_ENROLL_2FA_FAILED",
                    actor_ip,
                    succeeded: false,
                    reason: Some("Invalid or expired 6-digit 2FA OTP"),
                })
                .await;
            return Err(VaultError::InvalidTwoFactorOtp(
                "Invalid or expired 6-digit 2FA OTP code",
            ));
        }

        let masked_preview = code.to_masked_preview();
        let (nonce, ciphertext) = self.crypto.encrypt_code(
            tenant_id,
            &blind_index,
            CURRENT_KEY_VERSION,
            &code,
        )?;
        let now = Utc::now();

        let entry = VaultEntry {
            id: Uuid::now_v7(),
            tenant_id,
            account_blind_index: blind_index,
            masked_preview,
            nonce,
            ciphertext,
            key_version: CURRENT_KEY_VERSION,
            is_enabled: true,
            created_at: now,
            updated_at: now,
        };

        let saved = self.repo.upsert_vault_entry(&entry).await?;

        self.repo
            .append_audit_log(AuditRecord {
                tenant_id,
                account_blind_index: &blind_index,
                event_type: "CODE_ENROLLED_OR_ROTATED",
                actor_ip,
                succeeded: true,
                reason: None,
            })
            .await?;

        Ok(CodeStatusOutput {
            is_enabled: saved.is_enabled,
            masked_code: Some(saved.masked_preview),
            key_version: Some(saved.key_version),
            updated_at: Some(saved.updated_at),
        })
    }

    /// Use Case 4: Query activation status and masked code (`GET /api/v1/security/code/status`).
    pub async fn get_code_status(
        &self,
        tenant_id: TenantId,
        raw_account_ref: &str,
    ) -> VaultResult<CodeStatusOutput> {
        let account_ref = ExternalAccountRef::parse(raw_account_ref)?;
        let blind_index = self
            .crypto
            .compute_account_blind_index(tenant_id, &account_ref)?;

        match self.repo.find_vault_entry(tenant_id, &blind_index).await? {
            Some(entry) if entry.is_enabled => Ok(CodeStatusOutput {
                is_enabled: true,
                masked_code: Some(entry.masked_preview),
                key_version: Some(entry.key_version),
                updated_at: Some(entry.updated_at),
            }),
            _ => Ok(CodeStatusOutput {
                is_enabled: false,
                masked_code: None,
                key_version: None,
                updated_at: None,
            }),
        }
    }

    /// Use Case 5: Authorized B2B Notification Dispatcher Middleware (`POST /api/v1/security/dispatch/stamp`).
    ///
    /// When `wrap_links` is true (the default), every URL in the template is validated against the
    /// tenant's approved domains and replaced with a `https://<dz-domain>/go/<token>` interstitial
    /// shortlink BEFORE the secret word is stamped (so the word can never be parsed as part of a URL).
    pub async fn stamp_outgoing_notification(
        &self,
        tenant_id: TenantId,
        raw_account_ref: &str,
        template_body: &str,
        fallback_notice: Option<&str>,
        wrap_links: bool,
        actor_ip: &str,
    ) -> VaultResult<StampedNotificationOutput> {
        if !template_body.contains("{{ANTI_PHISHING_CODE}}") {
            return Err(VaultError::Validation(
                "Template body must contain the {{ANTI_PHISHING_CODE}} placeholder".to_owned(),
            ));
        }

        let account_ref = ExternalAccountRef::parse(raw_account_ref)?;
        let blind_index = self
            .crypto
            .compute_account_blind_index(tenant_id, &account_ref)?;

        let (template_body, wrapped_links) = if wrap_links {
            let wrapped = self
                .secure_links()?
                .wrap_message(tenant_id, &blind_index, template_body)
                .await?;
            (wrapped.body, wrapped.wrapped_count)
        } else {
            (template_body.to_owned(), 0)
        };
        let template_body = template_body.as_str();

        let maybe_entry = self.repo.find_vault_entry(tenant_id, &blind_index).await?;

        match maybe_entry {
            Some(entry) if entry.is_enabled => {
                let decrypted_code = self.crypto.decrypt_code(
                    tenant_id,
                    &blind_index,
                    entry.key_version,
                    &entry.nonce,
                    &entry.ciphertext,
                )?;

                let stamped_payload =
                    template_body.replace("{{ANTI_PHISHING_CODE}}", decrypted_code.expose_str());

                self.repo
                    .append_audit_log(AuditRecord {
                        tenant_id,
                        account_blind_index: &blind_index,
                        event_type: "DISPATCH_STAMPED_ACTIVE_CODE",
                        actor_ip,
                        succeeded: true,
                        reason: None,
                    })
                    .await?;

                Ok(StampedNotificationOutput {
                    stamped_payload,
                    code_applied: true,
                    masked_code: Some(entry.masked_preview),
                    wrapped_links,
                })
            }
            _ => {
                let fallback = fallback_notice.unwrap_or("[Anti-Phishing Code Not Configured]");
                let stamped_payload = template_body.replace("{{ANTI_PHISHING_CODE}}", fallback);

                self.repo
                    .append_audit_log(AuditRecord {
                        tenant_id,
                        account_blind_index: &blind_index,
                        event_type: "DISPATCH_STAMPED_FALLBACK",
                        actor_ip,
                        succeeded: true,
                        reason: Some("No active anti-phishing code configured for account"),
                    })
                    .await?;

                Ok(StampedNotificationOutput {
                    stamped_payload,
                    code_applied: false,
                    masked_code: None,
                    wrapped_links,
                })
            }
        }
    }

    /// Use Case 6: B2B Secure SMS Dispatch (`POST /api/v1/sms/send-secure`).
    ///
    /// * Validates Algerian mobile destination (`+213[567][0-9]{8}` under Law 18-07).
    /// * Auto-injects `{{ANTI_PHISHING_CODE}}` prefix if omitted by the bank template.
    /// * Decrypts the target user's personal Secret Word & wraps outbound URLs via `/go/:hash`.
    /// * Dispatches over `SmsGatewayPort` for `sc_live_` keys or returns sandbox receipt for `sc_test_`.
    #[allow(clippy::too_many_arguments)]
    pub async fn send_secure_b2b_sms(
        &self,
        tenant_id: TenantId,
        institution_name: &str,
        env: ApiKeyEnvironment,
        raw_account_ref: &str,
        raw_phone_number: &str,
        message_body: &str,
        wrap_links: bool,
        actor_ip: &str,
    ) -> VaultResult<SendSecureSmsOutput> {
        let trimmed_body = message_body.trim();
        if trimmed_body.is_empty() || trimmed_body.len() > 480 {
            return Err(VaultError::Validation(
                "message_body must be between 1 and 480 characters".to_owned(),
            ));
        }

        let recipient = PhoneNumber::parse(raw_phone_number)?;

        let prepared_template = if trimmed_body.contains("{{ANTI_PHISHING_CODE}}") {
            trimmed_body.to_owned()
        } else {
            format!("[{{{{ANTI_PHISHING_CODE}}}}] {}", trimmed_body)
        };

        let mut stamped = self
            .stamp_outgoing_notification(
                tenant_id,
                raw_account_ref,
                &prepared_template,
                None,
                wrap_links,
                actor_ip,
            )
            .await?;

        let delivery_status = match env {
            ApiKeyEnvironment::Live => {
                let gateway = self.sms_gateway.as_ref().ok_or_else(|| {
                    VaultError::Config("SMS gateway is not configured for live dispatch".to_owned())
                })?;
                let res = gateway
                    .send_stamped_sms(&recipient, institution_name, &stamped.stamped_payload)
                    .await;
                stamped.stamped_payload.zeroize();
                res?;
                "dispatched_live"
            }
            ApiKeyEnvironment::Test => {
                stamped.stamped_payload.zeroize();
                "simulated_test_sandbox"
            }
        };

        Ok(SendSecureSmsOutput {
            message_id: Uuid::now_v7(),
            institution_name: institution_name.to_owned(),
            environment: env,
            recipient_masked: recipient.to_masked_preview(),
            code_applied: stamped.code_applied,
            masked_code: stamped.masked_code,
            wrapped_links: stamped.wrapped_links,
            delivery_status,
            dispatched_at: Utc::now(),
        })
    }
}
