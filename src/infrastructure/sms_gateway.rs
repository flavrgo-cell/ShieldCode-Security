use std::time::Duration;

use async_trait::async_trait;
use reqwest::Client;
use secrecy::{ExposeSecret, SecretString};
use serde::Serialize;
use zeroize::{Zeroize, Zeroizing};

use crate::config::SmsGatewayConfig;
use crate::domain::ports::SmsGatewayPort;
use crate::domain::value_objects::{PhoneNumber, TwoFactorOtp};
use crate::error::{VaultError, VaultResult};

/// Outbound JSON payload sent to the external SMS Gateway REST API.
#[derive(Serialize)]
struct SmsGatewayPayload<'a> {
    to: &'a str,
    from: &'a str,
    message: &'a str,
    channel: &'static str,
}

/// Production HTTP client adapter (`reqwest`) for dispatching 6-digit SMS OTPs
/// via an external SMS Gateway API over TLS (`rustls-tls`).
#[derive(Clone)]
pub struct ReqwestSmsGateway {
    http_client: Client,
    endpoint_url: String,
    api_key: SecretString,
    sender_id: String,
}

impl ReqwestSmsGateway {
    pub fn new(config: &SmsGatewayConfig) -> VaultResult<Self> {
        let http_client = Client::builder()
            .timeout(Duration::from_secs(config.timeout_secs))
            .connect_timeout(Duration::from_secs(4))
            .use_rustls_tls()
            .build()
            .map_err(|_| {
                VaultError::Config("Failed to initialize reqwest TLS HTTP client".to_owned())
            })?;

        Ok(Self {
            http_client,
            endpoint_url: config.endpoint_url.clone(),
            api_key: config.api_key.clone(),
            sender_id: config.sender_id.clone(),
        })
    }

    async fn dispatch_sms(
        &self,
        recipient: &PhoneNumber,
        sender: &str,
        message: &str,
    ) -> VaultResult<()> {
        let payload = SmsGatewayPayload {
            to: recipient.as_str(),
            from: sender,
            message,
            channel: "sms",
        };

        let response = self
            .http_client
            .post(&self.endpoint_url)
            .bearer_auth(self.api_key.expose_secret())
            .json(&payload)
            .send()
            .await
            .map_err(|_| {
                tracing::error!("SMS gateway HTTP request failed or timed out");
                VaultError::ExternalDeliveryFailure(
                    "External SMS gateway request failed or timed out",
                )
            })?;

        let status = response.status();
        if !status.is_success() {
            tracing::error!(
                http_status = status.as_u16(),
                "External SMS gateway returned non-success status code"
            );
            return Err(VaultError::ExternalDeliveryFailure(
                "External SMS gateway rejected SMS dispatch request",
            ));
        }

        Ok(())
    }
}

#[async_trait]
impl SmsGatewayPort for ReqwestSmsGateway {
    async fn send_verification_otp(
        &self,
        recipient: &PhoneNumber,
        otp: &TwoFactorOtp,
    ) -> VaultResult<()> {
        let mut sms_text = Zeroizing::new(format!(
            "[ShieldCode Vault] Your 6-digit phone verification code is: {}. Valid for 10 minutes.",
            otp.expose_str()
        ));

        let result = self.dispatch_sms(recipient, &self.sender_id, &sms_text).await;
        // Explicitly zeroize the formatted SMS text buffer immediately after transmission
        sms_text.zeroize();
        result
    }

    async fn send_stamped_sms(
        &self,
        recipient: &PhoneNumber,
        sender_name: &str,
        stamped_body: &str,
    ) -> VaultResult<()> {
        let sender = if sender_name.trim().is_empty() {
            self.sender_id.as_str()
        } else {
            sender_name.trim()
        };
        self.dispatch_sms(recipient, sender, stamped_body).await
    }
}
