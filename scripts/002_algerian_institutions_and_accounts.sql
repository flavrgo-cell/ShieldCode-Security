-- ============================================================================
-- ShieldCode & TechStore — Live Algerian Banking & Postal Database Migration
-- Compatible with Supabase (PostgreSQL 15+)
-- Run this script inside Supabase Dashboard -> SQL Editor
-- ============================================================================

-- Ensure base tables from 001_create_tables.sql exist
CREATE TABLE IF NOT EXISTS payment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT UNIQUE NOT NULL,
  provider TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  anti_phishing_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'DZD',
  merchant_name TEXT NOT NULL,
  merchant_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  selfie_url TEXT NOT NULL,
  verification_token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 1. Official Algerian Financial & Postal Institutions Directory
-- ============================================================================
CREATE TABLE IF NOT EXISTS algerian_institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  bic VARCHAR(16) NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  type VARCHAR(24) NOT NULL CHECK (type IN ('Postal', 'Bank')),
  ownership VARCHAR(24) NOT NULL CHECK (ownership IN ('Postal', 'Public', 'Private', 'Islamic')),
  rails TEXT[] NOT NULL DEFAULT ARRAY['CIB', 'RIB']::TEXT[],
  bin_prefixes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  rib_prefix VARCHAR(8) NOT NULL,
  supports_edahabia BOOLEAN NOT NULL DEFAULT FALSE,
  supports_cib BOOLEAN NOT NULL DEFAULT TRUE,
  supports_baridimob BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extend payment_accounts with Algerian Banking & Postal columns
ALTER TABLE payment_accounts
  ADD COLUMN IF NOT EXISTS institution_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS institution_name TEXT,
  ADD COLUMN IF NOT EXISTS account_type VARCHAR(32) DEFAULT 'bank_rib',
  ADD COLUMN IF NOT EXISTS rib_or_rip VARCHAR(24),
  ADD COLUMN IF NOT EXISTS ccp_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(24),
  ADD COLUMN IF NOT EXISTS currency VARCHAR(8) DEFAULT 'DZD',
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE;

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS institution_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS provider VARCHAR(32);

-- ============================================================================
-- 2. Zero-Exposure Protected Edahabia Cards Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS protected_edahabia_cards (
  id TEXT PRIMARY KEY,
  institution_name TEXT NOT NULL DEFAULT 'Algérie Poste • بريد الجزائر',
  card_label TEXT NOT NULL,
  holder_name TEXT NOT NULL,
  bin_prefix VARCHAR(8) NOT NULL DEFAULT '6280',
  last4 VARCHAR(4) NOT NULL,
  masked_pan TEXT NOT NULL,
  card_blind_index TEXT NOT NULL,
  phone_masked TEXT NOT NULL,
  operator TEXT NOT NULL,
  secret_word VARCHAR(24) NOT NULL,
  protect_sms_links BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. Institution Developer API Keys Table (SHA-256 Fingerprints Only)
-- ============================================================================
CREATE TABLE IF NOT EXISTS partner_api_keys (
  id TEXT PRIMARY KEY,
  institution_name TEXT NOT NULL,
  label TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  masked_key TEXT NOT NULL,
  last4 VARCHAR(8) NOT NULL,
  environment VARCHAR(16) NOT NULL DEFAULT 'live',
  sha256_hash TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  requests_today INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_algerian_inst_code ON algerian_institutions(code);
CREATE INDEX IF NOT EXISTS idx_payment_accounts_inst ON payment_accounts(institution_code);
CREATE INDEX IF NOT EXISTS idx_payment_accounts_rib ON payment_accounts(rib_or_rip);
CREATE INDEX IF NOT EXISTS idx_protected_cards_blind ON protected_edahabia_cards(card_blind_index);
CREATE INDEX IF NOT EXISTS idx_partner_keys_hash ON partner_api_keys(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_token ON transactions(verification_token);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
ALTER TABLE algerian_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE protected_edahabia_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'algerian_institutions' AND policyname = 'algerian_institutions_all') THEN
    CREATE POLICY "algerian_institutions_all" ON algerian_institutions FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_accounts' AND policyname = 'payment_accounts_all') THEN
    CREATE POLICY "payment_accounts_all" ON payment_accounts FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'protected_edahabia_cards' AND policyname = 'protected_edahabia_cards_all') THEN
    CREATE POLICY "protected_edahabia_cards_all" ON protected_edahabia_cards FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partner_api_keys' AND policyname = 'partner_api_keys_all') THEN
    CREATE POLICY "partner_api_keys_all" ON partner_api_keys FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'transactions_all') THEN
    CREATE POLICY "transactions_all" ON transactions FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'verification_logs' AND policyname = 'verification_logs_all') THEN
    CREATE POLICY "verification_logs_all" ON verification_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- Seed 16 Official Algerian Financial & Postal Institutions
-- ============================================================================
INSERT INTO algerian_institutions (
  code, bic, name, name_ar, type, ownership, rails, bin_prefixes, rib_prefix,
  supports_edahabia, supports_cib, supports_baridimob, sort_order
)
VALUES
  ('007', 'BAPODZAL', 'Algérie Poste (CCP / BaridiMob)', 'بريد الجزائر (الحساب البريدي / بريدي موب)', 'Postal', 'Postal', ARRAY['Edahabia', 'BaridiMob', 'CCP / RIP'], ARRAY['6280'], '00799999', TRUE, FALSE, TRUE, 1),
  ('001', 'BNALDZAL', 'BNA (Banque Nationale d''Algérie)', 'البنك الوطني الجزائري (BNA)', 'Bank', 'Public', ARRAY['CIB / SATIM', 'RIB', 'Wimpay'], ARRAY['6281', '5057'], '001', FALSE, TRUE, FALSE, 2),
  ('002', 'BEXADZAL', 'BEA (Banque Extérieure d''Algérie)', 'بنك الجزائر الخارجي (BEA)', 'Bank', 'Public', ARRAY['CIB / SATIM', 'RIB'], ARRAY['6282'], '002', FALSE, TRUE, FALSE, 3),
  ('003', 'BADRDZAL', 'BADR Bank (Banque de l''Agriculture et du Développement Rural)', 'بنك الفلاحة والتنمية الريفية (BADR)', 'Bank', 'Public', ARRAY['CIB / SATIM', 'RIB'], ARRAY['6283'], '003', FALSE, TRUE, FALSE, 4),
  ('004', 'CPALDZAL', 'CPA (Crédit Populaire d''Algérie)', 'القرض الشعبي الجزائري (CPA)', 'Bank', 'Public', ARRAY['CIB / SATIM', 'RIB', 'Wimpay'], ARRAY['6284'], '004', FALSE, TRUE, FALSE, 5),
  ('005', 'CNEPDZAL', 'CNEP-Banque (Caisse Nationale d''Épargne et de Prévoyance)', 'الصندوق الوطني للتوفير والاحتياط (CNEP)', 'Bank', 'Public', ARRAY['CIB / SATIM', 'RIB'], ARRAY['6285'], '005', FALSE, TRUE, FALSE, 6),
  ('006', 'BDLODZAL', 'BDL (Banque de Développement Local)', 'بنك التنمية المحلية (BDL)', 'Bank', 'Public', ARRAY['CIB / SATIM', 'RIB', 'DigitBDL'], ARRAY['6286'], '006', FALSE, TRUE, FALSE, 7),
  ('021', 'SOGEDZAL', 'Société Générale Algérie (SGA)', 'سوسيتي جنرال الجزائر (SGA)', 'Bank', 'Private', ARRAY['CIB / SATIM', 'RIB'], ARRAY['6289'], '021', FALSE, TRUE, FALSE, 8),
  ('020', 'BNPADZAL', 'BNP Paribas El Djazaïr', 'بي إن بي باريبا الجزائر', 'Bank', 'Private', ARRAY['CIB / SATIM', 'RIB'], ARRAY['6288'], '020', FALSE, TRUE, FALSE, 9),
  ('027', 'AGBODZAL', 'AGB (Gulf Bank Algeria)', 'بنك الخليج الجزائر (AGB)', 'Bank', 'Private', ARRAY['CIB / SATIM', 'RIB', 'Visa'], ARRAY['6290'], '027', FALSE, TRUE, FALSE, 10),
  ('029', 'BRKADZAL', 'Al Baraka Bank Algeria', 'بنك البركة الجزائري', 'Bank', 'Islamic', ARRAY['CIB / SATIM', 'RIB'], ARRAY['6291'], '029', FALSE, TRUE, FALSE, 11),
  ('034', 'ASALDZAL', 'Al Salam Bank Algeria', 'مصرف السلام الجزائر', 'Bank', 'Islamic', ARRAY['CIB / SATIM', 'RIB'], ARRAY['6292'], '034', FALSE, TRUE, FALSE, 12),
  ('031', 'HBKADZAL', 'The Housing Bank for Trade & Finance (HBTF Algeria)', 'بنك الإسكان للتجارة والتمويل الجزائر', 'Bank', 'Private', ARRAY['CIB / SATIM', 'RIB'], ARRAY['6293'], '031', FALSE, TRUE, FALSE, 13),
  ('032', 'FRANDZAL', 'Fransabank El Djazaïr', 'فرنسابنك الجزائر', 'Bank', 'Private', ARRAY['CIB / SATIM', 'RIB'], ARRAY['6294'], '032', FALSE, TRUE, FALSE, 14),
  ('026', 'NATXDZAL', 'Natixis Algérie', 'ناتيكسيس الجزائر', 'Bank', 'Private', ARRAY['CIB / SATIM', 'RIB'], ARRAY['6295'], '026', FALSE, TRUE, FALSE, 15),
  ('014', 'ARABDZAL', 'Arab Bank PLC Algeria', 'البنك العربي الجزائر', 'Bank', 'Private', ARRAY['CIB / SATIM', 'RIB'], ARRAY['6296'], '014', FALSE, TRUE, FALSE, 16)
ON CONFLICT (code) DO UPDATE SET
  bic = EXCLUDED.bic,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  rails = EXCLUDED.rails,
  is_active = TRUE;

-- ============================================================================
-- Seed Algerian Payment Accounts (Postal CCP/Edahabia/BaridiMob & Bank RIB/CIB)
-- ============================================================================
INSERT INTO payment_accounts (
  account_id, provider, owner_email, owner_name, anti_phishing_code,
  institution_code, institution_name, account_type, rib_or_rip, ccp_number, phone_number, currency, is_verified
)
VALUES
  ('6280••••4821', 'edahabia', 'bachir.ibrahimi@shieldcode.dz', 'البشير الإبراهيمي', 'Bachir34', '007', 'Algérie Poste (CCP / BaridiMob)', 'edahabia', '00799999004123456789', '0041234567', '+213550123456', 'DZD', TRUE),
  ('BARI-12345', 'baridimob', 'amine.benali@shieldcode.dz', 'أمين بن علي', 'SECURE-DOLPHIN-42', '007', 'Algérie Poste (CCP / BaridiMob)', 'baridimob', '00799999004881122334', '0048811223', '+213661234567', 'DZD', TRUE),
  ('ECCP-11111', 'eccp', 'sara.mansouri@shieldcode.dz', 'سارة منصوري', 'VERIFIED-TIGER-77', '004', 'CPA (Crédit Populaire d''Algérie)', 'cib_eccp', '00400112000987654321', NULL, '+213770987654', 'DZD', TRUE),
  ('BNA-001-7788', 'eccp', 'karim.bouzid@shieldcode.dz', 'كريم بوزيد', 'BNA-SAFE-2026', '001', 'BNA (Banque Nationale d''Algérie)', 'bank_rib', '00100605030011223344', NULL, '+213551445566', 'DZD', TRUE),
  ('BEA-002-3310', 'eccp', 'yasmine.khelifi@shieldcode.dz', 'ياسمين خليفي', 'BEA-SHIELD-99', '002', 'BEA (Banque Extérieure d''Algérie)', 'bank_rib', '00200012000044556677', NULL, '+213662334455', 'DZD', TRUE),
  ('BADR-003-5521', 'eccp', 'mourad.ziani@shieldcode.dz', 'مراد زياني', 'BADR-TRUST-11', '003', 'BADR Bank', 'bank_rib', '00300415000099887766', NULL, '+213771556677', 'DZD', TRUE),
  ('CNEP-005-8840', 'eccp', 'nadia.belkacem@shieldcode.dz', 'نادية بلقاسم', 'CNEP-DZ-55', '005', 'CNEP-Banque', 'bank_rib', '00500190000022334455', NULL, '+213554778899', 'DZD', TRUE),
  ('BDL-006-4419', 'eccp', 'sofiane.hadj@shieldcode.dz', 'سفيان حاج', 'BDL-PROTECT-24', '006', 'BDL (Banque de Développement Local)', 'bank_rib', '00600204000066778899', NULL, '+213665889900', 'DZD', TRUE),
  ('SGA-021-9012', 'eccp', 'ines.djelloul@shieldcode.dz', 'إيناس جلول', 'SGA-GUARD-71', '021', 'Société Générale Algérie (SGA)', 'bank_rib', '02100005113001122334', NULL, '+213772112233', 'DZD', TRUE),
  ('RDPAY-67890', 'redotpay', 'walid.cherif@shieldcode.dz', 'وليد شريف', 'TRUSTED-EAGLE-99', NULL, 'RedotPay Global Visa', 'redotpay', NULL, NULL, '+213558990011', 'USD', TRUE)
ON CONFLICT (account_id) DO NOTHING;

-- Seed default protected Edahabia card (zero raw PAN/CVV2)
INSERT INTO protected_edahabia_cards (
  id, institution_name, card_label, holder_name, bin_prefix, last4, masked_pan,
  card_blind_index, phone_masked, operator, secret_word, protect_sms_links, is_active
)
VALUES (
  'edhb_demo_4821',
  'Algérie Poste • بريد الجزائر',
  'البطاقة الذهبية الرئيسية',
  'البشير الإبراهيمي',
  '6280',
  '4821',
  '6280 •••• •••• 4821',
  'f892c94c2c134bb2f2bc2f2a1f48e913e2cfbe09128d4efbc9e1893c11d14821',
  '+213 550 •• •• 56',
  'Ooredoo Algeria',
  'Bachir34',
  TRUE,
  TRUE
)
ON CONFLICT (id) DO NOTHING;
