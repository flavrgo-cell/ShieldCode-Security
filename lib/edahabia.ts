/**
 * Shared validation, masking, and formatting utilities for
 * Algérie Poste Edahabia (البطاقة البريدية الذهبية) anti-phishing protection.
 *
 * Security Principle (Zero-Exposure Card Shielding):
 * - NEVER collect or persist CVV2, expiration dates, or secret PIN codes.
 * - Full 16-digit PANs (BIN 6280...) are only used transiently for format/Luhn checks
 *   and immediately reduced to `6280 •••• •••• XXXX` + last4.
 */

export const EDAHABIA_BIN_PREFIX = "6280";
export const ALGERIAN_MOBILE_REGEX = /^\+213[567][0-9]{8}$/;
export const SECRET_WORD_REGEX = /^[A-Za-z0-9\u0600-\u06FF_\-\s]{3,20}$/;

export type EdahabiaInputMode = "last4" | "full16";

export interface EdahabiaValidationResult {
  valid: boolean;
  last4: string;
  maskedPan: string;
  luhnValid: boolean | null;
  errorAr?: string;
  errorEn?: string;
}

export interface DzPhoneValidationResult {
  valid: boolean;
  normalized: string;
  masked: string;
  operator: "Ooredoo Algeria" | "ATM Mobilis" | "Djezzy" | null;
  errorAr?: string;
  errorEn?: string;
}

export function normalizeDigits(raw: string): string {
  // Support Arabic-Indic digits (٠-٩) as well as ASCII digits
  return raw
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[^0-9]/g, "");
}

export function passesLuhn(digits: string): boolean {
  if (!/^[0-9]{12,19}$/.test(digits)) return false;
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export function formatEdahabiaPreview(mode: EdahabiaInputMode, raw: string): string {
  const digits = normalizeDigits(raw);
  if (mode === "last4") {
    const tail = digits.slice(0, 4).padEnd(4, "•");
    return `6280  ••••  ••••  ${tail}`;
  }
  const padded = digits.slice(0, 16);
  if (padded.length <= 4) {
    return `${padded.padEnd(4, "•")}  ••••  ••••  ••••`;
  }
  const last4 = padded.length >= 13 ? padded.slice(12).padEnd(4, "•") : "••••";
  return `${padded.slice(0, 4)}  ••••  ••••  ${last4}`;
}

export function validateEdahabiaInput(
  mode: EdahabiaInputMode,
  rawInput: string
): EdahabiaValidationResult {
  const digits = normalizeDigits(rawInput);

  if (mode === "last4") {
    if (digits.length !== 4) {
      return {
        valid: false,
        last4: "",
        maskedPan: formatEdahabiaPreview(mode, digits),
        luhnValid: null,
        errorAr: "يرجى إدخال آخر 4 أرقام فقط من بطاقتك الذهبية.",
        errorEn: "Please enter the last 4 digits of your Edahabia card.",
      };
    }
    return {
      valid: true,
      last4: digits,
      maskedPan: `6280 •••• •••• ${digits}`,
      luhnValid: null,
    };
  }

  if (!digits.startsWith(EDAHABIA_BIN_PREFIX)) {
    return {
      valid: false,
      last4: "",
      maskedPan: formatEdahabiaPreview(mode, digits),
      luhnValid: false,
      errorAr: "بطاقة بريد الجزائر الذهبية يجب أن تبدأ بالرقم المميز 6280.",
      errorEn: "Algérie Poste Edahabia cards must start with BIN 6280.",
    };
  }

  if (digits.length !== 16) {
    return {
      valid: false,
      last4: "",
      maskedPan: formatEdahabiaPreview(mode, digits),
      luhnValid: false,
      errorAr: "رقم البطاقة الذهبية يتكون من 16 رقماً (سيتم إخفاء الأرقام الوسطى تلقائياً).",
      errorEn: "Edahabia card number must be 16 digits (middle digits are masked immediately).",
    };
  }

  const last4 = digits.slice(-4);
  return {
    valid: true,
    last4,
    maskedPan: `6280 •••• •••• ${last4}`,
    luhnValid: passesLuhn(digits),
  };
}

export function normalizeAndValidateDzPhone(raw: string): DzPhoneValidationResult {
  let cleaned = normalizeDigits(raw.trim());
  if (cleaned.startsWith("00213")) {
    cleaned = cleaned.slice(5);
  } else if (cleaned.startsWith("213")) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith("0") && cleaned.length === 10) {
    cleaned = cleaned.slice(1);
  }

  const normalized = `+213${cleaned}`;
  if (!ALGERIAN_MOBILE_REGEX.test(normalized)) {
    return {
      valid: false,
      normalized,
      masked: "",
      operator: null,
      errorAr:
        "يرجى إدخال رقم هاتف جزائري صحيح (موبيليس 06، جيزي 07، أوريدو 05 أو +213).",
      errorEn:
        "Enter a valid Algerian mobile number (+2135, +2136, or +2137 followed by 8 digits).",
    };
  }

  const opDigit = normalized[4];
  const operator =
    opDigit === "5"
      ? "Ooredoo Algeria"
      : opDigit === "6"
      ? "ATM Mobilis"
      : "Djezzy";

  const masked = `+213 ${normalized.slice(4, 7)} •• •• ${normalized.slice(-2)}`;
  return {
    valid: true,
    normalized,
    masked,
    operator,
  };
}

/** Generates a Luhn-valid sample 16-digit Edahabia number starting with 6280 for testing. */
export function generateDemoEdahabiaNumber(): string {
  const randomMid = Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join("");
  const base15 = `${EDAHABIA_BIN_PREFIX}${randomMid}`;
  for (let check = 0; check <= 9; check++) {
    const candidate = `${base15}${check}`;
    if (passesLuhn(candidate)) {
      return candidate.replace(/(.{4})/g, "$1 ").trim();
    }
  }
  return "6280 0014 8821 4824";
}
