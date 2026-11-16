import { NextRequest, NextResponse } from 'next/server';
import { formatToE164, verifyOTPHash } from '@/lib/twilio/utils';
import { AlgerianLiveStore } from '@/lib/db/live-store';

/**
 * POST /api/phone/verify-otp
 * Verifies submitted OTP against HMAC hash and marks phone verified.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp, userId, antiPhishingCode } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'رقم الهاتف ورمز التحقق OTP مطلوبان' },
        { status: 400 }
      );
    }

    const formatResult = formatToE164(phone);
    if (!formatResult.isValid) {
      return NextResponse.json(
        { error: 'رقم الهاتف غير صالح' },
        { status: 400 }
      );
    }

    const e164Phone = formatResult.e164;
    const cleanOtp = String(otp).trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return NextResponse.json(
        { error: 'رمز التحقق يجب أن يتكون من 6 أرقام' },
        { status: 400 }
      );
    }

    // 1. Retrieve OTP record from storage
    const otpRecord = AlgerianLiveStore.getOTP(e164Phone);
    if (!otpRecord) {
      return NextResponse.json(
        { error: 'انتهت صلاحية رمز التحقق (5 دقائق) أو لم يتم إرسال طلب تحقق لهذا الرقم' },
        { status: 400 }
      );
    }

    // 2. Check if already exceeded 3 failed attempts
    if (otpRecord.attempts_count >= 3) {
      AlgerianLiveStore.deleteOTP(e164Phone);
      return NextResponse.json(
        { error: 'تم تجاوز الحد الأقصى للمحاولات الخاطئة (3 محاولات). يرجى طلب رمز تحقق جديد.' },
        { status: 403 }
      );
    }

    // 3. Timing-safe verification of hash
    const isMatch = verifyOTPHash(cleanOtp, otpRecord.otp_hash);

    if (!isMatch) {
      const { attempts, invalidated } = AlgerianLiveStore.incrementFailedAttempts(e164Phone);
      const remainingAttempts = Math.max(0, 3 - attempts);

      if (invalidated) {
        return NextResponse.json(
          {
            error: 'تم تجاوز الحد الأقصى للمحاولات الخاطئة (3 محاولات). تم إبطال الرمز لحماية أمان الحساب.',
            remainingAttempts: 0,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          error: `رمز التحقق غير صحيح. تبقى لك ${remainingAttempts} محاولة قبل إبطال الرمز.`,
          remainingAttempts,
        },
        { status: 400 }
      );
    }

    // 4. On Success: Mark verified & clean up
    const resolvedUserId = userId || otpRecord.user_id || e164Phone;
    const citizen = AlgerianLiveStore.markPhoneVerified(resolvedUserId, e164Phone);

    if (antiPhishingCode) {
      AlgerianLiveStore.setAntiPhishingCode(resolvedUserId, antiPhishingCode);
    }

    // Delete used OTP
    AlgerianLiveStore.deleteOTP(e164Phone);

    return NextResponse.json({
      success: true,
      phone_number: e164Phone,
      is_phone_verified: true,
      anti_phishing_code: citizen.anti_phishing_code,
      message: 'تم التحقق من رقم الهاتف وتوثيقه بنجاح عبر Twilio OTP!',
    });
  } catch (error: any) {
    console.error('API Error /api/phone/verify-otp:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء فحص رمز التحقق' },
      { status: 500 }
    );
  }
}
