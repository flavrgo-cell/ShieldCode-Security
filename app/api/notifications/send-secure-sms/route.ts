import { NextRequest, NextResponse } from 'next/server';
import { sendSecureSMS } from '@/lib/twilio/service';

/**
 * POST /api/notifications/send-secure-sms
 * Reusable backend service endpoint for sending secure official SMS alerts with Anti-Phishing protection.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, phone, messageBody, customSender } = body;

    const target = userId || phone;
    if (!target || !messageBody) {
      return NextResponse.json(
        { error: 'معرّف المستخدم أو رقم الهاتف ونص الرسالة مطلوبان' },
        { status: 400 }
      );
    }

    const result = await sendSecureSMS(target, messageBody, { customSender });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'فشل إرسال الرسالة الآمنة', errorCode: result.errorCode },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      to: result.to,
      protectedBody: result.body,
      isSimulated: result.isSimulated,
      message: 'تم إرسال الإشعار المحمي برمز مكافحة التصيد بنجاح عبر Twilio',
    });
  } catch (error: any) {
    console.error('API Error /api/notifications/send-secure-sms:', error);
    return NextResponse.json(
      { error: 'حدث خطأ داخلي أثناء إرسال الإشعار الآمن' },
      { status: 500 }
    );
  }
}
