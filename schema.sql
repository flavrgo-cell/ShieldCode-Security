-- ============================================================================
-- ShieldCode: Enterprise API-First B2B2C Anti-Phishing SaaS Platform
-- Multi-Tenant Database Schema (PostgreSQL / SQLite Compatible)
-- ============================================================================

-- 1. Partner Companies / Financial Institutions Table
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(64) PRIMARY KEY,
    company_name VARCHAR(128) NOT NULL,
    institution_type VARCHAR(64) NOT NULL DEFAULT 'Bank',
    webhook_url VARCHAR(255),
    integration_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. B2B API Keys Table (Issued to Financial Institutions)
CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(64) PRIMARY KEY,
    company_id VARCHAR(64) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    api_key VARCHAR(128) NOT NULL UNIQUE,
    key_prefix VARCHAR(24) NOT NULL,
    environment VARCHAR(16) NOT NULL DEFAULT 'production',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    requests_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. End-Users Table (Bank / Partner Company Customers)
CREATE TABLE IF NOT EXISTS end_users (
    id VARCHAR(64) PRIMARY KEY,
    company_id VARCHAR(64) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    external_user_id VARCHAR(64) NOT NULL,
    username VARCHAR(128) NOT NULL,
    phone_number VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (company_id, external_user_id)
);

-- 4. Anti-Phishing Security Codes Table (User-Defined Personal Stamps, e.g., "Bachir34")
CREATE TABLE IF NOT EXISTS anti_phishing_codes (
    id VARCHAR(64) PRIMARY KEY,
    company_id VARCHAR(64) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    end_user_id VARCHAR(64) NOT NULL REFERENCES end_users(id) ON DELETE CASCADE,
    security_code VARCHAR(20) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (company_id, end_user_id)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_lookup ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_end_users_company ON end_users(company_id, external_user_id);
CREATE INDEX IF NOT EXISTS idx_codes_company_user ON anti_phishing_codes(company_id, end_user_id);

-- Seed Default Partner Institution ("FinanzaBank") for Immediate Demo
INSERT INTO companies (id, company_name, institution_type, webhook_url, integration_active)
VALUES ('comp_finanza_01', 'FinanzaBank', 'Digital Bank', 'https://api.finanzabank.com/webhooks/shieldcode', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO api_keys (id, company_id, api_key, key_prefix, environment, is_active)
VALUES ('key_finanza_01', 'comp_finanza_01', 'sc_live_finanza_9f8e7d6c5b4a3210', 'sc_live_finanza', 'production', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO end_users (id, company_id, external_user_id, username, phone_number)
VALUES ('usr_bachir_01', 'comp_finanza_01', 'CUST-1001', 'البشير الإبراهيمي', '+213550123456')
ON CONFLICT (id) DO NOTHING;

INSERT INTO anti_phishing_codes (id, company_id, end_user_id, security_code, is_enabled)
VALUES ('code_bachir_01', 'comp_finanza_01', 'usr_bachir_01', 'Bachir34', TRUE)
ON CONFLICT (id) DO NOTHING;
