"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Smartphone,
  X,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Send,
  Zap,
} from "lucide-react";
import type { MockUser, SMSMessage } from "@/lib/types";
import {
  getSMSMessages,
  sendBankSMS,
  simulatePhishingSMS,
} from "@/lib/sms-service";

interface SMSInboxModalProps {
  user: MockUser;
  isOpen: boolean;
  onClose: () => void;
}

export function SMSInboxModal({ user, isOpen, onClose }: SMSInboxModalProps) {
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "legit" | "phish">("all");

  const refreshMessages = () => {
    setMessages(getSMSMessages(user.id));
  };

  useEffect(() => {
    if (!isOpen) return;
    refreshMessages();

    const handleNewSMS = () => {
      refreshMessages();
    };

    window.addEventListener("baridipay_new_sms", handleNewSMS);
    return () => {
      window.removeEventListener("baridipay_new_sms", handleNewSMS);
    };
  }, [isOpen, user.id]);

  if (!isOpen) return null;

  const handleSimulateLegit = () => {
    sendBankSMS({
      userId: user.id,
      user,
      type: "transfer",
      content: `تم تنفيذ عملية دفع جديدة بمبلغ 3,500.00 دج لصالح متجر الإلكترونيات من حسابك ${user.accountNumber}. الرصيد المتبقي: ${user.balance.toLocaleString("ar-DZ")} دج.`,
    });
    refreshMessages();
  };

  const handleSimulatePhish = () => {
    simulatePhishingSMS(user);
    refreshMessages();
  };

  const handleClear = () => {
    localStorage.removeItem("baridipay_sms_inbox");
    setMessages([]);
  };

  const filtered = messages.filter((m) => {
    if (activeTab === "legit") return !m.isPhishing;
    if (activeTab === "phish") return m.isPhishing;
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      dir="rtl"
    >
      <div
        className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col border"
        style={{
          backgroundColor: "#08111e",
          borderColor: "#1e3a5f",
          maxHeight: "90vh",
        }}
      >
        {/* Top Header */}
        <div
          className="p-4 flex items-center justify-between border-b"
          style={{ borderColor: "#1e3a5f", backgroundColor: "#0f2040" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: "#00b4a0" }}
            >
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">
                  هاتف العميل ({user.phone})
                </h3>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: user.antiphishingEnabled
                      ? "rgba(0,180,160,0.2)"
                      : "rgba(245,166,35,0.2)",
                    color: user.antiphishingEnabled ? "#34d399" : "#fbbf24",
                  }}
                >
                  {user.antiphishingEnabled
                    ? `🛡️ رمز الحساب: ${user.antiphishingCode}`
                    : "⚠️ الرمز غير مفعل"}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                مرتبط بالحساب البنكي: {user.accountNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Simulation Controls */}
        <div
          className="p-3 grid grid-cols-2 gap-2 border-b text-xs"
          style={{ borderColor: "#1e3a5f", backgroundColor: "#0c182c" }}
        >
          <button
            onClick={handleSimulateLegit}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition-all hover:opacity-90"
            style={{
              backgroundColor: "rgba(0,180,160,0.18)",
              color: "#34d399",
              border: "1px solid rgba(0,180,160,0.4)",
            }}
          >
            <CheckCircle2 className="w-4 h-4" />
            رسالة بنك رسمية (مع الرمز)
          </button>

          <button
            onClick={handleSimulatePhish}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition-all hover:opacity-90 animate-pulse"
            style={{
              backgroundColor: "rgba(239,68,68,0.18)",
              color: "#f87171",
              border: "1px solid rgba(239,68,68,0.4)",
            }}
          >
            <AlertTriangle className="w-4 h-4" />
            محاكاة تصيد احتيالي (بدون الرمز)
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e3a5f]/50 text-xs">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-[#00b4a0] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              الكل ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab("legit")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === "legit"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              الرسمية ({messages.filter((m) => !m.isPhishing).length})
            </button>
            <button
              onClick={() => setActiveTab("phish")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === "phish"
                  ? "bg-rose-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              رسائل التصيد ({messages.filter((m) => m.isPhishing).length})
            </button>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-red-400 flex items-center gap-1 text-[11px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              مسح السجل
            </button>
          )}
        </div>

        {/* Messages List (Phone Screen) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
          {filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
              <Smartphone className="w-12 h-12 mb-3 text-gray-500 opacity-50" />
              <p className="text-sm font-medium">لا توجد رسائل SMS حالياً</p>
              <p className="text-xs text-gray-500 mt-1">
                جرّب الضغط على أحد أزرار المحاكاة في الأعلى لإرسال رسالة تجريبية
              </p>
            </div>
          ) : (
            filtered.map((msg) => {
              const hasCode =
                !msg.isPhishing &&
                msg.antiphishingCode &&
                user.antiphishingEnabled;

              return (
                <div
                  key={msg.id}
                  className={`rounded-2xl p-4 transition-all border ${
                    msg.isPhishing
                      ? "bg-red-950/30 border-red-500/40"
                      : "bg-[#0f2040] border-[#1e3a5f]"
                  }`}
                >
                  {/* Sender & Timestamp */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white flex items-center gap-1">
                        🏦 {msg.sender}
                      </span>
                      {msg.isPhishing && (
                        <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">
                          انتحال هوية (Spoofed)
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400" dir="ltr">
                      {new Date(msg.timestamp).toLocaleTimeString("ar-DZ", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Anti-Phishing Code Badge (If Genuine) */}
                  {hasCode ? (
                    <div className="mb-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                      <Shield className="w-3.5 h-3.5" />
                      رمز مكافحة التصيد الخاص بك: [{msg.antiphishingCode}]
                    </div>
                  ) : null}

                  {/* Message Body */}
                  <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line font-mono">
                    {msg.text}
                  </p>

                  {/* Status Banner / Verdict */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                    {msg.isPhishing ? (
                      <div className="flex items-center gap-1.5 text-red-400 font-bold">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>
                          ⚠️ خطر: الرسالة لا تحتوي على رمزك [
                          {user.antiphishingCode || "غير محدد"}] — تصيد احتيالي!
                        </span>
                      </div>
                    ) : hasCode ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>
                          ✅ رسالة حقيقية موثوقة — تحمل بصمتك المسجلة في البنك
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>تنبيه: ميزة رمز مكافحة التصيد غير مفعلة بحسابك</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info note */}
        <div
          className="p-3 border-t text-[11px] text-gray-400 flex items-center justify-between"
          style={{ borderColor: "#1e3a5f", backgroundColor: "#0c182c" }}
        >
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#00b4a0]" />
            حماية البنك ضد تقنية SMS Spoofing بنظام Binance
          </span>
          <span className="text-gray-500">مشروع ShieldCode</span>
        </div>
      </div>
    </div>
  );
}
