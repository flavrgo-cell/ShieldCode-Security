"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Ban,
  BookOpen,
  Check,
  Code2,
  Copy,
  EyeOff,
  KeyRound,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import { useI18n } from "@/lib/i18n";

export interface DeveloperApiKeyDto {
  id: string;
  institution_name: string;
  label: string;
  key_prefix: string;
  masked_key: string;
  last4: string;
  environment: "live" | "test";
  sha256_preview: string;
  is_active: boolean;
  requests_today: number;
  created_at: string;
  revoked_at: string | null;
}

interface AnalyticsPoint {
  time: string;
  apiCalls: number;
  errors: number;
}

type SnippetLang = "curl" | "python" | "php";

const BASE_ANALYTICS_TODAY: AnalyticsPoint[] = [
  { time: "00:00", apiCalls: 1120, errors: 8 },
  { time: "03:00", apiCalls: 940, errors: 5 },
  { time: "06:00", apiCalls: 1680, errors: 11 },
  { time: "09:00", apiCalls: 3420, errors: 19 },
  { time: "12:00", apiCalls: 4890, errors: 24 },
  { time: "15:00", apiCalls: 4210, errors: 16 },
  { time: "18:00", apiCalls: 5140, errors: 21 },
  { time: "21:00", apiCalls: 2890, errors: 9 },
];

const BASE_ANALYTICS_WEEK: AnalyticsPoint[] = [
  { time: "Day 1", apiCalls: 18400, errors: 82 },
  { time: "Day 2", apiCalls: 21200, errors: 74 },
  { time: "Day 3", apiCalls: 19850, errors: 65 },
  { time: "Day 4", apiCalls: 24100, errors: 91 },
  { time: "Day 5", apiCalls: 26300, errors: 78 },
  { time: "Day 6", apiCalls: 22900, errors: 54 },
  { time: "Day 7", apiCalls: 24290, errors: 61 },
];

const COPY_DICTIONARY = {
  ar: {
    pageBadge: "بوابة المطورين والبنوك (B2B API)",
    title: "إعدادات المطورين ومفاتيح الربط البرمجي",
    subtitle:
      "أصدر مفاتيح سرية آمنة مشفّرة بـ SHA-256، راقب تحليلات الـ API، وادمج واجهة إرسال الرسائل المحمية داخل أنظمة مصرفك.",
    backHome: "العودة للمنصة الرئيسية",
    openSwagger: "وثائق OpenAPI التفاعلية (/api/docs)",
    // KPIs
    kpiCallsToday: "طلبات الـ API اليوم",
    kpiErrorsToday: "الأخطاء اليوم",
    kpiSuccessRate: "معدل النجاح",
    kpiLatency: "متوسط الاستجابة",
    // API Keys section
    keysHeading: "إدارة المفاتيح السرية (API Keys)",
    keysDesc:
      "يتم تخزين البصمة المشفّرة SHA-256 فقط في قاعدة بيانات PostgreSQL. يُكشف المفتاح السري مرة واحدة فقط عند الإنشاء.",
    envLive: "إنتاج (sc_live_)",
    envTest: "تجربة (sc_test_)",
    labelPlaceholder: "وصف المفتاح (مثال: بوابة الرسائل البنكية)",
    generateBtn: "توليد مفتاح سري جديد",
    generatingBtn: "جارٍ التوليد...",
    oneTimeTitle: "احفظ مفتاحك السري الآن — يُعرض مرة واحدة فقط!",
    oneTimeBody:
      "لأسباب أمنية، لا نحتفظ بالنص الأصلي للمفتاح على خوادمنا. بمجرد إخفاء هذه الرسالة لن تتمكن من رؤيته مرة أخرى.",
    copyBtn: "نسخ المفتاح",
    copiedBtn: "تم النسخ ✓",
    hideOneTimeBtn: "تم الحفظ، إخفاء المفتاح",
    activeStatus: "نشط",
    revokedStatus: "ملغى",
    revokeBtn: "إلغاء",
    copyPrefixBtn: "نسخ البادئة",
    shaLabel: "بصمة SHA-256:",
    emptyKeys: "لا توجد مفاتيح حالياً. اضغط على «توليد مفتاح سري جديد» للبدء.",
    // Snippets section
    snippetsHeading: "نماذج الربط البرمجي (Integration Snippets)",
    snippetsDesc:
      "أرسل رسائل SMS مختومة بالرمز السري للعميل ومحمية بالوسيط الآمن عبر نقطة النهاية POST /api/v1/sms/send-secure.",
    copyCodeBtn: "نسخ الكود",
    copiedCodeToast: "تم نسخ الكود البرمجي إلى الحافظة",
    copiedKeyToast: "تم نسخ المفتاح السري إلى الحافظة",
    copiedMaskToast: "تم نسخ البادئة المقنّعة (المفتاح الكامل يظهر عند الإنشاء فقط)",
    revokedToast: "تم إلغاء المفتاح السري وإيقاف صلاحيته فوراً",
    // Analytics section
    analyticsHeading: "تحليلات استخدام الـ API",
    analyticsDesc: "مقارنة لحظية بين إجمالي الطلبات اليومية والأخطاء المرصودة",
    timeframeToday: "اليوم (24 ساعة)",
    timeframeWeek: "آخر 7 أيام",
    legendCalls: "طلبات الـ API اليوم",
    legendErrors: "الأخطاء",
  },
  en: {
    pageBadge: "B2B Bank & Developer Portal",
    title: "Developer Settings & API Credentials",
    subtitle:
      "Provision SHA-256 hashed API keys (`sc_live_` / `sc_test_`), monitor real-time traffic analytics, and integrate secure SMS dispatch into your banking stack.",
    backHome: "Back to Platform",
    openSwagger: "Interactive OpenAPI Docs (/api/docs)",
    // KPIs
    kpiCallsToday: "API Calls Today",
    kpiErrorsToday: "Errors Today",
    kpiSuccessRate: "Success Rate",
    kpiLatency: "Avg Latency",
    // API Keys section
    keysHeading: "Secret API Keys",
    keysDesc:
      "Only the cryptographic SHA-256 digest is stored in PostgreSQL. Full secret keys are revealed strictly once upon creation.",
    envLive: "Production (sc_live_)",
    envTest: "Sandbox (sc_test_)",
    labelPlaceholder: "Key label (e.g. Core Banking SMS Gateway)",
    generateBtn: "Generate Secret Key",
    generatingBtn: "Generating...",
    oneTimeTitle: "Save your secret key now — revealed only once!",
    oneTimeBody:
      "For your institution's security, we never store plaintext secret keys. Once dismissed, you cannot reveal this key again.",
    copyBtn: "Copy to Clipboard",
    copiedBtn: "Copied ✓",
    hideOneTimeBtn: "I've saved it, mask key",
    activeStatus: "Active",
    revokedStatus: "Revoked",
    revokeBtn: "Revoke",
    copyPrefixBtn: "Copy Masked",
    shaLabel: "SHA-256 Digest:",
    emptyKeys: "No API keys found. Click \"Generate Secret Key\" to create one.",
    // Snippets section
    snippetsHeading: "Integration Snippets",
    snippetsDesc:
      "Send anti-phishing stamped SMS alerts with Sovereign Link Wrapping via POST /api/v1/sms/send-secure.",
    copyCodeBtn: "Copy Code",
    copiedCodeToast: "Integration snippet copied to clipboard",
    copiedKeyToast: "Secret API key copied to clipboard",
    copiedMaskToast: "Copied masked key reference (full secrets are only shown once)",
    revokedToast: "API key revoked immediately",
    // Analytics section
    analyticsHeading: "API Analytics",
    analyticsDesc: "Real-time comparison of API Calls Today vs Errors",
    timeframeToday: "Today (24h)",
    timeframeWeek: "Last 7 Days",
    legendCalls: "API Calls Today",
    legendErrors: "Errors",
  },
} as const;

async function copyTextSafe(value: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fallback below
    }
  }
  if (typeof document !== "undefined") {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  }
  return false;
}

export function DeveloperSettingsDashboard({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { locale, dir } = useI18n();
  const { isDark } = useTheme();
  const t = COPY_DICTIONARY[locale];
  const isAr = locale === "ar";

  const [keys, setKeys] = useState<DeveloperApiKeyDto[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newKeyEnv, setNewKeyEnv] = useState<"live" | "test">("live");
  const [newKeyLabel, setNewKeyLabel] = useState("");

  // Holds the newly created raw key strictly ONCE until the admin copies/dismisses it
  const [revealedSecret, setRevealedSecret] = useState<{
    keyId: string;
    rawKey: string;
  } | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Code Snippets & Analytics State
  const [snippetLang, setSnippetLang] = useState<SnippetLang>("curl");
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [timeframe, setTimeframe] = useState<"today" | "week">("today");
  const [chartMounted, setChartMounted] = useState(false);
  const [extraCallsOffset, setExtraCallsOffset] = useState(0);

  useEffect(() => {
    setChartMounted(true);
  }, []);

  const fetchKeys = useCallback(async () => {
    setLoadingKeys(true);
    try {
      const res = await fetch("/api/v1/institutions/api-keys", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.keys)) {
        setKeys(data.keys);
      }
    } catch {
      // Offline preview fallback
    } finally {
      setLoadingKeys(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch("/api/v1/institutions/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          environment: newKeyEnv,
          label: newKeyLabel.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) return;

      const created: DeveloperApiKeyDto = data.key;
      setKeys((prev) => [created, ...prev]);
      setRevealedSecret({ keyId: created.id, rawKey: data.raw_api_key });
      setNewKeyLabel("");
      setExtraCallsOffset((c) => c + 1);
    } finally {
      setGenerating(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      const res = await fetch(
        `/api/v1/institutions/api-keys?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      if (!res.ok) return;
      const data = await res.json();
      setKeys((prev) =>
        prev.map((k) => (k.id === id ? data.key : k))
      );
      if (revealedSecret?.keyId === id) {
        setRevealedSecret(null);
      }
      setExtraCallsOffset((c) => c + 1);
      toast.info(t.revokedToast);
    } catch {
      // Ignore transient network error
    }
  };

  const handleCopyKey = async (value: string, keyId: string, isFullSecret: boolean) => {
    const ok = await copyTextSafe(value);
    if (ok) {
      setCopiedKeyId(keyId);
      setTimeout(() => setCopiedKeyId((cur) => (cur === keyId ? null : cur)), 2200);
      toast.success(isFullSecret ? t.copiedKeyToast : t.copiedMaskToast);
    }
  };

  const snippetKeyToken = useMemo(() => {
    if (revealedSecret?.rawKey) return revealedSecret.rawKey;
    return "sc_live_YOUR_SECRET_API_KEY";
  }, [revealedSecret]);

  const snippets: Record<SnippetLang, string> = useMemo(() => {
    const endpoint = "https://api.shieldcode.dz/api/v1/sms/send-secure";
    const payloadJson = JSON.stringify(
      {
        external_account_ref: "EDAHABIA-6280-4821",
        recipient_phone: "+213550123456",
        message_body:
          "CPA Alert: Transfer of 45,000 DZD. OTP: 849201. Confirm at https://cpa-bank.dz/verify",
        wrap_links: true,
      },
      null,
      2
    );

    return {
      curl: `curl -X POST "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${snippetKeyToken}" \\
  -d '${payloadJson}'`,

      python: `import requests

response = requests.post(
    "${endpoint}",
    headers={
        "Content-Type": "application/json",
        "x-api-key": "${snippetKeyToken}",
    },
    json={
        "external_account_ref": "EDAHABIA-6280-4821",
        "recipient_phone": "+213550123456",
        "message_body": "CPA Alert: Transfer of 45,000 DZD. OTP: 849201. Confirm at https://cpa-bank.dz/verify",
        "wrap_links": True,
    },
    timeout=8,
)
response.raise_for_status()
print(response.json())`,

      php: `<?php
$ch = curl_init("${endpoint}");
$payload = json_encode([
    "external_account_ref" => "EDAHABIA-6280-4821",
    "recipient_phone" => "+213550123456",
    "message_body" => "CPA Alert: Transfer of 45,000 DZD. OTP: 849201. Confirm at https://cpa-bank.dz/verify",
    "wrap_links" => true,
]);

curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "x-api-key: ${snippetKeyToken}",
    ],
    CURLOPT_POSTFIELDS => $payload,
]);

$response = curl_exec($ch);
curl_close($ch);
echo $response;`,
    };
  }, [snippetKeyToken]);

  const handleCopySnippet = async () => {
    const ok = await copyTextSafe(snippets[snippetLang]);
    if (ok) {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
      toast.success(t.copiedCodeToast);
    }
  };

  const chartData = useMemo(() => {
    const base = timeframe === "today" ? BASE_ANALYTICS_TODAY : BASE_ANALYTICS_WEEK;
    return base.map((point, idx) =>
      idx === base.length - 1
        ? { ...point, apiCalls: point.apiCalls + extraCallsOffset }
        : point
    );
  }, [timeframe, extraCallsOffset]);

  const totalCalls = useMemo(
    () => chartData.reduce((acc, p) => acc + p.apiCalls, 0),
    [chartData]
  );
  const totalErrors = useMemo(
    () => chartData.reduce((acc, p) => acc + p.errors, 0),
    [chartData]
  );
  const successRate = useMemo(() => {
    if (totalCalls === 0) return "100.0%";
    return `${(((totalCalls - totalErrors) / totalCalls) * 100).toFixed(2)}%`;
  }, [totalCalls, totalErrors]);

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(isAr ? "ar-DZ" : "en-US"),
    [isAr]
  );

  return (
    <div
      dir={dir}
      className={`${
        embedded ? "" : "min-h-screen anti-banding-canvas"
      } text-slate-900 dark:text-slate-100`}
    >
      {/* Top Bar when rendered as standalone /developer page */}
      {!embedded && (
        <header className="sticky top-0 z-40 border-b border-teal-500/15 dark:border-white/10 bg-white/85 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm ring-1 ring-white/20 dark:ring-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/20">
                <Terminal className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 dark:text-white">
                  ShieldCode Developer Portal
                </h1>
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                  {t.pageBadge}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <ThemeToggle />
              <LanguageSwitcher />
              <Link
                href="/"
                className="rounded-xl border border-teal-200 dark:border-teal-800/80 bg-teal-50 dark:bg-teal-950/60 px-3.5 py-2 text-xs font-bold text-teal-800 dark:text-teal-200 transition hover:bg-teal-100 dark:hover:bg-teal-900/60"
              >
                {t.backHome}
              </Link>
            </div>
          </div>
        </header>
      )}

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        {/* ================================================================
            HEADER BANNER
        ================================================================ */}
        <section className="relative overflow-hidden rounded-3xl border border-teal-200/70 dark:border-white/10 anti-banding-teal p-6 sm:p-8 text-white shadow-retina-glass ring-1 ring-white/15">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -end-16 -top-16 h-56 w-56 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(103, 232, 249, 0.22) 0%, transparent 70%)",
            }}
          />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4 text-cyan-200" />
                <span>{t.pageBadge}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t.title}
              </h2>
              <p className="text-sm text-teal-50 leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {embedded && (
                <>
                  <ThemeToggle />
                  <LanguageSwitcher />
                </>
              )}
              <a
                href="/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-[#061820] px-4 py-2.5 text-xs font-extrabold text-teal-800 dark:text-cyan-200 shadow-md transition hover:bg-cyan-50 dark:hover:bg-teal-950"
              >
                <BookOpen className="h-4 w-4 text-teal-600 dark:text-cyan-300" />
                <span>{t.openSwagger}</span>
              </a>
            </div>
          </div>
        </section>

        {/* ================================================================
            KPI STRIP
        ================================================================ */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: t.kpiCallsToday,
              value: numberFormatter.format(totalCalls),
              badge: "+12.4%",
              gradient: "from-teal-600 to-teal-500",
            },
            {
              label: t.kpiErrorsToday,
              value: numberFormatter.format(totalErrors),
              badge: "0.45%",
              gradient: "from-cyan-700 to-cyan-500",
            },
            {
              label: t.kpiSuccessRate,
              value: successRate,
              badge: "SLA",
              gradient: "from-teal-500 to-cyan-500",
            },
            {
              label: t.kpiLatency,
              value: isAr ? "18 مللي/ث" : "18 ms",
              badge: "DZ Local",
              gradient: "from-cyan-600 to-teal-600",
            },
          ].map((kpi, index) => (
            <div
              key={index}
              className="rounded-2xl border border-teal-500/20 dark:border-white/10 bg-white/95 dark:bg-slate-900/85 ring-1 ring-teal-500/10 dark:ring-white/10 p-4 sm:p-5 shadow-retina-card hover-lift-gpu"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {kpi.label}
                </span>
                <span
                  className={`rounded-full bg-gradient-to-r ${kpi.gradient} px-2 py-0.5 text-[10px] font-extrabold text-white`}
                >
                  {kpi.badge}
                </span>
              </div>
              <p
                dir="ltr"
                className="mt-2 font-mono text-2xl sm:text-3xl font-black text-teal-800 dark:text-cyan-300"
              >
                {kpi.value}
              </p>
            </div>
          ))}
        </section>

        {/* ================================================================
            SECTION 1: API KEYS MANAGEMENT (REVEAL ONCE + MASK + COPY + REVOKE)
        ================================================================ */}
        <section className="rounded-3xl border border-teal-500/20 dark:border-white/10 bg-white/95 dark:bg-slate-900/85 ring-1 ring-teal-500/15 dark:ring-white/10 p-6 sm:p-8 shadow-retina-glass space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-teal-100 dark:border-teal-900/70 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
                <KeyRound className="h-5 w-5" />
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {t.keysHeading}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">{t.keysDesc}</p>
            </div>

            {/* Generate Key Controls */}
            <form
              onSubmit={handleGenerateKey}
              className="flex flex-wrap items-center gap-2.5"
            >
              <div className="flex rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-[#0a232e] p-1">
                {(["live", "test"] as const).map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setNewKeyEnv(env)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      newKeyEnv === env
                        ? "bg-teal-600 text-white shadow-sm"
                        : "text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/60"
                    }`}
                  >
                    {env === "live" ? t.envLive : t.envTest}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={newKeyLabel}
                onChange={(e) => setNewKeyLabel(e.target.value.slice(0, 64))}
                placeholder={t.labelPlaceholder}
                className="h-10 w-56 rounded-xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-[#031017] px-3 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />

              <button
                type="submit"
                disabled={generating}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 text-xs font-extrabold text-white shadow-md shadow-teal-600/20 transition hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-teal-500/30 disabled:opacity-60"
              >
                {generating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>{generating ? t.generatingBtn : t.generateBtn}</span>
              </button>
            </form>
          </div>

          {/* ONE-TIME SECRET REVEAL BANNER */}
          <AnimatePresence>
            {revealedSecret && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border-2 border-cyan-400 dark:border-cyan-500/60 bg-gradient-to-br from-teal-50 via-cyan-50 to-white dark:from-teal-950/90 dark:via-slate-900/90 dark:to-slate-950/95 ring-1 ring-white/10 p-5 shadow-retina-glow space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-teal-900 dark:text-cyan-200">
                    <Sparkles className="h-5 w-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span className="text-sm font-extrabold">
                      {t.oneTimeTitle}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRevealedSecret(null)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-[#061820] px-3 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-200 hover:bg-teal-50 dark:hover:bg-teal-950 transition"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                    <span>{t.hideOneTimeBtn}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">{t.oneTimeBody}</p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <code
                    dir="ltr"
                    className="flex-1 overflow-x-auto rounded-xl border border-teal-300 bg-slate-950 px-4 py-3 font-mono text-sm font-bold text-cyan-300 select-all"
                  >
                    {revealedSecret.rawKey}
                  </code>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyKey(
                        revealedSecret.rawKey,
                        revealedSecret.keyId,
                        true
                      )
                    }
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 text-xs font-extrabold text-white shadow-sm hover:from-teal-700 hover:to-cyan-700 transition"
                  >
                    {copiedKeyId === revealedSecret.keyId ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span>
                      {copiedKeyId === revealedSecret.keyId
                        ? t.copiedBtn
                        : t.copyBtn}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* API KEYS TABLE / LIST */}
          {loadingKeys ? (
            <div className="py-8 text-center text-xs font-bold text-teal-700 dark:text-teal-300">
              Loading...
            </div>
          ) : keys.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-teal-200 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/30 py-8 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.emptyKeys}
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((item) => {
                const isRevealedHere = revealedSecret?.keyId === item.id;
                const displaySecretOrMask = isRevealedHere
                  ? revealedSecret!.rawKey
                  : item.masked_key;
                const copyValue = isRevealedHere
                  ? revealedSecret!.rawKey
                  : item.masked_key;

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                      item.is_active
                        ? "border-teal-200 dark:border-teal-800/80 bg-teal-50/30 dark:bg-[#09202b] hover:border-teal-300 dark:hover:border-teal-700"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 opacity-70"
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {item.label}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                            item.environment === "live"
                              ? "bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700"
                              : "bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-700"
                          }`}
                        >
                          {item.environment === "live" ? "sc_live_" : "sc_test_"}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                            item.is_active
                              ? "bg-teal-600 text-white"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 line-through"
                          }`}
                        >
                          {item.is_active ? t.activeStatus : t.revokedStatus}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <code
                          dir="ltr"
                          className="rounded-lg border border-teal-200/80 dark:border-teal-800 bg-white dark:bg-[#031017] px-2.5 py-1 font-mono font-bold text-teal-900 dark:text-cyan-300"
                        >
                          {displaySecretOrMask}
                        </code>
                        <span
                          dir="ltr"
                          className="font-mono text-[11px] text-slate-500 dark:text-slate-400"
                        >
                          {t.shaLabel} {item.sha256_preview}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={!item.is_active}
                        onClick={() =>
                          handleCopyKey(copyValue, item.id, isRevealedHere)
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-[#061820] px-3 py-2 text-xs font-bold text-teal-800 dark:text-teal-200 transition hover:bg-teal-50 dark:hover:bg-teal-950 disabled:opacity-40"
                      >
                        {copiedKeyId === item.id ? (
                          <Check className="h-3.5 w-3.5 text-teal-600 dark:text-cyan-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-teal-600 dark:text-cyan-400" />
                        )}
                        <span>
                          {copiedKeyId === item.id
                            ? t.copiedBtn
                            : isRevealedHere
                            ? t.copyBtn
                            : t.copyPrefixBtn}
                        </span>
                      </button>

                      {item.is_active && (
                        <button
                          type="button"
                          onClick={() => handleRevokeKey(item.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/60 px-3 py-2 text-xs font-bold text-cyan-900 dark:text-cyan-200 transition hover:bg-cyan-700 hover:border-cyan-700 hover:text-white dark:hover:bg-cyan-700"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          <span>{t.revokeBtn}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ================================================================
            SECTION 2 & 3: ANALYTICS CHART + INTEGRATION SNIPPETS
        ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* API ANALYTICS (Recharts with Teal & Cyan Gradients) */}
          <section className="lg:col-span-6 flex flex-col justify-between rounded-3xl border border-teal-500/20 dark:border-white/10 bg-white/95 dark:bg-slate-900/85 ring-1 ring-teal-500/15 dark:ring-white/10 p-6 shadow-retina-glass space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
                  <Activity className="h-5 w-5" />
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {t.analyticsHeading}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t.analyticsDesc}
                </p>
              </div>

              <div className="flex rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-[#0a232e] p-1">
                <button
                  type="button"
                  onClick={() => setTimeframe("today")}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    timeframe === "today"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/60"
                  }`}
                >
                  {t.timeframeToday}
                </button>
                <button
                  type="button"
                  onClick={() => setTimeframe("week")}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    timeframe === "week"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/60"
                  }`}
                >
                  {t.timeframeWeek}
                </button>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5 text-teal-800 dark:text-teal-200">
                <span className="h-3 w-3 rounded-full bg-teal-600" />
                <span>{t.legendCalls}</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-800 dark:text-cyan-300">
                <span className="h-3 w-3 rounded-full bg-cyan-500" />
                <span>{t.legendErrors}</span>
              </div>
            </div>

            <div dir="ltr" className="h-[290px] w-full">
              {chartMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="tealCallsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.42} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient
                        id="cyanErrorsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? "#133c48" : "#ccfbf1"}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="time"
                      tick={{
                        fontSize: 11,
                        fill: isDark ? "#94b8be" : "#475569",
                        fontWeight: 600,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: isDark ? "#94b8be" : "#475569",
                        fontWeight: 600,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#042f2e",
                        borderColor: "#14b8a6",
                        borderRadius: "14px",
                        color: "#f0fdfa",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                      itemStyle={{ color: "#99f6e4" }}
                      labelStyle={{ color: "#5eead4", marginBottom: "4px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="apiCalls"
                      name={t.legendCalls}
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#tealCallsGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="errors"
                      name={t.legendErrors}
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      strokeDasharray="4 3"
                      fillOpacity={1}
                      fill="url(#cyanErrorsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 text-xs font-bold text-teal-700 dark:text-teal-300">
                  Loading Chart...
                </div>
              )}
            </div>
          </section>

          {/* INTEGRATION SNIPPETS (cURL / Python / PHP) */}
          <section className="lg:col-span-6 flex flex-col justify-between rounded-3xl border border-teal-500/20 dark:border-white/10 bg-white/95 dark:bg-slate-900/85 ring-1 ring-teal-500/15 dark:ring-white/10 p-6 shadow-retina-glass space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
                  <Code2 className="h-5 w-5" />
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {t.snippetsHeading}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t.snippetsDesc}
                </p>
              </div>
            </div>

            {/* Language Tabs + Copy Button */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-teal-200/80 dark:border-teal-800 bg-teal-50/60 dark:bg-[#0a232e] p-1.5">
              <div className="flex items-center gap-1">
                {(
                  [
                    { id: "curl", label: "cURL" },
                    { id: "python", label: "Python" },
                    { id: "php", label: "PHP" },
                  ] as { id: SnippetLang; label: string }[]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSnippetLang(tab.id)}
                    className={`rounded-xl px-3.5 py-1.5 font-mono text-xs font-extrabold transition ${
                      snippetLang === tab.id
                        ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-sm"
                        : "text-teal-800 dark:text-teal-200 hover:bg-white dark:hover:bg-teal-900/60"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopySnippet}
                className="inline-flex items-center gap-1.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-[#061820] px-3 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-200 transition hover:bg-teal-100 dark:hover:bg-teal-950"
              >
                {copiedSnippet ? (
                  <Check className="h-3.5 w-3.5 text-teal-600 dark:text-cyan-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-teal-600 dark:text-cyan-400" />
                )}
                <span>{copiedSnippet ? t.copiedBtn : t.copyCodeBtn}</span>
              </button>
            </div>

            {/* Always LTR code container even when Arabic RTL is active */}
            <div
              dir="ltr"
              className="flex-1 overflow-x-auto rounded-2xl border border-teal-500/30 bg-slate-950 p-4 text-xs leading-relaxed text-cyan-100 shadow-inner"
            >
              <pre className="font-mono whitespace-pre">
                <code>{snippets[snippetLang]}</code>
              </pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
