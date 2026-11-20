import { NextRequest, NextResponse } from "next/server";
import {
  deletePaymentAccount,
  listPaymentAccounts,
  upsertPaymentAccount,
} from "@/lib/supabase/db";
import {
  ALGERIAN_INSTITUTIONS,
  normalizeRibDigits,
  validateAlgerianRibOrRip,
  type AlgerianPaymentAccountDto,
} from "@/lib/algerian-banks";
import { normalizeAndValidateDzPhone, SECRET_WORD_REGEX } from "@/lib/edahabia";
import type { Provider } from "@/lib/types";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
};

/**
 * GET /api/v1/accounts
 * Lists Algerian banking & postal payment accounts from live Supabase PostgreSQL (or sandbox fallback).
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const institution_code = sp.get("institution_code")?.trim() || undefined;
  const provider = sp.get("provider")?.trim() || undefined;
  const q = sp.get("q")?.trim() || undefined;

  const { source, accounts } = await listPaymentAccounts({
    institution_code,
    provider,
    q,
  });

  return NextResponse.json(
    {
      source,
      count: accounts.length,
      accounts,
    },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

/**
 * POST /api/v1/accounts
 * Validates and links an Algerian Bank (RIB / CIB) or Postal (CCP / RIP / Edahabia / BaridiMob) account.
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

    const rawProvider = String(body.provider || "eccp").trim().toLowerCase();
    const validProviders: Provider[] = ["edahabia", "baridimob", "eccp", "redotpay"];
    const provider: Provider = validProviders.includes(rawProvider as Provider)
      ? (rawProvider as Provider)
      : "eccp";

    const ownerName = String(body.owner_name || "").trim().slice(0, 80);
    if (ownerName.length < 2) {
      return NextResponse.json(
        {
          error_code: "INVALID_OWNER_NAME",
          message: "يرجى إدخال اسم صاحب الحساب (حرفان على الأقل).",
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const ownerEmail = String(body.owner_email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
      return NextResponse.json(
        {
          error_code: "INVALID_EMAIL",
          message: "يرجى إدخال بريد إلكتروني صحيح لاستلام تنبيهات التحقق.",
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const antiPhishingCode = String(body.anti_phishing_code || "").trim();
    if (!SECRET_WORD_REGEX.test(antiPhishingCode)) {
      return NextResponse.json(
        {
          error_code: "INVALID_SECRET_WORD",
          message: "رمز مكافحة التصيد يجب أن يكون بين 3 و 20 حرفاً أو رقماً بدون رموز ضارة.",
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    let phoneNormalized: string | null = null;
    if (body.phone_number && String(body.phone_number).trim()) {
      const phoneCheck = normalizeAndValidateDzPhone(String(body.phone_number));
      if (!phoneCheck.valid) {
        return NextResponse.json(
          {
            error_code: "INVALID_DZ_PHONE",
            message: phoneCheck.errorAr || phoneCheck.errorEn,
          },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      phoneNormalized = phoneCheck.normalized || null;
    }

    const ribInput = String(body.rib_or_rip || "").trim();
    let ribDigits: string | null = null;
    let detectedInst = body.institution_code
      ? ALGERIAN_INSTITUTIONS.find(
          (i) => i.code === String(body.institution_code).trim()
        ) ?? null
      : null;

    if (ribInput) {
      const ribCheck = validateAlgerianRibOrRip(ribInput);
      if (!ribCheck.valid) {
        return NextResponse.json(
          {
            error_code: "INVALID_ALGERIAN_RIB",
            message: ribCheck.errorAr || ribCheck.errorEn,
          },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      ribDigits = ribCheck.digits;
      detectedInst = ribCheck.institution;
    } else if (provider === "edahabia" || provider === "baridimob") {
      detectedInst = ALGERIAN_INSTITUTIONS.find((i) => i.code === "007") ?? null;
    }

    let accountId = String(body.account_id || "").trim();
    if (!accountId) {
      if (ribDigits) {
        const prefix =
          detectedInst?.code === "007"
            ? provider === "edahabia"
              ? "6280••••"
              : "RIP-"
            : `${detectedInst?.code || "DZ"}-`;
        accountId = `${prefix}${ribDigits.slice(-4)}`;
      } else {
        return NextResponse.json(
          {
            error_code: "ACCOUNT_ID_REQUIRED",
            message: "يرجى إدخال رقم الحساب (RIB/RIP من 20 رقماً) أو معرف الحساب.",
          },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
    }

    const ccpNumber =
      detectedInst?.code === "007" && ribDigits
        ? ribDigits.slice(8, 18)
        : body.ccp_number
        ? normalizeRibDigits(String(body.ccp_number)).slice(0, 12) || null
        : null;

    const accountType: AlgerianPaymentAccountDto["account_type"] =
      provider === "edahabia"
        ? "edahabia"
        : provider === "baridimob"
        ? "baridimob"
        : provider === "redotpay"
        ? "redotpay"
        : detectedInst?.code === "007"
        ? "ccp_rip"
        : ribDigits
        ? "bank_rib"
        : "cib_eccp";

    const result = await upsertPaymentAccount({
      account_id: accountId,
      provider,
      owner_email: ownerEmail,
      owner_name: ownerName,
      anti_phishing_code: antiPhishingCode,
      institution_code: detectedInst?.code ?? null,
      institution_name:
        detectedInst?.name ||
        (provider === "redotpay" ? "RedotPay Global Visa" : "Algerian Financial Institution"),
      account_type: accountType,
      rib_or_rip: ribDigits,
      ccp_number: ccpNumber,
      phone_number: phoneNormalized,
      currency: provider === "redotpay" ? "USD" : "DZD",
    });

    return NextResponse.json(
      {
        source: result.source,
        account: result.account,
        message:
          result.source === "supabase"
            ? "تم حفظ وربط الحساب البنكي/البريدي في قاعدة بيانات Supabase الحية بنجاح."
            : "تم حفظ الحساب في الوضع التجريبي المحلي (أضف مفاتيح Supabase في .env.local للمزامنة السحابية).",
      },
      { status: result.created ? 201 : 200, headers: NO_STORE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      {
        error_code: "INTERNAL_ERROR",
        message: "تعذر حفظ بيانات الحساب البنكي أو البريدي.",
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

/**
 * DELETE /api/v1/accounts?id=...
 */
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json(
      { error_code: "VALIDATION_ERROR", message: "Missing account id" },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const { source, deleted } = await deletePaymentAccount(id);
  if (!deleted) {
    return NextResponse.json(
      { error_code: "NOT_FOUND", message: "Account not found" },
      { status: 404, headers: NO_STORE_HEADERS }
    );
  }

  return NextResponse.json(
    { source, deleted: true, id },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}
