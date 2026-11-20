import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getShieldCodeDb } from "@/lib/shieldcode-b2b-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawKey =
      req.headers.get("x-shield-api-key") ||
      body.api_key ||
      req.nextUrl.searchParams.get("api_key");

    if (!rawKey) {
      return NextResponse.json(
        {
          success: false,
          error_code: "MISSING_API_KEY",
          message: "Missing partner API key (supply X-Shield-Api-Key header or api_key).",
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

    const externalUserId = String(body.external_user_id || "CUST-1001").trim();
    const username = String(body.username || "البشير الإبراهيمي").trim();
    const phoneNumber = String(body.phone_number || "+213550123456").trim();
    const securityCode = String(body.security_code || "").trim();

    if (!/^[A-Za-z0-9_\-\u0600-\u06FF]{3,20}$/.test(securityCode)) {
      return NextResponse.json(
        {
          success: false,
          error_code: "INVALID_SECURITY_CODE",
          message:
            "security_code must be 3 to 20 safe alphanumeric/Arabic characters (no spaces or special symbols).",
        },
        { status: 400 }
      );
    }

    keyRecord.requests_count += 1;
    keyRecord.last_used_at = new Date().toISOString();

    const compositeKey = `${company.id}:${externalUserId}`;
    const now = new Date().toISOString();

    let endUser = db.endUsers.get(compositeKey);
    if (!endUser) {
      endUser = {
        id: `usr_${crypto.randomBytes(4).toString("hex")}`,
        company_id: company.id,
        external_user_id: externalUserId,
        username,
        phone_number: phoneNumber,
        created_at: now,
      };
      db.endUsers.set(compositeKey, endUser);
    }

    const codeRecord = {
      id: `code_${crypto.randomBytes(4).toString("hex")}`,
      company_id: company.id,
      end_user_id: endUser.id,
      external_user_id: externalUserId,
      security_code: securityCode,
      is_enabled: true,
      updated_at: now,
    };

    db.antiPhishingCodes.set(compositeKey, codeRecord);

    return NextResponse.json({
      success: true,
      company_name: company.company_name,
      external_user_id: externalUserId,
      security_code: codeRecord.security_code,
      masked_code: `${securityCode.slice(0, 2)}***`,
      is_enabled: true,
      requests_count: keyRecord.requests_count,
      updated_at: now,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error_code: "INTERNAL_ERROR",
        message: "Failed to configure ShieldCode.",
      },
      { status: 500 }
    );
  }
}
