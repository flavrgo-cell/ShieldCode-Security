use std::env;
use std::net::{IpAddr, SocketAddr};
use std::path::PathBuf;

use secrecy::{ExposeSecret, SecretString};
use zeroize::Zeroizing;

use crate::error::{VaultError, VaultResult};

/// Forbidden foreign cloud database suffixes under Algerian Law 18-07 (Data Sovereignty).
const FORBIDDEN_FOREIGN_CLOUD_HOSTS: &[&str] = &[
    "amazonaws.com",
    "aws.amazon.com",
    "supabase.co",
    "supabase.com",
    "neon.tech",
    "azure.com",
    "database.windows.net",
    "googleapis.com",
    "gcp.cloud",
    "render.com",
    "railway.app",
    "heroku.com",
    "cockroachlabs.cloud",
    "aivencloud.com",
    "planetscale.com",
    "digitalocean.com",
];

/// SMTP transport configuration for sovereign national Email OTP delivery (`lettre`).
#[derive(Clone, Debug)]
pub struct SmtpConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: SecretString,
    pub from_email: String,
}

/// National HTTP SMS Gateway configuration (`reqwest`) for Algerian operators (Mobilis / Djezzy / Ooredoo).
#[derive(Clone, Debug)]
pub struct SmsGatewayConfig {
    pub endpoint_url: String,
    pub api_key: SecretString,
    pub sender_id: String,
    pub timeout_secs: u64,
}

/// Runtime configuration loaded from environment variables.
/// Enforces Algerian Law 18-07 data residency: all database connections must reside on
/// `localhost` or a sovereign local network (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`),
/// and GeoIP verification uses a strictly local `.mmdb` file on disk.
#[derive(Clone, Debug)]
pub struct AppConfig {
    pub bind_addr: SocketAddr,
    pub database_url: SecretString,
    pub master_key_hex: SecretString,
    pub max_db_connections: u32,
    pub jwt_ttl_secs: u64,
    pub geoip_mmdb_path: PathBuf,
    pub smtp: SmtpConfig,
    pub sms_gateway: SmsGatewayConfig,
    pub secure_links: crate::application::link_wrapper::SecureLinkSettings,
}

impl AppConfig {
    pub fn from_env() -> VaultResult<Self> {
        let bind_raw = env::var("VAULT_BIND_ADDR").unwrap_or_else(|_| "127.0.0.1:8080".to_owned());
        let bind_addr: SocketAddr = bind_raw.parse().map_err(|_| {
            VaultError::Config("Invalid VAULT_BIND_ADDR socket address format".to_owned())
        })?;

        let raw_db_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
            "postgres://postgres:postgres@127.0.0.1:5432/shieldcode_dz_vault".to_owned()
        });
        Self::validate_sovereign_local_database_url(&raw_db_url)?;
        let database_url = SecretString::from(raw_db_url);

        let master_key_hex = SecretString::from(
            env::var("VAULT_MASTER_KEY_HEX").map_err(|_| {
                VaultError::Config(
                    "Missing VAULT_MASTER_KEY_HEX (expected 64 hex chars / 32 bytes)".to_owned(),
                )
            })?,
        );

        let max_db_connections = env::var("VAULT_MAX_DB_CONNECTIONS")
            .ok()
            .and_then(|v| v.parse::<u32>().ok())
            .unwrap_or(20);

        let jwt_ttl_secs = env::var("VAULT_JWT_TTL_SECS")
            .ok()
            .and_then(|v| v.parse::<u64>().ok())
            .unwrap_or(3600);

        let geoip_mmdb_path = PathBuf::from(
            env::var("VAULT_GEOIP_MMDB_PATH")
                .unwrap_or_else(|_| "./data/GeoLite2-Country.mmdb".to_owned()),
        );

        let smtp = SmtpConfig {
            host: env::var("SMTP_HOST").unwrap_or_else(|_| "127.0.0.1".to_owned()),
            port: env::var("SMTP_PORT")
                .ok()
                .and_then(|v| v.parse::<u16>().ok())
                .unwrap_or(587),
            username: env::var("SMTP_USERNAME")
                .unwrap_or_else(|_| "vault-mailer@shieldcode.dz".to_owned()),
            password: SecretString::from(env::var("SMTP_PASSWORD").map_err(|_| {
                VaultError::Config("Missing SMTP_PASSWORD environment variable".to_owned())
            })?),
            from_email: env::var("SMTP_FROM_EMAIL")
                .unwrap_or_else(|_| "ShieldCode Algérie <no-reply@shieldcode.dz>".to_owned()),
        };

        let sms_gateway = SmsGatewayConfig {
            endpoint_url: env::var("SMS_GATEWAY_URL")
                .unwrap_or_else(|_| "http://127.0.0.1:9090/v1/dz-sms/dispatch".to_owned()),
            api_key: SecretString::from(env::var("SMS_GATEWAY_API_KEY").map_err(|_| {
                VaultError::Config("Missing SMS_GATEWAY_API_KEY environment variable".to_owned())
            })?),
            sender_id: env::var("SMS_SENDER_ID").unwrap_or_else(|_| "ShieldDZ".to_owned()),
            timeout_secs: env::var("SMS_GATEWAY_TIMEOUT_SECS")
                .ok()
                .and_then(|v| v.parse::<u64>().ok())
                .unwrap_or(8),
        };

        let secure_links = crate::application::link_wrapper::SecureLinkSettings::new(
            &env::var("SECURE_LINK_BASE_URL").unwrap_or_else(|_| "https://shieldcode.dz".to_owned()),
            env::var("SECURE_LINK_TTL_HOURS")
                .ok()
                .and_then(|v| v.parse::<i64>().ok())
                .unwrap_or(72),
            env::var("SECURE_LINK_MAX_RESOLUTIONS")
                .ok()
                .and_then(|v| v.parse::<i16>().ok())
                .unwrap_or(5),
        )?;

        Ok(Self {
            bind_addr,
            database_url,
            master_key_hex,
            max_db_connections,
            jwt_ttl_secs,
            geoip_mmdb_path,
            smtp,
            sms_gateway,
            secure_links,
        })
    }

    /// Enforces Algerian Law 18-07 (Data Sovereignty):
    /// Verifies that `DATABASE_URL` points exclusively to `localhost`, `127.0.0.1`, `::1`,
    /// or a private local network (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
    /// Strictly rejects AWS, Supabase, Neon, Azure, GCP, or any public foreign IP/domain.
    pub fn validate_sovereign_local_database_url(raw_url: &str) -> VaultResult<()> {
        let trimmed = raw_url.trim();
        let without_scheme = trimmed
            .strip_prefix("postgres://")
            .or_else(|| trimmed.strip_prefix("postgresql://"))
            .ok_or_else(|| {
                VaultError::Config(
                    "DATABASE_URL must use postgres:// or postgresql:// scheme".to_owned(),
                )
            })?;

        let host_port_part = without_scheme
            .split('/')
            .next()
            .unwrap_or("")
            .rsplit('@')
            .next()
            .unwrap_or("");

        let host = if host_port_part.starts_with('[') {
            host_port_part
                .split(']')
                .next()
                .unwrap_or("")
                .trim_start_matches('[')
        } else {
            host_port_part.split(':').next().unwrap_or("")
        }
        .trim()
        .to_ascii_lowercase();

        if host.is_empty() {
            return Err(VaultError::Config(
                "DATABASE_URL is missing a valid PostgreSQL host".to_owned(),
            ));
        }

        // 1. Explicitly block known external cloud database providers
        for cloud_domain in FORBIDDEN_FOREIGN_CLOUD_HOSTS {
            if host == *cloud_domain || host.ends_with(&format!(".{}", cloud_domain)) {
                return Err(VaultError::Config(format!(
                    "Law 18-07 Violation: External cloud database host '{}' is strictly forbidden; PostgreSQL must run on localhost or a local Algerian sovereign network",
                    host
                )));
            }
        }

        // 2. Allow loopback / local LAN hostnames
        if host == "localhost"
            || host.ends_with(".local")
            || host.ends_with(".lan")
            || host.ends_with(".internal")
        {
            return Ok(());
        }

        // 3. If an IP address is provided, ensure it is loopback or RFC-1918 private LAN
        if let Ok(ip) = host.parse::<IpAddr>() {
            let is_local_or_private = match ip {
                IpAddr::V4(v4) => v4.is_loopback() || v4.is_private(),
                IpAddr::V6(v6) => v6.is_loopback() || (v6.segments()[0] & 0xfe00) == 0xfc00,
            };

            if is_local_or_private {
                return Ok(());
            }

            return Err(VaultError::Config(
                "Law 18-07 Violation: DATABASE_URL IP address must be loopback (127.0.0.1/::1) or private LAN (10.x/172.16-31.x/192.168.x)".to_owned(),
            ));
        }

        Err(VaultError::Config(
            "Law 18-07 Violation: External public database hostnames are prohibited; use localhost or a private LAN IP".to_owned(),
        ))
    }

    /// Decodes the 256-bit master key into a `Zeroizing<[u8; 32]>` stack buffer
    /// that is automatically wiped when dropped.
    pub fn decode_master_key(&self) -> VaultResult<Zeroizing<[u8; 32]>> {
        let raw_bytes = Zeroizing::new(
            hex::decode(self.master_key_hex.expose_secret().trim()).map_err(|_| {
                VaultError::Config("VAULT_MASTER_KEY_HEX must be valid hexadecimal".to_owned())
            })?,
        );

        if raw_bytes.len() != 32 {
            return Err(VaultError::Config(
                "VAULT_MASTER_KEY_HEX must decode to exactly 32 bytes (256 bits)".to_owned(),
            ));
        }

        let mut key = Zeroizing::new([0u8; 32]);
        key.copy_from_slice(&raw_bytes);
        Ok(key)
    }
}
