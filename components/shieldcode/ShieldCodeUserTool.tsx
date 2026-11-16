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
  Copy,
  Info,
} from "lucide-react";
import { defaultShieldCode } from "@/lib/shieldcode-sdk";

export interface ShieldCodeUserToolProps {
  userId?: string;
  defaultView?: "responsive" | "mobile" | "desktop";
  allowViewSwitch?: boolean;
  platformName?: string;
  onCodeUpdated?: (code: string, enabled: boolean) => void;
  className?: string;
}

export function ShieldCodeUserTool({
  userId = "user_account_01",
  defaultView = "responsive",
  allowViewSwitch = true,
  platformName = "المنصة المالية المعتمدة",
  onCodeUpdated,
  className = "",
}: ShieldCodeUserToolProps) {
  const [viewMode, setViewMode] = useState<"responsive" | "mobile" | "desktop">(defaultView);
  const [code, setCode] = useState("SECURE2026");
  const [enabled, setEnabled] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  // Load from SDK / LocalStorage on mount
  useEffect(() => {
    const existing = defaultShieldCode.getCode(userId);
    if (existing) {
      setCode(existing.code);
      setEnabled(existing.enabled);
    } else {
      defaultShieldCode.setCode(userId, code, enabled);
    }
  }, [userId]);

  const validation = defaultShieldCode.validateCode(code);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (enabled && !validation.valid) {
      setErrorMsg(validation.errors[0] || "يرجى إدخال رمز أمني صحيح");
      return;
    }

    try {
      const record = defaultShieldCode.setCode(userId, code.trim(), enabled);
      setSavedSuccess(true);
      if (onCodeUpdated) {
        onCodeUpdated(record.code, record.enabled);
      }
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء حفظ الرمز");
    }
  };

  const handleVerifyTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const result = defaultShieldCode.verifyMessage({
      userId,
      fullMessageText: testInput,
      providedCode: code,
    });

    if (result.isAuthentic) {
      setTestResult({
        status: "verified",
        message: `✅ تم التحقق: الرسالة تحتوي على رمزك السري [${code}]. وهي مراسلة أصلية معتمدة بنسبة 100%.`,
      });
    } else {
      setTestResult({
        status: "phishing",
        message: `🚨 تحذير أمني: الرسالة لا تحتوي على رمزك [${code}]. هذه محاولة تصيد احتيالي وانتحال هوية!`,
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
            وضع الحاسوب (Desktop Web)
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
            ? "max-w-[390px] rounded-[36px] p-4 bg-slate-950 border-[6px] border-slate-800 shadow-2xl"
            : "max-w-3xl rounded-2xl p-6 bg-slate-900/90 border border-slate-800 shadow-xl"
        }`}
      >
        {/* Mobile Top Bar Indicator */}
        {isMobileFrame && (
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-[11px] text-slate-400">
            <span className="font-mono">9:41</span>
            <div className="w-16 h-3 bg-slate-800 rounded-full"></div>
            <span>5G 100%</span>
          </div>
        )}

        {/* Tool Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center flex-shrink-0 text-teal-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  رمز مكافحة التصيد والاحتيال
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                  درع الأمان الشخصي
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                رمز أمان سري تحدده بنفسك، يظهر في كل الرسائل الرسمية الموجهة إليك من {platformName}.
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
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              رمز الأمان السري الخاص بك:
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

            {/* Validation Rules Indicator */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px]">
              <span
                className={`flex items-center gap-1 ${
                  code.length >= 4 && code.length <= 20 ? "text-teal-400" : "text-slate-500"
                }`}
              >
                <Check className="w-3 h-3" /> 4 إلى 20 خانة
              </span>
              <span
                className={`flex items-center gap-1 ${
                  /[A-Za-z\u0621-\u064A]/.test(code) ? "text-teal-400" : "text-slate-500"
                }`}
              >
                <Check className="w-3 h-3" /> يحتوي على أحرف
              </span>
              <span
                className={`flex items-center gap-1 ${
                  /[0-9]/.test(code) ? "text-teal-400" : "text-slate-500"
                }`}
              >
                <Check className="w-3 h-3" /> يحتوي على أرقام
              </span>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}
          </div>

          {/* Protected Channels Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              قنوات التواصل المشروطة بحقن الرمز:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <label
                className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                  channels.sms
                    ? "bg-teal-500/10 border-teal-500/40 text-teal-300"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <input
                  type="checkbox"
                  checked={channels.sms}
                  onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                  className="hidden"
                />
                <Smartphone className="w-3.5 h-3.5" />
                <span>الرسائل النصية SMS</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                  channels.email
                    ? "bg-teal-500/10 border-teal-500/40 text-teal-300"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <input
                  type="checkbox"
                  checked={channels.email}
                  onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
                  className="hidden"
                />
                <Mail className="w-3.5 h-3.5" />
                <span>البريد الإلكتروني</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                  channels.push
                    ? "bg-teal-500/10 border-teal-500/40 text-teal-300"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <input
                  type="checkbox"
                  checked={channels.push}
                  onChange={(e) => setChannels({ ...channels, push: e.target.checked })}
                  className="hidden"
                />
                <Bell className="w-3.5 h-3.5" />
                <span>إشعارات التطبيق</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                  channels.receipt
                    ? "bg-teal-500/10 border-teal-500/40 text-teal-300"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <input
                  type="checkbox"
                  checked={channels.receipt}
                  onChange={(e) => setChannels({ ...channels, receipt: e.target.checked })}
                  className="hidden"
                />
                <Receipt className="w-3.5 h-3.5" />
                <span>إيصالات الدفع</span>
              </label>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-teal-500/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              حفظ الرمز وتفعيل الحماية
            </button>

            {savedSuccess && (
              <span className="text-xs text-teal-400 font-semibold flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                تم حفظ الرمز الأمني بنجاح!
              </span>
            )}
          </div>
        </form>

        {/* Live Message Preview */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            معاينة شكل الإشعارات الصادرة إلى هاتفك / بريدك:
          </h4>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 font-sans leading-relaxed">
            {enabled ? (
              <>
                <div className="font-mono text-teal-400 font-bold text-sm mb-1 pb-1 border-b border-slate-800/50">
                  [رمزك الأمني: {code || "••••"}]
                </div>
                <p className="text-slate-300">
                  {platformName}: رمز تأكيد المعاملة المالية OTP هو 774102. صالح لمدة 5 دقائق.
                </p>
                <div className="text-[10px] text-teal-400/80 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  محمي وموثوق — إذا لم يطابق الرمز أعلاه رمزك الشخصي فلا تتابع العملية!
                </div>
              </>
            ) : (
              <p className="text-amber-400/90 text-xs">
                ⚠️ الحماية معطلة حالياً. ستصلك الإشعارات دون رمز مكافحة التصيد، مما يجعلك عرضة للاختراق عبر الرسائل المزيفة.
              </p>
            )}
          </div>
        </div>

        {/* Interactive Verifier Tool */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 mb-2">
            فحص فوري لأي رسالة واردة مشكوك فيها:
          </h4>
          <form onSubmit={handleVerifyTest} className="space-y-2">
            <textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="الصق نص الرسالة الواردة إليك هنا للتأكد هل هي أصلية أم تصيد احتيالي..."
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
              className={`mt-2.5 p-3 rounded-xl border text-xs font-medium ${
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
