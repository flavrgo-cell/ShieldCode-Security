-- B2B Anti-Phishing Code API Vault Schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS institution_tenants (
    id UUID PRIMARY KEY,
    institution_name VARCHAR(128) NOT NULL,
    api_key_prefix VARCHAR(24) NOT NULL UNIQUE,
    api_key_hash TEXT NOT NULL,
    hmac_signing_key_encrypted BYTEA NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anti_phishing_vault_entries (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES institution_tenants(id) ON DELETE RESTRICT,
    -- HMAC-SHA256 blind index of (tenant_id || external_account_ref) so raw bank account IDs are not stored in cleartext
    account_blind_index BYTEA NOT NULL,
    -- Masked representation (e.g., "Shi***ey") safe for status queries without decrypting ciphertext
    masked_preview VARCHAR(24) NOT NULL,
    -- 96-bit CSPRNG nonce for AES-256-GCM
    nonce BYTEA NOT NULL,
    -- AES-256-GCM ciphertext + 128-bit authentication tag bound via AAD to (tenant_id || account_blind_index)
    ciphertext BYTEA NOT NULL,
    key_version SMALLINT NOT NULL DEFAULT 1,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_account_blind_index UNIQUE (tenant_id, account_blind_index),
    CONSTRAINT chk_nonce_len CHECK (octet_length(nonce) = 12)
);

CREATE INDEX IF NOT EXISTS idx_vault_entries_lookup
    ON anti_phishing_vault_entries (tenant_id, account_blind_index);

CREATE TABLE IF NOT EXISTS vault_audit_logs (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES institution_tenants(id) ON DELETE RESTRICT,
    account_blind_index BYTEA NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    actor_ip VARCHAR(45) NOT NULL,
    succeeded BOOLEAN NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vault_audit_tenant_created
    ON vault_audit_logs (tenant_id, created_at DESC);
