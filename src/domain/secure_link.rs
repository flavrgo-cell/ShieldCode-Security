//! Secure Interstitial Link Wrapper — pure domain logic (no I/O).
//!
//! * `extract_urls` finds every `http(s)://` URL inside an outgoing SMS body.
//! * `validate_target_url` enforces strict rules on links a tenant is allowed to send.
//! * `SecureLinkToken` is the 128-bit CSPRNG public token; only its SHA-256 digest is persisted.

use std::sync::OnceLock;

use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine;
use rand::rngs::OsRng;
use rand::RngCore;
use regex::Regex;
use sha2::{Digest, Sha256};
use url::{Host, Url};

use crate::error::{VaultError, VaultResult};

/// 16 random bytes -> 22 base64url characters (no padding).
pub const TOKEN_BYTES: usize = 16;
pub const TOKEN_LEN: usize = 22;
pub const MAX_TARGET_URL_LEN: usize = 2048;
/// Hard ceiling of URLs per SMS to prevent DB amplification.
pub const MAX_URLS_PER_MESSAGE: usize = 5;

fn url_regex() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| {
        // Scheme is matched case-insensitively; stops at whitespace and common SMS delimiters.
        Regex::new(r#"(?i)\bhttps?://[^\s<>"'`{}|\\^\[\]]+"#).expect("static URL regex")
    })
}

/// A URL occurrence inside a message (byte range into the original text).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct UrlMatch {
    pub start: usize,
    pub end: usize,
    pub raw: String,
}

/// Extracts URLs, trimming trailing punctuation that is almost always sentence punctuation
/// (e.g. "Visit https://bank.dz/login." -> "https://bank.dz/login").
pub fn extract_urls(text: &str) -> Vec<UrlMatch> {
    url_regex()
        .find_iter(text)
        .filter_map(|m| {
            let mut candidate = m.as_str();
            while let Some(last) = candidate.chars().last() {
                let unbalanced_paren = last == ')' && !candidate.contains('(');
                if matches!(last, '.' | ',' | ';' | ':' | '!' | '?' | '،' | '؛' | '؟')
                    || unbalanced_paren
                {
                    candidate = &candidate[..candidate.len() - last.len_utf8()];
                } else {
                    break;
                }
            }
            (candidate.len() > "https://".len()).then(|| UrlMatch {
                start: m.start(),
                end: m.start() + candidate.len(),
                raw: candidate.to_owned(),
            })
        })
        .collect()
}

/// Strict validation of a link a tenant wants to deliver to a consumer.
///
/// Rejects: non-HTTPS, embedded credentials (`https://bank.dz@evil.com`), IP literals,
/// non-default ports, punycode / IDN hosts (homograph attacks), over-long URLs, and any
/// host that is not an exact match or sub-domain of the tenant's approved domain list.
pub fn validate_target_url(raw: &str, allowed_domains: &[String]) -> VaultResult<Url> {
    if raw.len() > MAX_TARGET_URL_LEN {
        return Err(VaultError::Validation("Link exceeds maximum length".to_owned()));
    }

    let url = Url::parse(raw)
        .map_err(|_| VaultError::Validation("Message contains a malformed link".to_owned()))?;

    if url.scheme() != "https" {
        return Err(VaultError::Validation(
            "Only HTTPS links may be sent to consumers".to_owned(),
        ));
    }
    if !url.username().is_empty() || url.password().is_some() {
        return Err(VaultError::Validation(
            "Links with embedded credentials are forbidden".to_owned(),
        ));
    }
    if url.port().is_some() {
        return Err(VaultError::Validation(
            "Links with explicit ports are forbidden".to_owned(),
        ));
    }

    let host = match url.host() {
        Some(Host::Domain(domain)) => domain.to_ascii_lowercase(),
        Some(Host::Ipv4(_)) | Some(Host::Ipv6(_)) => {
            return Err(VaultError::Validation(
                "Links pointing to raw IP addresses are forbidden".to_owned(),
            ))
        }
        None => return Err(VaultError::Validation("Link has no host".to_owned())),
    };

    // `url` converts Unicode hosts to punycode; refuse them all to defeat homograph lookalikes.
    if host.split('.').any(|label| label.starts_with("xn--")) {
        return Err(VaultError::Validation(
            "Internationalized (punycode) domains are forbidden".to_owned(),
        ));
    }

    if allowed_domains.is_empty() {
        return Err(VaultError::Validation(
            "Tenant has no approved link domains; contact ShieldCode to register them".to_owned(),
        ));
    }

    let host_trimmed = host.trim_end_matches('.');
    let approved = allowed_domains.iter().any(|allowed| {
        let allowed = allowed.trim().trim_end_matches('.').to_ascii_lowercase();
        !allowed.is_empty()
            && (host_trimmed == allowed || host_trimmed.ends_with(&format!(".{allowed}")))
    });

    if !approved {
        return Err(VaultError::Validation(
            "Message contains a link to a domain not approved for this institution".to_owned(),
        ));
    }

    Ok(url)
}

/// Public opaque token placed in `https://<dz-domain>/go/<token>`.
pub struct SecureLinkToken(String);

impl SecureLinkToken {
    pub fn generate() -> Self {
        let mut bytes = [0u8; TOKEN_BYTES];
        OsRng.fill_bytes(&mut bytes);
        Self(URL_SAFE_NO_PAD.encode(bytes))
    }

    /// Parses an untrusted path segment. Rejects anything that is not exactly 22 base64url chars,
    /// so malformed input never reaches the database.
    pub fn parse(raw: &str) -> VaultResult<Self> {
        let valid = raw.len() == TOKEN_LEN
            && raw
                .bytes()
                .all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_');
        if !valid {
            return Err(VaultError::NotFound);
        }
        Ok(Self(raw.to_owned()))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }

    /// SHA-256 digest stored in PostgreSQL. A plain hash is sufficient because the token
    /// already carries 128 bits of entropy (no brute-force / rainbow-table risk).
    pub fn sha256(&self) -> [u8; 32] {
        Sha256::digest(self.0.as_bytes()).into()
    }
}

impl std::fmt::Debug for SecureLinkToken {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("SecureLinkToken([REDACTED])")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn allow() -> Vec<String> {
        vec!["cpa-bank.dz".to_owned()]
    }

    #[test]
    fn extracts_and_trims_punctuation() {
        let found = extract_urls("Pay here: https://www.cpa-bank.dz/pay?id=7. Merci!");
        assert_eq!(found.len(), 1);
        assert_eq!(found[0].raw, "https://www.cpa-bank.dz/pay?id=7");
    }

    #[test]
    fn accepts_approved_subdomain() {
        assert!(validate_target_url("https://e.cpa-bank.dz/x", &allow()).is_ok());
    }

    #[test]
    fn rejects_attacks() {
        for bad in [
            "http://cpa-bank.dz/",
            "https://cpa-bank.dz@evil.com/",
            "https://evilcpa-bank.dz/",
            "https://cpa-bank.dz.evil.com/",
            "https://192.168.1.10/",
            "https://cpa-bank.dz:8443/",
            "https://xn--cpa-bnk-9ya.dz/",
        ] {
            assert!(validate_target_url(bad, &allow()).is_err(), "{bad}");
        }
    }

    #[test]
    fn token_roundtrip() {
        let t = SecureLinkToken::generate();
        assert_eq!(t.as_str().len(), TOKEN_LEN);
        assert!(SecureLinkToken::parse(t.as_str()).is_ok());
        assert!(SecureLinkToken::parse("../../etc/passwd").is_err());
    }
}
