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
  Lock,
} from "lucide-react";
import { defaultShieldCode } from "@/lib/shieldcode-sdk";

export interface AntiPhishingSecurityOptionProps {
  userId?: string;
  initialCode?: string;
  initialEnabled?: boolean;
  institutionName?: string;
  onCodeUpdated?: (code: string, enabled: boolean) => void;
  className?: string;
}

/**
 * <AntiPhishingSecurityOption />
 * أداة أمان بسيطة وقابلة للطي تُضاف كخيار أمان ضمن إعدادات حساب المستخدم في أي منصة بنكية أو مالية.
 */
export function AntiPhishingSecurityOption({
  userId = "user_default",
  initialCode = "SAFE2026",
  initialEnabled = true,
  institutionName = "المنصة المالية",
  onCodeUpdated,
  className = "",
}: AntiPhishingSecurityOptionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [showCode, setShowCode] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const validation = defaultShieldCode.validateCode(code);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (enabled && !validation.valid) {
      setErrorMsg(validation.errors[0] || "يرجى إدخال رمز أمني صحيح");
      return;
    }

    try {
      const rec = defaultShieldCode.setCode(userId, code.trim(), enabled);
      setSavedSuccess(true);
      if (onCodeUpdated) {
        onCodeUpdated(rec.code, rec.enabled);
      }
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء الحفظ");
    }
  };

  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/90 text-white overflow-hidden transition-all ${className}`}
      dir="rtl"
    >
      {/* Header bar / Clickable summary */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors text-right"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">رمز مكافحة التصيد (Anti-Phishing Code)</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  enabled
                    ? "bg-teal-500/20 text-teal-300 border-teal-500/30"
                    : "bg-slate-700/50 text-slate-400 border-slate-600"
                }`}
              >
                {enabled ? "مفعّل" : "غير مفعّل"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              رمز أمان شخصي يضمن لك أن الرسائل الواردة صادرة فعلياً من {institutionName}.
            </p>
          </div>
        </div>

        <div className="text-slate-400">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-4 pt-0 border-t border-slate-800/60 bg-slate-950/40">
          <form onSubmit={handleSave} className="space-y-3 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">حالة الحماية:</span>
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                  enabled ? "bg-teal-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    enabled ? "right-1" : "right-6"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">الرمز الشخصي:</label>
              <div className="relative">
                <input
                  type={showCode ? "text" : "password"}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="مثال: SECURE99"
                  maxLength={20}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono tracking-wider focus:outline-none focus:border-teal-500"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all"
              >
                حفظ الإعدادات
              </button>
              {savedSuccess && (
                <span className="text-xs text-teal-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  تم الحفظ بنجاح
                </span>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
