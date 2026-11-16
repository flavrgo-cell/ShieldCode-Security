"use client";

import React, { useState } from "react";
import {
  Shield,
  Key,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  Smartphone,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import type { MockUser } from "@/lib/types";
import { defaultShieldCode } from "@/lib/shieldcode-sdk";
import { sendBankSMS } from "@/lib/sms-service";

interface AntiPhishingSecurityOptionProps {
  user: MockUser;
  bankName?: string;
  onUpdate?: (updatedUser: MockUser) => void;
  onOpenSMSModal?: () => void;
}

/**
 * <AntiPhishingSecurityOption />
 * أداة أمان بسيطة تُضاف كخيار أمان ضمن إعدادات الحساب المالي للمستخدم
 * مصممة لتكون خفيفة، مدمجة، وقابلة للإضافة في أي تطبيق بنكي جزائري أو دولي.
 */
export function AntiPhishingSecurityOption({
  user,
  bankName = "بريدي موب",
  onUpdate,
  onOpenSMSModal,
}: AntiPhishingSecurityOptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [code, setCode] = useState(user.antiphishingCode || "");
  const [enabled, setEnabled] = useState(user.antiphishingEnabled || false);
  const [showCode, setShowCode] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [testSent, setTestSent] = useState(false);

  // Validation
  const validation = defaultShieldCode.validateCode(code);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (enabled && !validation.valid) {
      setErrorMsg(validation.errors[0] || "يرجى إدخال رمز صحيح");
      return;
    }

    const trimmedCode = code.trim();
    defaultShieldCode.setCode(user.id, trimmedCode, enabled);

    const updatedUser: MockUser = {
      ...user,
      antiphishingCode: trimmedCode,
      antiphishingEnabled: enabled,
    };

    if (onUpdate) {
      onUpdate(updatedUser);
    }

    setSavedSuccess(true);

    // Send immediate confirmation SMS
    if (enabled && trimmedCode) {
      sendBankSMS({
        userId: user.id,
        user: updatedUser,
        type: "security",
        content: `تم ربط رمز مكافحة التصيد [${trimmedCode}] بحسابك في ${bankName}. جميع رسائل البنك المستقبلية ستحمل هذا الرمز لضمان أمانك.`,
      });
    }

    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSendTestSMS = () => {
    if (!enabled || !code.trim()) {
      alert("يرجى تفعيل الرمز وحفظه أولاً لإجراء اختبار تجريبي.");
      return;
    }

    sendBankSMS({
      userId: user.id,
      user: { ...user, antiphishingCode: code.trim(), antiphishingEnabled: enabled },
      type: "otp",
      content: `رمز التحقق السريع لعمليتك هو 774109. هذا إشعار تجريبي لاختبار ظهور رمز الحماية الشخصي.`,
    });

    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);

    if (onOpenSMSModal) {
      setTimeout(() => onOpenSMSModal(), 400);
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        enabled
          ? "border-teal-500/50 bg-[#0c1830] shadow-lg shadow-teal-500/5"
          : "border-gray-800 bg-[#0f2040]"
      }`}
      dir="rtl"
    >
      {/* ── Collapsed / Main Security Option Row ── */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors rounded-2xl select-none"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              enabled
                ? "bg-teal-500/20 text-teal-400 border border-teal-500/40"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm md:text-base">
                رمز مكافحة التصيد والاحتيال (Anti-Phishing Code)
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  enabled
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                    : "bg-gray-800 text-gray-400"
                }`}
              >
                {enabled ? `مفعّل: [${user.antiphishingCode || code}]` : "غير مفعّل"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              يظهر رمزك السري في بداية كل رسالة SMS وإيميل رسمية من البنك لكشف أي محاولة انتحال فوراً
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-200 transition-all flex items-center gap-1"
          >
            {isExpanded ? "إغلاق" : "إدارة الرمز"}
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* ── Expanded Management Drawer ── */}
      {isExpanded && (
        <div className="px-5 pb-6 pt-2 border-t border-gray-800/80 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Quick Explanation */}
          <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-500/20 text-xs text-teal-200/90 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>كيف يحميك هذا الخيار؟</strong> بمجرد تفعيل هذا الخيار وكتابة كلمتك السرية، لن تصلك أي رسالة رسمية من {bankName} إلا وهي تبدأ برمزك. إذا وصلتك رسالة بدون الرمز، فأنت أمام محاولة تصيد احتيالي 100%!
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-900/60 border border-gray-800">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  الكلمة السرية الخاصة بك (حروف وأرقام):
                </label>
                <div className="relative max-w-md">
                  <input
                    type={showCode ? "text" : "password"}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setErrorMsg("");
                    }}
                    placeholder="مثال: AYOUB2026"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono text-sm tracking-wider outline-none focus:border-teal-500 transition-all"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Toggle switch inside */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-xs text-gray-300">
                  {enabled ? "الحماية مفعّلة" : "الحماية معطّلة"}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/80 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/80 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>تم حفظ الرمز وتفعيله في حسابك بنجاح! تم إرسال إشعار SMS تأكيدي لهاتفك.</span>
              </div>
            )}

            {/* Live Message Preview */}
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 text-xs space-y-2">
              <span className="text-gray-400 text-[11px] block font-medium">
                📱 هكذا ستظهر رسائل الـ SMS القادمة من {bankName} على هاتفك:
              </span>
              <div
                className="p-3 rounded-lg font-mono text-xs leading-relaxed"
                style={{ backgroundColor: "#071022", border: "1px solid rgba(0,180,160,0.25)" }}
              >
                {enabled && code.trim() ? (
                  <>
                    <span className="text-teal-400 font-bold bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-500/30">
                      [رمزك: {code.trim()}]
                    </span>
                    <span className="text-gray-300">
                      {" "}
                      {bankName}: رمز تأكيد المعاملة OTP هو 774109. لا تشاركه مع أي شخص.
                    </span>
                  </>
                ) : (
                  <span className="text-amber-400">
                    [⚠️ لم يتم تعيين رمز أمان] {bankName}: رمز تأكيد المعاملة OTP هو 774109.
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-teal-500 hover:bg-teal-400 text-black flex items-center gap-2 transition-all shadow-md shadow-teal-500/20"
              >
                <Save className="w-4 h-4" />
                حفظ التغييرات في الحساب
              </button>

              <button
                type="button"
                onClick={handleSendTestSMS}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 flex items-center gap-2 transition-all"
              >
                <Smartphone className="w-4 h-4 text-teal-400" />
                {testSent ? "✓ تم الإرسال!" : "إرسال SMS تجريبي للهاتف"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
