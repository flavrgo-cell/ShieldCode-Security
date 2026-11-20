use async_trait::async_trait;
use lettre::message::{header::ContentType, Mailbox};
use lettre::transport::smtp::authentication::Credentials;
use lettre::{AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor};
use secrecy::ExposeSecret;
use zeroize::Zeroizing;

use crate::config::SmtpConfig;
use crate::domain::ports::EmailDeliveryPort;
use crate::domain::value_objects::{EmailAddress, TwoFactorOtp};
use crate::error::{VaultError, VaultResult};

/// Production SMTP Email adapter powered by `lettre` (`AsyncSmtpTransport<Tokio1Executor>`).
/// Dispatches 6-digit verification OTPs over STARTTLS/TLS without logging PII or OTP tokens.
#[derive(Clone)]
pub struct LettreSmtpMailer {
    mailer: AsyncSmtpTransport<Tokio1Executor>,
    from_mailbox: Mailbox,
}

impl LettreSmtpMailer {
    pub fn new(config: &SmtpConfig) -> VaultResult<Self> {
        let from_mailbox: Mailbox = config.from_email.parse().map_err(|_| {
            VaultError::Config("Invalid SMTP_FROM_EMAIL mailbox format".to_owned())
        })?;

        let credentials = Credentials::new(
            config.username.clone(),
            config.password.expose_secret().to_owned(),
        );

        let mailer = AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(&config.host)
            .map_err(|_| VaultError::Config("Invalid SMTP_HOST relay address".to_owned()))?
            .port(config.port)
            .credentials(credentials)
            .build();

        Ok(Self {
            mailer,
            from_mailbox,
        })
    }
}

#[async_trait]
impl EmailDeliveryPort for LettreSmtpMailer {
    async fn send_verification_otp(
        &self,
        recipient: &EmailAddress,
        otp: &TwoFactorOtp,
    ) -> VaultResult<()> {
        let to_mailbox: Mailbox = recipient.as_str().parse().map_err(|_| {
            VaultError::Validation("Recipient email address rejected by RFC-5322 parser".to_owned())
        })?;

        // Format the email body inside a Zeroizing buffer so the 6-digit OTP is scrubbed on drop
        let email_body = Zeroizing::new(format!(
            "ShieldCode Anti-Phishing Vault Verification\r\n\r\n\
             Your 6-digit Email verification OTP is: {}\r\n\r\n\
             This code expires in 10 minutes. Never share this OTP with anyone.",
            otp.expose_str()
        ));

        let message = Message::builder()
            .from(self.from_mailbox.clone())
            .to(to_mailbox)
            .subject("ShieldCode Security: Verify Your Email Address")
            .header(ContentType::TEXT_PLAIN)
            .body((*email_body).clone())
            .map_err(|_| {
                VaultError::ExternalDeliveryFailure("Failed to construct SMTP verification message")
            })?;

        self.mailer.send(message).await.map_err(|_| {
            // Never log the underlying lettre::Error Display string as it can include recipient PII
            tracing::error!("SMTP transport failed to deliver verification OTP");
            VaultError::ExternalDeliveryFailure("SMTP gateway failed to deliver verification OTP")
        })?;

        Ok(())
    }
}
