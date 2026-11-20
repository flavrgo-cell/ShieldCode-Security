import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getShieldCodeDb } from "@/lib/shieldcode-b2b-store";

const WIDGET_JWT_SECRET =
  process.env.VAULT_MASTER_KEY_HEX || "shieldcode_vault_master_key_2026";

export function signWidgetSessionJwt(payload: {
  sub: string;
  cid: string;
  company_name: string;
  scope: "widget:configure";
  iat: number;
  exp: number;
}): string {
  const headerB64 = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", WIDGET_JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");
  return `${headerB64}.${payloadB64}.${signature}`;
}

export function verifyWidgetSessionJwt(token: string): {
  sub: string;
  cid: string;
  company_name: string;
  scope: string;
  iat: number;
  exp: number;
} | null {
  try {
    const parts = token.trim().split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;

    const expectedSig = crypto
      .createHmac("sha256", WIDGET_JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64url");

    const sigBuf = Buffer.from(sigB64);
    const expectedBuf = Buffer.from(expectedSig);
    if (
      sigBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    );
    const now = Math.floor(Date.now() / 1000);
    if (typeof decoded.exp === "number" && decoded.exp < now) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

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
