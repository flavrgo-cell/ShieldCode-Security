import { NextRequest, NextResponse } from "next/server";
import { registerCompanyInStore } from "@/lib/shieldcode-b2b-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const companyName = String(body.company_name || "").trim();

    if (companyName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error_code: "VALIDATION_ERROR",
          message: "company_name is required (minimum 2 characters).",
        },
        { status: 400 }
      );
    }

    const result = registerCompanyInStore(
      companyName,
      body.institution_type,
      body.webhook_url
    );

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error_code: "INTERNAL_ERROR",
        message: "Failed to register company.",
      },
      { status: 500 }
    );
  }
}
