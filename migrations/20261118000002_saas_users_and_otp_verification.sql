-- Public SaaS User Registration & Dual-Channel (Email + SMS) Verification Schema

-- Ensure the default Public SaaS tenant exists so public SaaS users map cleanly
-- into the multi-tenant `anti_phishing_vault_entries` foreign key hierarchy.
INSERT INTO institution_tenants (
    id,
    institution_name,
    api_key_prefix,
    api_key_hash,
    hmac_signing_key_encrypted,
    is_active
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'ShieldCode Public SaaS Platform',
    'saas_public_v1',
    '$argon2id$v=19$m=19456,t=2,p=1$c2Fhc19wdWJsaWNfc2FsdA$R7yB4X8K1pQ9vL2mN5wZ3xC6vB8nM0qW2eR4tY6uI8o',
    E'\\x00',
    TRUE
)
ON CONFLICT (api_key_prefix) DO NOTHING;

CREATE TABLE IF NOT EXISTS saas_users (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'
        REFERENCES institution_tenants(id) ON DELETE RESTRICT,
    -- HMAC-SHA256 blind index of normalized lowercase email address (PII never stored in cleartext)
    email_blind_index BYTEA NOT NULL UNIQUE,
    -- Masked email preview (e.g., "a***@example.com") for UI status display
    email_masked VARCHAR(64) NOT NULL,
    -- HMAC-SHA256 blind index of E.164 phone number
    phone_blind_index BYTEA NOT NULL UNIQUE,
    -- Masked phone preview (e.g., "+1******4567") for UI status display
    phone_masked VARCHAR(32) NOT NULL,
    -- Strict verification flags: BOTH must be TRUE before issuing a Vault-capable session or setting a code
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    -- Keyed HMAC-SHA256 digests of the 6-digit OTPs (plain-text OTPs are NEVER stored in PostgreSQL)
    email_otp_hash BYTEA,
    phone_otp_hash BYTEA,
    otp_expires_at TIMESTAMPTZ,
    otp_failed_attempts SMALLINT NOT NULL DEFAULT 0,
    -- Enforces per-user/per-phone cooldown against distributed SMS bombing
    last_otp_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_email_blind_index_len CHECK (octet_length(email_blind_index) = 32),
    CONSTRAINT chk_phone_blind_index_len CHECK (octet_length(phone_blind_index) = 32)
);

CREATE INDEX IF NOT EXISTS idx_saas_users_email_blind_index
    ON saas_users (email_blind_index);

CREATE INDEX IF NOT EXISTS idx_saas_users_phone_blind_index
    ON saas_users (phone_blind_index);
