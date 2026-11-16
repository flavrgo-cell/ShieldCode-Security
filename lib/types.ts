export type Provider = 'baridimob' | 'redotpay' | 'eccp'

export const PROVIDER_INFO: Record<
  Provider,
  { name: string; description: string; color: string; icon?: string }
> = {
  baridimob: {
    name: 'BaridiMob',
    description: 'تطبيق بريد الجزائر للدفع عبر الهاتف والبطاقة الذهبية',
    color: '#00b4a0',
  },
  redotpay: {
    name: 'RedotPay',
    description: 'بطاقة الدفع الرقمية العالمية',
    color: '#f59e0b',
  },
  eccp: {
    name: 'ECCP',
    description: 'الحساب البريدي الجاري الإلكتروني (بريد الجزائر)',
    color: '#38bdf8',
  },
}

export interface MockUser {
  id: string
  name: string
  phone: string
  email: string
  password?: string
  balance: number
  cardNumber: string
  cardExpiry: string
  cardCVV: string
  antiphishingCode: string
  antiphishingEnabled: boolean
  accountNumber: string
}

// Universal Transaction Interface (supports both Supabase Gateway & Mock Bank Dashboard)
export interface Transaction {
  id: string
  // Payment Gateway fields
  account_id?: string
  amount: number
  currency?: string
  merchant_name?: string
  merchant_id?: string | null
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'completed' | 'failed'
  selfie_url?: string
  verification_token?: string
  ip_address?: string | null
  user_agent?: string | null
  device_info?: any
  approved_at?: string | null
  rejected_at?: string | null
  expires_at?: string
  created_at?: string
  updated_at?: string

  // Bank Dashboard fields
  fromUserId?: string
  toUserId?: string
  type?: 'transfer' | 'payment' | 'flexi' | 'purchase'
  description?: string
  date?: string
  antiphishingCodeIncluded?: boolean
}

export interface SMSMessage {
  id: string
  userId?: string
  accountNumber?: string
  sender: string
  text: string
  timestamp: string
  isPhishing: boolean
  antiphishingCode?: string
  type?: 'otp' | 'transfer' | 'payment' | 'security' | 'alert'
}
