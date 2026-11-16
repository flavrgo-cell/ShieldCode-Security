import type { SMSMessage, MockUser } from './types'
import { getCurrentUser } from './auth'

const SMS_STORAGE_KEY = 'baridipay_sms_inbox'

export function getSMSMessages(userId?: string): SMSMessage[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SMS_STORAGE_KEY)
    if (!raw) return []
    const all: SMSMessage[] = JSON.parse(raw)
    if (!userId) return all
    return all.filter((m) => !m.userId || m.userId === userId)
  } catch {
    return []
  }
}

export function saveSMSMessage(msg: SMSMessage): void {
  if (typeof window === 'undefined') return
  try {
    const messages = getSMSMessages()
    const updated = [msg, ...messages]
    localStorage.setItem(SMS_STORAGE_KEY, JSON.stringify(updated))
    // Dispatch custom event for real-time UI notification
    window.dispatchEvent(new CustomEvent('baridipay_new_sms', { detail: msg }))
  } catch (e) {
    console.error('Error saving SMS message:', e)
  }
}

/**
 * Format an official Bank SMS with the user's Anti-Phishing Code (Binance-style)
 */
export function sendBankSMS(params: {
  userId: string
  user: MockUser
  content: string
  type: 'otp' | 'transfer' | 'payment' | 'security' | 'alert'
  sender?: string
}): SMSMessage {
  const { user, content, type, sender = 'BARIDIMOB' } = params

  let formattedText = ''
  let antiphishingCode: string | undefined = undefined

  // If user has Anti-Phishing Code enabled, attach it at the very top (Binance standard)
  if (user.antiphishingEnabled && user.antiphishingCode?.trim()) {
    antiphishingCode = user.antiphishingCode.trim()
    formattedText = `[رمزك السري: ${antiphishingCode}]\n${content}`
  } else {
    formattedText = `[⚠️ رمز الحماية غير مفعل]\n${content}`
  }

  const msg: SMSMessage = {
    id: `sms_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId: user.id,
    accountNumber: user.accountNumber,
    sender,
    text: formattedText,
    timestamp: new Date().toISOString(),
    isPhishing: false,
    antiphishingCode,
    type,
  }

  saveSMSMessage(msg)
  return msg
}

/**
 * Simulate an Attacker Phishing SMS (SMS Spoofing Attack)
 * In smishing, the attacker spoofs the Sender ID as "BARIDIMOB" or "BANK-DZ"
 * BUT they DO NOT have the user's secret Anti-Phishing Code!
 */
export function simulatePhishingSMS(user: MockUser, customContent?: string): SMSMessage {
  const phishingVariants = [
    `عميلنا العزيز، تم تعليق حسابك البريدي (${user.accountNumber}) مؤقتاً بسبب نشاط مشبوه.\nلتفادي تجميد الرصيد وتحديث بياناتك، اضغط الرابط فوراً:\nhttps://baridimob-poste.com/verify`,
    `تنبيه أمني: رصدنا محاولة تسجيل دخول لحسابك من جهاز مجهول.\nإذا لم تكن أنت، قم بتأكيد هويتك وأدخل الرمز السري عبر الرابط التالي:\nhttps://eccp-algerieposte.net/login`,
    `تم تحويل مبلغ 25,000 دج إلى حسابك وهو معلق بانتظار التأكيد.\nاضغط هنا لتأكيد استلام الدفعة خلال ساعتين:\nhttps://baridimob-paiement-dz.info`,
  ]

  const text = customContent || phishingVariants[Math.floor(Math.random() * phishingVariants.length)]

  const msg: SMSMessage = {
    id: `sms_phish_${Date.now()}`,
    userId: user.id,
    accountNumber: user.accountNumber,
    sender: 'BARIDIMOB', // Attacker spoofing the real bank sender ID!
    text,
    timestamp: new Date().toISOString(),
    isPhishing: true,
    antiphishingCode: undefined, // Missing! Attacker does not know the user's secret code!
    type: 'alert',
  }

  saveSMSMessage(msg)
  return msg
}

/**
 * Seed initial realistic SMS messages if inbox is empty
 */
export function ensureInitialSMS(user: MockUser): void {
  if (typeof window === 'undefined') return
  const existing = getSMSMessages(user.id)
  if (existing.length > 0) return

  if (user.antiphishingEnabled && user.antiphishingCode) {
    sendBankSMS({
      userId: user.id,
      user,
      type: 'security',
      content: `تم تفعيل رمز مكافحة التصيد [${user.antiphishingCode}] بنجاح وربطه بحسابك ${user.accountNumber}. كل رسالة من البنك ستحتوي على هذا الرمز.`,
    })
    sendBankSMS({
      userId: user.id,
      user,
      type: 'transfer',
      content: `إشعار بنكي: رصيدك الحالي في حساب ${user.accountNumber} هو ${user.balance.toLocaleString('ar-DZ')} دج. عملية شراء حديثة بمبلغ 2,500 دج.`,
    })
  }
}
