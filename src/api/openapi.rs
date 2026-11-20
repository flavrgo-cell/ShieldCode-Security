use utoipa::openapi::security::{ApiKey, ApiKeyValue, SecurityScheme};
use utoipa::{Modify, OpenApi};
use utoipa_swagger_ui::SwaggerUi;

use crate::api::dto::{
    ActiveInstitutionsResponse, ApiErrorResponse, ApiKeyEnvironmentSchema, CodeStatusResponse,
    GenerateApiKeyRequest, GenerateApiKeyResponse, HealthResponse, PublicInstitutionDto,
    SendSecureSmsRequest, SendSecureSmsResponse, VerifyLinkResponse,
};

struct XApiKeySecurityAddon;

impl Modify for XApiKeySecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "x-api-key",
                SecurityScheme::ApiKey(ApiKey::Header(ApiKeyValue::with_description(
                    "x-api-key",
                    "Algerian Bank B2B API Key prefixed with `sc_live_` (production) or `sc_test_` (sandbox). Verified via SHA-256 digest lookup in PostgreSQL.",
                ))),
            );
        }
    }
}

/// Interactive OpenAPI 3.1 Specification for Algerian Banks & Financial Institutions.
#[derive(OpenApi)]
#[openapi(
    info(
        title = "ShieldCode Algeria B2B Anti-Phishing API",
        version = "1.0.0",
        description = "Sovereign Anti-Phishing SaaS API for Algerian Banks, Algérie Poste (Edahabia/BaridiMob), and Financial Institutions (Law 18-07 Compliant). Authenticate protected endpoints via the `x-api-key` HTTP header (`sc_live_...` or `sc_test_...`)."
    ),
    paths(
        crate::api::routes::health_check,
        crate::api::routes::get_active_institutions_handler,
        crate::api::routes::send_secure_sms_handler,
        crate::api::routes::generate_institution_api_key_handler,
        crate::api::routes::verify_secure_link_handler,
    ),
    components(
        schemas(
            ApiKeyEnvironmentSchema,
            GenerateApiKeyRequest,
            GenerateApiKeyResponse,
            SendSecureSmsRequest,
            SendSecureSmsResponse,
            PublicInstitutionDto,
            ActiveInstitutionsResponse,
            VerifyLinkResponse,
            CodeStatusResponse,
            HealthResponse,
            ApiErrorResponse,
        )
    ),
    modifiers(&XApiKeySecurityAddon),
    tags(
        (name = "B2B SMS", description = "Secure SMS Stamping, Secret Word Injection & Link Wrapping (`sc_live_` / `sc_test_`)"),
        (name = "API Keys", description = "CSPRNG API Key Generation & SHA-256 Rotation for Banks"),
        (name = "Institutions", description = "Active Algerian Financial & Postal Institutions Directory"),
        (name = "Verification", description = "Interstitial Secure Link Resolution (`/go/:hash`) & Service Health")
    )
)]
pub struct B2bApiDoc;

/// Hosts the interactive Swagger UI at `/api/docs` and serves raw OpenAPI JSON at `/api/docs/openapi.json`.
pub fn swagger_routes() -> SwaggerUi {
    SwaggerUi::new("/api/docs").url("/api/docs/openapi.json", B2bApiDoc::openapi())
}
