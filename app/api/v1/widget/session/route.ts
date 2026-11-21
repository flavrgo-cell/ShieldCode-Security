import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getShieldCodeDb } from "@/lib/shieldcode-b2b-store";
import { signWidgetSessionJwt } from "@/lib/widget-jwt";

/**
 * POST /api/v1/widget/session
 * Called server-to-server by the Partner Bank's backend using its `X-Shield-Api-Key`
 * to mint a short-lived (15-minute) `clientSessionToken` (`eyJ...`) for the front-end
 * `<ShieldCodeWidget clientSessionToken="ey..." />`.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawKey =
      req.headers.get("x-shield-api-key") ||
      body.api_key ||
      "sc_live_finanza_9f8e7d6c5b4a3210";

    const db = getShieldCodeDb();
    const keyRecord = db.apiKeys.get(String(rawKey).trim());
    if (!keyRecord || !keyRecord.is_active) {
      return NextResponse.json(
        {
          error_code: "INVALID_API_KEY",
          message: "Invalid or inactive partner institution API key.",
        },
        { status: 403 }
      );
    }

    const company = db.companies.get(keyRecord.company_id);
    if (!company) {
      return NextResponse.json(
        { error_code: "COMPANY_NOT_FOUND", message: "Institution not found." },
        { status: 404 }
      );
    }

    const externalUserId = String(body.external_user_id || "CUST-1001").trim();
    const now = Math.floor(Date.now() / 1000);
    const ttlSecs = 900; // 15 minutes

    const clientSessionToken = signWidgetSessionJwt({
      sub: externalUserId,
      cid: company.id,
      company_name: company.company_name,
      scope: "widget:configure",
      iat: now,
      exp: now + ttlSecs,
    });

    return NextResponse.json({
      client_session_token: clientSessionToken,
      expires_in_secs: ttlSecs,
      external_user_id: externalUserId,
      company_name: company.company_name,
    });
  } catch {
    return NextResponse.json(
      {
        error_code: "INTERNAL_ERROR",
        message: "Failed to mint clientSessionToken.",
      },
      { status: 500 }
    );
  }
}
