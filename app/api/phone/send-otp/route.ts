import { NextRequest, NextResponse } from 'next/server';
import { formatToE164, generateSecureOTP, hashOTP, checkRateLimit } from '@/lib/twilio/utils';
import { sendOTPSms } from '@/lib/twilio/service';
import { AlgerianLiveStore } from '@/lib/db/live-store';

/**
 * POST /api/phone/send-otp
 * Generates and sends a cryptographically secure 6-digit OTP via Twilio.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, userId, antiPhishingCode } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'رقم الهاتف مطلوب' },
        { status: 400 }
      );
    }

    // 1. Strict E.164 validation and formatting
    const formatResult = formatToE164(phone);
    if (!formatResult.isValid) {
      return NextResponse.json(
        { error: formatResult.error || 'رقم الهاتف غير صالح بمعيار E.164' },
        { status: 400 }
      );
    }

    const e164Phone = formatResult.e164;

    // 2. Rate Limiting: Max 3 requests per 15 minutes per phone
    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitKey = `otp_rate_${e164Phone}_${clientIp.split(',')[0].trim()}`;
    const rateCheck = checkRateLimit(rateLimitKey, 3, 15 * 60 * 1000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `تم تجاوز الحد المسموح به لطلبات الـ OTP. يرجى المحاولة بعد ${rateCheck.retryAfterSeconds} ثانية لحماية الرصيد.`,
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // 3. Check if user already has an Anti-Phishing Code saved
    const resolvedUserId = userId || e164Phone;
    const existingUser = AlgerianLiveStore.getUser(resolvedUserId);
    const codeToInject = antiPhishingCode || existingUser?.anti_phishing_code;

    // 4. Generate cryptographically secure 6-digit numeric OTP
    const rawOtp = generateSecureOTP();

    // 5. Hash OTP before storing (Never store plaintext)
    const otpHash = hashOTP(rawOtp);
    const ttlMs = 5 * 60 * 1000; // 5 minutes TTL
    const expiresAt = Date.now() + ttlMs;

    AlgerianLiveStore.saveOTP({
      user_id: resolvedUserId,
      phone_number: e164Phone,
      otp_hash: otpHash,
      expires_at: expiresAt,
      attempts_count: 0,
      created_at: Date.now(),
    });

    // 6. Dispatch SMS via Twilio
    const smsResult = await sendOTPSms({
      toPhone: e164Phone,
      otpCode: rawOtp,
      antiPhishingCode: codeToInject,
    });

    if (!smsResult.success) {
      return NextResponse.json(
        {
          error: smsResult.error || 'فشل إرسال رسالة التحقق عبر مزود الاتصالات',
          errorCode: smsResult.errorCode,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      phone: e164Phone,
      expiresInSeconds: 300,
      antiPhishingCodeIncluded: Boolean(codeToInject),
      isSimulated: smsResult.isSimulated,
      messageId: smsResult.messageId,
      message: 'تم إرسال رمز التحقق OTP بنجاح إلى هاتفك محمي برمز مكافحة التصيد',
      // In simulation mode only, return hint for quick evaluation
      devHint: smsResult.isSimulated ? `[SIMULATION TEST CODE: ${rawOtp}]` : undefined,
    });
  } catch (error: any) {
    console.error('API Error /api/phone/send-otp:', error);
    return NextResponse.json(
      { error: 'حدث خطأ داخلي أثناء معالجة طلب التحقق' },
      { status: 500 }
    );
  }
}
