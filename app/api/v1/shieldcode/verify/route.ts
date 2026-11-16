import { NextRequest, NextResponse } from "next/server";
import { defaultShieldCode } from "@/lib/shieldcode-sdk";

/**
 * POST /api/v1/shieldcode/verify
 * Public REST API for Banks, Wallets, and Verification bots
 * Verifies if a received message/SMS legitimately contains the user's authentic code.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, fullMessageText, providedCode } = body;

    if (!userId || !fullMessageText) {
      return NextResponse.json(
        { error: "Missing required fields: userId and fullMessageText are required" },
        { status: 400 }
      );
    }

    const result = defaultShieldCode.verifyMessage({
      userId,
      fullMessageText,
      providedCode,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
