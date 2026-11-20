import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getShieldCodeDb } from "@/lib/shieldcode-b2b-store";

export async function GET(req: NextRequest) {
  try {
    const rawKey =
      req.headers.get("x-shield-api-key") ||
      req.nextUrl.searchParams.get("api_key");

    if (!rawKey) {
      return NextResponse.json(
        {
          success: false,
          error_code: "MISSING_API_KEY",
          message: "Missing partner API key (supply X-Shield-Api-Key header or ?api_key=...).",
        },
        { status: 401 }
      );
    }

    const db = getShieldCodeDb();
    const keyRecord = db.apiKeys.get(String(rawKey).trim());
    if (!keyRecord || !keyRecord.is_active) {
      return NextResponse.json(
        {
          success: false,
          error_code: "INVALID_API_KEY",
          message: "Invalid or revoked partner institution API key.",
        },
        { status: 403 }
      );
    }

    const company = db.companies.get(keyRecord.company_id);
    if (!company || !company.integration_active) {
      return NextResponse.json(
        {
          success: false,
          error_code: "INTEGRATION_DISABLED",
          message: "Partner institution integration is currently paused.",
        },
        { status: 403 }
      );
    }

    keyRecord.requests_count += 1;
    keyRecord.last_used_at = new Date().toISOString();

    const externalUserId =
      req.nextUrl.searchParams.get("external_user_id") || "CUST-1001";
    const actionType = req.nextUrl.searchParams.get("action") || "transfer";
    const compositeKey = `${company.id}:${externalUserId}`;

    const endUser = db.endUsers.get(compositeKey) || {
      external_user_id: externalUserId,
      username: "البشير الإبراهيمي",
      phone_number: "+213550123456",
    };

    const codeRecord = db.antiPhishingCodes.get(compositeKey);
    const generatedOtp = crypto.randomInt(100000, 999999).toString();
    const hasShieldCode = Boolean(codeRecord && codeRecord.is_enabled);
    const activeCode = hasShieldCode ? codeRecord!.security_code : null;

    const prefix = hasShieldCode
      ? `[${activeCode}]`
      : `[UNVERIFIED-NO-SHIELDCODE]`;

    const smsPayload =
      actionType === "login"
        ? `${prefix} ${company.company_name}: Your login OTP is ${generatedOtp}. Never share this code with anyone.`
        : `${prefix} ${company.company_name}: Your OTP is ${generatedOtp} to authorize a transfer of $1,250.00. If the prefix ${prefix} does not match your personal ShieldCode, DO NOT proceed!`;

    return NextResponse.json({
      success: true,
      company_name: company.company_name,
      recipient_phone: endUser.phone_number,
      external_user_id: externalUserId,
      shield_code_active: hasShieldCode,
      embedded_security_code: activeCode,
      generated_otp: generatedOtp,
      sms_payload: smsPayload,
      requests_count: keyRecord.requests_count,
      dispatched_at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error_code: "INTERNAL_ERROR",
        message: "Failed to simulate bank SMS.",
      },
      { status: 500 }
    );
  }
}
