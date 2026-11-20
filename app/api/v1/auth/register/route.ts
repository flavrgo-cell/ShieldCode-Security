import { NextRequest, NextResponse } from "next/server";
import { AuthGateError, createRegistrationSession } from "@/lib/auth-jwt";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
};

/**
 * `POST /register` (rewritten via `middleware.ts`) & `POST /api/v1/auth/register`.
 * Requires valid Email + Algerian Mobile Number (`+213[567]...`) + Password.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = createRegistrationSession(
      String(body?.email ?? ""),
      String(body?.phone_number ?? ""),
      String(body?.password ?? "")
    );

    return NextResponse.json(session, {
      status: 202,
      headers: NO_STORE_HEADERS,
    });
  } catch (err) {
    if (err instanceof AuthGateError) {
      return NextResponse.json(
        { error_code: err.errorCode, message: err.message },
        { status: err.status, headers: NO_STORE_HEADERS }
      );
    }
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: "Unable to create account." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
