import { NextRequest, NextResponse } from "next/server";
import { defaultShieldCode } from "@/lib/shieldcode-sdk";

/**
 * POST /api/v1/shieldcode/inject
 * Public REST API for Banks & Financial Institutions
 * Injects user's Anti-Phishing code into an outgoing SMS or Email.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, rawMessage, channel = "sms" } = body;

    if (!userId || !rawMessage) {
      return NextResponse.json(
        { error: "Missing required fields: userId and rawMessage are required" },
        { status: 400 }
      );
    }

    const result = defaultShieldCode.injectNotification({
      userId,
      rawMessage,
      channel,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
