import crypto from "crypto";

export const AUTH_COOKIE_NAME = "shieldcode_access_token";
export const EMAIL_REGEX = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,24}$/;
export const ALGERIAN_PHONE_REGEX = /^\+213[567][0-9]{8}$/;
export const OTP_SIX_DIGIT_REGEX = /^[0-9]{6}$/;

const OTP_TTL_MS = 10 * 60 * 1000;
const JWT_TTL_SECS = 3600;
const MAX_FAILED_OTP_ATTEMPTS = 5;
const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

export interface AuthGateSessionRecord {
  user_id: string;
  email: string;
  email_masked: string;
  phone_number: string;
  phone_masked: string;
  password_sha256: string;
  email_otp_hmac: string | null;
  phone_otp_hmac: string | null;
  dev_email_otp: string;
  dev_phone_otp: string;
  email_verified: boolean;
  phone_verified: boolean;
  otp_expires_at: number;
  failed_attempts: number;
}

export interface VerifiedJwtClaims {
  sub: string;
  tid: string;
  email_masked: string;
  phone_masked: string;
  email_verified: boolean;
  phone_verified: boolean;
  iat: number;
  exp: number;
  jti: string;
}

export class AuthGateError extends Error {
  status: number;
  errorCode: string;

  constructor(status: number, errorCode: string, message: string) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
  }
}

const globalAuthStore = globalThis as unknown as {
  __shieldcodeAuthGateSessions?: Map<string, AuthGateSessionRecord>;
};

function getSessionStore(): Map<string, AuthGateSessionRecord> {
  if (!globalAuthStore.__shieldcodeAuthGateSessions) {
    globalAuthStore.__shieldcodeAuthGateSessions = new Map<
      string,
      AuthGateSessionRecord
    >();
  }
  return globalAuthStore.__shieldcodeAuthGateSessions;
}

function getSigningSecret(): string {
  return process.env.VAULT_MASTER_KEY_HEX || "shieldcode_vault_master_key_2026";
}

function generateSixDigitOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function hmacOtp(userId: string, channel: "email" | "sms", otp: string): string {
  return crypto
    .createHmac("sha256", getSigningSecret())
    .update(`${userId}:${channel}:${otp}`)
    .digest("hex");
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  return `${local[0]}***@${domain}`;
}

function maskPhone(phone: string): string {
  if (phone.length < 8) return "+213********";
  return `${phone.slice(0, 5)}*****${phone.slice(-3)}`;
}

function constantTimeHexEqual(aHex: string, bHex: string): boolean {
  const bufA = Buffer.from(aHex, "hex");
  const bufB = Buffer.from(bHex, "hex");
  return bufA.length > 0 && bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

function signHs256Jwt(session: AuthGateSessionRecord): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");

  const now = Math.floor(Date.now() / 1000);
  const claims: VerifiedJwtClaims = {
    sub: session.user_id,
    tid: DEFAULT_TENANT_ID,
    email_masked: session.email_masked,
    phone_masked: session.phone_masked,
    email_verified: true,
    phone_verified: true,
    iat: now,
    exp: now + JWT_TTL_SECS,
    jti: crypto.randomUUID(),
  };

  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSigningSecret())
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

/**
 * Validates registration credentials, enforces Algerian mobile number (`+213[567]...`),
 * generates two independent CSPRNG 6-digit OTPs, and persists keyed HMAC-SHA256 digests.
 */
export function createRegistrationSession(
  rawEmail: string,
  rawPhone: string,
  rawPassword: string
) {
  const email = rawEmail.trim().toLowerCase();
  const phone = rawPhone.trim();
  const password = rawPassword;

  if (!EMAIL_REGEX.test(email)) {
    throw new AuthGateError(
      400,
      "VALIDATION_ERROR",
      "Please enter a valid email address."
    );
  }

  if (!ALGERIAN_PHONE_REGEX.test(phone)) {
    throw new AuthGateError(
      400,
      "LAW_18_07_PHONE_REQUIRED",
      "Phone number must be a valid Algerian mobile number (+213 followed by 5, 6, or 7 and 8 digits)."
    );
  }

  if (password.length < 8 || password.length > 128) {
    throw new AuthGateError(
      400,
      "VALIDATION_ERROR",
      "Password must be between 8 and 128 characters."
    );
  }

  const userId = crypto.randomUUID();
  const emailOtp = generateSixDigitOtp();
  const phoneOtp = generateSixDigitOtp();
  const passwordSha256 = crypto.createHash("sha256").update(password).digest("hex");

  const record: AuthGateSessionRecord = {
    user_id: userId,
    email,
    email_masked: maskEmail(email),
    phone_number: phone,
    phone_masked: maskPhone(phone),
    password_sha256: passwordSha256,
    email_otp_hmac: hmacOtp(userId, "email", emailOtp),
    phone_otp_hmac: hmacOtp(userId, "sms", phoneOtp),
    dev_email_otp: emailOtp,
    dev_phone_otp: phoneOtp,
    email_verified: false,
    phone_verified: false,
    otp_expires_at: Date.now() + OTP_TTL_MS,
    failed_attempts: 0,
  };

  const store = getSessionStore();
  if (store.size >= 500) {
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }
  store.set(userId, record);

  return {
    user_id: record.user_id,
    email_masked: record.email_masked,
    phone_masked: record.phone_masked,
    email_verified: false,
    phone_verified: false,
    otp_expires_in_secs: Math.floor(OTP_TTL_MS / 1000),
    sandbox_email_otp: emailOtp,
    sandbox_phone_otp: phoneOtp,
    status: "DUAL_OTP_DISPATCHED" as const,
  };
}

/**
 * Verifies BOTH 6-digit OTP codes in constant time, marks the user verified,
 * and issues an HS256 JWT.
 */
export function verifyDualOtpAndIssueJwt(
  rawUserId: string,
  rawEmailOtp: string,
  rawPhoneOtp: string
) {
  const userId = rawUserId.trim();
  const emailOtp = rawEmailOtp.trim();
  const phoneOtp = rawPhoneOtp.trim();

  if (!userId) {
    throw new AuthGateError(400, "VALIDATION_ERROR", "Missing user_id.");
  }
  if (!OTP_SIX_DIGIT_REGEX.test(emailOtp) || !OTP_SIX_DIGIT_REGEX.test(phoneOtp)) {
    throw new AuthGateError(
      400,
      "INVALID_2FA_OTP",
      "Both Email and SMS verification codes must be exactly 6 numeric digits."
    );
  }

  const store = getSessionStore();
  const session = store.get(userId);
  if (!session) {
    throw new AuthGateError(
      404,
      "SESSION_NOT_FOUND",
      "Registration session not found or expired. Please register again."
    );
  }

  if (session.failed_attempts >= MAX_FAILED_OTP_ATTEMPTS) {
    throw new AuthGateError(
      403,
      "OTP_LOCKED",
      "Maximum verification attempts exceeded. Please restart registration."
    );
  }

  if (
    Date.now() > session.otp_expires_at ||
    !session.email_otp_hmac ||
    !session.phone_otp_hmac
  ) {
    throw new AuthGateError(
      403,
      "OTP_EXPIRED",
      "Verification codes have expired. Please register again."
    );
  }

  const candidateEmailHmac = hmacOtp(userId, "email", emailOtp);
  const candidatePhoneHmac = hmacOtp(userId, "sms", phoneOtp);

  const emailMatches = constantTimeHexEqual(
    candidateEmailHmac,
    session.email_otp_hmac
  );
  const phoneMatches = constantTimeHexEqual(
    candidatePhoneHmac,
    session.phone_otp_hmac
  );

  if (!emailMatches || !phoneMatches) {
    session.failed_attempts += 1;
    const remaining = Math.max(0, MAX_FAILED_OTP_ATTEMPTS - session.failed_attempts);
    throw new AuthGateError(
      403,
      "INVALID_2FA_OTP",
      !emailMatches && !phoneMatches
        ? `Invalid Email and SMS verification codes (${remaining} attempts remaining).`
        : !emailMatches
        ? `Invalid Email verification code (${remaining} attempts remaining).`
        : `Invalid SMS verification code (${remaining} attempts remaining).`
    );
  }

  session.email_verified = true;
  session.phone_verified = true;
  session.email_otp_hmac = null;
  session.phone_otp_hmac = null;
  session.failed_attempts = 0;

  const accessToken = signHs256Jwt(session);

  return {
    user_id: session.user_id,
    access_token: accessToken,
    token_type: "Bearer" as const,
    expires_in_secs: JWT_TTL_SECS,
    email_verified: true,
    phone_verified: true,
    email_masked: session.email_masked,
    phone_masked: session.phone_masked,
  };
}

/**
 * Verifies an HS256 JWT signature, expiry (`exp`), and dual-channel verification claims.
 */
export function verifyHs256Jwt(token: string): VerifiedJwtClaims | null {
  try {
    const parts = token.trim().split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;
    const expectedSig = crypto
      .createHmac("sha256", getSigningSecret())
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64url");

    const sigBuf = Buffer.from(sigB64, "utf8");
    const expectedBuf = Buffer.from(expectedSig, "utf8");
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as VerifiedJwtClaims;

    const now = Math.floor(Date.now() / 1000);
    if (
      !decoded ||
      typeof decoded.sub !== "string" ||
      typeof decoded.exp !== "number" ||
      decoded.exp <= now ||
      decoded.email_verified !== true ||
      decoded.phone_verified !== true
    ) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}
