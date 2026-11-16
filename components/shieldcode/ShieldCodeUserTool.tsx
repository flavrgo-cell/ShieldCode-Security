"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Key,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  Lock,
  Smartphone,
  Laptop,
  Mail,
  Bell,
  Receipt,
  Sparkles,
  Check,
  Building,
  Radio,
  Send,
  RefreshCw,
  Phone,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import {
  ALGERIAN_BANKS_DATABASE,
  ALGERIAN_TELECOM_OPERATORS,
  detectAlgerianTelecom,
  detectAlgerianBank,
  AlgerianBank,
  AlgerianTelecomOperator,
} from "@/lib/algerian-registry";
import { defaultShieldCode } from "@/lib/shieldcode-sdk";

export interface ShieldCodeUserToolProps {
  userId?: string;
  defaultView?: "responsive" | "mobile" | "desktop";
  allowViewSwitch?: boolean;
  onCodeUpdated?: (code: string, enabled: boolean) => void;
  className?: string;
}

const COUNTRY_CODES = [
  { code: "+213", label: "🇩🇿 الجزائر (+213)", defaultLength: 9 },
  { code: "+33", label: "🇫🇷 فرنسا (+33)", defaultLength: 9 },
  { code: "+1", label: "🇺🇸 أمريكا / كندا (+1)", defaultLength: 10 },
  { code: "+971", label: "🇦🇪 الإمارات (+971)", defaultLength: 9 },
  { code: "+966", label: "🇸🇦 السعودية (+966)", defaultLength: 9 },
  { code: "+44", label: "🇬🇧 بريطانيا (+44)", defaultLength: 10 },
];

export function ShieldCodeUserTool({
  userId = "user_account_01",
  defaultView = "responsive",
  allowViewSwitch = true,
  onCodeUpdated,
  className = "",
}: ShieldCodeUserToolProps) {
  const [viewMode, setViewMode] = useState<"responsive" | "mobile" | "desktop">(defaultView);

  // Form Fields
  const [countryCode, setCountryCode] = useState("+213");
  const [phone, setPhone] = useState("0555123456");
  const [selectedBankId, setSelectedBankId] = useState("algerie-poste");
  const [accountNumber, setAccountNumber] = useState("");
  const [code, setCode] = useState("SECURE2026");
  const [enabled, setEnabled] = useState(true);
  const [showCode, setShowCode] = useState(false);

  // Twilio OTP Verification States
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpStep, setOtpStep] = useState<"idle" | "sent" | "verified">("idle");
  const [otpInput, setOtpInput] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccessMsg, setOtpSuccessMsg] = useState("");
  const [otpDevHint, setOtpDevHint] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState(3);

  // Status & Feedback
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Live Auto-Detected Entities
  const [detectedTelecom, setDetectedTelecom] = useState<AlgerianTelecomOperator | null>(null);
  const [selectedBank, setSelectedBank] = useState<AlgerianBank>(ALGERIAN_BANKS_DATABASE[1]);

  // Secure SMS Testing
  const [sendingSecureSms, setSendingSecureSms] = useState(false);
  const [secureSmsResult, setSecureSmsResult] = useState<any>(null);

  // Test Verifier
  const [testInput, setTestInput] = useState("");
  const [testResult, setTestResult] = useState<{
    status: "verified" | "phishing" | null;
    message: string;
  }>({ status: null, message: "" });

  // Auto-detect carrier when phone changes
  useEffect(() => {
    const carrier = detectAlgerianTelecom(phone);
    setDetectedTelecom(carrier);
  }, [phone]);

  // Update selected bank details
  useEffect(() => {
    const bank = detectAlgerianBank(selectedBankId);
    if (bank) setSelectedBank(bank);
  }, [selectedBankId]);

  const validation = defaultShieldCode.validateCode(code);

  // Formatted E.164 phone
  const getFullE164 = () => {
    let clean = phone.replace(/[\s\-\(\)]/g, "");
    if (clean.startsWith("+")) return clean;
    if (clean.startsWith("0") && countryCode === "+213") {
      clean = clean.slice(1);
    }
    return countryCode + clean;
  };

  // 1. Request Twilio OTP
  const handleRequestOTP = async () => {
    setOtpLoading(true);
    setOtpError("");
    setOtpSuccessMsg("");
    setOtpDevHint("");

    try {
      const fullPhone = getFullE164();
      const res = await fetch("/api/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullPhone,
          userId,
          antiPhishingCode: code,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل إرسال رمز التحقق عبر مزود Twilio");
      }

      setOtpStep("sent");
      setOtpSuccessMsg(data.message || "تم إرسال كود التحقق OTP إلى هاتفك!");
      if (data.devHint) {
        setOtpDevHint(data.devHint);
      }
    } catch (err: any) {
      setOtpError(err.message || "حدث خطأ أثناء إرسال الرمز");
    } finally {
      setOtpLoading(false);
    }
  };

  // 2. Verify Twilio OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      setOtpError("يرجى إدخال رمز التحقق المكون من 6 أرقام");
      return;
    }

    setOtpLoading(true);
    setOtpError("");
    try {
      const fullPhone = getFullE164();
      const res = await fetch("/api/phone/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullPhone,
          otp: otpInput.trim(),
          userId,
          antiPhishingCode: code,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }
        throw new Error(data.error || "فشل التحقق من الرمز");
      }

      setIsPhoneVerified(true);
      setOtpStep("verified");
      setOtpSuccessMsg("✓ تم توثيق رقم الهاتف بنجاح وربطه برمز مكافحة التصيد!");
    } catch (err: any) {
      setOtpError(err.message || "رمز التحقق غير صحيح");
    } finally {
      setOtpLoading(false);
    }
  };

  // 3. Send Official Secure SMS alert via Twilio
  const handleSendSecureSMS = async () => {
    setSendingSecureSms(true);
    setSecureSmsResult(null);
    try {
      const fullPhone = getFullE164();
      const res = await fetch("/api/notifications/send-secure-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullPhone,
          userId,
          messageBody: `${selectedBank.shortName}: تم تسجيل الدخول إلى حسابك المالي بنجاح من جهاز جديد. إذا لم تكن أنت، يرجى تجميد الحساب فوراً.`,
          customSender: selectedBank.shortName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل إرسال الإشعار المحمي");
      }
      setSecureSmsResult(data);
    } catch (err: any) {
      alert(err.message || "فشل إرسال الرسالة");
    } finally {
      setSendingSecureSms(false);
    }
  };

  // Save Settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (enabled && !validation.valid) {
      setErrorMsg(validation.errors[0] || "يرجى إدخال رمز أمني صحيح");
      return;
    }

    setSaving(true);
    try {
      const fullPhone = getFullE164();
      const res = await fetch("/api/v1/algeria/link-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullPhone,
          bankId: selectedBankId,
          code: code.trim(),
          accountNumber: accountNumber.trim(),
          enabled,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل حفظ البيانات");
      }

      defaultShieldCode.setCode(fullPhone, code.trim(), enabled);
      setSavedSuccess(true);
      if (onCodeUpdated) {
        onCodeUpdated(code.trim(), enabled);
      }
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const result = defaultShieldCode.verifyMessage({
      userId: getFullE164(),
      fullMessageText: testInput,
      providedCode: code,
    });

    if (result.isAuthentic) {
      setTestResult({
        status: "verified",
        message: `✅ موثق وأصلي! الرسالة تحتوي على رمزك السري [${code}]. وهي صادرة من المؤسسة الحقيقية عبر شبكة الهاتف الرسمية.`,
      });
    } else {
      setTestResult({
        status: "phishing",
        message: `🚨 إنذار تصيد خطير: الرسالة لا تحتوي على رمزك [${code}]. هذه محاولة احتيال وانتحال هوية!`,
      });
    }
  };

  const isMobileFrame = viewMode === "mobile";

  return (
    <div className={`flex flex-col items-center w-full ${className}`} dir="rtl">
      {/* Device Viewport Switcher */}
      {allowViewSwitch && (
        <div className="flex items-center gap-2 mb-4 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setViewMode("desktop")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "desktop"
                ? "bg-teal-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            وضع شاشة الحاسوب (Desktop Web)
          </button>
          <button
            onClick={() => setViewMode("mobile")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "mobile"
                ? "bg-teal-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            وضع تطبيق الهاتف (Mobile App)
          </button>
          <button
            onClick={() => setViewMode("responsive")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "responsive"
                ? "bg-teal-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            عرض متجاوب تلقائي
          </button>
        </div>
      )}

      {/* Frame Container */}
      <div
        className={`transition-all duration-300 w-full ${
          isMobileFrame
            ? "max-w-[420px] rounded-[36px] p-4 bg-slate-950 border-[6px] border-slate-800 shadow-2xl"
            : "max-w-3xl rounded-2xl p-6 bg-slate-900/90 border border-slate-800 shadow-xl"
        }`}
      >
        {/* Mobile Top Bar Indicator */}
        {isMobileFrame && (
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-[11px] text-slate-400">
            <span className="font-mono">09:41</span>
            <div className="flex items-center gap-1.5">
              {detectedTelecom ? (
                <span className="font-bold text-[10px]" style={{ color: detectedTelecom.color }}>
                  {detectedTelecom.companyName} 4G+
                </span>
              ) : (
                <span>الشبكة الوطنية</span>
              )}
            </div>
            <span>100% 🔋</span>
          </div>
        )}

        {/* Tool Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md"
              style={{ backgroundColor: selectedBank.color }}
            >
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  رمز مكافحة التصيد (ShieldCode)
                </h3>
                {isPhoneVerified ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    هاتف موثق بـ Twilio OTP
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                    يتطلب توثيق الهاتف
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                حماية الحسابات والمراسلات المالية عبر تفعيل الرمز وتوثيق رقم الهاتف عبر Twilio SMS.
              </p>
            </div>
          </div>

          {/* Protection Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-semibold text-slate-300">
              {enabled ? "مفعّل" : "معطّل"}
            </span>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                enabled ? "bg-teal-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  enabled ? "right-1" : "right-7"
                }`}
              />
            </button>
          </div>
        </div>

        {/* SECTION 1: Phone Verification via Twilio OTP */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-teal-400" />
              توثيق رقم الهاتف عبر خدمة Twilio SMS:
            </label>
            {isPhoneVerified && (
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                تم التوثيق بنجاح
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            {/* Country Selector */}
            <div className="sm:col-span-4">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                disabled={isPhoneVerified}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-teal-500 disabled:opacity-60"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone Input */}
            <div className="sm:col-span-8 flex gap-2">
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setIsPhoneVerified(false);
                  setOtpStep("idle");
                }}
                disabled={isPhoneVerified}
                placeholder="0555 12 34 56"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500 disabled:opacity-60"
                dir="ltr"
              />
              {!isPhoneVerified && (
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  disabled={otpLoading}
                  className="px-3 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-teal-500/20 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                >
                  {otpLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {otpStep === "sent" ? "إعادة إرسال" : "طلب كود OTP"}
                </button>
              )}
            </div>
          </div>

          {/* OTP Verification Input Form */}
          {otpStep === "sent" && !isPhoneVerified && (
            <form onSubmit={handleVerifyOTP} className="pt-2 border-t border-slate-800/60 space-y-2 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="أدخل رمز الـ 6 أرقام (OTP)"
                  className="flex-1 bg-slate-900 border border-teal-500/50 rounded-xl px-3 py-2 text-center text-sm font-mono tracking-[0.3em] font-bold text-teal-300 focus:outline-none"
                  dir="ltr"
                />
                <button
                  type="submit"
                  disabled={otpLoading || otpInput.length !== 6}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs disabled:opacity-50 transition-opacity"
                >
                  {otpLoading ? "جارِ التحقق..." : "تأكيد الرمز وتوثيق الهاتف"}
                </button>
              </div>

              {otpDevHint && (
                <div className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 p-2 rounded-lg border border-cyan-800/40" dir="ltr">
                  💡 {otpDevHint} (ينتهي خلال 5 دقائق)
                </div>
              )}
            </form>
          )}

          {otpSuccessMsg && (
            <p className="text-xs text-emerald-400 flex items-center gap-1 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {otpSuccessMsg}
            </p>
          )}

          {otpError && (
            <p className="text-xs text-rose-400 flex items-center gap-1 animate-fadeIn">
              <AlertTriangle className="w-3.5 h-3.5" />
              {otpError}
            </p>
          )}
        </div>

        {/* SECTION 2: Anti-Phishing Code & Institution Configuration */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Bank / Institution Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-teal-400" />
              المؤسسة المصرفية أو البريدية التابع لها الحساب:
            </label>
            <select
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              {ALGERIAN_BANKS_DATABASE.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.nameAr} ({bank.shortName}) - {bank.categoryLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Secret Anti-Phishing Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              رمز مكافحة التصيد السري الخاص بك (Anti-Phishing Code):
            </label>
            <div className="relative">
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                type={showCode ? "text" : "password"}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="أدخل رمزك (مثال: SAFE2026)"
                maxLength={20}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-11 py-2.5 text-sm text-white font-mono tracking-wider focus:outline-none focus:border-teal-500 transition-colors"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Validation Rules */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px]">
              <span className={`flex items-center gap-1 ${code.length >= 4 && code.length <= 20 ? "text-teal-400" : "text-slate-500"}`}>
                <Check className="w-3 h-3" /> 4 إلى 20 خانة
              </span>
              <span className={`flex items-center gap-1 ${/[A-Za-z\u0621-\u064A]/.test(code) ? "text-teal-400" : "text-slate-500"}`}>
                <Check className="w-3 h-3" /> أحرف
              </span>
              <span className={`flex items-center gap-1 ${/[0-9]/.test(code) ? "text-teal-400" : "text-slate-500"}`}>
                <Check className="w-3 h-3" /> أرقام
              </span>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-teal-500/20 active:scale-95 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ وتأمين الحساب
            </button>

            {savedSuccess && (
              <span className="text-xs text-teal-400 font-semibold flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                تم حفظ وتحديث الإعدادات بنجاح!
              </span>
            )}
          </div>
        </form>

        {/* SECTION 3: Official Secure SMS Dispatch Testing via Twilio */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              اختبار إرسال إشعار رسمي آمن عبر Twilio SMS:
            </h4>
            <button
              onClick={handleSendSecureSMS}
              disabled={sendingSecureSms || !phone}
              type="button"
              className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 font-semibold transition-colors disabled:opacity-50"
            >
              {sendingSecureSms ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              إرسال إشعار رسمي لهاتفي
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60 text-[11px]">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                المرسل: {selectedBank.smsSenderId}
              </span>
              <span className="text-slate-400 font-mono">
                مزود الخدمة: Twilio SMS Gateway
              </span>
            </div>

            {enabled ? (
              <>
                <div className="font-mono text-teal-400 font-bold text-sm mb-1 pb-1">
                  [رمزك الأمني: {code || "••••"}]
                </div>
                <p className="text-slate-300">
                  {selectedBank.shortName}: تم تسجيل الدخول إلى حسابك المالي بنجاح. إذا لم تكن أنت، يرجى تجميد الحساب فوراً.
                </p>
                <div className="text-[10px] text-teal-400/80 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  محمي برمز مكافحة التصيد — إذا لم يطابق الرمز أعلاه رمزك الشخصي فهذه رسالة احتيالية!
                </div>
              </>
            ) : (
              <p className="text-amber-400 text-xs">
                ⚠️ الحماية معطلة. الرسائل ستصلك دون رمز مكافحة التصيد!
              </p>
            )}

            {secureSmsResult && (
              <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] font-mono text-emerald-400 space-y-1">
                <div>✓ تم الإرسال عبر Twilio: {secureSmsResult.messageId}</div>
                <div className="text-slate-400 text-[10px]">إلى: {secureSmsResult.to}</div>
              </div>
            )}
          </div>
        </div>

        {/* Message Verifier */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 mb-2">
            فحص فوري لأي رسالة واردة مشكوك فيها:
          </h4>
          <form onSubmit={handleVerifyTest} className="space-y-2">
            <textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="الصق نص الرسالة الواردة للتأكد هل تحتوي على رمزك السري المشترك أم لا..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-colors"
            >
              فحص الرسالة ومطابقة الرمز
            </button>
          </form>

          {testResult.status && (
            <div
              className={`mt-2.5 p-3 rounded-xl border text-xs font-medium leading-relaxed ${
                testResult.status === "verified"
                  ? "bg-teal-500/10 border-teal-500/40 text-teal-300"
                  : "bg-rose-500/10 border-rose-500/40 text-rose-300"
              }`}
            >
              {testResult.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
