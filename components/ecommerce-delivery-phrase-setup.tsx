"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ============================================================================
// Strictly Local Framer-Motion-Compatible Popping Animation Wrapper
// Uses native Web Animations API for springy pop micro-interactions with zero external CDNs.
// ============================================================================

const motion = {
  div: ({
    children,
    animate,
    initial,
    transition: _transition,
    className,
    style,
    ...rest
  }: any) => {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const el = ref.current;
      if (!el || !animate) return;
      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      if (Array.isArray(animate.scale)) {
        el.animate(
          animate.scale.map((s: number) => ({
            transform: `scale(${s})`,
          })),
          {
            duration: 360,
            easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }
        );
      } else if (Array.isArray(animate.x)) {
        el.animate(
          animate.x.map((xVal: number) => ({
            transform: `translateX(${xVal}px)`,
          })),
          {
            duration: 340,
            easing: "ease-in-out",
          }
        );
      } else if (
        typeof animate.opacity === "number" &&
        initial &&
        typeof initial.opacity === "number"
      ) {
        el.animate(
          [
            {
              opacity: initial.opacity,
              transform: `translateY(${initial.y ?? 0}px) scale(${
                initial.scale ?? 1
              })`,
            },
            {
              opacity: animate.opacity,
              transform: `translateY(${animate.y ?? 0}px) scale(${
                animate.scale ?? 1
              })`,
            },
          ],
          {
            duration: 280,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          }
        );
      }
      // Run strictly once on mount / key change
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div ref={ref} className={className} style={style} {...rest}>
        {children}
      </div>
    );
  },

  span: ({
    children,
    animate,
    initial: _initial,
    transition: _transition,
    className,
    style,
    ...rest
  }: any) => {
    const ref = useRef<HTMLSpanElement | null>(null);

    useEffect(() => {
      const el = ref.current;
      if (!el || !animate) return;
      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      if (Array.isArray(animate.scale)) {
        el.animate(
          [
            { transform: "scale(0.86)", opacity: 0.78 },
            { transform: "scale(1.14)", opacity: 1 },
            { transform: "scale(0.96)", opacity: 0.96 },
            { transform: "scale(1)", opacity: 1 },
          ],
          {
            duration: 380,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          }
        );
      }
      // Run strictly once on mount / key change
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <span ref={ref} className={className} style={style} {...rest}>
        {children}
      </span>
    );
  },
};

// ============================================================================
// 100% Local Inline SVG Icons (Zero External Icon or Font CDNs)
// ============================================================================

const ShieldUniversalSvg = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path vectorEffect="non-scaling-stroke" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path vectorEffect="non-scaling-stroke" d="m9 12 2 2 4-4" />
  </svg>
);

const BankLandmarkSvg = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line vectorEffect="non-scaling-stroke" x1="3" x2="21" y1="22" y2="22" />
    <line vectorEffect="non-scaling-stroke" x1="6" x2="6" y1="18" y2="11" />
    <line vectorEffect="non-scaling-stroke" x1="10" x2="10" y1="18" y2="11" />
    <line vectorEffect="non-scaling-stroke" x1="14" x2="14" y1="18" y2="11" />
    <line vectorEffect="non-scaling-stroke" x1="18" x2="18" y1="18" y2="11" />
    <polygon vectorEffect="non-scaling-stroke" points="12 2 20 7 4 7" />
  </svg>
);

const CreditCardSvg = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect vectorEffect="non-scaling-stroke" width="20" height="14" x="2" y="5" rx="2" />
    <line vectorEffect="non-scaling-stroke" x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

const DeliveryTruckSvg = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path vectorEffect="non-scaling-stroke" d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path vectorEffect="non-scaling-stroke" d="M15 18H9" />
    <path vectorEffect="non-scaling-stroke" d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle vectorEffect="non-scaling-stroke" cx="17" cy="18" r="2" />
    <circle vectorEffect="non-scaling-stroke" cx="7" cy="18" r="2" />
  </svg>
);

const GlobeTransactionsSvg = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
    <path vectorEffect="non-scaling-stroke" d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path vectorEffect="non-scaling-stroke" d="M2 12h20" />
  </svg>
);

const MailEnvelopeSvg = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect vectorEffect="non-scaling-stroke" width="20" height="16" x="2" y="4" rx="2" />
    <path vectorEffect="non-scaling-stroke" d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const SmartphoneSvg = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect vectorEffect="non-scaling-stroke" width="14" height="20" x="5" y="2" rx="2" ry="2" />
    <path vectorEffect="non-scaling-stroke" d="M12 18h.01" />
  </svg>
);

const CheckBadgeSvg = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path vectorEffect="non-scaling-stroke" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path vectorEffect="non-scaling-stroke" d="m9 12 2 2 4-4" />
  </svg>
);

const SparklesSvg = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path vectorEffect="non-scaling-stroke" d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

// ============================================================================
// Universal Transaction Scenarios (Banking, Financial, Delivery, Bills & All Transactions)
// ============================================================================

type TransactionScenarioKey =
  | "edahabia"
  | "banking"
  | "financial"
  | "delivery"
  | "general";

interface ScenarioTemplate {
  key: TransactionScenarioKey;
  badgeAr: string;
  badgeEn: string;
  senderTitle: string;
  senderSub: string;
  smsPrefix: string;
  smsHighlight: string;
  smsSuffix: string;
  smsActionLabel: string;
  emailFrom: string;
  emailRef: string;
  emailTitle: string;
  emailBody: string;
  tipText: string;
  peaceText: string;
}

const TRANSACTION_SCENARIOS: Record<TransactionScenarioKey, ScenarioTemplate> = {
  edahabia: {
    key: "edahabia",
    badgeAr: "📮 البطاقة الذهبية (بريد الجزائر)",
    badgeEn: "Edahabia Card",
    senderTitle: "بريد الجزائر • البطاقة الذهبية 📮",
    senderSub: "● تنبيه رسمي لبطاقة الذهبية",
    smsPrefix: "بريد الجزائر: عملية على بطاقتك الذهبية (•••• 4821) بمبلغ ",
    smsHighlight: "8,500 د.ج",
    smsSuffix: ". رمز التأكيد OTP: 619402. كلمتك السرية: ",
    smsActionLabel: "مراجعة معاملة البطاقة الذهبية بأمان:",
    emailFrom: "alerts@poste-dz.dz",
    emailRef: "EDAHABIA #6280-4821",
    emailTitle: "إشعار أمان البطاقة البريدية الذهبية",
    emailBody:
      "تم تسجيل معاملة على بطاقتك الذهبية. لا تثق بأي رسالة هاتفية بدون ظهور رقم بطاقتك (•••• 4821) وكلمتك السرية:",
    tipText:
      "📮 تحذير هام لحاملي البطاقة الذهبية: أكثر عمليات الاحتيال تستهدف الذهبية برسائل مزورة تطلب CVV2! إذا غابت كلمتك السرية فالرسالة احتيالية.",
    peaceText:
      "🛡️ حماية مضاعفة للذهبية: بربط بطاقتك أسفله، تتحقق من بريد الجزائر وبريدي موب قبل فتح أي رابط أو إدخال OTP.",
  },
  banking: {
    key: "banking",
    badgeAr: "🏦 المعاملات البنكية والسحب",
    badgeEn: "Banking & Transfers",
    senderTitle: "المصرف والخدمات البنكية 🏦",
    senderSub: "● تنبيه بنكي رسمي موثق",
    smsPrefix: "تنبيه بنكي: تم طلب تحويل مبلغ ",
    smsHighlight: "45,000 د.ج",
    smsSuffix: " من حسابك الجاري. رمز التأكيد: 849201. كلمتك السرية: ",
    smsActionLabel: "تأكيد أو إيقاف العملية البنكية بأمان:",
    emailFrom: "security@bank-algeria.dz",
    emailRef: "TXN #BNK-90412",
    emailTitle: "إشعار عملية بنكية وتحويل مالي فوري",
    emailBody: "تم تسجيل عملية تحويل بنكي على حسابك. للتأكد من شرعية الإشعار، تحقق من وجود كلمتك السرية:",
    tipText:
      "🏦 تنبيه أمني بنكي: أي رسالة تطلب منك تأكيد تحويل مالي أو تحديث بطاقتك البنكية ولا تحتوي على كلمتك السرية هي رسالة تصيد احتيالي!",
    peaceText:
      "🔒 حماية حسابك البنكي: جميع كشوفات الحساب، التحويلات، وإشعارات السحب الرسمية تحمل دائماً ختمك الشخصي.",
  },
  financial: {
    key: "financial",
    badgeAr: "💳 الدفع الإلكتروني والفواتير",
    badgeEn: "Payments & Finance",
    senderTitle: "بوابة الدفع المالي والفواتير 💳",
    senderSub: "● معاملة مالية مشفرة",
    smsPrefix: "تأكيد دفع مالي: تسديد فاتورة ومعاملة بقيمة ",
    smsHighlight: "12,500 د.ج",
    smsSuffix: " عبر البطاقة الذهبية/CIB. رمز الأمان الشخصي: ",
    smsActionLabel: "مراجعة إيصال الدفع المالي عبر الرابط المحمي:",
    emailFrom: "payments@securepay-finance.dz",
    emailRef: "INV #FIN-33810",
    emailTitle: "إيصال تسديد دفعة مالية وفاتورة إلكترونية",
    emailBody: "شكراً لإتمام معاملتك المالية بنجاح. ختم الأمان الشخصي المعتمد لمعاملاتك المالية هو:",
    tipText:
      "💳 حماية المدفوعات: لا تدخل أرقام بطاقتك المالية في أي رابط دفع إلا بعد رؤية كلمتك السرية في الرسالة وفي صفحة الفحص!",
    peaceText:
      "✨ أمان مالي متكامل: سواء كنت تسدد فاتورة كهرباء، إنترنت، أو اشتراكاً رقمياً، كلمتك السرية تحميك من الصفحات المزورة.",
  },
  delivery: {
    key: "delivery",
    badgeAr: "🚚 التوصيل والتجارة الإلكترونية",
    badgeEn: "Delivery & Shopping",
    senderTitle: "خدمة التوصيل والطرود 🚚",
    senderSub: "● مندوب توصيل معتمد",
    smsPrefix: "مرحباً! طردك من متجر ",
    smsHighlight: "TechStore",
    smsSuffix: " خرج للتوصيل اليوم. رمز أمان الاستلام: ",
    smsActionLabel: "تتبع موقع الشحنة وتأكيد الاستلام بأمان:",
    emailFrom: "orders@techstore-shop.dz",
    emailRef: "Order #OS-84920",
    emailTitle: "تأكيد شحن الطلب وموعد التسليم",
    emailBody: "طردك في الطريق إليك! للتأكد من هوية موظف التوصيل والرسائل الرسمية، كلمتك السرية هي:",
    tipText:
      "🚚 نصيحة التوصيل: إذا طُلب منك دفع رسوم توصيل عبر رابط لا يعرض كلمتك السرية، فهو منتحل صفة شركة التوصيل!",
    peaceText:
      "📦 تسوق واستلام بلا قلق: كل رسالة شحن أو فاتورة شراء من المتاجر المعتمدة تحمل كلمتك السرية في المقدمة.",
  },
  general: {
    key: "general",
    badgeAr: "🌐 كافة المعاملات والحسابات",
    badgeEn: "All Transactions & Accounts",
    senderTitle: "مركز المعاملات والخدمات الرقمية 🌐",
    senderSub: "● بوابة المعاملات الرسمية",
    smsPrefix: "إشعار معاملة رسمية: طلب توثيق عقد وتسجيل دخول على ",
    smsHighlight: "حسابك الرقمي الموحد",
    smsSuffix: ". ختم المصادقة الشخصي: ",
    smsActionLabel: "الاطلاع على تفاصيل المعاملة والوثائق بأمان:",
    emailFrom: "notifications@unified-portal.dz",
    emailRef: "DOC #GEN-77201",
    emailTitle: "تأكيد معاملة رقمية وتوثيق حساب رسمي",
    emailBody: "تم إصدار معاملة جديدة مرتبطة بهويتك الرقمية. رمز التحقق من أصالة هذه الوثيقة هو:",
    tipText:
      "🌐 حماية متكاملة لكافة الخدمات: العقود، الخدمات الإدارية، الحجوزات، وتنبيهات الدخول لحساباتك كلها محمية بنفس الكلمة السرية!",
    peaceText:
      "🛡️ درع شامل لكل معاملاتك: كلمة سرية واحدة تختارها بنفسك تكشف لك فوراً أي رسالة مزورة في أي قطاع.",
  },
};

const FRIENDLY_PRESETS = [
  "Bachir34",
  "AlgeriaSafe",
  "Atlas99",
  "DinarGold",
  "Mango99",
];

export const EcommerceDeliveryPhraseSetup = React.memo(function EcommerceDeliveryPhraseSetup() {
  const [secretWord, setSecretWord] = useState("Bachir34");
  const [savedWord, setSavedWord] = useState("Bachir34");
  const [scenario, setScenario] = useState<TransactionScenarioKey>("banking");
  const [popKey, setPopKey] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [helperNotice, setHelperNotice] = useState<string | null>(null);

  const displayWord = secretWord.trim() || "YourSecretWord";
  const currentScenario = TRANSACTION_SCENARIOS[scenario];

  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw.length > 20) return;

    if (raw !== "" && !/^[A-Za-z0-9\u0600-\u06FF\s\-]+$/.test(raw)) {
      setShakeKey((k) => k + 1);
      setHelperNotice(
        "يرجى استخدام حروف وأرقام بسيطة فقط ليظهر رمزك واضحاً في جميع رسائل معاملاتك البنكية والمالية والتوصيل!"
      );
      return;
    }

    setHelperNotice(null);
    setJustSaved(false);
    setSecretWord(raw);
    setPopKey((k) => k + 1);
  };

  const handleSelectPreset = (word: string) => {
    setHelperNotice(null);
    setJustSaved(false);
    setSecretWord(word);
    setPopKey((k) => k + 1);
  };

  const handleSelectScenario = (next: TransactionScenarioKey) => {
    setScenario(next);
    setPopKey((k) => k + 1);
  };

  const handleSavePhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = secretWord.trim();
    if (cleaned.length < 3) {
      setShakeKey((k) => k + 1);
      setHelperNotice("يرجى اختيار كلمة سرية لا تقل عن 3 أحرف.");
      return;
    }

    setIsSaving(true);
    try {
      const cleanAlnum = cleaned.replace(/[^A-Za-z0-9]/g, "") || "Bachir34";
      await fetch("/api/v1/widget/configure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJDVVNULTEwMDEifQ.sig",
        },
        body: JSON.stringify({
          anti_phishing_code:
            cleanAlnum.length >= 4 ? cleanAlnum : `${cleanAlnum}2026`,
        }),
      }).catch(() => {});

      setSavedWord(cleaned);
      setJustSaved(true);
      setPopKey((k) => k + 1);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="w-full py-10 px-4 sm:px-6 font-sans text-slate-800 dark:text-slate-100">
      <div className="mx-auto max-w-6xl">
        {/* ==================================================================
            1. UNIVERSAL SECURITY HUB HEADER (BANKING, FINANCE, DELIVERY & ALL TRANSACTIONS)
        ================================================================== */}
        <div className="overflow-hidden rounded-3xl border border-teal-500/20 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 ring-1 ring-white/25 dark:ring-white/10 shadow-retina-glass">
          {/* Top Universal Header */}
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-teal-100/40 dark:border-white/10 anti-banding-teal px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-md">
                <ShieldUniversalSvg className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl font-extrabold tracking-tight">
                    ShieldCode • درع المعاملات الشامل
                  </span>
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">
                    بنوك • مالية • توصيل • فواتير • معاملات عامة
                  </span>
                </div>
                <p className="text-xs text-teal-50">
                  كلمة سرية واحدة تختم جميع رسائلك البنكية والمالية والتجارية والخدمية لحمايتك من الاحتيال
                </p>
              </div>
            </div>

            {/* Sector Switcher Pills in Header */}
            <nav className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-teal-900/40 p-1.5">
              {(
                [
                  { key: "edahabia", label: "📮 الذهبية" },
                  { key: "banking", label: "🏦 بنكية وتحويلات" },
                  { key: "financial", label: "💳 دفع وفواتير" },
                  { key: "delivery", label: "🚚 توصيل وتسوق" },
                  { key: "general", label: "🌐 كافة المعاملات" },
                ] as { key: TransactionScenarioKey; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleSelectScenario(tab.key)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors duration-200 ${
                    scenario === tab.key
                      ? "bg-white text-teal-800 shadow-sm"
                      : "text-white hover:bg-white/15"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </header>

          {/* Sub-bar Breadcrumb / Active Universal Coverage */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-teal-900/60 bg-teal-50/50 dark:bg-[#09202b] px-6 py-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500">الحماية الشاملة</span>
              <span>›</span>
              <span className="font-bold text-teal-700">
                رمز الأمان الموحد (للبنوك، المدفوعات المالية، التوصيل، وكافة المعاملات)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-800 font-semibold">
              <ShieldUniversalSvg className="w-4 h-4 text-teal-600" />
              <span>كلمتك السرية النشطة على جميع معاملاتك:</span>
              <span className="rounded-lg bg-cyan-100 px-2 py-0.5 font-mono font-bold text-cyan-900">
                [{savedWord}]
              </span>
            </div>
          </div>

          {/* ================================================================
              MAIN CONTENT GRID:
              Left (5 cols): Universal Security Phrase Setup Card
              Right (7 cols): Multi-Sector Live SMS + Official Email Previews
          ================================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 items-start">
            {/* LEFT COLUMN: Universal Security Phrase Setup */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-teal-200/90 dark:border-teal-800/70 bg-gradient-to-b from-teal-50/70 to-white dark:from-[#09202b] dark:to-[#061820] p-6 shadow-sm space-y-5">
                {/* Badge & Title */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 dark:bg-teal-950/80 px-3 py-1 text-xs font-bold text-teal-800 dark:text-teal-200">
                    <ShieldUniversalSvg className="w-4 h-4" />
                    <span>Universal Security Phrase • رمز الأمان الشامل</span>
                  </div>

                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
                    كلمتك السرية الموحدة لجميع معاملاتك
                  </h2>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    اختر كلمة سرية خاصة بك. سنقوم بختمها تلقائياً في جميع رسائل الـ SMS والإيميلات الخاصة بـ{" "}
                    <strong className="text-teal-800 dark:text-cyan-300">
                      معاملاتك البنكية، التحويلات المالية، الفواتير، التوصيل، الحسابات، وكل معاملة رسمية
                    </strong>{" "}
                    لتتأكد فوراً أنها حقيقية وليست من محتال.
                  </p>

                  <div
                    dir="rtl"
                    className="rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/70 dark:border-cyan-800/70 p-3.5 text-xs text-cyan-950 dark:text-cyan-100 leading-relaxed font-medium space-y-2"
                  >
                    <p>
                      💡 <strong>حماية شاملة لجميع معاملاتك الرقمية:</strong>
                    </p>
                    <ul className="grid grid-cols-2 gap-1.5 text-[11px] font-bold text-teal-900 dark:text-teal-200">
                      <li className="flex items-center gap-1">
                        <BankLandmarkSvg className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400 shrink-0" />
                        <span>التحويلات والسحب البنكي</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <CreditCardSvg className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400 shrink-0" />
                        <span>الدفع المالي والفواتير</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <DeliveryTruckSvg className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400 shrink-0" />
                        <span>الطرود والتجارة والتوصيل</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <GlobeTransactionsSvg className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400 shrink-0" />
                        <span>العقود والحسابات الرقمية</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Soft Input Area */}
                <form onSubmit={handleSavePhrase} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="universal-secret-word-input"
                        className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-teal-200"
                      >
                        أدخل كلمتك السرية الموحدة (Your Secret Word)
                      </label>
                      <span className="text-xs font-semibold text-teal-700 dark:text-cyan-300">
                        {secretWord.length}/20
                      </span>
                    </div>

                    <motion.div
                      key={shakeKey}
                      animate={
                        shakeKey > 0 ? { x: [0, -8, 8, -5, 5, 0] } : undefined
                      }
                      className="relative"
                    >
                      <input
                        id="universal-secret-word-input"
                        type="text"
                        value={secretWord}
                        onChange={handleWordChange}
                        placeholder="مثال: Bachir34 أو AlgeriaSafe"
                        className="h-14 w-full rounded-2xl border-2 border-teal-500/50 bg-white dark:bg-[#031017] px-4 pr-28 text-lg font-extrabold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner transition-colors duration-200 focus:border-teal-600 dark:focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-teal-500/20"
                      />
                      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rounded-xl bg-teal-100 dark:bg-teal-950/90 px-2.5 py-1 text-[11px] font-bold text-teal-800 dark:text-cyan-300">
                        معاينة حية ⚡
                      </span>
                    </motion.div>

                    {helperNotice && (
                      <p className="text-xs font-semibold text-cyan-800 dark:text-cyan-200 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 rounded-xl px-3 py-2">
                        {helperNotice}
                      </p>
                    )}
                  </div>

                  {/* Fun One-Click Suggestion Chips */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <SparklesSvg className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400" />
                      جرّب كلمة سرية جاهزة بضغطة واحدة:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {FRIENDLY_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors duration-200 ${
                            secretWord === preset
                              ? "bg-teal-600 text-white shadow-sm scale-105"
                              : "bg-teal-100/75 dark:bg-teal-950/70 text-teal-800 dark:text-teal-200 hover:bg-teal-200/80 dark:hover:bg-teal-900/70"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bank-Grade Friendly Blue-Green Save Button */}
                  <button
                    type="submit"
                    disabled={isSaving || secretWord.trim().length < 2}
                    className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-teal-600/25 transition hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-teal-500/30 disabled:opacity-50"
                  >
                    <CheckBadgeSvg className="w-5 h-5" />
                    {isSaving
                      ? "جارٍ تفعيل رمز الأمان الشامل..."
                      : "حفظ وتعميم رمز الأمان على جميع معاملاتي"}
                  </button>

                  {justSaved && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2.5 rounded-2xl border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 p-3.5 text-xs font-bold text-teal-800 dark:text-teal-200"
                    >
                      <CheckBadgeSvg className="w-5 h-5 text-teal-600 dark:text-cyan-400 shrink-0" />
                      <span>
                        تم التفعيل بنجاح! كلمتك السرية{" "}
                        <strong className="underline">[{savedWord}]</strong>{" "}
                        مفعّلة الآن لحماية جميع معاملاتك البنكية، المالية، التوصيل، وكافة حساباتك.
                      </span>
                    </motion.div>
                  )}
                </form>
              </div>
            </div>

            {/* ==============================================================
                RIGHT COLUMN: LIVE MULTI-SECTOR PREVIEWS (SMS + OFFICIAL EMAIL)
            ============================================================== */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    شاهد كيف تحميك كلمتك السرية في كل نوع من المعاملات
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    اختر نوع المعاملة بالأسفل واكتب كلمتك السرية لتراها تتوهج داخل الرسائل البنكية والمالية والتوصيل!
                  </p>
                </div>
                <span className="rounded-full bg-cyan-100 dark:bg-cyan-950/80 px-3 py-1 text-xs font-bold text-cyan-900 dark:text-cyan-200">
                  تحديث فوري لجميع القطاعات ✨
                </span>
              </div>

              {/* Interactive Scenario Selector Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 rounded-2xl bg-slate-100/90 dark:bg-[#09202b] p-1.5 border border-slate-200/80 dark:border-teal-800/70">
                {(Object.values(TRANSACTION_SCENARIOS) as ScenarioTemplate[]).map(
                  (item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleSelectScenario(item.key)}
                      className={`rounded-xl px-2 py-2 text-[11px] font-extrabold transition-colors duration-200 text-center ${
                        scenario === item.key
                          ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-sm"
                          : "text-slate-700 dark:text-teal-200 hover:bg-white/80 dark:hover:bg-teal-900/50"
                      }`}
                    >
                      {item.badgeAr}
                    </button>
                  )
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* ----------------------------------------------------------
                    MOCKUP 1: UNIVERSAL SMS MOCKUP (BANKING / FINANCE / DELIVERY / GENERAL)
                ---------------------------------------------------------- */}
                <div className="flex flex-col justify-between rounded-3xl border-2 border-cyan-200/90 dark:border-cyan-800/70 bg-gradient-to-b from-cyan-50/70 to-white dark:from-[#09202b] dark:to-[#061820] p-5 shadow-md">
                  <div className="space-y-4">
                    {/* Phone Header Bar */}
                    <div className="flex items-center justify-between border-b border-cyan-100 dark:border-teal-800/70 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-sm">
                          <SmartphoneSvg className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300 block">
                            1. معاينة رسالة SMS الرسمية
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {currentScenario.senderTitle}
                          </h4>
                        </div>
                      </div>
                      <span className="rounded-full bg-teal-100 dark:bg-teal-950/80 px-2.5 py-0.5 text-[10px] font-bold text-teal-800 dark:text-teal-200">
                        SMS موثق
                      </span>
                    </div>

                    {/* Phone Screen Frame */}
                    <div className="rounded-2xl border border-slate-700/80 bg-slate-900 p-4 text-white shadow-inner space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-2">
                        <span>Today, 10:42 AM</span>
                        <span className="text-teal-400 font-semibold">
                          {currentScenario.senderSub}
                        </span>
                      </div>

                      {/* SMS Message Bubble with Cyan/Teal Glowing Popping Secret Word */}
                      <div className="rounded-2xl rounded-tl-sm bg-slate-800 p-3.5 text-sm leading-relaxed text-slate-100 border border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.12)]">
                        <span>
                          {currentScenario.smsPrefix}
                          <strong className="text-cyan-300">
                            {currentScenario.smsHighlight}
                          </strong>
                          {currentScenario.smsSuffix}
                        </span>
                        <motion.span
                          key={`sms-pop-${popKey}-${scenario}`}
                          animate={{ scale: [0.85, 1.18, 0.96, 1] }}
                          className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-2.5 py-0.5 font-mono text-sm font-extrabold text-slate-950 shadow-[0_0_16px_rgba(20,184,166,0.55)] ring-2 ring-cyan-300/60"
                        >
                          [{displayWord}]
                        </motion.span>
                        <div className="mt-2.5 pt-2 border-t border-slate-700/60">
                          <span className="block text-[11px] text-slate-300 mb-1">
                            {currentScenario.smsActionLabel}
                          </span>
                          <Link
                            href={`/go/demoAppleSecureLink001?word=${encodeURIComponent(displayWord)}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-950/80 border border-teal-400/50 px-2 py-1 text-xs font-mono text-cyan-300 hover:bg-teal-900 hover:text-white transition-colors duration-200 underline decoration-cyan-400/70"
                          >
                            <span>🔗 https://shieldcode.dz/go/demoAppleSecureLink001</span>
                          </Link>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-teal-300 font-semibold">
                        <CheckBadgeSvg className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>
                          تظهر كلمتك السرية [{displayWord}] — المعاملة أصلية وآمنة 100%!
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 p-2.5 text-[11px] text-cyan-950 dark:text-cyan-100 font-medium">
                    {currentScenario.tipText}
                  </p>
                </div>

                {/* ----------------------------------------------------------
                    MOCKUP 2: OFFICIAL TRANSACTION EMAIL MOCKUP
                ---------------------------------------------------------- */}
                <div className="flex flex-col justify-between rounded-3xl border-2 border-teal-200/90 dark:border-teal-800/70 bg-gradient-to-b from-teal-50/70 to-white dark:from-[#09202b] dark:to-[#061820] p-5 shadow-md">
                  <div className="space-y-4">
                    {/* Email Header Bar */}
                    <div className="flex items-center justify-between border-b border-teal-100 dark:border-teal-800/70 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm">
                          <MailEnvelopeSvg className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 block">
                            2. معاينة البريد الإلكتروني الرسمي
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {currentScenario.emailTitle} 💌
                          </h4>
                        </div>
                      </div>
                      <span className="rounded-full bg-teal-100 dark:bg-teal-950/80 px-2.5 py-0.5 text-[10px] font-bold text-teal-800 dark:text-teal-200">
                        إشعار رسمي
                      </span>
                    </div>

                    {/* Email Card Window */}
                    <div className="rounded-2xl border border-teal-200/80 dark:border-teal-800/70 bg-white dark:bg-[#031017] p-4 shadow-inner space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-teal-900/60 pb-2 text-[11px]">
                        <span className="font-bold text-slate-700 dark:text-slate-200 truncate">
                          From: {currentScenario.emailFrom}
                        </span>
                        <span className="rounded bg-slate-100 dark:bg-[#09202b] px-2 py-0.5 font-mono text-[10px] text-slate-600 dark:text-teal-300 shrink-0">
                          {currentScenario.emailRef}
                        </span>
                      </div>

                      {/* Official Notification Body with Cyan/Teal Glowing Popping Secret Word */}
                      <div className="space-y-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 p-3.5 border border-teal-200/70 dark:border-teal-800/70 shadow-[0_0_20px_rgba(6,182,212,0.12)]">
                        <div className="flex items-center gap-2">
                          <ShieldUniversalSvg className="w-5 h-5 text-teal-700 dark:text-cyan-400 shrink-0" />
                          <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                            {currentScenario.emailTitle}
                          </span>
                        </div>

                        <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                          {currentScenario.emailBody}{" "}
                          <motion.span
                            key={`email-pop-${popKey}-${scenario}`}
                            animate={{ scale: [0.85, 1.18, 0.96, 1] }}
                            className="inline-flex items-center rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-2.5 py-0.5 font-mono text-sm font-extrabold text-white shadow-[0_0_16px_rgba(6,182,212,0.45)] ring-2 ring-teal-300/70"
                          >
                            [{displayWord}]
                          </motion.span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-teal-800 dark:text-teal-300 font-semibold">
                        <CheckBadgeSvg className="w-4 h-4 text-teal-600 dark:text-cyan-400 shrink-0" />
                        <span>
                          يطابق رمز الأمان الشامل الخاص بك [{displayWord}]
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 rounded-xl bg-teal-50 dark:bg-teal-950/50 p-2.5 text-[11px] text-teal-900 dark:text-teal-200 font-medium">
                    {currentScenario.peaceText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
