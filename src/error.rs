use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde::Serialize;
use thiserror::Error;

pub type VaultResult<T> = Result<T, VaultError>;

/// Unified error type across Domain, Cryptography, Infrastructure, and API layers.
/// Designed so internal database, upstream gateway, or cryptographic details are never leaked to HTTP clients.
#[derive(Debug, Error)]
pub enum VaultError {
    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Authentication failed: {0}")]
    Unauthorized(&'static str),

    #[error("Account verification required: {0}")]
    AccountNotVerified(&'static str),

    #[error("Geographic access denied under Algerian Law 18-07: {0}")]
    ForeignIpBlocked(&'static str),

    #[error("2FA OTP verification failed: {0}")]
    InvalidTwoFactorOtp(&'static str),

    #[error("Resource conflict: {0}")]
    Conflict(&'static str),

    #[error("Rate limit exceeded; retry after {retry_after_secs}s")]
    RateLimitExceeded { retry_after_secs: u64 },

    #[error("Requested vault resource was not found")]
    NotFound,

    #[error("Cryptographic operation failed")]
    CryptoFailure,

    #[error("Storage layer failure")]
    StorageFailure,

    #[error("External OTP delivery gateway failure: {0}")]
    ExternalDeliveryFailure(&'static str),

    #[error("Configuration error: {0}")]
    Config(String),
}

#[derive(Serialize)]
struct ErrorEnvelope<'a> {
    error_code: &'a str,
    message: String,
}

impl IntoResponse for VaultError {
    fn into_response(self) -> Response {
        if let VaultError::RateLimitExceeded { retry_after_secs } = self {
            let body = Json(ErrorEnvelope {
                error_code: "RATE_LIMIT_EXCEEDED",
                message: format!(
                    "Too many requests. Please wait {} seconds before retrying.",
                    retry_after_secs
                ),
            });
            return (
                StatusCode::TOO_MANY_REQUESTS,
                [(header::RETRY_AFTER, retry_after_secs.to_string())],
                body,
            )
                .into_response();
        }

        let (status, code, client_message) = match &self {
            VaultError::Validation(msg) => {
                (StatusCode::BAD_REQUEST, "VALIDATION_ERROR", msg.clone())
            }
            VaultError::Unauthorized(reason) => (
                StatusCode::UNAUTHORIZED,
                "UNAUTHORIZED",
                (*reason).to_owned(),
            ),
            VaultError::AccountNotVerified(reason) => (
                StatusCode::FORBIDDEN,
                "ACCOUNT_NOT_FULLY_VERIFIED",
                (*reason).to_owned(),
            ),
            VaultError::ForeignIpBlocked(reason) => (
                StatusCode::FORBIDDEN,
                "LAW_18_07_GEO_RESTRICTION",
                (*reason).to_owned(),
            ),
            VaultError::InvalidTwoFactorOtp(reason) => (
                StatusCode::FORBIDDEN,
                "INVALID_2FA_OTP",
                (*reason).to_owned(),
            ),
            VaultError::Conflict(reason) => (
                StatusCode::CONFLICT,
                "RESOURCE_CONFLICT",
                (*reason).to_owned(),
            ),
            VaultError::RateLimitExceeded { .. } => unreachable!(),
            VaultError::NotFound => (
                StatusCode::NOT_FOUND,
                "VAULT_RESOURCE_NOT_FOUND",
                "Requested user or anti-phishing vault record was not found".to_owned(),
            ),
            VaultError::CryptoFailure => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "CRYPTO_INTEGRITY_ERROR",
                "Unable to process cryptographic operation".to_owned(),
            ),
            VaultError::StorageFailure => (
                StatusCode::SERVICE_UNAVAILABLE,
                "STORAGE_UNAVAILABLE",
                "Vault persistence layer is temporarily unavailable".to_owned(),
            ),
            VaultError::ExternalDeliveryFailure(reason) => (
                StatusCode::BAD_GATEWAY,
                "OTP_DELIVERY_GATEWAY_ERROR",
                (*reason).to_owned(),
            ),
            VaultError::Config(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "SERVER_CONFIG_ERROR",
                "Internal configuration error".to_owned(),
            ),
        };

        let body = Json(ErrorEnvelope {
            error_code: code,
            message: client_message,
        });

        (status, body).into_response()
    }
}
