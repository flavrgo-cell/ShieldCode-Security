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

export function ShieldCodeUserTool({
  userId = "0555123456",
  defaultView = "responsive",
  allowViewSwitch = true,
  onCodeUpdated,
  className = "",
}: ShieldCodeUserToolProps) {
  const [viewMode, setViewMode] = useState<"responsive" | "mobile" | "desktop">(defaultView);

  // Form Fields
  const [phone, setPhone] = useState(userId.startsWith("0") ? userId : "0555123456");
  const [selectedBankId, setSelectedBankId] = useState("algerie-poste");
  const [accountNumber, setAccountNumber] = useState("");
  const [code, setCode] = useState("SECURE2026");
  const [enabled, setEnabled] = useState(true);
  const [showCode, setShowCode] = useState(false);

  // Status & Feedback
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Live Auto-Detected Entities
  const [detectedTelecom, setDetectedTelecom] = useState<AlgerianTelecomOperator | null>(null);
  const [selectedBank, setSelectedBank] = useState<AlgerianBank>(ALGERIAN_BANKS_DATABASE[1]);

  // Channels
  const [channels, setChannels] = useState({
    sms: true,
    email: true,
    push: true,
    receipt: false,
  });

  // Test Verifier
  const [testInput, setTestInput] = useState("");
  const [testResult, setTestResult] = useState<{
    status: "verified" | "phishing" | null;
    message: string;
  }>({ status: null, message: "" });

  // Live Simulated SMS Sending test
  const [simulatedRoute, setSimulatedRoute] = useState<any>(null);

  // Effect: Auto-detect carrier when phone changes
  useEffect(() => {
    const carrier = detectAlgerianTelecom(phone);
    setDetectedTelecom(carrier);
  }, [phone]);

  // Effect: Update selected bank details
  useEffect(() => {
    const bank = detectAlgerianBank(selectedBankId);
    if (bank) setSelectedBank(bank);
  }, [selectedBankId]);

  // Validation
  const validation = defaultShieldCode.validateCode(code);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (enabled && !validation.valid) {
      setErrorMsg(validation.errors[0] || "يرجى إدخال رمز أمني صحيح");
      return;
    }

    setSaving(true);
    try {
      // Call Live Algerian API
      const res = await fetch("/api/v1/algeria/link-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          bankId: selectedBankId,
          code: code.trim(),
          accountNumber: accountNumber.trim(),
          enabled,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل حفظ البيانات في قاعدة البيانات الحية");
      }

      defaultShieldCode.setCode(phone.trim(), code.trim(), enabled);
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

  const handleSendTestOTP = async () => {
    try {
      const res = await fetch("/api/v1/algeria/route-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          bankId: selectedBankId,
          rawMessage: `رمز تأكيد المعاملة المالية OTP هو: ${Math.floor(100000 + Math.random() * 900000)}. صالح لمدة 5 دقائق.`,
          channel: "sms",
        }),
      });
      const data = await res.json();
      setSimulatedRoute(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const result = defaultShieldCode.verifyMessage({
      userId: phone,
      fullMessageText: testInput,
      providedCode: code,
    });

    if (result.isAuthentic) {
      setTestResult({
        status: "verified",
        message: `✅ موثق وأصلي! الرسالة تحتوي على رمزك السري [${code}]. وهي صادرة من خوادم ${selectedBank.nameAr} عبر شبكة ${detectedTelecom ? detectedTelecom.companyName : "الهاتف الجزائري"}.`,
      });
    } else {
      setTestResult({
        status: "phishing",
        message: `🚨 إنذار تصيد خطير: الرسالة لا تحتوي على رمزك الشخصي [${code}]. لا تضغط على أي رابط فهذه رسالة مزورة تنتحل اسم ${selectedBank.shortName}!`,
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
            ? "max-w-[410px] rounded-[36px] p-4 bg-slate-950 border-[6px] border-slate-800 shadow-2xl"
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
                  رمز مكافحة التصيد (ShieldCode DZ)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                  قاعدة البيانات الحية
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                حماية الحسابات البنكية والبريدية الجزائرية عبر متعاملي الهاتف النقال (موبيليس، جيزي، أوريدو).
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Algerian Bank / Postal Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-teal-400" />
              اختر البنك أو المؤسسة المالية الجزائرية:
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

          {/* Algerian Phone Number + Live Carrier Auto-Detection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                رقم الهاتف النقال الجزائري:
              </label>

              {/* Detected Operator Badge */}
              {detectedTelecom ? (
                <span
                  className="text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border animate-fadeIn"
                  style={{
                    backgroundColor: detectedTelecom.bgLight,
                    color: detectedTelecom.color,
                    borderColor: detectedTelecom.color,
                  }}
                >
                  <Radio className="w-3 h-3" />
                  متعامل: {detectedTelecom.companyName} ({detectedTelecom.carrierCode})
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">أدخل (05 / 06 / 07) لكشف المتعامل تلقائياً</span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثال: 0555123456 أو 0661998877 أو 0770112233"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-3 pl-24 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                dir="ltr"
              />
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                +213 DZ
              </div>
            </div>
          </div>

          {/* Account / RIP / CCP / CIB Card (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              رقم الحساب البريدي / البنكي (RIP / CCP / CIB):
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="مثال: 00799999001234567890 (أو رقم بطاقة CIB / الذهبية)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
              dir="ltr"
            />
          </div>

          {/* Secret Anti-Phishing Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              رمز مكافحة التصيد السري الخاص بك:
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
              حفظ وتوثيق الرمز في الشبكة الوطنية
            </button>

            {savedSuccess && (
              <span className="text-xs text-teal-400 font-semibold flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                تم التوثيق في قاعدة البيانات الحية!
              </span>
            )}
          </div>
        </form>

        {/* Live Message Preview Routed via Algerian Telecom */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              معاينة الإشعار الصادر عبر بوابة {selectedBank.shortName} وشبكة {detectedTelecom ? detectedTelecom.companyName : "المتعامل"}:
            </h4>
            <button
              onClick={handleSendTestOTP}
              type="button"
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 font-semibold"
            >
              <Send className="w-3 h-3" />
              اختبار توليد OTP حي
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
            {/* Header / Sender ID */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60 text-[11px]">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                المرسل: {selectedBank.smsSenderId}
              </span>
              <span className="text-slate-400 font-mono">
                عبر {detectedTelecom ? detectedTelecom.companyName : "SMS Gateway"} ({detectedTelecom?.smscCenter || "SMSC"})
              </span>
            </div>

            {enabled ? (
              <>
                <div className="font-mono text-teal-400 font-bold text-sm mb-1 pb-1">
                  [رمزك: {code || "••••"}]
                </div>
                <p className="text-slate-300">
                  {simulatedRoute ? simulatedRoute.protectedMessage.replace(/^\[.*?\]\n?/, '') : `${selectedBank.shortName}: رمز التحقق OTP لتأكيد العملية هو 884102. صالح لمدة 5 دقائق.`}
                </p>
                <div className="text-[10px] text-teal-400/80 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  إذا لم تجد الرمز [{code}] في بداية الرسالة، فهذه محاولة احتيال وانتحال هوية!
                </div>
              </>
            ) : (
              <p className="text-amber-400 text-xs">
                ⚠️ الحماية معطلة. الرسائل ستصلك دون رمز مكافحة التصيد!
              </p>
            )}
          </div>
        </div>

        {/* Message Verifier */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 mb-2">
            فحص فوري لأي رسالة SMS أو إيميل وارد للتأكد من أصالته:
          </h4>
          <form onSubmit={handleVerifyTest} className="space-y-2">
            <textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="الصق نص الرسالة الواردة للتأكد هل هي صادرة من بنكك الحقيقي أم من محتال..."
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
