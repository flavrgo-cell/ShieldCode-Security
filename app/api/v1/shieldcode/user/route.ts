import { NextRequest, NextResponse } from "next/server";
import { defaultShieldCode } from "@/lib/shieldcode-sdk";

/**
 * GET /api/v1/shieldcode/user?userId=...
 * POST /api/v1/shieldcode/user
 * Manage user's Anti-Phishing Code in central repository.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId parameter is required" }, { status: 400 });
  }

  const record = defaultShieldCode.getCode(userId);
  if (!record) {
    return NextResponse.json({ found: false, enabled: false }, { status: 200 });
  }

  return NextResponse.json({
    found: true,
    userId: record.userId,
    enabled: record.enabled,
    hasCode: Boolean(record.code),
    lastUsedAt: record.lastUsedAt,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, code, enabled = true } = body;

    if (!userId || !code) {
      return NextResponse.json(
        { error: "userId and code are required" },
        { status: 400 }
      );
    }

    const record = defaultShieldCode.setCode(userId, code, enabled);
    return NextResponse.json({
      success: true,
      record: {
        userId: record.userId,
        enabled: record.enabled,
        updatedAt: record.updatedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update code" },
      { status: 400 }
    );
  }
}
