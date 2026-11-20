-- ============================================================================
-- Public B2B Bank API Keys (SHA-256 Digest Storage) & Institution Sync
-- ============================================================================
-- * Raw `sc_live_` and `sc_test_` keys are NEVER stored in PostgreSQL.
-- * Only the 64-character lowercase SHA-256 hex digest is stored in
--   `institutions.api_key_hash` alongside the non-secret prefix and environment.

ALTER TABLE institutions
    ADD COLUMN IF NOT EXISTS api_key_prefix VARCHAR(24),
    ADD COLUMN IF NOT EXISTS key_environment VARCHAR(16) NOT NULL DEFAULT 'live',
    ADD COLUMN IF NOT EXISTS last_api_key_rotated_at TIMESTAMPTZ;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_institutions_key_env') THEN
        ALTER TABLE institutions
            ADD CONSTRAINT chk_institutions_key_env
            CHECK (key_environment IN ('live', 'test'));
    END IF;
END$$;

-- Unique partial index enabling constant-lookup-plan SHA-256 authentication on `x-api-key`
CREATE UNIQUE INDEX IF NOT EXISTS idx_institutions_api_key_hash_active
    ON institutions (api_key_hash)
    WHERE is_active = TRUE;

-- Synchronize seeded institutions into `institution_tenants` so B2B bank dispatches
-- cleanly reference tenant foreign keys on vault entries, audit logs, and wrapped links.
INSERT INTO institution_tenants (
    id,
    institution_name,
    api_key_prefix,
    api_key_hash,
    hmac_signing_key_encrypted,
    is_active,
    created_at,
    updated_at
)
SELECT
    i.id,
    i.name,
    COALESCE(i.api_key_prefix, 'dz_' || LEFT(REPLACE(i.id::TEXT, '-', ''), 12)),
    i.api_key_hash,
    decode(repeat('00', 32), 'hex'),
    i.is_active,
    i.created_at,
    i.updated_at
FROM institutions i
ON CONFLICT (id) DO NOTHING;
