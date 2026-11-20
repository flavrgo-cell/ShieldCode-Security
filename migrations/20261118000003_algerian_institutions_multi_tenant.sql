-- ============================================================================
-- Algerian National Financial, Postal & E-Commerce Institutions Schema
-- Strict Multi-Tenant Architecture (Law 18-07 Sovereign Compliance)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'institution_sector_type') THEN
        CREATE TYPE institution_sector_type AS ENUM ('Bank', 'Postal', 'E-commerce');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY,
    name VARCHAR(160) NOT NULL UNIQUE,
    "type" institution_sector_type NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    -- Argon2id PHC hash for secure Server-to-Server (S2S) authentication; never exposed in public DTOs
    api_key_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial index optimized for the public `GET /api/v1/institutions/active` query
CREATE INDEX IF NOT EXISTS idx_institutions_active_lookup
    ON institutions ("type", name)
    WHERE is_active = TRUE;
