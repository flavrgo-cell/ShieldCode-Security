-- ============================================================================
-- Secure Interstitial Link Wrapper (https://<dz-domain>/go/<token>)
-- ============================================================================
-- Security model:
--  * The public token (128-bit CSPRNG, base64url) is NEVER stored. Only its SHA-256 digest
--    is persisted, so a database leak cannot be replayed into live links.
--  * The raw bank account reference is NEVER stored; only the HMAC blind index already used
--    by anti_phishing_vault_entries.
--  * Links expire (expires_at) and have a hard resolution budget (max_resolutions) to limit
--    the exposure of the user's secret word if an SMS is forwarded or leaked.
--  * Each tenant must explicitly approve the domains it is allowed to link to.

ALTER TABLE institution_tenants
    ADD COLUMN IF NOT EXISTS allowed_link_domains TEXT[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS secure_links (
    id UUID PRIMARY KEY,
    token_sha256 BYTEA NOT NULL UNIQUE,
    tenant_id UUID NOT NULL REFERENCES institution_tenants(id) ON DELETE RESTRICT,
    account_blind_index BYTEA NOT NULL,
    target_url TEXT NOT NULL,
    max_resolutions SMALLINT NOT NULL DEFAULT 5,
    resolution_count SMALLINT NOT NULL DEFAULT 0,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    last_resolved_at TIMESTAMPTZ,
    CONSTRAINT chk_token_sha256_len CHECK (octet_length(token_sha256) = 32),
    CONSTRAINT chk_blind_index_len CHECK (octet_length(account_blind_index) = 32),
    CONSTRAINT chk_target_https CHECK (target_url LIKE 'https://%'),
    CONSTRAINT chk_target_len CHECK (char_length(target_url) <= 2048),
    CONSTRAINT chk_resolution_budget CHECK (resolution_count <= max_resolutions)
);

-- Supports the periodic purge job: DELETE FROM secure_links WHERE expires_at < NOW() - INTERVAL '30 days'
CREATE INDEX IF NOT EXISTS idx_secure_links_expiry ON secure_links (expires_at);
CREATE INDEX IF NOT EXISTS idx_secure_links_tenant_created ON secure_links (tenant_id, created_at DESC);
