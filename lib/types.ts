export type Provider = 'baridimob' | 'redotpay' | 'eccp'

export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'expired'

export interface PaymentAccount {
  id: string
  account_id: string
  provider: Provider
  owner_email: string
  owner_name: string
  anti_phishing_code: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  account_id: string
  amount: number
  currency: string
  merchant_name: string
  merchant_id?: string
  status: TransactionStatus
  selfie_url: string
  verification_token: string
  ip_address?: string
  user_agent?: string
  device_info?: Record<string, unknown>
  approved_at?: string
  rejected_at?: string
  expires_at: string
  created_at: string
  updated_at: string
}

export interface VerificationLog {
  id: string
  transaction_id: string
  action: 'email_sent' | 'email_opened' | 'approved' | 'rejected' | 'expired'
  ip_address?: string
  user_agent?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface CheckoutFormData {
  accountId: string
  provider: Provider
  amount: number
  merchantName: string
}

export const PROVIDER_INFO: Record<Provider, { name: string; color: string; description: string }> = {
  baridimob: {
    name: 'BaridiMob',
    color: '#00A651',
    description: 'Algeria Post Mobile Payment'
  },
  redotpay: {
    name: 'RedotPay',
    color: '#FF4444',
    description: 'Global Crypto Visa Card'
  },
  eccp: {
    name: 'ECCP',
    color: '#0066CC',
    description: 'E-Commerce Card Payment'
  }
}
