"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Lock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { RealisticEdahabiaCard } from "@/components/realistic-edahabia-card";
import { useI18n } from "@/lib/i18n";
import {
  formatEdahabiaPreview,
  generateDemoEdahabiaNumber,
  normalizeAndValidateDzPhone,
  normalizeDigits,
  validateEdahabiaInput,
  type EdahabiaInputMode,
} from "@/lib/edahabia";

export interface ProtectedEdahabiaCardDto {
  id: string;
  institution_name: string;
  card_label: string;
  holder_name: string;
  bin_prefix: string;
  last4: string;
  masked_pan: string;
  phone_masked: string;
  operator: string;
  secret_word: string;
  protect_sms_links: boolean;
  is_active: boolean;
  created_at: string;
}

export const EdahabiaCardShield = React.memo(function EdahabiaCardShield() {
  const { locale, dir } = useI18n();
  const isAr = locale === "ar";

  const [cards, setCards] = useState<ProtectedEdahabiaCardDto[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);

  // Add Card Form State
  const [mode, setMode] = useState<EdahabiaInputMode>("last4");
  const [cardInput, setCardInput] = useState("4821");
  const [cardLabel, setCardLabel] = useState(
    isAr ? "بطاقتي الذهبية الشخصية" : "My Personal Edahabia"
  );
  const [holderName, setHolderName] = useState("البشير الإبراهيمي");
  const [phoneInput, setPhoneInput] = useState("+213550123456");
  const [secretWord, setSecretWord] = useState("Bachir34");
  const [protectSmsLinks, setProtectSmsLinks] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load initial cards from backend API
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/v1/cards/edahabia", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (active && Array.isArray(data.cards)) {
          setCards(data.cards);
          if (data.cards.length > 0) {
            setSelectedCardId(data.cards[0].id);
          }
        }
      } catch {
        // Keep graceful offline fallback
      } finally {
        if (active) setLoadingList(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const selectedCard = useMemo(
    () => cards.find((c) => c.id === selectedCardId) ?? null,
    [cards, selectedCardId]
  );

  // Live preview falls back cleanly to what the user is typing in the form
  const liveValidation = useMemo(
    () => validateEdahabiaInput(mode, cardInput),
    [mode, cardInput]
  );
  const phoneValidation = useMemo(
    () => normalizeAndValidateDzPhone(phoneInput),
    [phoneInput]
  );

  const previewMaskedPan = useMemo(() => {
    if (cardInput.trim()) {
      return formatEdahabiaPreview(mode, cardInput);
    }
    return selectedCard?.masked_pan ?? "6280  ••••  ••••  4821";
  }, [cardInput, mode, selectedCard]);

  const previewLast4 = useMemo(() => {
    if (liveValidation.valid) return liveValidation.last4;
    const d = normalizeDigits(cardInput);
    if (mode === "last4" && d.length > 0) return d.slice(0, 4).padEnd(4, "•");
    if (mode === "full16" && d.length >= 13) return d.slice(12, 16).padEnd(4, "•");
    return selectedCard?.last4 ?? "4821";
  }, [liveValidation, cardInput, mode, selectedCard]);

  const previewWord =
    secretWord.trim() || selectedCard?.secret_word || "Bachir34";
  const previewPhone = phoneValidation.valid
    ? phoneValidation.masked
    : selectedCard?.phone_masked ?? "+213 550 •• •• 56";
  const previewHolder =
    holderName.trim().toUpperCase() ||
    selectedCard?.holder_name.toUpperCase() ||
    "البشير الإبراهيمي";

  const handleModeSwitch = (next: EdahabiaInputMode) => {
    setMode(next);
    setFormError(null);
    setCardInput(next === "last4" ? "4821" : "6280 0014 8821 4824");
  };

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = normalizeDigits(e.target.value);
    setFormError(null);
    if (mode === "last4") {
      setCardInput(digits.slice(0, 4));
    } else {
      const capped = digits.slice(0, 16);
      setCardInput(capped.replace(/(.{4})/g, "$1 ").trim());
    }
  };

  const handleFillDemoFull16 = () => {
    setMode("full16");
    setFormError(null);
    setCardInput(generateDemoEdahabiaNumber());
  };

  const handleSubmitCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!liveValidation.valid) {
      setFormError(isAr ? liveValidation.errorAr! : liveValidation.errorEn!);
      return;
    }
    if (!phoneValidation.valid) {
      setFormError(
        isAr ? phoneValidation.errorAr! : phoneValidation.errorEn!
      );
      return;
    }
    if (secretWord.trim().length < 3) {
      setFormError(
        isAr
          ? "يرجى إدخال كلمة سرية لا تقل عن 3 أحرف لحماية رسائل بطاقتك."
          : "Please enter a secret word of at least 3 characters."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/cards/edahabia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          card_input: normalizeDigits(cardInput),
          card_label: cardLabel.trim(),
          holder_name: holderName.trim(),
          phone_number: phoneValidation.normalized,
          secret_word: secretWord.trim(),
          protect_sms_links: protectSmsLinks,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || "Validation failed");
        return;
      }

      const saved: ProtectedEdahabiaCardDto = data.card;
      setCards((prev) => {
        const filtered = prev.filter((c) => c.id !== saved.id);
        return [saved, ...filtered];
      });
      setSelectedCardId(saved.id);
      toast.success(
        isAr
          ? `تم ربط البطاقة الذهبية (•••• ${saved.last4}) وحمايتها بالرمز [${saved.secret_word}]`
          : `Edahabia card (•••• ${saved.last4}) protected with [${saved.secret_word}]`
      );
    } catch {
      setFormError(
        isAr
          ? "تعذر الاتصال بخادم الحماية حالياً."
          : "Unable to reach protection server."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/cards/edahabia?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) return;
      setCards((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (selectedCardId === id) {
          setSelectedCardId(next[0]?.id ?? null);
        }
        return next;
      });
      toast.info(
        isAr ? "تم فك ارتباط البطاقة من القائمة." : "Card unlinked from vault."
      );
    } catch {
      // Ignore transient error
    }
  };

  const handleSelectSavedCard = (card: ProtectedEdahabiaCardDto) => {
    setSelectedCardId(card.id);
    setMode("last4");
    setCardInput(card.last4);
    setSecretWord(card.secret_word);
    setHolderName(card.holder_name);
    setCardLabel(card.card_label);
    setProtectSmsLinks(card.protect_sms_links);
  };

  return (
    <section
      dir={dir}
      className="w-full py-12 px-4 sm:px-6 border-t border-teal-500/15 dark:border-white/10"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        {/* ================================================================
            HEADER & FRAUD WARNING CALLOUT
        ================================================================ */}
        <div className="rounded-3xl border border-teal-500/20 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 ring-1 ring-white/25 dark:ring-white/10 p-6 sm:p-8 shadow-retina-glass">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-100 dark:border-teal-900/60">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 dark:bg-teal-950/80 px-3.5 py-1 text-xs font-extrabold text-teal-800 dark:text-teal-200">
                <CreditCard className="w-4 h-4 text-teal-700 dark:text-cyan-400" />
                <span>
                  {isAr
                    ? "حماية البطاقة البريدية الذهبية • بريد الجزائر (Edahabia Shield)"
                    : "Algérie Poste Edahabia Card Anti-Phishing Shield"}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {isAr
                  ? "أضف بطاقتك الذهبية واحمِها من رسائل النصب على الهاتف"
                  : "Protect Your Edahabia Postal Card Against SMS Phishing"}
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAr
                  ? "تُعد البطاقة البريدية الذهبية (Edahabia) الأكثر استهدافاً برسائل الاحتيال على الهواتف النقالة في الجزائر (مثل رسائل إيقاف البطاقة أو الروابط المزورة لبريدي موب). بربط بطاقتك هنا، تُختم كل رسالة رسمية من بريد الجزائر بكلمتك السرية وآخر 4 أرقام من بطاقتك لتكشف المحتالين فوراً."
                  : "Algérie Poste's Edahabia card is the #1 target for mobile SMS phishing scams. Linking your card ensures every authentic SMS carries your personal Secret Word and masked card tail so spoofed messages fail immediately."}
              </p>
            </div>

            {/* Zero-Exposure Privacy Guarantee */}
            <div className="shrink-0 rounded-2xl border border-teal-300/70 dark:border-teal-700/70 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/80 dark:to-[#09202b] p-4 max-w-xs space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-teal-800 dark:text-cyan-300">
                <Lock className="w-4 h-4 text-teal-700 dark:text-cyan-400 shrink-0" />
                <span>
                  {isAr
                    ? "خصوصية تامة: لا نطلب أسرار بطاقتك!"
                    : "Zero-PIN & Zero-CVV2 Policy"}
                </span>
              </div>
              <p className="text-[11px] text-teal-950 dark:text-teal-100 leading-relaxed font-medium">
                {isAr
                  ? "لا يُطلب أبداً إدخال رمز CVV2 أو الرقم السري PIN أو تاريخ الانتهاء. يكفي آخر 4 أرقام فقط أو إخفاء الرقم تلقائياً."
                  : "We NEVER ask for your CVV2, PIN, or expiry date. Last 4 digits alone are enough to verify your SMS."}
              </p>
            </div>
          </div>

          {/* ================================================================
              MAIN 2-COLUMN GRID
          ================================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-start">
            {/* LEFT COLUMN: Add Card Form + Saved Cards List */}
            <div className="lg:col-span-5 space-y-6">
              <form
                onSubmit={handleSubmitCard}
                className="rounded-3xl border border-teal-200 dark:border-teal-800/70 bg-gradient-to-b from-teal-50/50 to-white dark:from-[#09202b] dark:to-[#061820] p-5 sm:p-6 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-teal-600 dark:text-cyan-400" />
                    <span>
                      {isAr
                        ? "إضافة البطاقة البريدية الذهبية"
                        : "Add Edahabia Postal Card"}
                    </span>
                  </h3>
                  <span className="rounded-lg bg-amber-100 dark:bg-amber-950/60 border border-amber-300/70 dark:border-amber-500/40 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-900 dark:text-amber-200">
                    BIN 6280
                  </span>
                </div>

                {/* Security Mode Toggle */}
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 dark:bg-[#031017] p-1">
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("last4")}
                    className={`rounded-xl px-2.5 py-2 text-xs font-bold transition-colors duration-200 ${
                      mode === "last4"
                        ? "anti-banding-teal text-white shadow-sm"
                        : "text-slate-600 dark:text-teal-200 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {isAr
                      ? "آخر 4 أرقام فقط (موصى به)"
                      : "Last 4 Digits (Safest)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("full16")}
                    className={`rounded-xl px-2.5 py-2 text-xs font-bold transition-colors duration-200 ${
                      mode === "full16"
                        ? "anti-banding-teal text-white shadow-sm"
                        : "text-slate-600 dark:text-teal-200 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {isAr
                      ? "فحص الـ 16 رقم (6280...)"
                      : "Full 16-Digit Check"}
                  </button>
                </div>

                {/* Card Digits Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="edahabia-card-input"
                      className="text-xs font-bold text-slate-700 dark:text-teal-200"
                    >
                      {mode === "last4"
                        ? isAr
                          ? "آخر 4 أرقام من البطاقة الذهبية"
                          : "Last 4 Digits of Edahabia"
                        : isAr
                        ? "رقم البطاقة الذهبية (يبدأ بـ 6280)"
                        : "Edahabia Card Number (starts with 6280)"}
                    </label>
                    {mode === "full16" && (
                      <button
                        type="button"
                        onClick={handleFillDemoFull16}
                        className="text-[11px] font-bold text-teal-700 dark:text-cyan-300 hover:text-teal-900 dark:hover:text-white underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        {isAr ? "توليد رقم تجريبي 6280" : "Demo 6280#"}
                      </button>
                    )}
                  </div>

                  <input
                    id="edahabia-card-input"
                    type="text"
                    dir="ltr"
                    inputMode="numeric"
                    value={cardInput}
                    onChange={handleCardInputChange}
                    placeholder={
                      mode === "last4" ? "4821" : "6280 0014 8821 4824"
                    }
                    className="h-12 w-full rounded-2xl border-2 border-teal-500/40 bg-white dark:bg-[#031017] px-4 font-mono text-base font-extrabold tracking-widest text-slate-900 dark:text-white focus:border-teal-600 dark:focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-teal-500/20"
                  />

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {mode === "last4"
                      ? isAr
                        ? "سيُحفظ الرقم بصيغة مقنّعة: 6280 •••• •••• " +
                          previewLast4
                        : `Stored masked as: 6280 •••• •••• ${previewLast4}`
                      : isAr
                      ? "تُخفى الأرقام الـ 8 الوسطى فوراً عند الحفظ ولا تُخزن كاملة أبداً."
                      : "Middle 8 digits are immediately discarded and masked on save."}
                  </p>
                </div>

                {/* Card Nickname & Holder */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="edahabia-label-input"
                      className="text-xs font-bold text-slate-700 dark:text-teal-200"
                    >
                      {isAr ? "اسم وصفي للبطاقة" : "Card Nickname"}
                    </label>
                    <input
                      id="edahabia-label-input"
                      type="text"
                      value={cardLabel}
                      onChange={(e) => setCardLabel(e.target.value.slice(0, 48))}
                      placeholder={
                        isAr ? "بطاقتي الذهبية" : "My Edahabia Card"
                      }
                      className="h-11 w-full rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-[#031017] px-3 text-xs font-bold text-slate-800 dark:text-white focus:border-teal-600 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="edahabia-holder-input"
                      className="text-xs font-bold text-slate-700 dark:text-teal-200"
                    >
                      {isAr ? "اسم صاحب البطاقة" : "Cardholder Name"}
                    </label>
                    <input
                      id="edahabia-holder-input"
                      type="text"
                      value={holderName}
                      onChange={(e) =>
                        setHolderName(e.target.value.slice(0, 48))
                      }
                      placeholder="البشير الإبراهيمي"
                      className="h-11 w-full rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-[#031017] px-3 text-xs font-bold text-slate-800 dark:text-white focus:border-teal-600 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                {/* Linked Algerian Mobile Number */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="edahabia-phone-input"
                      className="text-xs font-bold text-slate-700 dark:text-teal-200"
                    >
                      {isAr
                        ? "رقم الهاتف المرتبط ببريدي موب (+213)"
                        : "Linked Algerian Mobile (+213)"}
                    </label>
                    {phoneValidation.operator && (
                      <span className="text-[10px] font-extrabold text-teal-700 dark:text-cyan-300 bg-teal-100 dark:bg-teal-950/80 px-2 py-0.5 rounded-full">
                        {phoneValidation.operator}
                      </span>
                    )}
                  </div>
                  <input
                    id="edahabia-phone-input"
                    type="tel"
                    dir="ltr"
                    value={phoneInput}
                    onChange={(e) => {
                      setFormError(null);
                      setPhoneInput(e.target.value.slice(0, 18));
                    }}
                    placeholder="+213550123456"
                    className="h-11 w-full rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-[#031017] px-3 font-mono text-sm font-bold text-slate-900 dark:text-white focus:border-teal-600 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {/* Personal Secret Word for Edahabia */}
                <div className="space-y-1">
                  <label
                    htmlFor="edahabia-secret-input"
                    className="text-xs font-bold text-slate-700 dark:text-teal-200"
                  >
                    {isAr
                      ? "الكلمة السرية المختومة في رسائل البطاقة الذهبية"
                      : "Edahabia SMS Secret Word"}
                  </label>
                  <input
                    id="edahabia-secret-input"
                    type="text"
                    value={secretWord}
                    onChange={(e) => {
                      setFormError(null);
                      setSecretWord(e.target.value.slice(0, 20));
                    }}
                    placeholder="مثال: Bachir34"
                    className="h-12 w-full rounded-xl border-2 border-teal-500/40 bg-white dark:bg-[#031017] px-3 font-mono text-base font-extrabold text-teal-800 dark:text-cyan-300 focus:border-teal-600 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {/* Protect Links Toggle */}
                <label className="flex items-center justify-between gap-3 rounded-2xl border border-cyan-200 dark:border-cyan-800/70 bg-cyan-50/70 dark:bg-cyan-950/40 p-3 cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                      {isAr
                        ? "تغليف روابط بريد الجزائر بالوسيط الآمن (/go/:hash)"
                        : "Wrap Algérie Poste SMS Links via /go/:hash"}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      {isAr
                        ? "يعرض كلمتك السرية قبل فتح أي رابط دفع أو تفعيل"
                        : "Displays your secret word before redirecting"}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={protectSmsLinks}
                    onChange={(e) => setProtectSmsLinks(e.target.checked)}
                    className="h-5 w-5 accent-teal-600 rounded"
                  />
                </label>

                {formError && (
                  <p className="rounded-xl border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-950/50 px-3 py-2 text-xs font-bold text-red-700 dark:text-red-200">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl anti-banding-teal px-5 text-sm font-extrabold text-white shadow-retina-glow ring-1 ring-white/20 hover-lift-gpu focus:outline-none focus:ring-4 focus:ring-teal-500/30 disabled:opacity-60"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>
                    {submitting
                      ? isAr
                        ? "جارٍ ربط البطاقة بأمان..."
                        : "Securing Edahabia Card..."
                      : isAr
                      ? "إضافة وحماية البطاقة الذهبية الآن"
                      : "Link & Protect Edahabia Card"}
                  </span>
                </button>
              </form>

              {/* Saved Protected Cards List */}
              <div className="rounded-2xl border border-slate-200 dark:border-teal-800/70 bg-slate-50/80 dark:bg-[#09202b] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-700 dark:text-teal-200 uppercase tracking-wide">
                    {isAr
                      ? `البطاقات الذهبية المحمية (${cards.length})`
                      : `Protected Edahabia Cards (${cards.length})`}
                  </h4>
                  <span className="text-[10px] font-bold text-teal-700 dark:text-cyan-300">
                    {isAr ? "مقنّعة بالكامل 🔒" : "Fully Masked 🔒"}
                  </span>
                </div>

                {loadingList ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isAr ? "جارٍ تحميل البطاقات..." : "Loading cards..."}
                  </p>
                ) : cards.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isAr
                      ? "لم تُضف أي بطاقة ذهبية بعد. استخدم النموذج أعلاه لإضافة بطاقتك."
                      : "No Edahabia cards added yet. Use the form above to protect yours."}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {cards.map((card) => {
                      const isSelected = card.id === selectedCardId;
                      return (
                        <div
                          key={card.id}
                          className={`flex items-center justify-between gap-2 rounded-xl border p-3 transition-colors duration-200 cursor-pointer animate-in fade-in ${
                            isSelected
                              ? "border-teal-500 bg-white dark:bg-[#031017] shadow-sm ring-2 ring-teal-500/20"
                              : "border-slate-200 dark:border-teal-800/60 bg-white/70 dark:bg-[#061820] hover:border-teal-300 dark:hover:border-teal-700"
                          }`}
                          onClick={() => handleSelectSavedCard(card)}
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                                {card.card_label}
                              </span>
                              <span className="rounded bg-teal-100 dark:bg-teal-950/90 px-1.5 py-0.5 font-mono text-[10px] font-bold text-teal-800 dark:text-cyan-300">
                                [{card.secret_word}]
                              </span>
                            </div>
                            <p
                              dir="ltr"
                              className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400"
                            >
                              {card.masked_pan} • {card.phone_masked}
                            </p>
                          </div>
                          <button
                            type="button"
                            aria-label="Remove protected card"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleDeleteCard(card.id);
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Live Realistic Edahabia Card + SMS Fraud Defense Comparison */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Realistic Physical Algérie Poste Edahabia Gold Classic Card Preview */}
              <RealisticEdahabiaCard
                maskedPan={previewMaskedPan}
                holderName={previewHolder}
                phoneMasked={previewPhone}
                secretWord={previewWord}
                last4={previewLast4}
                protectSmsLinks={protectSmsLinks}
                isAr={isAr}
              />

              {/* 2. Side-by-Side Real Algérie Poste SMS vs Phishing Attack */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* REAL PROTECTED SMS */}
                <div className="rounded-2xl border-2 border-teal-400/80 bg-slate-950 p-4 text-slate-100 shadow-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-500 text-slate-950">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-extrabold text-teal-300">
                        {isAr
                          ? "✅ رسالة بريد الجزائر الحقيقية"
                          : "✅ Official Algérie Poste SMS"}
                      </span>
                    </div>
                    <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300">
                      {isAr ? "موثوق" : "Authentic"}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-900 p-3 text-xs leading-relaxed border border-teal-500/30 space-y-2">
                    <p>
                      {isAr
                        ? `بريد الجزائر: عملية على بطاقتك الذهبية (•••• ${previewLast4}) بمبلغ 8,500 د.ج. رمز التأكيد OTP: 619402. كلمتك السرية:`
                        : `Algérie Poste: Operation on Edahabia (•••• ${previewLast4}) for 8,500 DZD. OTP: 619402. Secret Word:`}{" "}
                      <span className="inline-block rounded-lg bg-gradient-to-r from-teal-400 to-cyan-400 px-2 py-0.5 font-mono font-extrabold text-slate-950">
                        [{previewWord}]
                      </span>
                    </p>

                    {protectSmsLinks && (
                      <Link
                        href={`/go/demoAppleSecureLink001?word=${encodeURIComponent(
                          previewWord
                        )}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-teal-950 border border-teal-500/50 px-2 py-1 text-[11px] font-mono text-cyan-300 hover:text-white underline max-w-full"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          https://shieldcode.dz/go/demo...
                        </span>
                      </Link>
                    )}
                  </div>

                  <p className="flex items-center gap-1.5 text-[11px] font-bold text-teal-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      {isAr
                        ? `تحتوي على [${previewWord}] وآخر 4 أرقام (${previewLast4})`
                        : `Contains [${previewWord}] & last 4 digits (${previewLast4})`}
                    </span>
                  </p>
                </div>

                {/* FAKE PHISHING SMS EXPOSED */}
                <div className="rounded-2xl border-2 border-red-300 dark:border-red-500/40 bg-red-50/70 dark:bg-red-950/35 p-4 text-slate-800 dark:text-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-red-200 dark:border-red-800/60 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-red-600 text-white">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-extrabold text-red-700 dark:text-red-300">
                        {isAr
                          ? "🚨 رسالة احتيال (فخ سرقة الذهبية)"
                          : "🚨 Phishing Scam Exposed"}
                      </span>
                    </div>
                    <span className="rounded-full bg-red-100 dark:bg-red-950/80 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-300">
                      {isAr ? "احتيال" : "Scam"}
                    </span>
                  </div>

                  <div className="rounded-xl bg-white dark:bg-[#091217] p-3 text-xs leading-relaxed border border-red-200 dark:border-red-900/60 text-slate-700 dark:text-slate-200">
                    {isAr
                      ? '"عاجل بريد الجزائر: تم تجميد بطاقتك الذهبية! لتفعيلها فوراً أدخل رقم البطاقة وCVV2 عبر: http://poste-dz-active.com"'
                      : '"URGENT Algérie Poste: Your Edahabia is suspended! Enter card & CVV2 at http://poste-dz-active.com"'}
                  </div>

                  <ul className="space-y-1 text-[11px] font-bold text-red-700 dark:text-red-300">
                    <li className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {isAr
                          ? `تفتقد لكلمتك السرية [${previewWord}] وآخر 4 أرقام (${previewLast4})`
                          : `Missing [${previewWord}] and card suffix (${previewLast4})`}
                      </span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {isAr
                          ? "تطلب CVV2 عبر رابط غير محمي — احذفها فوراً!"
                          : "Asks for CVV2 via unverified link — Delete immediately!"}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
