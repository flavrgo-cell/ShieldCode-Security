use std::sync::Arc;

use chrono::{Duration as ChronoDuration, Utc};
use uuid::Uuid;

use crate::domain::ports::{ConsumedSecureLink, NewSecureLink, SecureLinkRepository};
use crate::domain::secure_link::{
    extract_urls, validate_target_url, SecureLinkToken, MAX_URLS_PER_MESSAGE,
};
use crate::domain::value_objects::TenantId;
use crate::error::{VaultError, VaultResult};

#[derive(Clone, Debug)]
pub struct SecureLinkSettings {
    /// Sovereign public origin, e.g. `https://shieldcode.dz` (no trailing slash).
    pub public_base_url: String,
    pub ttl: ChronoDuration,
    pub max_resolutions: i16,
}

impl SecureLinkSettings {
    /// Validates the public origin: must be HTTPS on a `.dz` domain
    /// (plain `http://localhost` / `http://127.0.0.1` are tolerated for local development only).
    pub fn new(public_base_url: &str, ttl_hours: i64, max_resolutions: i16) -> VaultResult<Self> {
        let base = public_base_url.trim().trim_end_matches('/').to_owned();
        let parsed = url::Url::parse(&base)
            .map_err(|_| VaultError::Config("Invalid SECURE_LINK_BASE_URL".to_owned()))?;
        let host = parsed.host_str().unwrap_or_default().to_ascii_lowercase();

        let is_local_dev =
            parsed.scheme() == "http" && (host == "localhost" || host == "127.0.0.1");
        let is_sovereign = parsed.scheme() == "https" && host.ends_with(".dz");
        if !(is_local_dev || is_sovereign) {
            return Err(VaultError::Config(
                "SECURE_LINK_BASE_URL must be an https:// .dz origin (Law 18-07)".to_owned(),
            ));
        }
        if !(1..=24 * 30).contains(&ttl_hours) || !(1..=50).contains(&max_resolutions) {
            return Err(VaultError::Config(
                "Secure link TTL must be 1h..30d and max resolutions 1..50".to_owned(),
            ));
        }

        Ok(Self {
            public_base_url: base,
            ttl: ChronoDuration::hours(ttl_hours),
            max_resolutions,
        })
    }
}

#[derive(Debug, Clone)]
pub struct WrappedMessage {
    pub body: String,
    pub wrapped_count: usize,
}

/// Intercepts URLs in outbound tenant messages and replaces them with
/// `https://<dz-domain>/go/<token>` interstitial shortlinks.
pub struct SecureLinkService {
    repo: Arc<dyn SecureLinkRepository>,
    settings: SecureLinkSettings,
}

impl SecureLinkService {
    pub fn new(repo: Arc<dyn SecureLinkRepository>, settings: SecureLinkSettings) -> Self {
        Self { repo, settings }
    }

    pub async fn wrap_message(
        &self,
        tenant_id: TenantId,
        account_blind_index: &[u8; 32],
        text: &str,
    ) -> VaultResult<WrappedMessage> {
        let matches = extract_urls(text);
        if matches.is_empty() {
            return Ok(WrappedMessage {
                body: text.to_owned(),
                wrapped_count: 0,
            });
        }
        if matches.len() > MAX_URLS_PER_MESSAGE {
            return Err(VaultError::Validation(format!(
                "A message may contain at most {MAX_URLS_PER_MESSAGE} links"
            )));
        }

        let own_prefix = format!("{}/go/", self.settings.public_base_url);
        let allowed_domains = self.repo.tenant_allowed_link_domains(tenant_id).await?;
        let expires_at = Utc::now() + self.settings.ttl;

        // Validate everything first: one bad link rejects the whole dispatch (fail closed).
        let mut targets = Vec::with_capacity(matches.len());
        for m in &matches {
            if m.raw.starts_with(&own_prefix) {
                targets.push(None); // already wrapped; leave untouched
            } else {
                targets.push(Some(validate_target_url(&m.raw, &allowed_domains)?.to_string()));
            }
        }

        let tokens: Vec<Option<SecureLinkToken>> = targets
            .iter()
            .map(|t| t.as_ref().map(|_| SecureLinkToken::generate()))
            .collect();

        let new_links: Vec<NewSecureLink<'_>> = targets
            .iter()
            .zip(&tokens)
            .filter_map(|(target, token)| match (target, token) {
                (Some(url), Some(token)) => Some(NewSecureLink {
                    id: Uuid::now_v7(),
                    token_sha256: token.sha256(),
                    tenant_id,
                    account_blind_index,
                    target_url: url.as_str(),
                    max_resolutions: self.settings.max_resolutions,
                    expires_at,
                }),
                _ => None,
            })
            .collect();

        self.repo.insert_secure_links(&new_links).await?;

        // Rebuild the body, replacing each original URL byte-range with its shortlink.
        let mut body = String::with_capacity(text.len());
        let mut cursor = 0;
        for (m, token) in matches.iter().zip(&tokens) {
            body.push_str(&text[cursor..m.start]);
            match token {
                Some(token) => {
                    body.push_str(&own_prefix);
                    body.push_str(token.as_str());
                }
                None => body.push_str(&m.raw),
            }
            cursor = m.end;
        }
        body.push_str(&text[cursor..]);

        Ok(WrappedMessage {
            body,
            wrapped_count: new_links.len(),
        })
    }

    pub async fn consume(&self, token: &SecureLinkToken) -> VaultResult<ConsumedSecureLink> {
        self.repo
            .consume_secure_link(&token.sha256())
            .await?
            .ok_or(VaultError::NotFound)
    }
}
