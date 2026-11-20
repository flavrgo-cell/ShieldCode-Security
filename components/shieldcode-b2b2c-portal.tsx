"use client";

import React, { useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Building2,
  Code2,
  Smartphone,
  Copy,
  Check,
  Sparkles,
  Power,
  Send,
  AlertTriangle,
  Wallet,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCodeWidget } from "@/components/shieldcode-dropin-widget";

interface SimulatedSmsItem {
  id: string;
  isPhishing: boolean;
  companyName: string;
  securityCode: string | null;
  otp: string;
  text: string;
  timestamp: string;
}

export function ShieldCodeB2B2CPortal() {
  // B2B Partner Institution State
  const [companyName, setCompanyName] = useState("FinanzaBank");
  const [institutionType, setInstitutionType] = useState("Digital Bank");
  const [apiKey, setApiKey] = useState("sc_live_finanza_9f8e7d6c5b4a3210");
  const [integrationActive, setIntegrationActive] = useState(true);
  const [requestsCount, setRequestsCount] = useState(18);
  const [isRegistering, setIsRegistering] = useState(false);
  const [copiedSdk, setCopiedSdk] = useState(false);

  // End-User Bank Account & Injected Widget State
  const [externalUserId] = useState("CUST-1001");
  const [endUserName] = useState("البشير الإبراهيمي");
  const [clientSessionToken, setClientSessionToken] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJDVVNULTEwMDEiLCJjaWQiOiJjb21wX2ZpbmFuemFfMDEiLCJjb21wYW55X25hbWUiOiJGaW5hbnphQmFuayIsInNjb3BlIjoid2lkZ2V0OmNvbmZpZ3VyZSJ9.shieldcode_sig"
  );
  const [securityCodeInput, setSecurityCodeInput] = useState("Bachir34");
  const [activeSecurityCode, setActiveSecurityCode] = useState("Bachir34");
  const [isSavingCode, setIsSavingCode] = useState(false);

  // Live SMS Simulator State
  const [isSimulatingSms, setIsSimulatingSms] = useState(false);
  const [smsHistory, setSmsHistory] = useState<SimulatedSmsItem[]>([
    {
      id: "sms_init_1",
      isPhishing: false,
      companyName: "FinanzaBank",
      securityCode: "Bachir34",
      otp: "849201",
      text: "[Bachir34] FinanzaBank: Your OTP is 849201 to authorize a transfer of $1,250.00. Never share this code.",
      timestamp: "Just now",
    },
  ]);

  const sdkSnippet = `<!-- 1. Load ShieldCode Shadow-DOM Web Component SDK -->
<script src="https://api.shieldcode.io/sdk/shieldcode-widget.js"></script>

<!-- 2. Drop in the Widget with the short-lived clientSessionToken -->
<shield-code-widget
  client-session-token="${clientSessionToken.slice(0, 36)}..."
  api-base-url="https://api.shieldcode.io">
</shield-code-widget>

<!-- Or in React / Next.js: -->
<ShieldCodeWidget clientSessionToken="${clientSessionToken.slice(0, 36)}..." />`;

  // 1. POST /api/v1/register-company
  const handleRegisterCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsRegistering(true);
    try {
      const res = await fetch("/api/v1/register-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName.trim(),
          institution_type: institutionType,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to register company.");
        return;
      }

      setApiKey(data.api_key);
      setCompanyName(data.company.company_name);
      setIntegrationActive(true);
      setRequestsCount((c) => c + 1);
      toast.success(
        `تم إصدار مفتاح API جديد للمؤسسة: ${data.company.company_name}`
      );
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بخادم التسجيل.");
    } finally {
      setIsRegistering(false);
    }
  };

  // 2. POST /api/v1/shield/configure
  const handleConfigureShieldCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = securityCodeInput.trim();
    if (cleaned.length < 3) {
      toast.error("يجب أن يتكون الرمز من 3 إلى 20 حرفاً أو رقماً.");
      return;
    }

    setIsSavingCode(true);
    try {
      const res = await fetch("/api/v1/shield/configure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shield-Api-Key": apiKey,
        },
        body: JSON.stringify({
          external_user_id: externalUserId,
          security_code: cleaned,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "تعذر حفظ الرمز الأمني.");
        return;
      }

      setActiveSecurityCode(data.security_code);
      setRequestsCount(data.requests_count || requestsCount + 1);
      toast.success(
        `تم تحديث رمز مكافحة التصيد إلى [${data.security_code}] وحقنه في رسائل البنك!`
      );
      await handleSimulateLegitSms(data.security_code);
    } catch {
      toast.error("فشل الاتصال بواجهة /api/v1/shield/configure");
    } finally {
      setIsSavingCode(false);
    }
  };

  // 3. GET /api/v1/sms/simulate
  const handleSimulateLegitSms = async (overrideCode?: string) => {
    setIsSimulatingSms(true);
    try {
      const res = await fetch(
        `/api/v1/sms/simulate?external_user_id=${encodeURIComponent(
          externalUserId
        )}&action=transfer`,
        {
          headers: {
            "X-Shield-Api-Key": apiKey,
          },
        }
      );
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "تعذر محاكاة رسالة الـ SMS");
        return;
      }

      const codeUsed =
        overrideCode || data.embedded_security_code || activeSecurityCode;
      const otp = data.generated_otp || "592041";

      const newItem: SimulatedSmsItem = {
        id: `sms_${Date.now()}`,
        isPhishing: false,
        companyName: data.company_name || companyName,
        securityCode: codeUsed,
        otp,
        text: `[${codeUsed}] ${
          data.company_name || companyName
        }: Your OTP is ${otp} to authorize a transfer of $1,250.00. Never share this code.`,
        timestamp: new Date().toLocaleTimeString(),
      };

      setSmsHistory((prev) => [newItem, ...prev.slice(0, 5)]);
      setRequestsCount(data.requests_count || requestsCount + 1);
      toast.success(`وصلت رسالة SMS رسمية مختومة بالرمز [${codeUsed}]`);
    } catch {
      toast.error("تعذر الاتصال بـ /api/v1/sms/simulate");
    } finally {
      setIsSimulatingSms(false);
    }
  };

  // Simulate Spoofed / Phishing SMS (Missing Personal Code)
  const handleSimulatePhishingSms = () => {
    const fakeItem: SimulatedSmsItem = {
      id: `phish_${Date.now()}`,
      isPhishing: true,
      companyName: `${companyName}-SecurityAlert`,
      securityCode: null,
      otp: "------",
      text: `${companyName}: URGENT! Your bank card has been suspended. Click http://verify-${companyName.toLowerCase()}-login.com immediately to restore access!`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setSmsHistory((prev) => [fakeItem, ...prev.slice(0, 5)]);
    toast.warning(
      `⚠️ تم اعتراض رسالة احتيالية منتحلة لا تحتوي على الرمز الشخصي [${activeSecurityCode}]!`
    );
  };

  const copySdkToClipboard = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(sdkSnippet);
      setCopiedSdk(true);
      toast.success("تم نسخ كود التضمين (Embeddable Widget SDK)");
      setTimeout(() => setCopiedSdk(false), 2000);
    }
  };

  return (
    <div
      dir="rtl"
      className="bg-slate-950 text-slate-100 py-14 px-4 sm:px-6 border-b border-slate-800"
    >
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top Architecture Header Banner */}
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-l from-slate-900 via-slate-900/95 to-emerald-950/30 p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 px-3 py-1 text-xs">
                  🎓 مشروع التخرج: ShieldCode (API-First B2B2C SaaS)
                </Badge>
                <Badge
                  variant="outline"
                  className="border-cyan-500/40 bg-cyan-500/10 text-cyan-300 text-xs font-mono"
                >
                  Express / Next.js REST API + Embeddable SDK
                </Badge>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                منصة <span className="text-emerald-400">ShieldCode</span> لحقن
                أداة مكافحة التصيد داخل البنوك والمؤسسات المالية
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                تحصل المؤسسات المالية والبنوك على مفتاح ربط برمجي (
                <code className="text-cyan-300 font-mono" dir="ltr">
                  api_key
                </code>
                )، وبمجرد دمجه في أنظمتها، تنبثق{" "}
                <strong className="text-emerald-300">
                  أداة إعداد الرمز السري (ShieldCode Widget)
                </strong>{" "}
                تلقائياً داخل حساب كل عميل في البنك، ليتم ختم جميع رسائل الـ SMS
                البنكية برمزه الشخصي (مثل:{" "}
                <code className="text-emerald-300 font-mono" dir="ltr">
                  [{activeSecurityCode}] {companyName}: Your OTP is...
                </code>
                ).
              </p>
            </div>

            {/* Live Multi-Tenant Telemetry Counters */}
            <div className="grid grid-cols-3 gap-3 text-center shrink-0">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
                <span className="text-xs text-slate-400 block">
                  المؤسسة الشريكة
                </span>
                <span
                  className="mt-1 block font-extrabold text-emerald-400 text-sm sm:text-base"
                  dir="ltr"
                >
                  {companyName}
                </span>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
                <span className="text-xs text-slate-400 block">
                  رمز العميل المحقون
                </span>
                <span
                  className="mt-1 block font-mono font-extrabold text-cyan-300 text-sm sm:text-base"
                  dir="ltr"
                >
                  [{activeSecurityCode}]
                </span>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
                <span className="text-xs text-slate-400 block">
                  استدعاءات الـ API
                </span>
                <span className="mt-1 block font-mono font-extrabold text-white text-sm sm:text-base">
                  {requestsCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main 12-Column Split Architecture: B2B Portal (5 cols) + End-User Bank Account & SMS Simulator (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================================================================
              COLUMN 1 (5 COLS): B2B PARTNER COMPANY PORTAL
          ================================================================ */}
          <Card className="lg:col-span-5 border-slate-800 bg-slate-900/80 text-slate-100 rounded-3xl shadow-2xl">
            <CardHeader className="border-b border-slate-800/80 pb-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-cyan-400" />
                  <CardTitle className="text-lg font-bold text-white">
                    1. بوابة الشركات والبنوك (B2B Portal)
                  </CardTitle>
                </div>
                <span
                  className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 font-mono text-[10px] text-cyan-300"
                  dir="ltr"
                >
                  POST /api/v1/register-company
                </span>
              </div>
              <CardDescription className="text-slate-400 text-xs pt-1">
                سجّل مؤسسة مالية جديدة لتوليد مفتاح{" "}
                <code className="text-cyan-300" dir="ltr">
                  api_key
                </code>{" "}
                واختبر تفعيل أو إيقاف حقن الـ Widget داخل حسابات العملاء.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-5 space-y-5">
              <form onSubmit={handleRegisterCompany} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    اسم البنك أو المؤسسة المالية
                  </label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="مثال: FinanzaBank"
                    className="h-11 border-slate-700 bg-slate-950 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      قطاع المؤسسة
                    </label>
                    <select
                      value={institutionType}
                      onChange={(e) => setInstitutionType(e.target.value)}
                      className="h-11 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-white"
                    >
                      <option value="Digital Bank">
                        بنك رقمي (Digital Bank)
                      </option>
                      <option value="Commercial Bank">
                        بنك تجاري (Commercial Bank)
                      </option>
                      <option value="FinTech Gateway">
                        بوابة دفع (FinTech)
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      حالة حقن الـ Widget عن بُعد
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIntegrationActive((prev) => !prev);
                        toast.info(
                          !integrationActive
                            ? "تم تفعيل الربط وحقن أداة ShieldCode في حساب العميل!"
                            : "تم إيقاف الربط مؤقتاً وإخفاء الأداة من حساب العميل."
                        );
                      }}
                      className={`h-11 w-full text-xs font-bold ${
                        integrationActive
                          ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                          : "border-amber-500/50 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                      }`}
                    >
                      <Power className="ml-1.5 h-3.5 w-3.5" />
                      {integrationActive
                        ? "الربط مفعّل (Widget Injected)"
                        : "الربط متوقف (Widget Hidden)"}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isRegistering}
                  className="h-11 w-full bg-gradient-to-r from-cyan-500 to-emerald-500 font-bold text-slate-950 hover:from-cyan-400 hover:to-emerald-400"
                >
                  <KeyRound className="ml-2 h-4 w-4" />
                  {isRegistering
                    ? "جارٍ توليد مفتاح الـ API..."
                    : "توليد مفتاح API جديد للمؤسسة"}
                </Button>
              </form>

              {/* Issued API Key Box */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400">
                    مفتاح الربط النشط (
                    <code className="text-cyan-300" dir="ltr">
                      X-Shield-Api-Key
                    </code>
                    ):
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    ● مصادق عليه
                  </span>
                </div>
                <div
                  dir="ltr"
                  className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-emerald-300 break-all"
                >
                  {apiKey}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-slate-400 flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-cyan-400" />
                    كود التضمين في موقع البنك (Embeddable SDK):
                  </span>
                  <button
                    type="button"
                    onClick={copySdkToClipboard}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    {copiedSdk ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> تم النسخ
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> نسخ الكود
                      </>
                    )}
                  </button>
                </div>
                <pre
                  dir="ltr"
                  className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-cyan-300 overflow-x-auto"
                >
                  {sdkSnippet}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* ================================================================
              COLUMN 2 (7 COLS): END-USER BANK VIEW + INJECTED WIDGET + SMS SIMULATOR
          ================================================================ */}
          <Card className="lg:col-span-7 border-slate-800 bg-slate-900/80 text-slate-100 rounded-3xl shadow-2xl overflow-hidden">
            {/* Simulated Partner Bank Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white text-sm sm:text-base">
                      {companyName} — بوابة العميل البنكية
                    </h3>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px]">
                      End-User Account View
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                    العميل: <strong>{endUserName}</strong> • المعرّف:{" "}
                    <code dir="ltr" className="text-cyan-300">
                      {externalUserId}
                    </code>
                  </p>
                </div>
              </div>

              <div className="text-left" dir="ltr">
                <span className="text-[11px] text-slate-400 block">
                  Checking Account Balance
                </span>
                <span className="text-lg font-extrabold text-emerald-400">
                  $24,850.00
                </span>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Dynamically Injected ShieldCode Widget inside the Bank Account */}
              {integrationActive ? (
                <div className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 p-5 shadow-lg shadow-emerald-500/10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-slate-950">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-white text-sm">
                            أداة الحماية المحقونة ديناميكياً (ShieldCode
                            Injected Widget)
                          </h4>
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                            Injected via API Key
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">
                          عيّن كلمتك السرية الخاصة لتظهر في مقدمة كل رسالة SMS
                          حقيقية يرسلها لك <strong>{companyName}</strong>
                        </p>
                      </div>
                    </div>

                    <span
                      dir="ltr"
                      className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 font-mono text-[10px] text-emerald-300"
                    >
                      POST /api/v1/shield/configure
                    </span>
                  </div>

                  <form
                    onSubmit={handleConfigureShieldCode}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <div className="relative flex-1">
                      <Input
                        dir="ltr"
                        value={securityCodeInput}
                        onChange={(e) => setSecurityCodeInput(e.target.value)}
                        maxLength={20}
                        placeholder="أدخل رمزك الشخصي (مثال: Bachir34)"
                        className="h-11 border-slate-700 bg-slate-900 font-mono text-sm font-bold text-emerald-300"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSavingCode}
                      className="h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 shrink-0"
                    >
                      <Sparkles className="ml-1.5 h-4 w-4" />
                      {isSavingCode
                        ? "جارٍ الحفظ والختم..."
                        : "حفظ وتفعيل الرمز الشخصي"}
                    </Button>
                  </form>

                  {/* Live Shadow-DOM Isolated <ShieldCodeWidget clientSessionToken="ey..." /> */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cyan-300">
                        ⚡ مكون الـ Drop-In المعزول بـ Shadow DOM (Stripe Elements Style):
                      </span>
                      <code dir="ltr" className="text-[11px] text-emerald-400">
                        &lt;ShieldCodeWidget clientSessionToken=&quot;ey...&quot; /&gt;
                      </code>
                    </div>
                    <ShieldCodeWidget
                      clientSessionToken={clientSessionToken}
                      defaultCode={activeSecurityCode}
                      onConfigured={(payload) => {
                        setActiveSecurityCode(payload.security_code);
                        setSecurityCodeInput(payload.security_code);
                        handleSimulateLegitSms(payload.security_code);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-center text-xs text-amber-300">
                  ⚠️ تم إيقاف ربط الـ API من لوحة تحكم المؤسسة (B2B Portal)،
                  لذلك اختفت أداة ShieldCode من حساب العميل! اضغط على زر{" "}
                  <strong>&quot;الربط متوقف&quot;</strong> لإعادة حقن الأداة
                  فوراً.
                </div>
              )}

              {/* Live SMS Simulator Section */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
                <div className="md:col-span-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                      <Smartphone className="h-4 w-4" />
                      محاكي رسائل الـ SMS البنكية الفوري
                    </span>
                    <span
                      dir="ltr"
                      className="font-mono text-[10px] text-slate-400"
                    >
                      GET /api/v1/sms/simulate
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-white">
                    شاهد كيف يحميك الرمز{" "}
                    <code className="text-emerald-400" dir="ltr">
                      [{activeSecurityCode}]
                    </code>{" "}
                    من رسائل التصيد المنتحلة
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    جرّب إرسال رسالة OTP بنكية حقيقية عبر الـ API (ستظهر مختومة
                    برمزك{" "}
                    <code className="text-emerald-300" dir="ltr">
                      [{activeSecurityCode}]
                    </code>
                    )، أو جرّب محاكاة هجوم تصيد احتيالي (SMS Spoofing) لترى كيف
                    يكتشف العميل التزوير فوراً!
                  </p>

                  <div className="space-y-2.5 pt-2">
                    <Button
                      type="button"
                      disabled={isSimulatingSms}
                      onClick={() => handleSimulateLegitSms()}
                      className="w-full h-11 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold text-xs hover:from-emerald-400 hover:to-cyan-400"
                    >
                      <Send className="ml-1.5 h-3.5 w-3.5" />
                      {isSimulatingSms
                        ? "جارٍ توليد وختم رسالة الـ SMS..."
                        : `إرسال رسالة SMS بنكية شرعية [${activeSecurityCode}]`}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSimulatePhishingSms}
                      className="w-full h-11 border-rose-500/50 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 hover:text-white font-bold text-xs"
                    >
                      <AlertTriangle className="ml-1.5 h-3.5 w-3.5 text-rose-400" />
                      محاكاة رسالة تصيد احتيالي مزورة (بدون رمزك السري)
                    </Button>
                  </div>
                </div>

                {/* Smartphone Live SMS Preview */}
                <div className="md:col-span-6">
                  <div className="mx-auto max-w-[310px] rounded-[36px] border-4 border-slate-700 bg-slate-950 p-4 shadow-2xl">
                    <div className="mx-auto mb-3 h-4 w-24 rounded-full bg-slate-900 border border-slate-800" />
                    <div className="text-center border-b border-slate-800 pb-2 mb-3">
                      <p className="text-xs font-extrabold text-white">
                        {companyName} SMS Gateway
                      </p>
                      <p className="text-[10px] text-emerald-400">
                        ● ShieldCode Real-Time Protection
                      </p>
                    </div>

                    <div
                      dir="ltr"
                      className="space-y-2.5 min-h-[195px] max-h-[240px] overflow-y-auto pr-1 text-left"
                    >
                      {smsHistory.map((item) =>
                        item.isPhishing ? (
                          <div
                            key={item.id}
                            className="rounded-2xl rounded-tl-sm border border-rose-500/60 bg-rose-950/40 p-3 text-xs text-rose-100 leading-relaxed"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="inline-flex items-center gap-1 rounded bg-rose-500 px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-white">
                                <ShieldAlert className="h-3 w-3" /> NO
                                SHIELDCODE!
                              </span>
                              <span className="text-[9px] text-rose-300">
                                {item.timestamp}
                              </span>
                            </div>
                            <p>{item.text}</p>
                            <div
                              dir="rtl"
                              className="mt-2 rounded-lg bg-rose-500/20 px-2 py-1 text-[10px] font-bold text-rose-300"
                            >
                              🚨 تحذير: لا تحتوي على رمزك [{activeSecurityCode}]
                              — رسالة احتيالية مزورة!
                            </div>
                          </div>
                        ) : (
                          <div
                            key={item.id}
                            className="rounded-2xl rounded-tl-sm border border-emerald-500/50 bg-emerald-950/30 p-3 text-xs text-slate-200 leading-relaxed"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="inline-block rounded bg-emerald-500 px-1.5 py-0.5 font-mono text-[11px] font-extrabold text-slate-950">
                                [{item.securityCode}]
                              </span>
                              <span className="text-[9px] text-slate-400">
                                {item.timestamp}
                              </span>
                            </div>
                            <p>
                              <strong>{item.companyName}:</strong> Your OTP is{" "}
                              <span className="font-mono font-bold text-emerald-300">
                                {item.otp}
                              </span>{" "}
                              to authorize a transfer of $1,250.00.
                            </p>
                            <div
                              dir="rtl"
                              className="mt-1.5 text-[10px] font-bold text-emerald-400"
                            >
                              ✓ رسالة رسمية موثوقة ومختومة برمزك الشخصي
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
