import { NextResponse } from "next/server";

const globalVault = globalThis as unknown as {
  __vaultState?: {
    is_enabled: boolean;
    masked_code: string | null;
    key_version: number;
    updated_at: string | null;
  };
};

export async function GET() {
  const state = globalVault.__vaultState;
  if (!state || !state.is_enabled) {
    return NextResponse.json({
      is_enabled: false,
      masked_code: null,
      key_version: null,
      updated_at: null,
    });
  }

  return NextResponse.json({
    is_enabled: state.is_enabled,
    masked_code: state.masked_code,
    key_version: state.key_version,
    updated_at: state.updated_at,
  });
}
