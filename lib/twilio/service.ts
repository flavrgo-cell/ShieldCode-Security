import { getTwilioClient, twilioPhoneNumber, isTwilioConfigured } from './client';
import { AlgerianLiveStore } from '@/lib/db/live-store';
import { formatToE164 } from './utils';

export interface SendSmsResult {
  success: boolean;
  messageId: string;
  to: string;
  body: string;
  isSimulated: boolean;
  error?: string;
  errorCode?: string | number;
}

/**
 * Send an OTP verification SMS via Twilio with Anti-Phishing Code protection.
 */
export async function sendOTPSms(params: {
  toPhone: string;
  otpCode: string;
  antiPhishingCode?: string;
}): Promise<SendSmsResult> {
  const { toPhone, otpCode, antiPhishingCode } = params;

  // Format message text
  let body = '';
  if (antiPhishingCode) {
    body = `[رمزك الأمني: ${antiPhishingCode}]\nShieldCode: رمز التحقق OTP لتأكيد هاتفك هو: ${otpCode}. صالح لمدة 5 دقائق. لا تشارك هذا الرمز مطلقاً.`;
  } else {
    body = `ShieldCode: رمز التحقق OTP لتأكيد هاتفك هو: ${otpCode}. صالح لمدة 5 دقائق. لا تشارك هذا الرمز مع أي شخص.`;
  }

  const client = getTwilioClient();

  // If Twilio is not configured or in mock/test mode
  if (!client || !isTwilioConfigured) {
    const mockSid = `SM_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log(`\n--------------------------------------------------`);
    console.log(`[Twilio Simulation Mode] SMS Dispatched:`);
    console.log(`To: ${toPhone}`);
    console.log(`From: ${twilioPhoneNumber}`);
    console.log(`Body: \n${body}`);
    console.log(`Mock SID: ${mockSid}`);
    console.log(`--------------------------------------------------\n`);

    return {
      success: true,
      messageId: mockSid,
      to: toPhone,
      body,
      isSimulated: true,
    };
  }

  // Live Twilio Production dispatch
  try {
    const message = await client.messages.create({
      to: toPhone,
      from: twilioPhoneNumber,
      body,
    });

    return {
      success: true,
      messageId: message.sid,
      to: toPhone,
      body,
      isSimulated: false,
    };
  } catch (error: any) {
    console.error('❌ Twilio API Error sending OTP SMS:', error);

    // Map common Twilio error codes to user-friendly messages
    let userFriendlyError = 'تعذر إرسال رسالة SMS عبر مزود الاتصالات';
    if (error.code === 21211) {
      userFriendlyError = 'رقم الهاتف غير صالح أو غير معتمد في شبكة الاتصالات';
    } else if (error.code === 21608) {
      userFriendlyError = 'حساب Twilio التجريبي يتطلب توثيق رقم الهاتف في قائمة أرقام الاختبار (Unverified Number)';
    } else if (error.code === 20003) {
      userFriendlyError = 'فشل التحقق من مفاتيح حساب Twilio (Authentication Error)';
    } else if (error.code === 21408) {
      userFriendlyError = 'لا تتوفر صلاحية إرسال الرسائل إلى هذه الدولة في حساب Twilio الحالي';
    }

    return {
      success: false,
      messageId: '',
      to: toPhone,
      body,
      isSimulated: false,
      error: userFriendlyError,
      errorCode: error.code || 'TWILIO_DISPATCH_FAILED',
    };
  }
}

/**
 * Reusable Service Function: sendSecureSMS(userId, messageBody)
 * Automatically fetches the user's Anti-Phishing code and verified phone number,
 * prepends the code to the message, sends via Twilio, and records an audit log.
 */
export async function sendSecureSMS(
  userIdOrPhone: string,
  messageBody: string,
  options?: { customSender?: string }
): Promise<SendSmsResult> {
  const user = AlgerianLiveStore.getUser(userIdOrPhone);
  const targetPhone = user?.phone_number || (formatToE164(userIdOrPhone).isValid ? formatToE164(userIdOrPhone).e164 : null);

  if (!targetPhone) {
    return {
      success: false,
      messageId: '',
      to: userIdOrPhone,
      body: messageBody,
      isSimulated: false,
      error: 'لم يتم العثور على رقم هاتف موثق لهذا المستخدم',
    };
  }

  const code = user?.anti_phishing_code || 'SECURE2026';
  const protectedText = `[Security Code: ${code}]\n${messageBody}`;

  const client = getTwilioClient();

  if (!client || !isTwilioConfigured) {
    const mockSid = `SM_mock_secure_${Date.now()}`;
    console.log(`\n[Twilio Simulation] Secure Notification Dispatched to ${targetPhone}:`);
    console.log(`${protectedText}\n`);

    AlgerianLiveStore.logNotification({
      phone: targetPhone,
      telecom: 'twilio_carrier',
      bankId: user?.bankId || 'shieldcode',
      bankName: options?.customSender || 'ShieldCode Enterprise',
      channel: 'sms',
      codeInjected: code,
      rawText: messageBody,
      protectedText,
      status: 'delivered',
      twilioSid: mockSid,
    });

    return {
      success: true,
      messageId: mockSid,
      to: targetPhone,
      body: protectedText,
      isSimulated: true,
    };
  }

  try {
    const message = await client.messages.create({
      to: targetPhone,
      from: twilioPhoneNumber,
      body: protectedText,
    });

    AlgerianLiveStore.logNotification({
      phone: targetPhone,
      telecom: 'twilio',
      bankId: user?.bankId || 'shieldcode',
      bankName: options?.customSender || 'ShieldCode Enterprise',
      channel: 'sms',
      codeInjected: code,
      rawText: messageBody,
      protectedText,
      status: 'delivered',
      twilioSid: message.sid,
    });

    return {
      success: true,
      messageId: message.sid,
      to: targetPhone,
      body: protectedText,
      isSimulated: false,
    };
  } catch (err: any) {
    console.error('❌ Twilio Error sending Secure SMS:', err);
    return {
      success: false,
      messageId: '',
      to: targetPhone,
      body: protectedText,
      isSimulated: false,
      error: err.message || 'فشل إرسال الإشعار الأمني',
      errorCode: err.code,
    };
  }
}
