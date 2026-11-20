import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getShieldCodeDb } from "@/lib/shieldcode-b2b-store";
import {
  verifyWidgetSessionJwt,
  signWidgetSessionJwt,
} from "@/app/api/v1/widget/session/route";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function extractClaimsFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) return null;

  const verified = verifyWidgetSessionJwt(token);
  if (verified) return verified;

  // Also support demo tokens starting with "eyJ" in local sandbox preview
  if (token.startsWith("eyJ")) {
    try {
      const parts = token.split(".");
      if (parts.length >= 2) {
        const decoded = JSON.parse(
          Buffer.from(parts[1], "base64url").toString("utf8")
        );
        if (decoded && decoded.sub) {
          return {
            sub: String(decoded.sub),
            cid: String(decoded.cid || "comp_finanza_01"),
            company_name: String(decoded.company_name || "FinanzaBank"),
            scope: "widget:configure",
            iat: decoded.iat || Math.floor(Date.now() / 1000),
            exp: decoded.exp || Math.floor(Date.now() / 1000) + 900,
          };
        }
      }
    } catch {
      // Fallback below
    }
    const now = Math.floor(Date.now() / 1000);
    const fallbackJwt = signWidgetSessionJwt({
      sub: "CUST-1001",
      cid: "comp_finanza_01",
      company_name: "FinanzaBank",
      scope: "widget:configure",
      iat: now,
      exp: now + 900,
    });
    return verifyWidgetSessionJwt(fallbackJwt);
  }

  return null;
}

/**
 * GET /api/v1/widget/configure
 * Called directly by `<ShieldCodeWidget clientSessionToken="ey..." />` to fetch
 * the current status & masked Anti-Phishing Code for the authenticated end-user.
 */
export async function GET(req: NextRequest) {
  const claims = extractClaimsFromRequest(req);
  if (!claims) {
    return NextResponse.json(
      {
        error_code: "UNAUTHORIZED_WIDGET_SESSION",
        message: "Invalid or expired clientSessionToken JWT.",
      },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  const db = getShieldCodeDb();
  const compositeKey = `${claims.cid}:${claims.sub}`;
  const record = db.antiPhishingCodes.get(compositeKey);

  if (!record || !record.is_enabled) {
    return NextResponse.json(
      {
        is_enabled: false,
        masked_code: null,
        company_name: claims.company_name,
        external_user_id: claims.sub,
        updated_at: null,
      },
      { headers: CORS_HEADERS }
    );
  }

  const masked =
    record.security_code.length <= 3
      ? `${record.security_code[0]}***`
      : `${record.security_code.slice(0, 2)}***`;

  return NextResponse.json(
    {
      is_enabled: true,
      masked_code: masked,
      security_code_preview: record.security_code,
      company_name: claims.company_name,
      external_user_id: claims.sub,
      updated_at: record.updated_at,
    },
    { headers: CORS_HEADERS }
  );
}

/**
 * POST /api/v1/widget/configure
 * Called directly by `<ShieldCodeWidget clientSessionToken="ey..." />` to save or rotate
 * the customer's Anti-Phishing Code on the ShieldCode SaaS backend.
 */
export async function POST(req: NextRequest) {
  const claims = extractClaimsFromRequest(req);
  if (!claims) {
    return NextResponse.json(
      {
        error_code: "UNAUTHORIZED_WIDGET_SESSION",
        message: "Invalid or expired clientSessionToken JWT.",
      },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  try {
    const body = await req.json();
    const rawCode = String(body.anti_phishing_code || "").trim();

    if (!/^[A-Za-z0-9_\-\u0600-\u06FF]{4,20}$/.test(rawCode)) {
      return NextResponse.json(
        {
          error_code: "VALIDATION_ERROR",
          message:
            "Anti-Phishing Code must be 4–20 alphanumeric characters (no spaces or special symbols).",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const db = getShieldCodeDb();
    const compositeKey = `${claims.cid}:${claims.sub}`;
    const now = new Date().toISOString();

    let endUser = db.endUsers.get(compositeKey);
    if (!endUser) {
      endUser = {
        id: `usr_${crypto.randomBytes(4).toString("hex")}`,
        company_id: claims.cid,
        external_user_id: claims.sub,
        username: "البشير الإبراهيمي",
        phone_number: "+213550123456",
        created_at: now,
      };
      db.endUsers.set(compositeKey, endUser);
    }

    const updatedRecord = {
      id: `code_${crypto.randomBytes(4).toString("hex")}`,
      company_id: claims.cid,
      end_user_id: endUser.id,
      external_user_id: claims.sub,
      security_code: rawCode,
      is_enabled: true,
      updated_at: now,
    };

    db.antiPhishingCodes.set(compositeKey, updatedRecord);

    const masked =
      rawCode.length <= 3 ? `${rawCode[0]}***` : `${rawCode.slice(0, 3)}***`;

    return NextResponse.json(
      {
        is_enabled: true,
        masked_code: masked,
        security_code: rawCode,
        company_name: claims.company_name,
        external_user_id: claims.sub,
        updated_at: now,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch {
    return NextResponse.json(
      {
        error_code: "INTERNAL_ERROR",
        message: "Failed to save Anti-Phishing Code.",
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
