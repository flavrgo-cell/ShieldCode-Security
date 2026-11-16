"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Key,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Info,
  Save,
  Send,
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
} from "lucide-react";
import { getCurrentUser, updateCurrentUserCode } from "@/lib/auth";
import type { MockUser } from "@/lib/types";
import { sendBankSMS, ensureInitialSMS } from "@/lib/sms-service";
import { SMSInboxModal } from "@/components/sms-inbox-modal";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [code, setCode] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.replace("/login");
    } else {
      setUser(currentUser);
      setCode(currentUser.antiphishingCode || "");
      setEnabled(currentUser.antiphishingEnabled || false);
      ensureInitialSMS(currentUser);
      setLoading(false);
    }
  }, [router]);

  if (loading || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0a1628" }}
      >
        <div
          className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "#00b4a0", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  // Code validation rules
  const hasLetters = /[A-Za-z\u0621-\u064A]/.test(code);
  const hasDigits = /[0-9\u0660-\u0669]/.test(code);
  const validLength = code.length >= 4 && code.length <= 20;
  const noSpaces = !/\s/.test(code);
  const isCodeValid = hasLetters && hasDigits && validLength && noSpaces;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (enabled && !isCodeValid) return;

    const trimmedCode = code.trim();
    updateCurrentUserCode(trimmedCode, enabled);

    const updatedUser: MockUser = {
      ...user,
      antiphishingCode: trimmedCode,
      antiphishingEnabled: enabled,
    };
    setUser(updatedUser);
    setSavedSuccess(true);

    // Send an immediate confirmation SMS to user's phone!
    if (enabled) {
      sendBankSMS({
        userId: user.id,
        user: updatedUser,
        type: "security",
        content: `تم تحديث رمز مكافحة التصيد [${trimmedCode}] وربطه بحسابك البنكي ${user.accountNumber}. جميع رسائل البنك المستقبلية ستحتوي على هذا الرمز.`,
      });
    }

    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleSendTestSMS = () => {
    if (!user.antiphishingEnabled || !user.antiphishingCode) {
      alert("يرجى تفعيل رمز مكافحة التصيد وحفظه أولاً لإرسال رسالة تجريبية.");
      return;
    }

    sendBankSMS({
      userId: user.id,
      user,
      type: "otp",
      content: `رمز التحقق السريع لعمليتك هو 593812. هذا إشعار تجريبي للتأكد من ظهور رمز الحماية في رسائل SMS.`,
    });

    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
    setSmsModalOpen(true);
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen pb-16 pt-4 px-4 max-w-4xl mx-auto"
      style={{ color: "#ffffff" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e3a5f]">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-[#00b4a0]" />
            إعدادات الأمان وحماية الحساب البنكي
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            إدارة رمز مكافحة التصيد الاحتيالي (ShieldCode) المرتبط بحسابك{" "}
            <span className="text-white font-mono font-bold">
              {user.accountNumber}
            </span>
          </p>
        </div>

        <button
          onClick={() => setSmsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 shadow-lg"
          style={{
            backgroundColor: "#00b4a0",
            color: "#ffffff",
          }}
        >
          <Smartphone className="w-4 h-4" />
          صندوق رسائل الهاتف (SMS)
        </button>
      </div>

      {/* Account Identity Card */}
      <div
        className="rounded-2xl p-5 mb-6 border"
        style={{ backgroundColor: "#0f2040", borderColor: "#1e3a5f" }}
      >
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          بيانات الحساب البنكي المعتمد
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-[#091526] p-3 rounded-xl border border-white/5">
            <span className="text-gray-400 text-xs block mb-1">صاحب الحساب</span>
            <span className="font-bold text-white">{user.name}</span>
          </div>
          <div className="bg-[#091526] p-3 rounded-xl border border-white/5">
            <span className="text-gray-400 text-xs block mb-1">
              رقم الحساب البريدي (CCP)
            </span>
            <span className="font-bold text-[#00b4a0] font-mono">
              {user.accountNumber}
            </span>
          </div>
          <div className="bg-[#091526] p-3 rounded-xl border border-white/5">
            <span className="text-gray-400 text-xs block mb-1">
              رقم الهاتف المسجل لاستلام SMS
            </span>
            <span className="font-bold text-white font-mono">{user.phone}</span>
          </div>
        </div>
      </div>

      {/* Main Feature: Binance-style Anti-Phishing Code */}
      <div
        className="rounded-3xl p-6 mb-6 border shadow-xl relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #0f2244 0%, #0a172e 100%)",
          borderColor: user.antiphishingEnabled ? "#00b4a0" : "#f5a623",
        }}
      >
        {/* Decorative background glow */}
        <div
          className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ backgroundColor: "#00b4a0" }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10">
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: user.antiphishingEnabled
                  ? "rgba(0,180,160,0.2)"
                  : "rgba(245,166,35,0.2)",
                color: user.antiphishingEnabled ? "#00b4a0" : "#f5a623",
              }}
            >
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  رمز مكافحة التصيد الاحتيالي (Anti-Phishing Code)
                </h3>
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-bold"
                  style={{
                    backgroundColor: user.antiphishingEnabled
                      ? "rgba(52,211,153,0.15)"
                      : "rgba(245,166,35,0.15)",
                    color: user.antiphishingEnabled ? "#34d399" : "#fbbf24",
                  }}
                >
                  {user.antiphishingEnabled ? "مفعل ونشط" : "غير مفعل"}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1 max-w-xl leading-relaxed">
                رمز سري خاص بك يظهر في جميع رسائل SMS الرسمية من البنك. إذا
                وصلتك رسالة تدعي أنها من البنك ولا تحتوي على هذا الرمز، فهي
                محاولة تصيد احتيالي (Smishing) وانتحال هوية.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#00b4a0]"></div>
          </label>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              الرمز السري المخصص (حروف وأرقام):
            </label>
            <div className="relative max-w-md">
              <input
                type={showCode ? "text" : "password"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={!enabled}
                placeholder="مثال: AYOUB2026 أو ايوب2026"
                maxLength={20}
                className="w-full bg-[#071020] border-2 rounded-2xl py-3 px-4 text-white text-lg font-mono font-bold tracking-wider placeholder:text-gray-600 focus:outline-none transition-colors"
                style={{
                  borderColor: !enabled
                    ? "#1e3a5f"
                    : isCodeValid
                    ? "#00b4a0"
                    : "#f87171",
                  opacity: enabled ? 1 : 0.6,
                }}
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
              >
                {showCode ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Validation Checklist */}
            {enabled && (
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                <span
                  className={`flex items-center gap-1 ${
                    hasLetters ? "text-emerald-400" : "text-gray-400"
                  }`}
                >
                  {hasLetters ? "✔" : "○"} يحتوي على حروف
                </span>
                <span
                  className={`flex items-center gap-1 ${
                    hasDigits ? "text-emerald-400" : "text-gray-400"
                  }`}
                >
                  {hasDigits ? "✔" : "○"} يحتوي على أرقام
                </span>
                <span
                  className={`flex items-center gap-1 ${
                    validLength ? "text-emerald-400" : "text-gray-400"
                  }`}
                >
                  {validLength ? "✔" : "○"} من 4 إلى 20 خانة
                </span>
                <span
                  className={`flex items-center gap-1 ${
                    noSpaces ? "text-emerald-400" : "text-gray-400"
                  }`}
                >
                  {noSpaces ? "✔" : "○"} بدون مسافات
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={enabled && !isCodeValid}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              style={{
                backgroundColor: "#00b4a0",
                color: "#ffffff",
              }}
            >
              <Save className="w-4 h-4" />
              حفظ الرمز وربطه بالحساب البنكي
            </button>

            {user.antiphishingEnabled && user.antiphishingCode && (
              <button
                type="button"
                onClick={handleSendTestSMS}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/10 border border-white/20 text-gray-200"
              >
                <Send className="w-4 h-4 text-[#00b4a0]" />
                تجربة إرسال رسالة SMS إلى هاتفي
              </button>
            )}
          </div>

          {/* Success Alert */}
          {savedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>
                تم حفظ رمز مكافحة التصيد بنجاح! تم ربطه بحسابك البنكي وتم إرسال
                إشعار تأكيد إلى رقم هاتفك المسجل ({user.phone}).
              </span>
            </div>
          )}

          {testSent && (
            <div className="p-3.5 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 text-sm flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>
                تم إرسال رسالة SMS بنكية تجريبية تتضمن رمزك السري إلى هاتفك!
              </span>
            </div>
          )}
        </form>
      </div>

      {/* How it Protects You: Technical Breakdown */}
      <div
        className="rounded-2xl p-6 border"
        style={{ backgroundColor: "#0f2040", borderColor: "#1e3a5f" }}
      >
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-[#00b4a0]" />
          كيف يحميك هذا الرمز من هجمات انتحال الرسائل (SMS Spoofing)؟
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
          <div className="bg-[#091526] p-4 rounded-xl border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
              <CheckCircle2 className="w-4 h-4" />
              الرسائل البنكية الرسمية
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              عندما يرسل البنك رمز تحقق (OTP) أو إشعار تحويل أو كشف رصيد، يسحب
              الخادم رمزك السري تلقائياً من قاعدة البيانات ويضعه في الترويسة:
              <br />
              <span className="font-mono text-emerald-300 block mt-1 bg-black/40 p-1.5 rounded">
                [رمزك: {user.antiphishingCode || "AYOUB2026"}] رمز التحقق هو:
                482910
              </span>
            </p>
          </div>

          <div className="bg-[#091526] p-4 rounded-xl border border-rose-500/20">
            <div className="flex items-center gap-2 text-rose-400 font-bold mb-2">
              <AlertTriangle className="w-4 h-4" />
              رسائل التصيد الاحتيالي (Smishing)
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              حتى لو استطاع المحتال تزوير اسم المرسل ليظهر باسم{" "}
              <strong>BARIDIMOB</strong>، فهو مستحيل أن يعرف رمزك السري:
              <br />
              <span className="font-mono text-rose-300 block mt-1 bg-black/40 p-1.5 rounded" dir="ltr">
                عميلنا تم قفل حسابك، لتفعيله ادخل هنا: https://baridimob-poste.com/login
              </span>
              <span className="text-[11px] text-rose-400 block mt-1">
                ⬅️ غياب الرمز يفضح المحتال فوراً!
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* SMS Inbox Modal */}
      <SMSInboxModal
        user={user}
        isOpen={smsModalOpen}
        onClose={() => setSmsModalOpen(false)}
      />
    </main>
  );
}
