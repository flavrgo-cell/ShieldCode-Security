use std::collections::HashMap;
use std::net::IpAddr;
use std::path::Path;
use std::sync::Arc;
use std::time::{Duration, Instant};

use async_trait::async_trait;
use axum::body::Body;
use axum::extract::{FromRequestParts, State};
use axum::http::header::AUTHORIZATION;
use axum::http::request::Parts;
use axum::http::Request;
use axum::middleware::Next;
use axum::response::Response;
use maxminddb::geoip2;
use tokio::sync::Mutex;
use uuid::Uuid;

use crate::application::use_cases::AntiPhishingVaultService;
use crate::domain::api_key::ApiKeyEnvironment;
use crate::domain::entities::InstitutionSectorType;
use crate::domain::value_objects::TenantId;
use crate::error::{VaultError, VaultResult};

pub const HEADER_B2B_API_KEY: &str = "x-api-key";
pub const HEADER_TENANT_API_KEY: &str = "x-vault-api-key";
pub const HEADER_FORWARDED_FOR: &str = "x-forwarded-for";
pub const HEADER_REAL_IP: &str = "x-real-ip";
pub const HEADER_ACCOUNT_REF: &str = "x-account-ref";

/// ISO-3166-1 alpha-2 code for the People's Democratic Republic of Algeria.
pub const ALGERIA_ISO_COUNTRY_CODE: &str = "DZ";

/// Maximum distinct rate-limit keys retained in memory before forced garbage collection,
/// preventing unbounded HashMap growth (OOM DoS) under spoofed header floods.
const MAX_TRACKED_BUCKETS: usize = 10_000;

/// Offline GeoIP Enforcer backed by a local MaxMind `.mmdb` database file (`GeoLite2-Country.mmdb`).
/// Performs zero external network calls, complying strictly with Algerian Law 18-07 data residency.
#[derive(Clone)]
pub struct AlgerianGeoIpEnforcer {
    reader: Arc<maxminddb::Reader<Vec<u8>>>,
}

impl AlgerianGeoIpEnforcer {
    /// Loads the local `.mmdb` database into RAM at server startup.
    pub fn from_local_mmdb<P: AsRef<Path>>(mmdb_path: P) -> VaultResult<Self> {
        let reader = maxminddb::Reader::open_readfile(mmdb_path).map_err(|_| {
            VaultError::Config(
                "Failed to load local MaxMind .mmdb GeoIP database file (VAULT_GEOIP_MMDB_PATH)"
                    .to_owned(),
            )
        })?;

        Ok(Self {
            reader: Arc::new(reader),
        })
    }

    /// Evaluates whether `client_ip` originates within the Algerian national territory (`DZ`).
    /// Returns `Err(VaultError::ForeignIpBlocked)` (`403 Forbidden`) for all non-Algerian IPs.
    pub fn verify_algerian_ip(&self, client_ip: IpAddr) -> VaultResult<()> {
        let country_record: geoip2::Country<'_> = self
            .reader
            .lookup(client_ip)
            .map_err(|_| {
                VaultError::ForeignIpBlocked(
                    "IP address could not be verified inside the Algerian national GeoIP database (DZ)",
                )
            })?;

        let iso_code = country_record
            .country
            .and_then(|c| c.iso_code)
            .unwrap_or("");

        if iso_code != ALGERIA_ISO_COUNTRY_CODE {
            return Err(VaultError::ForeignIpBlocked(
                "Access denied under Law 18-07: Only IP addresses originating from Algeria (DZ) are permitted",
            ));
        }

        Ok(())
    }
}

/// Axum middleware that drops ANY HTTP request whose originating IP address does not
/// resolve to Algeria (`DZ`) in the local `.mmdb` GeoIP database, returning `403 Forbidden`.
pub async fn algeria_geo_block_middleware(
    State(geo_enforcer): State<AlgerianGeoIpEnforcer>,
    req: Request<Body>,
    next: Next,
) -> Result<Response, VaultError> {
    let raw_ip = extract_sanitized_ip(req.headers());
    let parsed_ip: IpAddr = raw_ip.parse().map_err(|_| {
        VaultError::ForeignIpBlocked(
            "Malformed originating IP address; Algerian (DZ) IP verification failed",
        )
    })?;

    geo_enforcer.verify_algerian_ip(parsed_ip)?;

    Ok(next.run(req).await)
}

/// Memory-bounded sliding-window rate limiter state.
#[derive(Clone)]
pub struct RateLimiterState {
    max_requests: usize,
    window: Duration,
    buckets: Arc<Mutex<HashMap<String, Vec<Instant>>>>,
}

impl RateLimiterState {
    pub fn new(max_requests: usize, window: Duration) -> Self {
        Self {
            max_requests,
            window,
            buckets: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Checks and records an incoming request for `client_key` while bounding memory usage.
    pub async fn check_and_record(&self, client_key: &str) -> Result<(), VaultError> {
        let now = Instant::now();
        let window = self.window;
        let mut guard = self.buckets.lock().await;

        // Sweep expired buckets if the map approaches capacity to prevent OOM memory leaks
        if guard.len() >= MAX_TRACKED_BUCKETS && !guard.contains_key(client_key) {
            guard.retain(|_, list| {
                list.retain(|&ts| now.duration_since(ts) < window);
                !list.is_empty()
            });

            if guard.len() >= MAX_TRACKED_BUCKETS {
                return Err(VaultError::RateLimitExceeded {
                    retry_after_secs: window.as_secs().max(1),
                });
            }
        }

        let timestamps = guard.entry(client_key.to_owned()).or_default();
        timestamps.retain(|&ts| now.duration_since(ts) < window);

        if timestamps.len() >= self.max_requests {
            let oldest = timestamps.first().copied().unwrap_or(now);
            let elapsed = now.duration_since(oldest);
            let retry_after_secs = window
                .checked_sub(elapsed)
                .map(|d| d.as_secs().max(1))
                .unwrap_or(1);
            return Err(VaultError::RateLimitExceeded { retry_after_secs });
        }

        timestamps.push(now);
        Ok(())
    }
}

/// Extracts a sanitized client IP string from `X-Forwarded-For` or `X-Real-Ip`.
pub fn extract_sanitized_ip(headers: &axum::http::HeaderMap) -> String {
    headers
        .get(HEADER_FORWARDED_FOR)
        .or_else(|| headers.get(HEADER_REAL_IP))
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.split(',').next())
        .map(str::trim)
        .filter(|s| !s.is_empty() && s.len() <= 45)
        .unwrap_or("127.0.0.1")
        .to_owned()
}

/// Axum middleware enforcing strict anti-SMS-bombing & anti-brute-force sliding-window rate limits.
pub async fn rate_limit_middleware(
    State(limiter): State<RateLimiterState>,
    req: Request<Body>,
    next: Next,
) -> Result<Response, VaultError> {
    let client_ip = extract_sanitized_ip(req.headers());

    let key_prefix = req
        .headers()
        .get(HEADER_B2B_API_KEY)
        .and_then(|v| v.to_str().ok())
        .map(str::trim)
        .filter(|s| s.is_ascii() && s.len() >= 16)
        .map(|s| &s[..16])
        .or_else(|| {
            req.headers()
                .get(HEADER_TENANT_API_KEY)
                .and_then(|v| v.to_str().ok())
                .and_then(|s| s.split('.').next())
                .map(str::trim)
                .filter(|s| !s.is_empty() && s.len() <= 24)
        })
        .unwrap_or("saas");

    let bucket_key = format!("{}:{}", key_prefix, client_ip);
    limiter.check_and_record(&bucket_key).await?;

    Ok(next.run(req).await)
}

/// Lightweight extractor providing the sanitized client IP for public registration/OTP routes.
pub struct ClientIp(pub String);

#[async_trait]
impl<S> FromRequestParts<S> for ClientIp
where
    S: Send + Sync,
{
    type Rejection = VaultError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        Ok(Self(extract_sanitized_ip(&parts.headers)))
    }
}

/// Axum request extractor that strictly authenticates a Code Vault request.
pub struct AuthenticatedTenant {
    pub tenant_id: TenantId,
    pub user_id: Option<Uuid>,
    pub institution_name: String,
    pub client_ip: String,
    pub header_account_ref: Option<String>,
}

#[async_trait]
impl FromRequestParts<Arc<AntiPhishingVaultService>> for AuthenticatedTenant {
    type Rejection = VaultError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &Arc<AntiPhishingVaultService>,
    ) -> Result<Self, Self::Rejection> {
        let client_ip = extract_sanitized_ip(&parts.headers);

        // 1. Check for SaaS Bearer JWT Authentication (`Authorization: Bearer <token>`)
        if let Some(auth_header) = parts
            .headers
            .get(AUTHORIZATION)
            .and_then(|v| v.to_str().ok())
            .map(str::trim)
        {
            let bearer_token = auth_header
                .strip_prefix("Bearer ")
                .or_else(|| auth_header.strip_prefix("bearer "))
                .map(str::trim)
                .filter(|t| !t.is_empty())
                .ok_or(VaultError::Unauthorized(
                    "Malformed Authorization header; expected 'Bearer <JWT>'",
                ))?;

            let (verified_user, _claims) =
                state.authenticate_verified_saas_jwt(bearer_token).await?;

            return Ok(Self {
                tenant_id: verified_user.tenant_id,
                user_id: Some(verified_user.id),
                institution_name: "ShieldCode Algérie SaaS".to_owned(),
                client_ip,
                header_account_ref: Some(verified_user.id.to_string()),
            });
        }

        // 2. Fallback: B2B Financial Institution API Key (`X-Vault-Api-Key`)
        let raw_key = parts
            .headers
            .get(HEADER_TENANT_API_KEY)
            .and_then(|v| v.to_str().ok())
            .map(str::trim)
            .ok_or(VaultError::Unauthorized(
                "Missing Authorization: Bearer <JWT> (or X-Vault-Api-Key) header",
            ))?;

        let (prefix, _secret_part) = raw_key
            .split_once('.')
            .ok_or(VaultError::Unauthorized("Malformed X-Vault-Api-Key format"))?;

        if prefix.is_empty() || prefix.len() > 24 {
            return Err(VaultError::Unauthorized("Invalid API key prefix length"));
        }

        let tenant = state
            .repo()
            .find_active_tenant_by_prefix(prefix)
            .await?
            .ok_or(VaultError::Unauthorized(
                "Unknown or inactive institution tenant",
            ))?;

        let verified = state
            .crypto()
            .verify_tenant_api_key(raw_key, &tenant.api_key_hash)?;

        if !verified {
            return Err(VaultError::Unauthorized("Invalid institution API key"));
        }

        let header_account_ref = parts
            .headers
            .get(HEADER_ACCOUNT_REF)
            .and_then(|v| v.to_str().ok())
            .map(|s| s.trim().to_owned())
            .filter(|s| !s.is_empty());

        Ok(Self {
            tenant_id: tenant.id,
            user_id: None,
            institution_name: tenant.institution_name,
            client_ip,
            header_account_ref,
        })
    }
}

/// Authenticated Public B2B Bank Tenant extracted from the `x-api-key` header
/// (`sc_live_...` or `sc_test_...`) after SHA-256 hash lookup in PostgreSQL `institutions`.
#[derive(Clone, Debug)]
pub struct ApiKeyTenant {
    pub institution_id: Uuid,
    pub tenant_id: TenantId,
    pub institution_name: String,
    pub institution_type: InstitutionSectorType,
    pub api_key_prefix: Option<String>,
    pub environment: ApiKeyEnvironment,
    pub client_ip: String,
}

async fn authenticate_x_api_key_from_headers(
    headers: &axum::http::HeaderMap,
    service: &Arc<AntiPhishingVaultService>,
) -> VaultResult<ApiKeyTenant> {
    let raw_key = headers
        .get(HEADER_B2B_API_KEY)
        .and_then(|v| v.to_str().ok())
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .ok_or(VaultError::Unauthorized(
            "Missing x-api-key header; expected a ShieldCode B2B key prefixed with sc_live_ or sc_test_",
        ))?;

    let (institution, environment) = service.authenticate_institution_x_api_key(raw_key).await?;
    let client_ip = extract_sanitized_ip(headers);

    Ok(ApiKeyTenant {
        institution_id: institution.id,
        tenant_id: TenantId(institution.id),
        institution_name: institution.name,
        institution_type: institution.institution_type,
        api_key_prefix: institution.api_key_prefix,
        environment,
        client_ip,
    })
}

/// Axum middleware that authenticates incoming B2B bank requests using `x-api-key`,
/// hashes the key with SHA-256, verifies it against PostgreSQL `institutions.api_key_hash`,
/// and attaches `ApiKeyTenant` to request extensions.
pub async fn x_api_key_auth_middleware(
    State(service): State<Arc<AntiPhishingVaultService>>,
    mut req: Request<Body>,
    next: Next,
) -> Result<Response, VaultError> {
    let tenant = authenticate_x_api_key_from_headers(req.headers(), &service).await?;
    req.extensions_mut().insert(tenant);
    Ok(next.run(req).await)
}

/// Axum extractor injecting the authenticated B2B `ApiKeyTenant` into handlers.
/// Reuses the extension already verified by `x_api_key_auth_middleware` when present,
/// or performs direct SHA-256 `x-api-key` authentication when used standalone.
#[async_trait]
impl FromRequestParts<Arc<AntiPhishingVaultService>> for ApiKeyTenant {
    type Rejection = VaultError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &Arc<AntiPhishingVaultService>,
    ) -> Result<Self, Self::Rejection> {
        if let Some(existing) = parts.extensions.get::<ApiKeyTenant>() {
            return Ok(existing.clone());
        }
        authenticate_x_api_key_from_headers(&parts.headers, state).await
    }
}
