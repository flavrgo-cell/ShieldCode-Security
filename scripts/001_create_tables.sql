-- SecurePay Gateway Database Schema

-- Payment Accounts table
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

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
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

-- Verification logs table
CREATE TABLE IF NOT EXISTS verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_token ON transactions(verification_token);
CREATE INDEX IF NOT EXISTS idx_logs_transaction_id ON verification_logs(transaction_id);

-- Enable RLS
ALTER TABLE payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "payment_accounts_all" ON payment_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "transactions_all" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "verification_logs_all" ON verification_logs FOR ALL USING (true) WITH CHECK (true);

-- Insert sample accounts
INSERT INTO payment_accounts (account_id, provider, owner_email, owner_name, anti_phishing_code)
VALUES 
  ('BARI-12345', 'baridimob', 'owner@example.com', 'John Doe', 'SECURE-DOLPHIN-42'),
  ('RDPAY-67890', 'redotpay', 'jane@example.com', 'Jane Smith', 'TRUSTED-EAGLE-99'),
  ('ECCP-11111', 'eccp', 'bob@example.com', 'Bob Wilson', 'VERIFIED-TIGER-77')
ON CONFLICT (account_id) DO NOTHING;
