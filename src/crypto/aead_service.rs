use std::env;
use std::fmt;

use aes_gcm::aead::{Aead, AeadCore, KeyInit, OsRng, Payload};
use aes_gcm::{Aes256Gcm, Key, Nonce};
use argon2::password_hash::PasswordHash;
use argon2::{Argon2, PasswordVerifier};
use base64::engine::general_purpose::STANDARD_NO_PAD as B64;
use base64::Engine;
use chrono::Utc;
use hkdf::Hkdf;
use hmac::{Hmac, Mac};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use rand::RngCore;
use sha2::Sha256;
use subtle::ConstantTimeEq;
use thiserror::Error;
use uuid::Uuid;
use zeroize::{Zeroize, ZeroizeOnDrop, Zeroizing};

use crate::domain::entities::SaasUser;
use crate::domain::ports::VaultCryptoPort;
use crate::domain::value_objects::{
    AntiPhishingCode, ExternalAccountRef, TenantId, TwoFactorOtp, VerifiedJwtClaims,
};
use crate::error::{VaultError, VaultResult};

type HmacSha256 = Hmac<Sha256>;

/// Default environment variable name holding the 256-bit (32-byte) master key in hex or Base64.
pub const ENV_MASTER_KEY: &str = "VAULT_MASTER_KEY_HEX";

/// Size of an AES-256 key in bytes (256 bits).
pub const KEY_SIZE: usize = 32;

/// Size of a standard AES-GCM nonce/IV in bytes (96 bits).
pub const NONCE_SIZE: usize = 12;

/// Size of the AES-GCM authentication tag in bytes (128 bits).
pub const TAG_SIZE: usize = 16;

const HKDF_SALT_DEK: &[u8] = b"ShieldCode-Vault-Account-DEK-v2";
const HKDF_SALT_BLIND_INDEX: &[u8] = b"ShieldCode-Vault-BlindIndex-v2";
const HKDF_SALT_CONTACT_INDEX: &[u8] = b"ShieldCode-Vault-ContactIndex-v2";
const HKDF_SALT_OTP_HASH: &[u8] = b"ShieldCode-Vault-DualOtpHash-v2";
const HKDF_SALT_JWT_SIGNING: &[u8] = b"ShieldCode-Vault-JwtSigningKey-v2";
const HKDF_SALT_TOTP: &[u8] = b"ShieldCode-Vault-Account-TOTP-v2";

/// Comprehensive, secret-safe error enum for all cryptographic operations.
/// Never embeds key material, nonces, or plaintext codes inside error messages.
#[derive(Debug, Error, PartialEq, Eq)]
pub enum CryptoError {
    #[error("Master encryption key environment variable '{0}' is not set")]
    MissingEnvKey(&'static str),

    #[error("Master encryption key encoding is invalid (expected 64-char hex or Base64)")]
    InvalidKeyEncoding,

    #[error("Master encryption key length is invalid (expected exactly 32 bytes / 256 bits)")]
    InvalidKeyLength,

    #[error("Master encryption key rejected: all-zero weak key detected")]
    WeakAllZeroKey,

    #[error("Plaintext anti-phishing code cannot be empty or exceed maximum vault length")]
    InvalidPlaintextLength,

    #[error("Invalid nonce length or degenerate all-zero nonce")]
    InvalidNonce,

    #[error("Ciphertext is truncated or missing the 128-bit GCM authentication tag")]
    TruncatedCiphertext,

    #[error("Malformed serialized ciphertext token format")]
    MalformedTokenFormat,

    #[error("Key derivation (HKDF-SHA256) failed")]
    KeyDerivationFailed,

    #[error("AES-256-GCM encryption failed")]
    EncryptionFailed,

    #[error("AES-256-GCM decryption failed: authentication tag mismatch or corrupted payload")]
    AuthenticationFailed,

    #[error("Decrypted payload is not valid UTF-8 or violates domain code invariants")]
    InvalidDecryptedCode,

    #[error("Tenant API key hash verification failed")]
    InvalidPasswordHashFormat,
}

impl From<CryptoError> for VaultError {
    fn from(err: CryptoError) -> Self {
        match err {
            CryptoError::MissingEnvKey(_)
            | CryptoError::InvalidKeyEncoding
            | CryptoError::InvalidKeyLength
            | CryptoError::WeakAllZeroKey => VaultError::Config(err.to_string()),
            CryptoError::InvalidPlaintextLength => VaultError::Validation(err.to_string()),
            _ => VaultError::CryptoFailure,
        }
    }
}

/// Memory-scrubbed plaintext wrapper that guarantees the decrypted Anti-Phishing Code
/// is wiped from RAM the instant it goes out of scope.
#[derive(Clone, Zeroize, ZeroizeOnDrop)]
pub struct ZeroizingPlaintext(String);

impl ZeroizingPlaintext {
    #[inline]
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Debug for ZeroizingPlaintext {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("ZeroizingPlaintext([REDACTED])")
    }
}

impl fmt::Display for ZeroizingPlaintext {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("[REDACTED]")
    }
}

/// Output of an AES-256-GCM encryption operation containing the unique 96-bit Nonce/IV
/// and the authenticated ciphertext (which includes the 128-bit GCM auth tag).
#[derive(Clone, PartialEq, Eq)]
pub struct EncryptedCodePacket {
    pub nonce: [u8; NONCE_SIZE],
    pub ciphertext: Vec<u8>,
}

impl EncryptedCodePacket {
    pub fn to_storage_token(&self) -> String {
        format!(
            "v1:{}:{}",
            B64.encode(self.nonce),
            B64.encode(&self.ciphertext)
        )
    }

    pub fn from_storage_token(token: &str) -> Result<Self, CryptoError> {
        let mut parts = token.trim().splitn(3, ':');
        let version = parts.next().ok_or(CryptoError::MalformedTokenFormat)?;
        let nonce_b64 = parts.next().ok_or(CryptoError::MalformedTokenFormat)?;
        let cipher_b64 = parts.next().ok_or(CryptoError::MalformedTokenFormat)?;

        if version != "v1" || parts.next().is_some() {
            return Err(CryptoError::MalformedTokenFormat);
        }

        let nonce_vec = B64
            .decode(nonce_b64)
            .map_err(|_| CryptoError::MalformedTokenFormat)?;
        let nonce: [u8; NONCE_SIZE] = nonce_vec
            .try_into()
            .map_err(|_| CryptoError::InvalidNonce)?;

        if nonce.iter().all(|&b| b == 0) {
            return Err(CryptoError::InvalidNonce);
        }

        let ciphertext = B64
            .decode(cipher_b64)
            .map_err(|_| CryptoError::MalformedTokenFormat)?;

        if ciphertext.len() <= TAG_SIZE {
            return Err(CryptoError::TruncatedCiphertext);
        }

        Ok(Self { nonce, ciphertext })
    }
}

impl fmt::Debug for EncryptedCodePacket {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("EncryptedCodePacket")
            .field("nonce_len", &self.nonce.len())
            .field("ciphertext_len", &self.ciphertext.len())
            .finish()
    }
}

/// Hardened AES-256-GCM & JWT Cryptography Service for the Anti-Phishing Code Vault.
#[derive(Zeroize, ZeroizeOnDrop)]
pub struct Aes256GcmVaultCrypto {
    master_key: [u8; KEY_SIZE],
}

impl fmt::Debug for Aes256GcmVaultCrypto {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("Aes256GcmVaultCrypto { master_key: [REDACTED] }")
    }
}

impl Aes256GcmVaultCrypto {
    /// Initializes the cryptography service by copying from a borrowed `Zeroizing` key buffer
    /// so no un-zeroed stack copy is left behind.
    pub fn new(master_key: Zeroizing<[u8; KEY_SIZE]>) -> Self {
        let mut instance = Self {
            master_key: [0u8; KEY_SIZE],
        };
        instance.master_key.copy_from_slice(master_key.as_ref());
        instance
    }

    pub fn from_env() -> Result<Self, CryptoError> {
        Self::from_env_var(ENV_MASTER_KEY)
    }

    pub fn from_env_var(var_name: &'static str) -> Result<Self, CryptoError> {
        let raw_env = Zeroizing::new(
            env::var(var_name).map_err(|_| CryptoError::MissingEnvKey(var_name))?,
        );
        let trimmed = raw_env.trim();

        let decoded: Zeroizing<Vec<u8>> = if trimmed.len() == KEY_SIZE * 2 {
            Zeroizing::new(hex::decode(trimmed).map_err(|_| CryptoError::InvalidKeyEncoding)?)
        } else {
            Zeroizing::new(
                B64.decode(trimmed.trim_end_matches('='))
                    .map_err(|_| CryptoError::InvalidKeyEncoding)?,
            )
        };

        if decoded.len() != KEY_SIZE {
            return Err(CryptoError::InvalidKeyLength);
        }

        if decoded.iter().all(|&b| b == 0) {
            return Err(CryptoError::WeakAllZeroKey);
        }

        let mut key_buf = Zeroizing::new([0u8; KEY_SIZE]);
        key_buf.copy_from_slice(&decoded);

        Ok(Self::new(key_buf))
    }

    /// Generates a fresh 96-bit CSPRNG nonce via `OsRng` and rejects degenerate all-zero nonces.
    fn generate_verified_nonce() -> Result<[u8; NONCE_SIZE], CryptoError> {
        let nonce_ga = Aes256Gcm::generate_nonce(&mut OsRng);
        let mut nonce_bytes = [0u8; NONCE_SIZE];
        nonce_bytes.copy_from_slice(nonce_ga.as_slice());

        if nonce_bytes.iter().all(|&b| b == 0) {
            return Err(CryptoError::InvalidNonce);
        }
        Ok(nonce_bytes)
    }

    /// Encrypts `plaintext_code` and immediately zeroizes the caller's `String` buffer in RAM.
    pub fn encrypt_and_zeroize_plaintext(
        &self,
        plaintext_code: &mut String,
        aad: &[u8],
    ) -> Result<EncryptedCodePacket, CryptoError> {
        let result = self.encrypt_str_with_aad(plaintext_code.as_str(), aad);
        plaintext_code.zeroize();
        result
    }

    /// Encrypts a borrowed `&str` code using the master key without copying `self.master_key`
    /// onto an un-zeroed stack frame.
    pub fn encrypt_str_with_aad(
        &self,
        plaintext_code: &str,
        aad: &[u8],
    ) -> Result<EncryptedCodePacket, CryptoError> {
        let bytes = plaintext_code.as_bytes();
        if bytes.is_empty() || bytes.len() > 64 {
            return Err(CryptoError::InvalidPlaintextLength);
        }

        let key = Key::<Aes256Gcm>::from_slice(&self.master_key);
        let cipher = Aes256Gcm::new(key);

        let nonce_bytes = Self::generate_verified_nonce()?;
        let nonce = Nonce::from_slice(&nonce_bytes);

        let payload = Payload { msg: bytes, aad };
        let ciphertext = cipher
            .encrypt(nonce, payload)
            .map_err(|_| CryptoError::EncryptionFailed)?;

        Ok(EncryptedCodePacket {
            nonce: nonce_bytes,
            ciphertext,
        })
    }

    /// Decrypts an `EncryptedCodePacket` and returns a `ZeroizingPlaintext` guard.
    pub fn decrypt_with_aad(
        &self,
        packet: &EncryptedCodePacket,
        aad: &[u8],
    ) -> Result<ZeroizingPlaintext, CryptoError> {
        if packet.ciphertext.len() <= TAG_SIZE {
            return Err(CryptoError::TruncatedCiphertext);
        }
        if packet.nonce.iter().all(|&b| b == 0) {
            return Err(CryptoError::InvalidNonce);
        }

        let key = Key::<Aes256Gcm>::from_slice(&self.master_key);
        let cipher = Aes256Gcm::new(key);

        let nonce = Nonce::from_slice(&packet.nonce);
        let payload = Payload {
            msg: &packet.ciphertext,
            aad,
        };

        let raw_plaintext = Zeroizing::new(
            cipher
                .decrypt(nonce, payload)
                .map_err(|_| CryptoError::AuthenticationFailed)?,
        );

        let utf8_str = std::str::from_utf8(&raw_plaintext)
            .map_err(|_| CryptoError::InvalidDecryptedCode)?;

        Ok(ZeroizingPlaintext(utf8_str.to_owned()))
    }

    /// Derives a 256-bit subkey via `HKDF-SHA256` inside a `Zeroizing` stack buffer.
    fn derive_subkey(
        &self,
        salt: &[u8],
        info: &[u8],
    ) -> Result<Zeroizing<[u8; KEY_SIZE]>, CryptoError> {
        let hk = Hkdf::<Sha256>::new(Some(salt), &self.master_key);
        let mut okm = Zeroizing::new([0u8; KEY_SIZE]);
        hk.expand(info, okm.as_mut())
            .map_err(|_| CryptoError::KeyDerivationFailed)?;
        Ok(okm)
    }

    /// Constructs the 50-byte context (`tenant_id || account_blind_index || key_version_be`)
    /// used both as HKDF `info` (per-account key isolation) and as AES-GCM `AAD` (versioned ciphertext binding).
    #[inline]
    fn build_context_and_aad(
        tenant_id: TenantId,
        account_blind_index: &[u8; 32],
        key_version: i16,
    ) -> [u8; 50] {
        let mut buf = [0u8; 50];
        buf[..16].copy_from_slice(tenant_id.as_bytes());
        buf[16..48].copy_from_slice(account_blind_index);
        buf[48..50].copy_from_slice(&key_version.to_be_bytes());
        buf
    }
}

impl VaultCryptoPort for Aes256GcmVaultCrypto {
    fn compute_account_blind_index(
        &self,
        tenant_id: TenantId,
        account_ref: &ExternalAccountRef,
    ) -> VaultResult<[u8; 32]> {
        let index_key = self.derive_subkey(HKDF_SALT_BLIND_INDEX, tenant_id.as_bytes())?;
        let mut mac = <HmacSha256 as Mac>::new_from_slice(index_key.as_ref())
            .map_err(|_| CryptoError::KeyDerivationFailed)?;
        mac.update(tenant_id.as_bytes());
        mac.update(b":");
        mac.update(account_ref.as_str().as_bytes());

        let result = mac.finalize().into_bytes();
        let mut out = [0u8; 32];
        out.copy_from_slice(&result);
        Ok(out)
    }

    fn compute_contact_blind_index(
        &self,
        domain_tag: &str,
        normalized_contact: &str,
    ) -> VaultResult<[u8; 32]> {
        let index_key = self.derive_subkey(HKDF_SALT_CONTACT_INDEX, domain_tag.as_bytes())?;
        let mut mac = <HmacSha256 as Mac>::new_from_slice(index_key.as_ref())
            .map_err(|_| CryptoError::KeyDerivationFailed)?;
        mac.update(domain_tag.as_bytes());
        mac.update(b":");
        mac.update(normalized_contact.as_bytes());

        let result = mac.finalize().into_bytes();
        let mut out = [0u8; 32];
        out.copy_from_slice(&result);
        Ok(out)
    }

    fn generate_csprng_six_digit_otp(&self) -> VaultResult<TwoFactorOtp> {
        // Uniform rejection sampling over u32::MAX (largest multiple of 1_000_000 is 4_294_000_000)
        // to guarantee zero modulo bias when generating 6-digit OTPs via OsRng.
        const UNIFORM_UPPER_BOUND: u32 = 4_294_000_000;
        loop {
            let candidate = OsRng.next_u32();
            if candidate < UNIFORM_UPPER_BOUND {
                let otp_digits = Zeroizing::new(format!("{:06}", candidate % 1_000_000));
                return TwoFactorOtp::parse(&otp_digits);
            }
        }
    }

    fn hash_verification_otp(
        &self,
        user_id: Uuid,
        channel: &str,
        otp: &TwoFactorOtp,
    ) -> VaultResult<[u8; 32]> {
        let otp_key = self.derive_subkey(HKDF_SALT_OTP_HASH, user_id.as_bytes())?;
        let mut mac = <HmacSha256 as Mac>::new_from_slice(otp_key.as_ref())
            .map_err(|_| CryptoError::KeyDerivationFailed)?;
        mac.update(user_id.as_bytes());
        mac.update(b":");
        mac.update(channel.as_bytes());
        mac.update(b":");
        mac.update(otp.expose_str().as_bytes());

        let result = mac.finalize().into_bytes();
        let mut out = [0u8; 32];
        out.copy_from_slice(&result);
        Ok(out)
    }

    fn verify_hashed_otp(
        &self,
        user_id: Uuid,
        channel: &str,
        submitted_otp: &TwoFactorOtp,
        expected_hash: &[u8; 32],
    ) -> VaultResult<bool> {
        let computed = self.hash_verification_otp(user_id, channel, submitted_otp)?;
        Ok(computed.ct_eq(expected_hash).into())
    }

    fn issue_verified_user_jwt(&self, user: &SaasUser, ttl_secs: u64) -> VaultResult<String> {
        // Hard security invariant: refuse to mint a Vault session JWT unless BOTH Email and Phone are verified
        if !user.is_fully_verified() {
            return Err(VaultError::AccountNotVerified(
                "Cannot issue session JWT until both Email and Phone OTPs are verified",
            ));
        }

        let signing_key =
            self.derive_subkey(HKDF_SALT_JWT_SIGNING, b"ShieldCode-SaaS-Session-HS256")?;
        let now = Utc::now().timestamp().max(0) as usize;
        let exp = now.saturating_add(ttl_secs as usize);

        let claims = VerifiedJwtClaims {
            sub: user.id,
            tid: user.tenant_id.0,
            email_verified: user.email_verified,
            phone_verified: user.phone_verified,
            iat: now,
            exp,
            jti: Uuid::now_v7().to_string(),
        };

        let header = Header::new(Algorithm::HS256);
        let encoding_key = EncodingKey::from_secret(signing_key.as_ref());
        encode(&header, &claims, &encoding_key).map_err(|_| VaultError::CryptoFailure)
    }

    fn verify_user_jwt(&self, token: &str) -> VaultResult<VerifiedJwtClaims> {
        let signing_key =
            self.derive_subkey(HKDF_SALT_JWT_SIGNING, b"ShieldCode-SaaS-Session-HS256")?;
        let decoding_key = DecodingKey::from_secret(signing_key.as_ref());

        let mut validation = Validation::new(Algorithm::HS256);
        validation.validate_exp = true;
        validation.leeway = 5;

        let token_data = decode::<VerifiedJwtClaims>(token, &decoding_key, &validation)
            .map_err(|_| VaultError::Unauthorized("Invalid or expired Bearer JWT token"))?;

        token_data.claims.ensure_fully_verified()?;
        Ok(token_data.claims)
    }

    fn encrypt_code(
        &self,
        tenant_id: TenantId,
        account_blind_index: &[u8; 32],
        key_version: i16,
        code: &AntiPhishingCode,
    ) -> VaultResult<([u8; NONCE_SIZE], Vec<u8>)> {
        let context_aad = Self::build_context_and_aad(tenant_id, account_blind_index, key_version);
        // Derive a dedicated per-(tenant, account, key_version) DEK to eliminate multi-user nonce birthday pressure
        let dek = self.derive_subkey(HKDF_SALT_DEK, &context_aad)?;
        let cipher = Aes256Gcm::new_from_slice(dek.as_ref())
            .map_err(|_| CryptoError::EncryptionFailed)?;

        let nonce_bytes = Self::generate_verified_nonce()?;
        let nonce = Nonce::from_slice(&nonce_bytes);

        let payload = Payload {
            msg: code.expose_str().as_bytes(),
            aad: &context_aad,
        };

        let ciphertext = cipher
            .encrypt(nonce, payload)
            .map_err(|_| CryptoError::EncryptionFailed)?;

        Ok((nonce_bytes, ciphertext))
    }

    fn decrypt_code(
        &self,
        tenant_id: TenantId,
        account_blind_index: &[u8; 32],
        key_version: i16,
        nonce_bytes: &[u8; NONCE_SIZE],
        ciphertext: &[u8],
    ) -> VaultResult<AntiPhishingCode> {
        if ciphertext.len() <= TAG_SIZE {
            return Err(CryptoError::TruncatedCiphertext.into());
        }
        if nonce_bytes.iter().all(|&b| b == 0) {
            return Err(CryptoError::InvalidNonce.into());
        }

        let context_aad = Self::build_context_and_aad(tenant_id, account_blind_index, key_version);
        let dek = self.derive_subkey(HKDF_SALT_DEK, &context_aad)?;
        let cipher = Aes256Gcm::new_from_slice(dek.as_ref())
            .map_err(|_| CryptoError::AuthenticationFailed)?;

        let nonce = Nonce::from_slice(nonce_bytes);
        let payload = Payload {
            msg: ciphertext,
            aad: &context_aad,
        };

        let plaintext_bytes = Zeroizing::new(
            cipher
                .decrypt(nonce, payload)
                .map_err(|_| CryptoError::AuthenticationFailed)?,
        );

        let plaintext_str = std::str::from_utf8(&plaintext_bytes)
            .map_err(|_| CryptoError::InvalidDecryptedCode)?;

        AntiPhishingCode::parse(plaintext_str)
    }

    fn verify_account_totp(
        &self,
        tenant_id: TenantId,
        account_blind_index: &[u8; 32],
        submitted_otp: &TwoFactorOtp,
    ) -> VaultResult<bool> {
        let context = Self::build_context_and_aad(tenant_id, account_blind_index, 1);
        let totp_secret_key = self.derive_subkey(HKDF_SALT_TOTP, &context)?;

        let now_step = (Utc::now().timestamp() as u64) / 30;

        for step in [now_step.saturating_sub(1), now_step, now_step + 1] {
            let mut mac = <HmacSha256 as Mac>::new_from_slice(totp_secret_key.as_ref())
                .map_err(|_| CryptoError::KeyDerivationFailed)?;
            mac.update(&step.to_be_bytes());
            let digest = mac.finalize().into_bytes();

            let offset = (digest[31] & 0x0f) as usize;
            let binary = ((u32::from(digest[offset] & 0x7f)) << 24)
                | ((u32::from(digest[offset + 1])) << 16)
                | ((u32::from(digest[offset + 2])) << 8)
                | u32::from(digest[offset + 3]);

            let expected_str = Zeroizing::new(format!("{:06}", binary % 1_000_000));
            if submitted_otp.verify_constant_time(&expected_str) {
                return Ok(true);
            }
        }

        Ok(false)
    }

    fn verify_tenant_api_key(
        &self,
        raw_api_key: &str,
        expected_phc_hash: &str,
    ) -> VaultResult<bool> {
        let parsed_hash = PasswordHash::new(expected_phc_hash)
            .map_err(|_| CryptoError::InvalidPasswordHashFormat)?;
        Ok(Argon2::default()
            .verify_password(raw_api_key.as_bytes(), &parsed_hash)
            .is_ok())
    }
}
