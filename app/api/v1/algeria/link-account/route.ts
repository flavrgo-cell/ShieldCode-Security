import { NextRequest, NextResponse } from 'next/server';
import { AlgerianLiveStore } from '@/lib/db/live-store';
import { detectAlgerianTelecom, detectAlgerianBank } from '@/lib/algerian-registry';
import { defaultShieldCode } from '@/lib/shieldcode-sdk';

/**
 * POST /api/v1/algeria/link-account
 * Register or update an Algerian citizen account with Bank & Telecom linking.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, bankId, code, accountNumber, enabled = true } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'رقم الهاتف الجزائري ورمز مكافحة التصيد مطلوبان' },
        { status: 400 }
      );
    }

    const validation = defaultShieldCode.validateCode(code);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors[0] || 'كود غير صالح' },
        { status: 400 }
      );
    }

    // Auto-detect carrier
    const telecom = detectAlgerianTelecom(phone);
    const bank = detectAlgerianBank(bankId || 'algerie-poste');

    const record = AlgerianLiveStore.linkCitizen({
      phone,
      bankId: bank ? bank.id : (bankId || 'algerie-poste'),
      code,
      accountNumber,
      enabled,
    });

    // Also update in-memory core SDK
    defaultShieldCode.setCode(record.phone, record.antiphishingCode, record.enabled);

    return NextResponse.json({
      success: true,
      record,
      telecomDetected: telecom ? {
        id: telecom.id,
        nameAr: telecom.nameAr,
        companyName: telecom.companyName,
        carrierCode: telecom.carrierCode,
      } : null,
      bankDetected: bank ? {
        id: bank.id,
        nameAr: bank.nameAr,
        shortName: bank.shortName,
        smsSenderId: bank.smsSenderId,
      } : null,
      message: 'تم ربط الحساب بنجاح في قاعدة البيانات الحية لشبكة الأمان الجزائرية',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
