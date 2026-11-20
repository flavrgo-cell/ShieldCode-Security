#![forbid(unsafe_code)]
#![warn(clippy::all, rust_2018_idioms)]

use std::sync::Arc;
use std::time::Duration;

use secrecy::ExposeSecret;
use sqlx::postgres::PgPoolOptions;
use tokio::net::TcpListener;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

use shieldcode_vault::api::middleware::AlgerianGeoIpEnforcer;
use shieldcode_vault::api::routes::build_router;
use shieldcode_vault::application::link_wrapper::SecureLinkService;
use shieldcode_vault::application::use_cases::AntiPhishingVaultService;
use shieldcode_vault::config::AppConfig;
use shieldcode_vault::crypto::aead_service::Aes256GcmVaultCrypto;
use shieldcode_vault::domain::ports::{
    EmailDeliveryPort, SecureLinkRepository, SmsGatewayPort, VaultCryptoPort, VaultRepository,
};
use shieldcode_vault::infrastructure::postgres_repo::PostgresVaultRepository;
use shieldcode_vault::infrastructure::secure_link_repo::PostgresSecureLinkRepository;
use shieldcode_vault::infrastructure::seeder::seed_official_algerian_institutions;
use shieldcode_vault::infrastructure::sms_gateway::ReqwestSmsGateway;
use shieldcode_vault::infrastructure::smtp_mailer::LettreSmtpMailer;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let _ = dotenvy::dotenv();

    tracing_subscriber::registry()
        .with(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new("info,tower_http=info")),
        )
        .with(tracing_subscriber::fmt::layer().json())
        .init();

    let config = AppConfig::from_env()?;
    let master_key = config.decode_master_key()?;

    tracing::info!(
        bind_addr = %config.bind_addr,
        "Initializing ShieldCode Public SaaS & B2B Anti-Phishing Code Vault"
    );

    let pg_pool = PgPoolOptions::new()
        .max_connections(config.max_db_connections)
        .acquire_timeout(Duration::from_secs(5))
        .connect(config.database_url.expose_secret())
        .await?;

    sqlx::migrate!("./migrations").run(&pg_pool).await?;

    // Automatically seed official Algerian financial & postal institutions on startup
    seed_official_algerian_institutions(&pg_pool).await?;

    let repo: Arc<dyn VaultRepository> = Arc::new(PostgresVaultRepository::new(pg_pool.clone()));
    let link_repo: Arc<dyn SecureLinkRepository> =
        Arc::new(PostgresSecureLinkRepository::new(pg_pool));
    let secure_links = Arc::new(SecureLinkService::new(link_repo, config.secure_links.clone()));
    let crypto: Arc<dyn VaultCryptoPort> = Arc::new(Aes256GcmVaultCrypto::new(master_key));
    let email_mailer: Arc<dyn EmailDeliveryPort> = Arc::new(LettreSmtpMailer::new(&config.smtp)?);
    let sms_gateway: Arc<dyn SmsGatewayPort> =
        Arc::new(ReqwestSmsGateway::new(&config.sms_gateway)?);

    let geo_enforcer = AlgerianGeoIpEnforcer::from_local_mmdb(&config.geoip_mmdb_path)?;

    let vault_service = Arc::new(
        AntiPhishingVaultService::with_saas_gateways(
            repo,
            crypto,
            email_mailer,
            sms_gateway,
            config.jwt_ttl_secs,
        )
        .with_secure_links(secure_links),
    );

    let app = build_router(vault_service, geo_enforcer);
    let listener = TcpListener::bind(config.bind_addr).await?;

    tracing::info!(bind_addr = %config.bind_addr, "Vault SaaS API server listening");

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async {
        if let Err(err) = tokio::signal::ctrl_c().await {
            tracing::error!(error = %err, "Failed to install Ctrl+C signal handler");
        }
    };

    #[cfg(unix)]
    let terminate = async {
        if let Ok(mut sig) =
            tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
        {
            sig.recv().await;
        }
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    tracing::info!("Shutdown signal received; draining in-flight Vault connections");
}
