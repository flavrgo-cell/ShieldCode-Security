import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Shared in-memory vault state for local preview of `/vault`
const globalVault = globalThis as unknown as {
  __vaultState?: {
    is_enabled: boolean;
    masked_code: string | null;
    nonce_hex: string | null;
    ciphertext_hex: string | null;
    key_version: number;
    updated_at: string | null;
  };
};

if (!globalVault.__vaultState) {
  globalVault.__vaultState = {
    is_enabled: false,
    masked_code: null,
    nonce_hex: null,
    ciphertext_hex: null,
    key_version: 1,
    updated_at: null,
  };
}

const CODE_REGEX = /^[A-Za-z0-9]{4,20}$/;
const OTP_REGEX = /^[0-9]{6}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCode = String(body.anti_phishing_code || "");
    const rawOtp = String(body.otp_code || "");

    if (!CODE_REGEX.test(rawCode) || !/[A-Za-z]/.test(rawCode) || !/[0-9]/.test(rawCode)) {
      return NextResponse.json(
        {
          error_code: "VALIDATION_ERROR",
          message: "anti_phishing_code must be 4-20 alphanumeric characters with letters and digits",
        },
        { status: 400 }
      );
    }

    if (!OTP_REGEX.test(rawOtp)) {
      return NextResponse.json(
        {
          error_code: "INVALID_2FA_OTP",
          message: "otp_code must be a 6-digit numeric string",
        },
        { status: 400 }
      );
    }

    // AES-256-GCM encryption with unique 96-bit CSPRNG nonce
    const key = crypto
      .createHash("sha256")
      .update(process.env.VAULT_MASTER_KEY_HEX || "shieldcode_vault_master_key_2026")
      .digest();
    const nonce = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, nonce);
    const encrypted = Buffer.concat([cipher.update(rawCode, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    const masked =
      rawCode.length <= 4 ? `${rawCode[0]}***` : `${rawCode.slice(0, 3)}***`;
    const now = new Date().toISOString();

    globalVault.__vaultState = {
      is_enabled: true,
      masked_code: masked,
      nonce_hex: nonce.toString("hex"),
      ciphertext_hex: Buffer.concat([encrypted, tag]).toString("hex"),
      key_version: 1,
      updated_at: now,
    };

    return NextResponse.json({
      is_enabled: true,
      masked_code: masked,
      key_version: 1,
      updated_at: now,
    });
  } catch {
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: "Unable to process request" },
      { status: 500 }
    );
  }
}
