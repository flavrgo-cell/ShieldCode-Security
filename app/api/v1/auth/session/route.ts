import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyHs256Jwt } from "@/lib/auth-jwt";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
};

/**
 * `GET /api/v1/auth/session`
 * Reads the `HttpOnly` cookie or `Authorization: Bearer <token>` and returns session claims.
 */
export async function GET(req: NextRequest) {
  const cookieToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const authHeader = req.headers.get("authorization") || "";
  const bearerToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  const token = cookieToken || bearerToken || "";

  if (!token) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  const claims = verifyHs256Jwt(token);
  if (!claims) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      access_token: token,
      user: {
        user_id: claims.sub,
        email_masked: claims.email_masked,
        phone_masked: claims.phone_masked,
        email_verified: claims.email_verified,
        phone_verified: claims.phone_verified,
      },
    },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

/**
 * `DELETE /api/v1/auth/session`
 * Clears the `HttpOnly` JWT session cookie on sign out.
 */
export async function DELETE() {
  const response = NextResponse.json(
    { authenticated: false },
    { status: 200, headers: NO_STORE_HEADERS }
  );

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
