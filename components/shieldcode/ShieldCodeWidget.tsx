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
  Info,
} from "lucide-react";
import { defaultShieldCode } from "@/lib/shieldcode-sdk";

export interface ShieldCodeWidgetProps {
  userId: string;
  initialCode?: string;
  initialEnabled?: boolean;
  bankName?: string;
  theme?: "dark" | "light";
  onCodeUpdated?: (newCode: string, enabled: boolean) => void;
  className?: string;
}

/**
 * <ShieldCodeWidget />
 * The embeddable, plug-and-play Anti-Phishing UI tool.
 * Can be dropped into any React / Next.js / React Native financial dashboard.
 */
export function ShieldCodeWidget({
  userId,
  initialCode = "",
  initialEnabled = false,
  bankName = "البنك",
  theme = "dark",
  onCodeUpdated,
  className = "",
}: ShieldCodeWidgetProps) {
  const [code, setCode] = useState(initialCode);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [showCode, setShowCode] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load existing code on mount
  useEffect(() => {
    const existing = defaultShieldCode.getCode(userId);
    if (existing) {
      setCode(existing.code);
      setEnabled(existing.enabled);
    } else if (initialCode) {
      defaultShieldCode.setCode(userId, initialCode, initialEnabled);
    }
  }, [userId, initialCode, initialEnabled]);

  // Validation
  const validation = defaultShieldCode.validateCode(code);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (enabled && !validation.valid) {
      setErrorMsg(validation.errors[0] || "يرجى إدخال رمز صحيح");
      return;
    }

    try {
      const record = defaultShieldCode.setCode(userId, code.trim(), enabled);
      setSavedSuccess(true);
      if (onCodeUpdated) {
        onCodeUpdated(record.code, record.enabled);
      }
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء حفظ الرمز");
    }
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`rounded-2xl border p-6 shadow-xl transition-all ${
        isDark
          ? "bg-[#0f2040] border-[#1e3a5f] text-white"
          : "bg-white border-gray-200 text-gray-900 shadow-sm"
      } ${className}`}
      dir="rtl"
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-700/60 mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#00b4a0" }}
          >
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              رمز مكافحة التصيد والاحتيال (ShieldCode)
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                أداة أمان مستقلة
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              طبقة الحماية المعتمدة لـ {bankName} للتحقق من مصداقية الرسائل والإشعارات
            </p>
          </div>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-300">
            {enabled ? "مفعّل" : "معطّل"}
          </span>
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
              enabled ? "bg-teal-500" : "bg-gray-600"
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

      <form onSubmit={handleSave} className="space-y-4">
        {/* Code Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            الرمز السري الشخصي (Anti-Phishing Keyword):
          </label>
          <div className="relative">
            <input
              type={showCode ? "text" : "password"}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setErrorMsg("");
              }}
              placeholder="مثال: AYOUB2026 أو رمزك_الخاص"
              disabled={!enabled}
              className={`w-full px-4 py-3 rounded-xl border text-sm font-mono tracking-wider transition-all outline-none ${
                isDark
                  ? "bg-[#071022] border-gray-700 text-white placeholder-gray-500 focus:border-teal-400"
                  : "bg-gray-50 border-gray-300 text-gray-900 focus:border-teal-500"
              } ${!enabled ? "opacity-50 cursor-not-allowed" : ""}`}
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
          <p className="text-[11px] text-gray-400 mt-1">
            اختر كلمة سرية تتكون من 4 إلى 20 حرفاً ورقماً لا يعرفها إلا أنت وخادم {bankName}.
          </p>
        </div>

        {/* Validation indicators */}
        {enabled && (
          <div className="flex flex-wrap gap-2 text-[11px] pt-1">
            <span
              className={`px-2 py-0.5 rounded-full ${
                code.length >= 4 && code.length <= 20
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              ✓ 4 إلى 20 حرف/رقم
            </span>
            <span
              className={`px-2 py-0.5 rounded-full ${
                /[A-Za-z\u0621-\u064A]/.test(code)
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              ✓ يحتوي على أحرف
            </span>
            <span
              className={`px-2 py-0.5 rounded-full ${
                /[0-9]/.test(code)
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              ✓ يحتوي على أرقام
            </span>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success message */}
        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>تم حفظ وربط رمز مكافحة التصيد بنجاح! جميع رسائل {bankName} ستحتوي عليه فوراً.</span>
          </div>
        )}

        {/* Live Notification Preview (The Tool's visual proof) */}
        <div
          className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
            isDark ? "bg-[#071022] border-gray-800" : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-teal-400">
              <Smartphone className="w-3.5 h-3.5" />
              معاينة فورية لشكل الرسالة القادمة من {bankName}:
            </span>
            <span>SMS Preview</span>
          </div>
          <div
            className="p-2.5 rounded-lg font-mono text-[11px] leading-relaxed"
            style={{
              backgroundColor: isDark ? "#0b162a" : "#ffffff",
              border: "1px solid rgba(0, 180, 160, 0.3)",
            }}
          >
            {enabled && code ? (
              <>
                <span className="text-teal-400 font-bold bg-teal-950/50 px-1 py-0.5 rounded">
                  [رمزك: {code}]
                </span>
                <span className="text-gray-300">
                  {" "}
                  {bankName}: رمز التحقق OTP هو 889102. صالح لمدة 10 دقائق.
                </span>
              </>
            ) : (
              <span className="text-amber-400">
                [⚠️ الحماية غير مفعلة] {bankName}: رمز التحقق OTP هو 889102.
              </span>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
          style={{ backgroundColor: "#00b4a0", color: "#000" }}
        >
          <Save className="w-4 h-4" />
          تحديث وحفظ رمز الحماية في {bankName}
        </button>
      </form>
    </div>
  );
}
