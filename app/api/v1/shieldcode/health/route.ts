import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "ShieldCode Security Gateway & SDK API",
    version: "2.1.0",
    status: "healthy",
    supportedChannels: ["sms", "email", "push"],
    documentation: "/tool",
    endpoints: {
      inject: "POST /api/v1/shieldcode/inject",
      verify: "POST /api/v1/shieldcode/verify",
      user: "GET, POST /api/v1/shieldcode/user",
    },
  });
}
