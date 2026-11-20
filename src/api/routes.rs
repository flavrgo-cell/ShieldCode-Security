use std::sync::Arc;
use std::time::Duration;

use axum::body::Body;
use axum::extract::{DefaultBodyLimit, MatchedPath, Path, Query, State};
use axum::http::{
    header::{self, HeaderName, AUTHORIZATION},
    Request, StatusCode,
};
use axum::middleware::from_fn_with_state;
use axum::response::IntoResponse;
use axum::routing::{get, post};
use axum::{Json, Router};
use secrecy::ExposeSecret;
use tower_http::sensitive_headers::SetSensitiveRequestHeadersLayer;
use tower_http::trace::TraceLayer;

use crate::api::dto::{
    ActiveInstitutionsResponse, ApiErrorResponse, CodeStatusQuery, CodeStatusResponse,
    GenerateApiKeyRequest, GenerateApiKeyResponse, HealthResponse, PublicInstitutionDto,
    RegisterUserRequest, RegisterUserResponse, SendSecureSmsRequest, SendSecureSmsResponse,
    SetAntiPhishingCodeRequest, StampNotificationRequest, StampNotificationResponse,
    VerifyDualOtpRequest, VerifyDualOtpResponse, VerifyLinkResponse,
};
use crate::api::middleware::{
    algeria_geo_block_middleware, rate_limit_middleware, x_api_key_auth_middleware,
    AlgerianGeoIpEnforcer, ApiKeyTenant, AuthenticatedTenant, ClientIp, RateLimiterState,
    HEADER_ACCOUNT_REF, HEADER_B2B_API_KEY, HEADER_TENANT_API_KEY,
};
use crate::api::openapi::swagger_routes;
use crate::application::use_cases::AntiPhishingVaultService;
use crate::error::VaultResult;

/// Builds the hardened Axum router for the Algerian Sovereign Anti-Phishing Code Vault (Law 18-07):
/// - Enforces local MaxMind `.mmdb` IP Geo-Blocking (`algeria_geo_block_middleware`) dropping any
///   non-Algerian (`!= DZ`) IP with `403 Forbidden`.
/// - Redacts `Authorization`, `x-api-key`, `X-Vault-Api-Key`, and `X-Account-Ref` from HTTP traces.
/// - Authenticates B2B bank API requests (`/api/v1/sms/send-secure`, `/api/v1/institutions/api-keys`)
///   using `x-api-key` hashed with SHA-256 against `institutions.api_key_hash`.
/// - Exposes interactive OpenAPI / Swagger UI at `/api/docs`.
pub fn build_router(
    service: Arc<AntiPhishingVaultService>,
    geo_enforcer: AlgerianGeoIpEnforcer,
) -> Router {
    let sensitive_headers = Arc::new([
        AUTHORIZATION,
        HeaderName::from_static(HEADER_B2B_API_KEY),
        HeaderName::from_static(HEADER_TENANT_API_KEY),
        HeaderName::from_static(HEADER_ACCOUNT_REF),
    ]);

    // Strict anti-SMS-bombing limiter: max 2 OTP generation requests per 60 seconds per IP
    let otp_generation_limiter = RateLimiterState::new(2, Duration::from_secs(60));
    // Brute-force limiter for OTP verification and Code Vault writes: max 5 requests per 60 seconds
    let write_limiter = RateLimiterState::new(5, Duration::from_secs(60));
    // Status & dispatch limiter: max 30 requests per 60 seconds
    let read_limiter = RateLimiterState::new(30, Duration::from_secs(60));
    // B2B Bank API limiter: max 60 requests per 60 seconds per key prefix + IP
    let b2b_api_limiter = RateLimiterState::new(60, Duration::from_secs(60));

    let otp_dispatch_routes = Router::new()
        .route("/register", post(register_saas_user_handler))
        .route("/api/v1/auth/register", post(register_saas_user_handler))
        .route_layer(from_fn_with_state(
            otp_generation_limiter,
            rate_limit_middleware,
        ));

    let write_routes = Router::new()
        .route("/verify-otp", post(verify_dual_otp_handler))
        .route("/api/v1/auth/verify-otp", post(verify_dual_otp_handler))
        .route("/api/v1/security/code", post(set_anti_phishing_code_handler))
        .route_layer(from_fn_with_state(write_limiter, rate_limit_middleware));

    let read_routes = Router::new()
        .route(
            "/api/v1/institutions/active",
            get(get_active_institutions_handler),
        )
        .route(
            "/api/v1/security/code/status",
            get(get_anti_phishing_code_status_handler),
        )
        .route(
            "/api/v1/security/dispatch/stamp",
            post(stamp_outgoing_notification_handler),
        )
        .route_layer(from_fn_with_state(read_limiter, rate_limit_middleware));

    // Anti-enumeration limiter for the public interstitial resolver: 20 req / 60s per IP.
    let link_limiter = RateLimiterState::new(20, Duration::from_secs(60));
    let link_routes = Router::new()
        .route("/api/v1/verify-link/:hash", get(verify_secure_link_handler))
        .route_layer(from_fn_with_state(link_limiter, rate_limit_middleware));

    // Public B2B Bank API routes authenticated via `x-api-key` (`sc_live_` / `sc_test_`).
    let b2b_bank_routes = Router::new()
        .route("/api/v1/sms/send-secure", post(send_secure_sms_handler))
        .route(
            "/api/v1/institutions/api-keys",
            post(generate_institution_api_key_handler),
        )
        .route_layer(from_fn_with_state(
            Arc::clone(&service),
            x_api_key_auth_middleware,
        ))
        .route_layer(from_fn_with_state(b2b_api_limiter, rate_limit_middleware));

    let sanitized_trace_layer = TraceLayer::new_for_http().make_span_with(|req: &Request<Body>| {
        // Log only the route template or path without query parameters (`?external_account_ref=...`)
        let route_path = req
            .extensions()
            .get::<MatchedPath>()
            .map(MatchedPath::as_str)
            .unwrap_or_else(|| req.uri().path());

        tracing::info_span!(
            "vault_http_request",
            method = %req.method(),
            route = %route_path,
        )
    });

    Router::new()
        .route("/v1/health", get(health_check))
        .merge(swagger_routes())
        .merge(otp_dispatch_routes)
        .merge(write_routes)
        .merge(read_routes)
        .merge(link_routes)
        .merge(b2b_bank_routes)
        .route_layer(from_fn_with_state(
            geo_enforcer,
            algeria_geo_block_middleware,
        ))
        .layer(DefaultBodyLimit::max(32 * 1024))
        .layer(SetSensitiveRequestHeadersLayer::from_shared(
            sensitive_headers,
        ))
        .layer(sanitized_trace_layer)
        .with_state(service)
}

#[utoipa::path(
    get,
    path = "/v1/health",
    tag = "Verification",
    responses(
        (status = 200, description = "Service is healthy", body = HealthResponse)
    )
)]
pub async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        service: "shieldcode-vault-api",
        version: env!("CARGO_PKG_VERSION"),
    })
}

/// `GET /api/v1/institutions/active`
/// Fast, RwLock-cached public endpoint returning active Algerian Financial & Postal Institutions
/// (`id`, `name`, `type`) with HTTP `Cache-Control: public, max-age=300`.
#[utoipa::path(
    get,
    path = "/api/v1/institutions/active",
    tag = "Institutions",
    responses(
        (status = 200, description = "Cached list of active Algerian financial & postal institutions", body = ActiveInstitutionsResponse),
        (status = 403, description = "Blocked outside Algerian territory (Law 18-07)", body = ApiErrorResponse)
    )
)]
pub async fn get_active_institutions_handler(
    State(service): State<Arc<AntiPhishingVaultService>>,
) -> VaultResult<impl IntoResponse> {
    let cached = service.get_cached_active_institutions().await?;
    let institutions: Vec<PublicInstitutionDto> =
        cached.iter().map(PublicInstitutionDto::from).collect();
    let count = institutions.len();

    Ok((
        StatusCode::OK,
        [(header::CACHE_CONTROL, "public, max-age=300, stale-while-revalidate=60")],
        Json(ActiveInstitutionsResponse {
            count,
            institutions,
        }),
    ))
}

/// `POST /register` (and `POST /api/v1/auth/register`)
/// Accepts a real email and E.164 phone number, generates two CSPRNG 6-digit OTPs,
/// sends the Email OTP via `lettre` SMTP and the SMS OTP via `reqwest` SMS Gateway.
async fn register_saas_user_handler(
    State(service): State<Arc<AntiPhishingVaultService>>,
    ClientIp(client_ip): ClientIp,
    Json(payload): Json<RegisterUserRequest>,
) -> VaultResult<(StatusCode, Json<RegisterUserResponse>)> {
    let output = service
        .register_saas_user(
            payload.email.expose_secret(),
            payload.phone_number.expose_secret(),
            &client_ip,
        )
        .await?;

    Ok((
        StatusCode::ACCEPTED,
        Json(RegisterUserResponse {
            user_id: output.user_id,
            email_masked: output.email_masked,
            phone_masked: output.phone_masked,
            email_verified: output.email_verified,
            phone_verified: output.phone_verified,
            otp_expires_in_secs: output.otp_expires_in_secs,
            status: output.status,
        }),
    ))
}

/// `POST /verify-otp` (and `POST /api/v1/auth/verify-otp`)
/// Verifies both the 6-digit Email OTP and the 6-digit SMS OTP in constant time.
/// Once both are verified, marks the user verified in PostgreSQL and issues a signed Bearer JWT.
async fn verify_dual_otp_handler(
    State(service): State<Arc<AntiPhishingVaultService>>,
    ClientIp(client_ip): ClientIp,
    Json(payload): Json<VerifyDualOtpRequest>,
) -> VaultResult<(StatusCode, Json<VerifyDualOtpResponse>)> {
    let session = service
        .verify_saas_user_otps_and_issue_jwt(
            payload.user_id,
            payload.email_otp.expose_secret(),
            payload.phone_otp.expose_secret(),
            &client_ip,
        )
        .await?;

    Ok((
        StatusCode::OK,
        Json(VerifyDualOtpResponse {
            user_id: session.user_id,
            access_token: session.access_token,
            token_type: session.token_type,
            expires_in_secs: session.expires_in_secs,
            email_verified: session.email_verified,
            phone_verified: session.phone_verified,
        }),
    ))
}

/// `POST /api/v1/security/code`
/// Guarded by `AuthenticatedTenant` which enforces that SaaS users have a valid Bearer JWT
/// AND that BOTH `email_verified` and `phone_verified` are `true` before accessing the Code Vault.
async fn set_anti_phishing_code_handler(
    State(service): State<Arc<AntiPhishingVaultService>>,
    auth: AuthenticatedTenant,
    Json(payload): Json<SetAntiPhishingCodeRequest>,
) -> VaultResult<(StatusCode, Json<CodeStatusResponse>)> {
    let account_ref = auth
        .header_account_ref
        .as_deref()
        .unwrap_or(&payload.external_account_ref);

    let status = service
        .enroll_or_rotate_code_with_2fa(
            auth.tenant_id,
            account_ref,
            payload.anti_phishing_code.expose_secret(),
            payload.otp_code.expose_secret(),
            &auth.client_ip,
        )
        .await?;

    Ok((
        StatusCode::OK,
        Json(CodeStatusResponse {
            is_enabled: status.is_enabled,
            masked_code: status.masked_code,
            key_version: status.key_version,
            updated_at: status.updated_at,
        }),
    ))
}

/// `GET /api/v1/security/code/status`
async fn get_anti_phishing_code_status_handler(
    State(service): State<Arc<AntiPhishingVaultService>>,
    auth: AuthenticatedTenant,
    Query(query): Query<CodeStatusQuery>,
) -> VaultResult<Json<CodeStatusResponse>> {
    let account_ref = auth
        .header_account_ref
        .as_deref()
        .or(query.external_account_ref.as_deref())
        .unwrap_or("default_account");

    let status = service.get_code_status(auth.tenant_id, account_ref).await?;

    Ok(Json(CodeStatusResponse {
        is_enabled: status.is_enabled,
        masked_code: status.masked_code,
        key_version: status.key_version,
        updated_at: status.updated_at,
    }))
}

/// `POST /api/v1/security/dispatch/stamp`
async fn stamp_outgoing_notification_handler(
    State(service): State<Arc<AntiPhishingVaultService>>,
    auth: AuthenticatedTenant,
    Json(payload): Json<StampNotificationRequest>,
) -> VaultResult<Json<StampNotificationResponse>> {
    let account_ref = auth
        .header_account_ref
        .as_deref()
        .unwrap_or(&payload.external_account_ref);

    let result = service
        .stamp_outgoing_notification(
            auth.tenant_id,
            account_ref,
            &payload.template_body,
            payload.fallback_notice.as_deref(),
            payload.wrap_links,
            &auth.client_ip,
        )
        .await?;

    Ok(Json(StampNotificationResponse {
        stamped_payload: result.stamped_payload,
        code_applied: result.code_applied,
        masked_code: result.masked_code,
        wrapped_links: result.wrapped_links,
    }))
}

/// `GET /api/v1/verify-link/:hash`
///
/// Public (no tenant auth — the 128-bit token IS the capability) but still:
/// - geo-blocked to Algeria (DZ) by the global middleware,
/// - rate-limited per IP (anti-enumeration),
/// - budget-limited per link (atomic counter) and time-limited (`expires_at`),
/// - returns a uniform 404 for unknown / expired / revoked / exhausted links (no oracle),
/// - served with `no-store` + `no-referrer` so the secret word is never cached or leaked.
#[utoipa::path(
    get,
    path = "/api/v1/verify-link/{hash}",
    tag = "Verification",
    params(
        ("hash" = String, Path, description = "22-character base64url shortlink token generated by the Secure Link Wrapper")
    ),
    responses(
        (status = 200, description = "Link verified and customer secret word retrieved", body = VerifyLinkResponse),
        (status = 403, description = "Blocked outside Algerian territory (Law 18-07)", body = ApiErrorResponse),
        (status = 404, description = "Link unknown, revoked, expired, or resolution budget exhausted", body = ApiErrorResponse)
    )
)]
pub async fn verify_secure_link_handler(
    State(service): State<Arc<AntiPhishingVaultService>>,
    ClientIp(client_ip): ClientIp,
    Path(hash): Path<String>,
) -> VaultResult<impl IntoResponse> {
    let resolved = service.resolve_secure_link(&hash, &client_ip).await?;

    let secret_word = resolved
        .secret_word
        .as_ref()
        .map(|c| c.expose_str().to_owned());
    let secret_word_configured = secret_word.is_some();

    let body = Json(VerifyLinkResponse {
        target_url: resolved.target_url,
        institution_name: resolved.institution_name,
        secret_word,
        secret_word_configured,
        remaining_resolutions: resolved.remaining_resolutions,
        expires_at: resolved.expires_at,
    })
    .into_response();

    Ok((
        StatusCode::OK,
        [
            (header::CACHE_CONTROL, "no-store, max-age=0"),
            (header::PRAGMA, "no-cache"),
            (header::REFERRER_POLICY, "no-referrer"),
            (HeaderName::from_static("x-robots-tag"), "noindex, nofollow"),
        ],
        body,
    ))
}

/// `POST /api/v1/sms/send-secure`
/// B2B Algerian Bank Endpoint:
/// - Authenticates tenant via `x-api-key` header (SHA-256 lookup on `institutions`).
/// - Enforces Law 18-07 Algerian mobile number restriction (`+213[567][0-9]{8}`).
/// - Stamps SMS with the recipient's AES-256-GCM decrypted Secret Word & wraps URLs into `/go/:hash`.
#[utoipa::path(
    post,
    path = "/api/v1/sms/send-secure",
    tag = "B2B SMS",
    request_body = SendSecureSmsRequest,
    responses(
        (status = 200, description = "SMS securely stamped and dispatched (or simulated under sc_test_)", body = SendSecureSmsResponse),
        (status = 400, description = "Validation error (invalid Algerian phone number or unapproved link domain)", body = ApiErrorResponse),
        (status = 401, description = "Missing or invalid x-api-key header", body = ApiErrorResponse),
        (status = 403, description = "Blocked outside Algerian territory (Law 18-07)", body = ApiErrorResponse)
    ),
    security(
        ("x-api-key" = [])
    )
)]
pub async fn send_secure_sms_handler(
    State(service): State<Arc<AntiPhishingVaultService>>,
    tenant: ApiKeyTenant,
    Json(payload): Json<SendSecureSmsRequest>,
) -> VaultResult<Json<SendSecureSmsResponse>> {
    let result = service
        .send_secure_b2b_sms(
            tenant.tenant_id,
            &tenant.institution_name,
            tenant.environment,
            &payload.external_account_ref,
            &payload.recipient_phone,
            &payload.message_body,
            payload.wrap_links,
            &tenant.client_ip,
        )
        .await?;

    Ok(Json(SendSecureSmsResponse {
        message_id: result.message_id,
        institution_name: result.institution_name,
        environment: result.environment.into(),
        recipient_masked: result.recipient_masked,
        code_applied: result.code_applied,
        masked_code: result.masked_code,
        wrapped_links: result.wrapped_links,
        delivery_status: result.delivery_status,
        dispatched_at: result.dispatched_at,
    }))
}

/// `POST /api/v1/institutions/api-keys`
/// Rotates & issues a new `sc_live_...` or `sc_test_...` API key for the authenticated bank.
/// Returns the plaintext key ONCE; only its SHA-256 hash is stored in PostgreSQL `institutions`.
#[utoipa::path(
    post,
    path = "/api/v1/institutions/api-keys",
    tag = "API Keys",
    request_body = GenerateApiKeyRequest,
    responses(
        (status = 201, description = "New API key generated; store immediately (shown once)", body = GenerateApiKeyResponse),
        (status = 401, description = "Missing or invalid x-api-key header", body = ApiErrorResponse)
    ),
    security(
        ("x-api-key" = [])
    )
)]
pub async fn generate_institution_api_key_handler(
    State(service): State<Arc<AntiPhishingVaultService>>,
    tenant: ApiKeyTenant,
    Json(payload): Json<GenerateApiKeyRequest>,
) -> VaultResult<(StatusCode, [(header::HeaderName, &'static str); 1], Json<GenerateApiKeyResponse>)> {
    let provisioned = service
        .provision_institution_api_key(tenant.institution_id, payload.environment.into())
        .await?;

    Ok((
        StatusCode::CREATED,
        [(header::CACHE_CONTROL, "no-store, max-age=0")],
        Json(GenerateApiKeyResponse {
            institution_id: provisioned.institution_id,
            institution_name: provisioned.institution_name,
            api_key: provisioned.raw_api_key.as_str().to_owned(),
            key_prefix: provisioned.key_prefix,
            environment: provisioned.environment.into(),
            issued_at: provisioned.issued_at,
            notice: "Store this key securely now. Only its SHA-256 hash is persisted in PostgreSQL.",
        }),
    ))
}
