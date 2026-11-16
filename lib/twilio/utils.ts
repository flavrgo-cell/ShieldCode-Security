import crypto from 'crypto';

const OTP_SECRET = process.env.OTP_SECRET || 'shieldcode_production_salt_2026_default';

/**
 * Validates and formats a phone number to strict E.164 international standard.
 * Supports Algeria numbers (e.g. 0555123456 -> +213555123456) and already formatted E.164 (+213...).
 */
export function formatToE164(phone: string, defaultCountryCode: string = '+213'): {
  isValid: boolean;
  e164: string;
  error?: string;
} {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, e164: '', error: 'رقم الهاتف مطلوب' };
  }

  // Remove spaces, hyphens, brackets, dots
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  // If starts with 00213 -> +213
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }

  // If local Algerian number starting with 05, 06, 07
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = defaultCountryCode + cleaned.slice(1);
  } else if (!cleaned.startsWith('+')) {
    // If no leading +
    if (cleaned.startsWith('213')) {
      cleaned = '+' + cleaned;
    } else {
      cleaned = defaultCountryCode + cleaned;
    }
  }

  // E.164 Regex: + followed by 8 to 15 digits
  const e164Regex = /^\+[1-9]\d{7,14}$/;
  const isValid = e164Regex.test(cleaned);

  if (!isValid) {
    return {
      isValid: false,
      e164: cleaned,
      error: 'رقم الهاتف غير متوافق مع المعيار الدولي E.164 (مثال: +213555123456)',
    };
  }

  return { isValid: true, e164: cleaned };
}

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
export function generateSecureOTP(): string {
  // crypto.randomInt ensures uniform distribution and cryptographic security
  const code = crypto.randomInt(100000, 999999);
  return code.toString();
}

/**
 * Hash an OTP using HMAC-SHA256 with server salt
 * Never store plaintext OTPs in storage
 */
export function hashOTP(otp: string): string {
  return crypto.createHmac('sha256', OTP_SECRET).update(otp.trim()).digest('hex');
}

/**
 * Verify an OTP against a stored hash using timing-safe comparison
 */
export function verifyOTPHash(candidateOtp: string, expectedHash: string): boolean {
  const candidateHash = hashOTP(candidateOtp);
  try {
    const bufA = Buffer.from(candidateHash, 'hex');
    const bufB = Buffer.from(expectedHash, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// In-Memory Rate Limiter for Phone Verification
// Max 3 requests per 15 minutes window
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(key: string, maxRequests: number = 3, windowMs: number = 15 * 60 * 1000): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1, retryAfterSeconds: 0 };
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds: retryAfter };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count, retryAfterSeconds: 0 };
}
