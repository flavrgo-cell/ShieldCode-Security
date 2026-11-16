"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Key,
  Smartphone,
  Lock,
  Fingerprint,
  PhoneCall,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Info,
  Send,
  Zap,
} from "lucide-react";
import { getCurrentUser, updateCurrentUserCode } from "@/lib/auth";
import type { MockUser } from "@/lib/types";
import { ensureInitialSMS, sendBankSMS, simulatePhishingSMS } from "@/lib/sms-service";
import { SMSInboxModal } from "@/components/sms-inbox-modal";
import { AntiPhishingSecurityOption } from "@/components/shieldcode/AntiPhishingSecurityOption";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.replace("/login");
    } else {
      setUser(currentUser);
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

  const handleUserUpdate = (updated: MockUser) => {
    setUser(updated);
    updateCurrentUserCode(updated.antiphishingCode, updated.antiphishingEnabled);
  };

  const handleTestLegit = () => {
    sendBankSMS({
      userId: user.id,
      user,
      type: "otp",
      content: "رمز التحقق OTP الخاص بك هو: 881902 لتأكيد تسجيل الدخول لجهاز جديد.",
    });
    setNotificationStatus("✅ تم إرسال رسالة رسمية تحمل رمزك السري إلى محاكي الهاتف");
    setTimeout(() => setNotificationStatus(null), 3000);
    setSmsModalOpen(true);
  };

  const handleTestPhish = () => {
    simulatePhishingSMS({
      userId: user.id,
      accountNumber: user.accountNumber,
    });
    setNotificationStatus("🚨 تم إرسال رسالة تصيد مزورة (بدون رمز) لاختبار كشف الاحتيال");
    setTimeout(() => setNotificationStatus(null), 3000);
    setSmsModalOpen(true);
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen pb-16 pt-4 px-4 max-w-4xl mx-auto text-white"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#1e3a5f]">
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#00b4a0" }}
            >
              <Shield className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                مركز الأمان وحماية الحساب المالي
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                خيارات الأمان المعتمدة لحسابك المصرفي{" "}
                <span className="text-teal-400 font-mono font-bold">
                  {user.accountNumber}
                </span>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setSmsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-teal-300 border border-teal-500/30 transition-all shadow-md self-start sm:self-auto"
        >
          <Smartphone className="w-4 h-4 text-teal-400" />
          فتح محاكي هاتف العميل (SMS Inbox)
        </button>
      </div>

      {/* Account Info Pill */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-xs">
        <div className="p-3 rounded-xl bg-[#0f2040] border border-[#1e3a5f] flex justify-between items-center">
          <span className="text-gray-400">صاحب الحساب:</span>
          <span className="font-bold text-white">{user.name}</span>
        </div>
        <div className="p-3 rounded-xl bg-[#0f2040] border border-[#1e3a5f] flex justify-between items-center">
          <span className="text-gray-400">رقم الهاتف للإشعارات:</span>
          <span className="font-bold text-white font-mono">{user.phone}</span>
        </div>
        <div className="p-3 rounded-xl bg-[#0f2040] border border-[#1e3a5f] flex justify-between items-center">
          <span className="text-gray-400">مستوى الأمان الحالي:</span>
          <span className="font-bold text-teal-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {user.antiphishingEnabled ? "عالي (محمي بـ ShieldCode)" : "متوسط (غير محمي)"}
          </span>
        </div>
      </div>

      {/* ── THE SECURITY OPTIONS LIST (خيارات الأمان والحماية) ── */}
      <div className="space-y-3 mb-8">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          خيارات الأمان والتحقق المالي المتاحة لحسابك:
        </div>

        {/* 1. Password Option */}
        <div className="p-4 rounded-2xl bg-[#0f2040] border border-gray-800 flex items-center justify-between opacity-80">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gray-800 text-gray-300 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">كلمة المرور للدخول (Password)</div>
              <div className="text-xs text-gray-400">تم تعيين كلمة مرور قوية • آخر تحديث منذ 20 يوماً</div>
            </div>
          </div>
          <span className="text-xs text-gray-400 font-semibold px-2.5 py-1 rounded bg-gray-800">
            مفعّل
          </span>
        </div>

        {/* 2. Biometrics Option */}
        <div className="p-4 rounded-2xl bg-[#0f2040] border border-gray-800 flex items-center justify-between opacity-80">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gray-800 text-gray-300 flex items-center justify-center">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">بصمة الإصبع والوجه (Biometrics)</div>
              <div className="text-xs text-gray-400">تسجيل دخول سريع وآمن عبر قارئ البصمة بالهاتف</div>
            </div>
          </div>
          <span className="text-xs text-gray-400 font-semibold px-2.5 py-1 rounded bg-gray-800">
            مفعّل
          </span>
        </div>

        {/* 3. 2FA Two Factor Authentication */}
        <div className="p-4 rounded-2xl bg-[#0f2040] border border-gray-800 flex items-center justify-between opacity-80">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gray-800 text-gray-300 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">المصادقة الثنائية (SMS OTP 2FA)</div>
              <div className="text-xs text-gray-400">إرسال كود تحقق مؤقت عند كل عملية مالية أو تحويل</div>
            </div>
          </div>
          <span className="text-xs text-gray-400 font-semibold px-2.5 py-1 rounded bg-gray-800">
            مفعّل
          </span>
        </div>

        {/* ── 4. THE CORE TOOL: Anti-Phishing Security Option (خيارنا الأمني البسيط) ── */}
        <AntiPhishingSecurityOption
          user={user}
          bankName="بريدي موب (BaridiMob)"
          onUpdate={handleUserUpdate}
          onOpenSMSModal={() => setSmsModalOpen(true)}
        />

        {/* 5. Trusted Devices */}
        <div className="p-4 rounded-2xl bg-[#0f2040] border border-gray-800 flex items-center justify-between opacity-80">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gray-800 text-gray-300 flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">الأجهزة الموثوقة والجلسات (Active Sessions)</div>
              <div className="text-xs text-gray-400">متصل الآن من هاتف هواوي وجهاز حاسوب محلي</div>
            </div>
          </div>
          <span className="text-xs text-gray-400 font-semibold px-2.5 py-1 rounded bg-gray-800">
            2 جهاز نشط
          </span>
        </div>
      </div>

      {/* ── Demo Testing Section for the Jury ── */}
      <div className="p-5 rounded-2xl bg-[#0b162a] border border-teal-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-teal-400" />
            <h3 className="font-bold text-sm text-white">
              محاكي كشف التصيد الاحتيالي أمام اللجنة (Live Jury Testing)
            </h3>
          </div>
          <span className="text-[10px] text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/30">
            دليل إثبات الفكرة
          </span>
        </div>
        <p className="text-xs text-gray-400">
          اضغط أحد الزرين لإرسال رسالة تجريبية لمحاكي الهاتف ومقارنة النتيجة مباشرة:
        </p>

        {notificationStatus && (
          <div className="p-2.5 rounded-lg bg-teal-950/50 border border-teal-500/40 text-xs text-teal-200">
            {notificationStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleTestLegit}
            className="p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-right flex items-center justify-between transition-all"
          >
            <div>
              <div className="text-white font-semibold">1. إرسال SMS بنكي رسمي ✅</div>
              <div className="text-[11px] text-emerald-400/80">يحمل رمزك السري [{user.antiphishingCode || "AYOUB2026"}]</div>
            </div>
            <Send className="w-4 h-4" />
          </button>

          <button
            onClick={handleTestPhish}
            className="p-3 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 text-xs font-bold text-right flex items-center justify-between transition-all"
          >
            <div>
              <div className="text-white font-semibold">2. إرسال SMS تصيد مزور 🚨</div>
              <div className="text-[11px] text-red-400/80">رسالة انتحال بدون الرمز السري</div>
            </div>
            <AlertTriangle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SMS Modal */}
      <SMSInboxModal
        user={user}
        isOpen={smsModalOpen}
        onClose={() => setSmsModalOpen(false)}
      />
    </main>
  );
}
