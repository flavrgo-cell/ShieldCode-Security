import { NextRequest, NextResponse } from 'next/server';
import { AlgerianLiveStore } from '@/lib/db/live-store';
import { detectAlgerianTelecom, detectAlgerianBank } from '@/lib/algerian-registry';

/**
 * POST /api/v1/algeria/route-notification
 * Injects user's Anti-Phishing code and routes notification through the target Algerian telecom gateway.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, bankId = 'algerie-poste', rawMessage, channel = 'sms' } = body;

    if (!phone || !rawMessage) {
      return NextResponse.json(
        { error: 'رقم الهاتف الجزائري ونص الرسالة مطلوبان' },
        { status: 400 }
      );
    }

    const citizen = AlgerianLiveStore.getCitizenByPhone(phone);
    const telecom = detectAlgerianTelecom(phone);
    const bank = detectAlgerianBank(bankId);

    const bankName = bank ? bank.shortName : 'البنك الجزائري';
    const senderId = bank ? bank.smsSenderId : 'BANK_OTP';
    const carrierName = telecom ? telecom.companyName : 'Algerian Mobile Carrier';

    let hasCode = false;
    let protectedMessage = rawMessage;
    let codeAttached = '';

    if (citizen && citizen.enabled && citizen.antiphishingCode) {
      hasCode = true;
      codeAttached = citizen.antiphishingCode;
      if (channel === 'sms') {
        protectedMessage = `[رمزك: ${citizen.antiphishingCode}]\n${rawMessage}`;
      } else if (channel === 'email') {
        protectedMessage = `[Anti-Phishing Code: ${citizen.antiphishingCode}]\n\n${rawMessage}\n\n---\n🛡️ هذا الإشعار موثق برمزك الأمني لدى ${bankName}. إذا لم يطابق الرمز فهو تصيد احتيالي!`;
      } else {
        protectedMessage = `[رمزك: ${citizen.antiphishingCode}] ${rawMessage}`;
      }
    }

    // Log the event in live database
    const auditRecord = AlgerianLiveStore.logNotification({
      phone,
      telecom: telecom ? telecom.id : 'unknown',
      bankId: bank ? bank.id : bankId,
      bankName,
      channel,
      codeInjected: codeAttached,
      rawText: rawMessage,
      protectedText: protectedMessage,
      status: hasCode ? 'delivered' : 'delivered',
    });

    return NextResponse.json({
      success: true,
      hasCode,
      codeAttached,
      protectedMessage,
      telecomRoute: {
        operator: carrierName,
        carrierId: telecom ? telecom.id : 'unknown',
        carrierCode: telecom ? telecom.carrierCode : 'N/A',
        smscCenter: telecom ? telecom.smscCenter : 'N/A',
      },
      bankDetails: {
        id: bank ? bank.id : bankId,
        nameAr: bank ? bank.nameAr : bankName,
        senderId,
        code: bank ? bank.code : '000',
      },
      auditId: auditRecord.id,
      timestamp: auditRecord.timestamp,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
