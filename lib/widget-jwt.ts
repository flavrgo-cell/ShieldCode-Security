import crypto from "crypto";

const WIDGET_JWT_SECRET =
  process.env.VAULT_MASTER_KEY_HEX || "shieldcode_vault_master_key_2026";

export interface WidgetJwtPayload {
  sub: string;
  cid: string;
  company_name: string;
  scope: "widget:configure";
  iat: number;
  exp: number;
}

export function signWidgetSessionJwt(payload: WidgetJwtPayload): string {
  const headerB64 = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", WIDGET_JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");
  return `${headerB64}.${payloadB64}.${signature}`;
}

export function verifyWidgetSessionJwt(token: string): {
  sub: string;
  cid: string;
  company_name: string;
  scope: string;
  iat: number;
  exp: number;
} | null {
  try {
    const parts = token.trim().split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;

    const expectedSig = crypto
      .createHmac("sha256", WIDGET_JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64url");

    const sigBuf = Buffer.from(sigB64);
    const expectedBuf = Buffer.from(expectedSig);
    if (
      sigBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    );
    if (!decoded || typeof decoded.exp !== "number") return null;
    if (Math.floor(Date.now() / 1000) > decoded.exp) return null;

    return decoded;
  } catch {
    return null;
  }
}
