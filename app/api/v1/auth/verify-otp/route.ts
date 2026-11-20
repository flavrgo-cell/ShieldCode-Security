import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  AuthGateError,
  verifyDualOtpAndIssueJwt,
} from "@/lib/auth-jwt";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
};

/**
 * `POST /verify-otp` (rewritten via `middleware.ts`) & `POST /api/v1/auth/verify-otp`.
 * Verifies BOTH 6-digit Email and SMS OTPs and issues an `HttpOnly; SameSite=Strict` HS256 JWT.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = verifyDualOtpAndIssueJwt(
      String(body?.user_id ?? ""),
      String(body?.email_otp ?? ""),
      String(body?.phone_otp ?? "")
    );

    const response = NextResponse.json(result, {
      status: 200,
      headers: NO_STORE_HEADERS,
    });

    response.cookies.set(AUTH_COOKIE_NAME, result.access_token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: result.expires_in_secs,
    });

    return response;
  } catch (err) {
    if (err instanceof AuthGateError) {
      return NextResponse.json(
        { error_code: err.errorCode, message: err.message },
        { status: err.status, headers: NO_STORE_HEADERS }
      );
    }
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: "Unable to verify OTP codes." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
