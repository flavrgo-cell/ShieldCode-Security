"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Smartphone,
  Sparkles,
  Wifi,
  BatteryCharging,
  Signal,
  CheckCircle2,
  KeyRound,
  ExternalLink,
  ShieldAlert,
  Landmark,
  CreditCard,
  Truck,
  Globe,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

type PhoneTxCategory = "edahabia" | "banking" | "financial" | "delivery" | "all";

export const AntiPhishingSetup = React.memo(function AntiPhishingSetup() {
  const { locale } = useI18n();
  const [code, setCode] = useState("Bachir34");
  const [category, setCategory] = useState<PhoneTxCategory>("edahabia");
  const [secureLinkEnabled, setSecureLinkEnabled] = useState(true);
  const [pulseKey, setPulseKey] = useState(0);
  const badgeRef = useRef<HTMLSpanElement | null>(null);

  const displayCode = code.trim() || (locale === "ar" ? "رمزك_هنا" : "YourCode");

  useEffect(() => {
    const el = badgeRef.current;
    if (!el) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    el.animate(
      [
        {
          transform: "scale(0.88)",
          boxShadow: "0 0 0 0 rgba(20, 184, 166, 0)",
        },
        {
          transform: "scale(1.14)",
          boxShadow: "0 0 24px 6px rgba(6, 182, 212, 0.55)",
        },
        {
          transform: "scale(1)",
          boxShadow: "0 0 12px 2px rgba(20, 184, 166, 0.35)",
        },
      ],
      {
        duration: 360,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }
    );
  }, [pulseKey, category]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.slice(0, 20);
    setCode(next);
    setPulseKey((k) => k + 1);
  };

  const handleRandomCode = () => {
    const samples = ["Algeria34", "Safe77", "Atlas99", "Baridi88", "Dinar55"];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    setCode(pick);
    setPulseKey((k) => k + 1);
  };

  const getSmsMessageText = () => {
    if (locale === "ar") {
      switch (category) {
        case "edahabia":
          return `بريد الجزائر (الذهبية •••• 4821) مختومة بالرمز [${displayCode}]: عملية دفع بمبلغ 8,500 د.ج. رمز التحقق OTP: 619402.`;
        case "banking":
          return `معاملة بنكية مختومة بالرمز [${displayCode}]: تحويل مبلغ 45,000 د.ج. رمز التحقق OTP: 849201.`;
        case "financial":
          return `معاملة مالية ودفع فاتورة مختومة بالرمز [${displayCode}]: تسديد 12,500 د.ج. كود التأكيد: 849201.`;
        case "delivery":
          return `إشعار توصيل وطلب مختوم بالرمز [${displayCode}]: شحنتك في الطريق للاستلام. كود التسليم: 849201.`;
        default:
          return `معاملة رسمية شاملة مختومة بالرمز [${displayCode}]: توثيق حسابك ومعاملاتك. رمز التحقق: 849201.`;
      }
    } else {
      switch (category) {
        case "edahabia":
          return `Algérie Poste Edahabia (•••• 4821) stamped with [${displayCode}]: 8,500 DZD payment. Auth OTP: 619402.`;
        case "banking":
          return `Banking transfer stamped with [${displayCode}]: 45,000 DZD transfer initiated. Auth OTP: 849201.`;
        case "financial":
          return `Financial payment stamped with [${displayCode}]: 12,500 DZD bill settlement. Auth OTP: 849201.`;
        case "delivery":
          return `Delivery & order update stamped with [${displayCode}]: Package out for delivery. Code: 849201.`;
        default:
          return `Official transaction stamped with [${displayCode}]: Universal account verification OTP: 849201.`;
      }
    }
  };

  return (
    <section className="w-full py-12 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-teal-950/30 to-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* ================================================================
              1. مكان إدخال الكود وخيارات المعاملات الشاملة
          ================================================================ */}
          <div className="md:col-span-6 space-y-4 rounded-3xl border border-teal-500/30 bg-slate-900/95 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <label
                htmlFor="live-phone-sim-input"
                className="flex items-center gap-2 text-base font-extrabold text-white"
              >
                <KeyRound className="h-5 w-5 text-teal-400" />
                <span>
                  {locale === "ar"
                    ? "رمز الأمان الشامل (للبنوك، المالية، التوصيل وكل المعاملات)"
                    : "Universal Security Code (Banking, Finance, Delivery & All)"}
                </span>
              </label>
              <span className="font-mono text-xs font-bold text-teal-400">
                {code.length}/20
              </span>
            </div>

            <div className="relative">
              <Input
                id="live-phone-sim-input"
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder={
                  locale === "ar" ? "اكتب رمزك هنا..." : "Type your code here..."
                }
                className="h-14 rounded-2xl border-2 border-teal-500/50 bg-slate-950 px-4 pe-24 font-mono text-lg font-extrabold text-cyan-300 placeholder:text-slate-600 focus-visible:border-teal-400 focus-visible:ring-teal-500/30"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleRandomCode}
                className="absolute end-2 top-1/2 -translate-y-1/2 h-9 rounded-xl bg-teal-500/15 px-3 text-xs font-bold text-teal-300 hover:bg-teal-500/25 hover:text-white"
              >
                <Sparkles className="h-3.5 w-3.5 me-1" />
                {locale === "ar" ? "تلقائي" : "Auto"}
              </Button>
            </div>

            {/* Universal Category Selector Pills */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 block">
                {locale === "ar"
                  ? "اختر نوع المعاملة لمحاكاتها على شاشة الهاتف:"
                  : "Select transaction type to simulate on phone:"}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  {
                    id: "edahabia" as PhoneTxCategory,
                    icon: CreditCard,
                    ar: "البطاقة الذهبية (بريد الجزائر)",
                    en: "Edahabia Postal Card",
                  },
                  {
                    id: "banking" as PhoneTxCategory,
                    icon: Landmark,
                    ar: "بنكية وتحويلات",
                    en: "Banking & Transfers",
                  },
                  {
                    id: "financial" as PhoneTxCategory,
                    icon: CreditCard,
                    ar: "مالية وفواتير",
                    en: "Finance & Bills",
                  },
                  {
                    id: "delivery" as PhoneTxCategory,
                    icon: Truck,
                    ar: "توصيل وتسوق",
                    en: "Delivery & Orders",
                  },
                  {
                    id: "all" as PhoneTxCategory,
                    icon: Globe,
                    ar: "كافة المعاملات",
                    en: "All Transactions",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = category === item.id;
                  const spanTwo = item.id === "edahabia";
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors duration-200 border ${
                        spanTwo ? "col-span-2" : ""
                      } ${
                        active
                          ? item.id === "edahabia"
                            ? "bg-amber-400/20 border-amber-400 text-amber-200 shadow-sm"
                            : "bg-teal-500/25 border-teal-400 text-cyan-200 shadow-sm"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 ${
                          item.id === "edahabia" ? "text-amber-400" : "text-teal-400"
                        }`}
                      />
                      <span className="truncate">
                        {locale === "ar" ? item.ar : item.en}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Option Toggle: Secure Interstitial Link Wrapper */}
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/30 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <ShieldAlert className="h-4 w-4 text-cyan-400 shrink-0" />
                  {locale === "ar"
                    ? "خيار حماية الروابط (Secure Link Wrapper)"
                    : "Secure Link Wrapper Option"}
                </span>
                <button
                  type="button"
                  onClick={() => setSecureLinkEnabled((v) => !v)}
                  className={`rounded-full px-3 py-1 text-[11px] font-extrabold transition-colors duration-200 ${
                    secureLinkEnabled
                      ? "bg-teal-500 text-slate-950 shadow-[0_0_12px_rgba(20,184,166,0.5)]"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {secureLinkEnabled
                    ? locale === "ar"
                      ? "مفعّل ✓"
                      : "Enabled ✓"
                    : locale === "ar"
                    ? "معطّل ✕"
                    : "Disabled ✕"}
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {locale === "ar"
                  ? "يحمي جميع الروابط البنكية والمالية والتجارية والخدمية بعرض كلمتك السرية قبل التحويل للموقع الرسمي."
                  : "Protects all banking, financial, delivery, and general links by displaying your secret word before redirecting."}
              </p>
              {secureLinkEnabled && (
                <Link
                  href={`/go/demoAppleSecureLink001?word=${encodeURIComponent(displayCode)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-300 hover:text-white underline underline-offset-4 transition-colors"
                >
                  <span>
                    {locale === "ar"
                      ? `تجربة الرابط الآمن بكلمتك [${displayCode}] الآن`
                      : `Test Secure Link with [${displayCode}] now`}
                  </span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>

          {/* ================================================================
              2. شاشة الهاتف النقال (Mobile Phone Screen)
          ================================================================ */}
          <div className="md:col-span-6 flex justify-center">
            <div
              dir="ltr"
              className="w-full max-w-[320px] rounded-[44px] border-[6px] border-slate-800 bg-slate-950 p-4 shadow-[0_20px_60px_rgba(20,184,166,0.2)] ring-1 ring-teal-500/30"
            >
              {/* Phone Dynamic Island & Status Bar */}
              <div className="flex items-center justify-between px-3 pt-1 pb-3 text-[11px] font-semibold text-slate-300">
                <span>9:41</span>
                <div className="h-4 w-24 rounded-full bg-black border border-slate-800" />
                <div className="flex items-center gap-1.5">
                  <Signal className="h-3 w-3" />
                  <Wifi className="h-3 w-3" />
                  <BatteryCharging className="h-3.5 w-3.5 text-teal-400" />
                </div>
              </div>

              {/* Phone SMS Sender Header */}
              <div className="flex items-center gap-2.5 border-b border-slate-800/90 pb-3 px-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-extrabold text-white">
                    ShieldCode Universal SMS
                  </p>
                  <p className="text-[10px] text-teal-400 font-medium">
                    ● Banking • Finance • Delivery • All
                  </p>
                </div>
              </div>

              {/* SMS Conversation Body */}
              <div className="py-5 px-2 space-y-3 min-h-[210px] flex flex-col justify-center">
                <div className="text-center text-[10px] text-slate-500">
                  Today • 9:41 AM
                </div>

                <div className="rounded-2xl rounded-tl-sm border border-teal-500/40 bg-slate-900/95 p-4 text-left text-xs leading-relaxed text-slate-100 shadow-lg">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                      {locale === "ar" ? "رمز الأمان الشامل:" : "Universal Code:"}
                    </span>
                    <span
                      ref={badgeRef}
                      className="inline-flex items-center rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-2.5 py-1 font-mono text-xs font-extrabold text-white shadow-md ring-2 ring-cyan-300/60"
                    >
                      [{displayCode}]
                    </span>
                  </div>

                  <p className="text-slate-200">{getSmsMessageText()}</p>

                  {/* Intercepted Secure Link inside the SMS (when option enabled) */}
                  {secureLinkEnabled && (
                    <div className="mt-2 pt-2 border-t border-slate-800">
                      <p className="text-[10px] text-slate-400 mb-1">
                        {locale === "ar"
                          ? "رابط المعاملة المحمي بالوسيط الآمن:"
                          : "Protected Transaction Link:"}
                      </p>
                      <Link
                        href={`/go/demoAppleSecureLink001?word=${encodeURIComponent(displayCode)}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-teal-950/80 border border-teal-500/50 px-2 py-1 text-[11px] font-mono text-cyan-300 hover:bg-teal-900/90 hover:text-white transition-colors duration-200 underline decoration-cyan-400/60 max-w-full"
                        title="اضغط لتجربة صفحة التحقق الآمنة /go/:hash"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0 text-teal-400" />
                        <span className="truncate">
                          https://shieldcode.dz/go/demoAppleSecureLink001
                        </span>
                      </Link>
                    </div>
                  )}

                  <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-teal-400">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {locale === "ar"
                        ? "يحمي البنوك، المالية، التوصيل وكل معاملاتك"
                        : "Protects banking, finance, delivery & all transactions"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Home Indicator Bar */}
              <div className="mx-auto mt-2 h-1 w-28 rounded-full bg-slate-700" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
