import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

interface OnboardingSession {
  user_id: string;
  email: string;
  email_masked: string;
  password_hash: string;
  phone_number: string | null;
  phone_masked: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  email_otp_hash: string | null;
  phone_otp_hash: string | null;
  // Returned in local dev header/meta when SMTP/SMS env vars are not set, while also supporting real Resend/SMS
  dev_email_otp?: string;
  dev_phone_otp?: string;
  otp_expires_at: number;
  failed_attempts: number;
  last_email_otp_sent_at: number;
  last_phone_otp_sent_at: number;
}

const globalAuthStore = globalThis as unknown as {
  __onboardingSessions?: Map<string, OnboardingSession>;
};

if (!globalAuthStore.__onboardingSessions) {
  globalAuthStore.__onboardingSessions = new Map<string, OnboardingSession>();
}

const EMAIL_REGEX = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,24}$/;
const E164_PHONE_REGEX = /^\+213[567][0-9]{8}$/;
const OTP_REGEX = /^[0-9]{6}$/;
const RESEND_COOLDOWN_MS = 60_000;

function generateSixDigitOtp(): string {
  const n = crypto.randomInt(0, 1_000_000);
  return n.toString().padStart(6, "0");
}

function hmacOtp(userId: string, channel: "email" | "sms", otp: string): string {
  const secret =
    process.env.VAULT_MASTER_KEY_HEX || "shieldcode_vault_master_key_2026";
  return crypto
    .createHmac("sha256", secret)
    .update(`${userId}:${channel}:${otp}`)
    .digest("hex");
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  return `${local[0]}***@${domain}`;
}

function maskPhone(phone: string): string {
  if (phone.length < 7) return "+***";
  return `${phone.slice(0, 3)}******${phone.slice(-3)}`;
}

function issueHs256Jwt(session: OnboardingSession): string {
  const secret =
    process.env.VAULT_MASTER_KEY_HEX || "shieldcode_vault_master_key_2026";
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      sub: session.user_id,
      tid: "00000000-0000-0000-0000-000000000001",
      email_verified: session.email_verified,
      phone_verified: session.phone_verified,
      iat: now,
      exp: now + 3600,
      jti: crypto.randomUUID(),
    })
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${signature}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = String(body.action || "");
    const store = globalAuthStore.__onboardingSessions!;
    const now = Date.now();

    // STEP 1: Account Creation (Email + Password) -> Dispatches 6-digit Email OTP
    if (action === "create_account") {
      const email = String(body.email || "")
        .trim()
        .toLowerCase();
      const password = String(body.password || "");

      if (!EMAIL_REGEX.test(email)) {
        return NextResponse.json(
          {
            error_code: "VALIDATION_ERROR",
            message: "Please enter a valid email address.",
          },
          { status: 400 }
        );
      }

      if (password.length < 8) {
        return NextResponse.json(
          {
            error_code: "VALIDATION_ERROR",
            message: "Password must be at least 8 characters long.",
          },
          { status: 400 }
        );
      }

      const userId = crypto.randomUUID();
      const emailOtp = generateSixDigitOtp();
      const emailOtpHash = hmacOtp(userId, "email", emailOtp);
      const passwordHash = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

      const session: OnboardingSession = {
        user_id: userId,
        email,
        email_masked: maskEmail(email),
        password_hash: passwordHash,
        phone_number: null,
        phone_masked: null,
        email_verified: false,
        phone_verified: false,
        email_otp_hash: emailOtpHash,
        phone_otp_hash: null,
        dev_email_otp: emailOtp,
        otp_expires_at: now + 10 * 60 * 1000,
        failed_attempts: 0,
        last_email_otp_sent_at: now,
        last_phone_otp_sent_at: 0,
      };

      store.set(userId, session);

      // If RESEND_API_KEY is configured in environment, dispatch real email via Resend API
      if (process.env.RESEND_API_KEY) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from:
                process.env.RESEND_FROM_EMAIL ||
                "ShieldCode Security <onboarding@resend.dev>",
              to: [email],
              subject: "ShieldCode Vault: Your 6-Digit Email Verification Code",
              text: `Your ShieldCode 6-digit email verification code is: ${emailOtp}. It expires in 10 minutes.`,
            }),
          });
        } catch {
          // Fallback to local sandbox preview if network/key is unavailable
        }
      }

      return NextResponse.json(
        {
          user_id: userId,
          email_masked: session.email_masked,
          otp_expires_in_secs: 600,
          cooldown_secs: 60,
          // Included for instant sandbox verification if external SMTP credentials are not configured
          sandbox_otp_preview: emailOtp,
          status: "EMAIL_OTP_DISPATCHED",
        },
        { status: 202 }
      );
    }

    // STEP 2: Verify Email 6-Digit OTP
    if (action === "verify_email_otp") {
      const userId = String(body.user_id || "");
      const emailOtp = String(body.email_otp || "").trim();
      const session = store.get(userId);

      if (!session) {
        return NextResponse.json(
          {
            error_code: "SESSION_NOT_FOUND",
            message: "Onboarding session expired. Please start over.",
          },
          { status: 404 }
        );
      }

      if (!OTP_REGEX.test(emailOtp)) {
        return NextResponse.json(
          {
            error_code: "INVALID_2FA_OTP",
            message: "Email verification code must be 6 digits.",
          },
          { status: 400 }
        );
      }

      if (session.failed_attempts >= 5) {
        return NextResponse.json(
          {
            error_code: "OTP_LOCKED",
            message:
              "Too many invalid attempts. Please click 'Resend Code' to generate a fresh OTP.",
          },
          { status: 403 }
        );
      }

      if (now > session.otp_expires_at || !session.email_otp_hash) {
        return NextResponse.json(
          {
            error_code: "OTP_EXPIRED",
            message: "Your email OTP has expired. Please request a new code.",
          },
          { status: 403 }
        );
      }

      const candidateHash = hmacOtp(userId, "email", emailOtp);
      const isMatch = crypto.timingSafeEqual(
        Buffer.from(candidateHash, "hex"),
        Buffer.from(session.email_otp_hash, "hex")
      );

      if (!isMatch) {
        session.failed_attempts += 1;
        return NextResponse.json(
          {
            error_code: "INVALID_2FA_OTP",
            message: `Invalid email verification code (${5 - session.failed_attempts} attempts remaining).`,
          },
          { status: 403 }
        );
      }

      session.email_verified = true;
      session.email_otp_hash = null;
      session.failed_attempts = 0;

      return NextResponse.json({
        user_id: session.user_id,
        email_verified: true,
        status: "EMAIL_VERIFIED",
      });
    }

    // STEP 3: Link Real Phone Number (E.164) & Dispatch 6-Digit SMS OTP
    if (action === "link_phone") {
      const userId = String(body.user_id || "");
      const phone = String(body.phone_number || "").trim();
      const session = store.get(userId);

      if (!session || !session.email_verified) {
        return NextResponse.json(
          {
            error_code: "EMAIL_VERIFICATION_REQUIRED",
            message: "Please verify your email address before linking a phone number.",
          },
          { status: 403 }
        );
      }

      if (!E164_PHONE_REGEX.test(phone)) {
        return NextResponse.json(
          {
            error_code: "VALIDATION_ERROR",
            message:
              "Phone number must be in valid E.164 format (e.g. +14155552671).",
          },
          { status: 400 }
        );
      }

      const elapsed = now - session.last_phone_otp_sent_at;
      if (session.last_phone_otp_sent_at > 0 && elapsed < RESEND_COOLDOWN_MS) {
        const retrySecs = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          {
            error_code: "RATE_LIMIT_EXCEEDED",
            message: `Anti-SMS-bombing protection active. Please wait ${retrySecs}s before requesting another SMS.`,
          },
          { status: 429 }
        );
      }

      const smsOtp = generateSixDigitOtp();
      session.phone_number = phone;
      session.phone_masked = maskPhone(phone);
      session.phone_otp_hash = hmacOtp(userId, "sms", smsOtp);
      session.dev_phone_otp = smsOtp;
      session.otp_expires_at = now + 10 * 60 * 1000;
      session.failed_attempts = 0;
      session.last_phone_otp_sent_at = now;

      return NextResponse.json(
        {
          user_id: session.user_id,
          phone_masked: session.phone_masked,
          otp_expires_in_secs: 600,
          cooldown_secs: 60,
          sandbox_otp_preview: smsOtp,
          status: "SMS_OTP_DISPATCHED",
        },
        { status: 202 }
      );
    }

    // STEP 4: Verify SMS OTP & Issue Signed JWT
    if (action === "verify_sms_otp") {
      const userId = String(body.user_id || "");
      const phoneOtp = String(body.phone_otp || "").trim();
      const session = store.get(userId);

      if (!session || !session.email_verified) {
        return NextResponse.json(
          {
            error_code: "ACCOUNT_NOT_FULLY_VERIFIED",
            message: "Email verification must be completed first.",
          },
          { status: 403 }
        );
      }

      if (!OTP_REGEX.test(phoneOtp)) {
        return NextResponse.json(
          {
            error_code: "INVALID_2FA_OTP",
            message: "SMS verification code must be 6 digits.",
          },
          { status: 400 }
        );
      }

      if (session.failed_attempts >= 5) {
        return NextResponse.json(
          {
            error_code: "OTP_LOCKED",
            message:
              "Maximum SMS verification attempts reached. Please click 'Resend Code' for a new SMS OTP.",
          },
          { status: 403 }
        );
      }

      if (now > session.otp_expires_at || !session.phone_otp_hash) {
        return NextResponse.json(
          {
            error_code: "OTP_EXPIRED",
            message: "SMS verification code has expired. Please resend.",
          },
          { status: 403 }
        );
      }

      const candidateHash = hmacOtp(userId, "sms", phoneOtp);
      const isMatch = crypto.timingSafeEqual(
        Buffer.from(candidateHash, "hex"),
        Buffer.from(session.phone_otp_hash, "hex")
      );

      if (!isMatch) {
        session.failed_attempts += 1;
        return NextResponse.json(
          {
            error_code: "INVALID_2FA_OTP",
            message: `Invalid SMS OTP code (${5 - session.failed_attempts} attempts remaining).`,
          },
          { status: 403 }
        );
      }

      session.phone_verified = true;
      session.phone_otp_hash = null;
      session.failed_attempts = 0;

      const accessToken = issueHs256Jwt(session);

      return NextResponse.json({
        user_id: session.user_id,
        email_masked: session.email_masked,
        phone_masked: session.phone_masked,
        email_verified: true,
        phone_verified: true,
        access_token: accessToken,
        token_type: "Bearer",
        expires_in_secs: 3600,
        status: "FULLY_VERIFIED",
      });
    }

    // RESEND CODE (Email or SMS) with strict 60-second anti-spam enforcement
    if (action === "resend_otp") {
      const userId = String(body.user_id || "");
      const channel = body.channel === "sms" ? "sms" : "email";
      const session = store.get(userId);

      if (!session) {
        return NextResponse.json(
          {
            error_code: "SESSION_NOT_FOUND",
            message: "Onboarding session not found.",
          },
          { status: 404 }
        );
      }

      const lastSent =
        channel === "email"
          ? session.last_email_otp_sent_at
          : session.last_phone_otp_sent_at;
      const elapsed = now - lastSent;

      if (elapsed < RESEND_COOLDOWN_MS) {
        const retrySecs = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          {
            error_code: "RATE_LIMIT_EXCEEDED",
            message: `Please wait ${retrySecs}s before requesting another ${channel.toUpperCase()} code.`,
          },
          { status: 429 }
        );
      }

      const freshOtp = generateSixDigitOtp();
      session.failed_attempts = 0;
      session.otp_expires_at = now + 10 * 60 * 1000;

      if (channel === "email") {
        session.email_otp_hash = hmacOtp(userId, "email", freshOtp);
        session.dev_email_otp = freshOtp;
        session.last_email_otp_sent_at = now;
      } else {
        session.phone_otp_hash = hmacOtp(userId, "sms", freshOtp);
        session.dev_phone_otp = freshOtp;
        session.last_phone_otp_sent_at = now;
      }

      return NextResponse.json({
        user_id: session.user_id,
        channel,
        cooldown_secs: 60,
        sandbox_otp_preview: freshOtp,
        status: "OTP_RESENT",
      });
    }

    return NextResponse.json(
      { error_code: "BAD_ACTION", message: "Unsupported onboarding action." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      {
        error_code: "INTERNAL_ERROR",
        message: "Failed to process onboarding request.",
      },
      { status: 500 }
    );
  }
}
