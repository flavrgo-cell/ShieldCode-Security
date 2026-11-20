import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import type { ProtectedEdahabiaCard } from "@/lib/shieldcode-b2b-store";
import {
  deleteProtectedEdahabiaCard,
  listProtectedEdahabiaCards,
  upsertProtectedEdahabiaCard,
} from "@/lib/supabase/db";
import {
  EDAHABIA_BIN_PREFIX,
  SECRET_WORD_REGEX,
  normalizeAndValidateDzPhone,
  normalizeDigits,
  validateEdahabiaInput,
  type EdahabiaInputMode,
} from "@/lib/edahabia";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Pragma": "no-cache",
};

const FORBIDDEN_SECRET_KEYS = [
  "cvv",
  "cvv2",
  "cvc",
  "pin",
  "secret_pin",
  "expiry",
  "exp_date",
  "expiration",
];

const CARD_INDEX_SECRET =
  process.env.EDAHABIA_HMAC_KEY || "shieldcode_edahabia_dz_salt_2026";

function serializeCard(card: ProtectedEdahabiaCard) {
  return {
    id: card.id,
    institution_name: card.institution_name,
    card_label: card.card_label,
    holder_name: card.holder_name,
    bin_prefix: card.bin_prefix,
    last4: card.last4,
    masked_pan: card.masked_pan,
    phone_masked: card.phone_masked,
    operator: card.operator,
    secret_word: card.secret_word,
    protect_sms_links: card.protect_sms_links,
    is_active: card.is_active,
    created_at: card.created_at,
  };
}

/**
 * `GET /api/v1/cards/edahabia`
 * Returns only masked representations (`6280 •••• •••• XXXX` & masked DZ phone);
 * raw 16-digit PANs, PINs, or CVV2 are never stored or returned.
 */
export async function GET() {
  const { source, cards: rawCards } = await listProtectedEdahabiaCards();
  const cards = rawCards.map(serializeCard);

  return NextResponse.json(
    { source, count: cards.length, cards },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

/**
 * `POST /api/v1/cards/edahabia`
 * Links an Algérie Poste Edahabia card for SMS Anti-Phishing Shield protection.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error_code: "VALIDATION_ERROR", message: "Invalid JSON payload" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    // Security policy: actively reject requests that attempt to send PIN, CVV2, or expiry
    const lowerKeys = Object.keys(body).map((k) => k.toLowerCase());
    if (lowerKeys.some((k) => FORBIDDEN_SECRET_KEYS.includes(k))) {
      return NextResponse.json(
        {
          error_code: "ZERO_EXPOSURE_POLICY",
          message:
            "Security policy: Never send or store CVV2, secret PIN, or card expiry dates.",
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const mode: EdahabiaInputMode =
      body.mode === "full16" ? "full16" : "last4";
    const cardValidation = validateEdahabiaInput(
      mode,
      String(body.card_input || "")
    );
    if (!cardValidation.valid) {
      return NextResponse.json(
        {
          error_code: "INVALID_EDAHABIA_CARD",
          message: cardValidation.errorAr || cardValidation.errorEn,
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const phoneValidation = normalizeAndValidateDzPhone(
      String(body.phone_number || "")
    );
    if (!phoneValidation.valid || !phoneValidation.operator) {
      return NextResponse.json(
        {
          error_code: "LAW_18_07_PHONE_REQUIRED",
          message: phoneValidation.errorAr || phoneValidation.errorEn,
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const secretWord = String(body.secret_word || "").trim();
    if (!SECRET_WORD_REGEX.test(secretWord)) {
      return NextResponse.json(
        {
          error_code: "INVALID_SECRET_WORD",
          message:
            "الكلمة السرية يجب أن تكون بين 3 و 20 حرفاً أو رقماً بدون رموز ضارة.",
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const cardLabel =
      String(body.card_label || "").trim().slice(0, 48) ||
      "بطاقتي الذهبية - بريد الجزائر";
    const holderName =
      String(body.holder_name || "").trim().slice(0, 48) || "حامل البطاقة";
    const protectSmsLinks = body.protect_sms_links !== false;

    // Immediately compute keyed HMAC blind index and discard raw digits
    const normalizedInputDigits = normalizeDigits(String(body.card_input || ""));
    const blindIndex = crypto
      .createHmac("sha256", CARD_INDEX_SECRET)
      .update(
        `${EDAHABIA_BIN_PREFIX}:${normalizedInputDigits}:${phoneValidation.normalized}`
      )
      .digest("hex");

    const record: ProtectedEdahabiaCard = {
      id: `edhb_${crypto.randomBytes(4).toString("hex")}`,
      institution_name: "Algérie Poste • بريد الجزائر",
      card_label: cardLabel,
      holder_name: holderName,
      bin_prefix: "6280",
      last4: cardValidation.last4,
      masked_pan: cardValidation.maskedPan,
      card_blind_index: blindIndex,
      phone_masked: phoneValidation.masked,
      operator: phoneValidation.operator,
      secret_word: secretWord,
      protect_sms_links: protectSmsLinks,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const { source, card: saved, existed } = await upsertProtectedEdahabiaCard(record);

    return NextResponse.json(
      {
        source,
        card: serializeCard(saved),
        message: "تم ربط وحماية البطاقة الذهبية بنجاح دون حفظ أي بيانات سرية.",
      },
      { status: existed ? 200 : 201, headers: NO_STORE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: "تعذر حفظ بيانات الحماية للبطاقة" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

/**
 * `DELETE /api/v1/cards/edahabia?id=...`
 * Revokes SMS protection link for an Edahabia card.
 */
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json(
      { error_code: "VALIDATION_ERROR", message: "Missing card id" },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const { source, deleted } = await deleteProtectedEdahabiaCard(id);
  if (!deleted) {
    return NextResponse.json(
      { error_code: "NOT_FOUND", message: "Card not found" },
      { status: 404, headers: NO_STORE_HEADERS }
    );
  }

  return NextResponse.json(
    { source, deleted: true, id },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}
