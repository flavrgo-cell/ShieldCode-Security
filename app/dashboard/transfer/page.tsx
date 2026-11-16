"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Shield,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  CreditCard,
  Lock,
} from "lucide-react";
import { getCurrentUser, saveCurrentUser } from "@/lib/auth";
import { MOCK_USERS, addTransaction } from "@/lib/mock-data";
import type { MockUser, Transaction } from "@/lib/types";
import { sendBankSMS } from "@/lib/sms-service";
import { SMSInboxModal } from "@/components/sms-inbox-modal";

export default function TransferPage() {
  const router = useRouter();
  const [user, setUser] = useState<MockUser | null>(null);
  const [recipientCCP, setRecipientCCP] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // OTP Verification Step
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [inputOTP, setInputOTP] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.replace("/login");
    } else {
      setUser(currentUser);
    }
  }, [router]);

  if (!user) return null;

  // Quick recipient pickers
  const otherUsers = MOCK_USERS.filter((u) => u.id !== user.id);

  const handleSelectQuick = (u: MockUser) => {
    setRecipientCCP(u.accountNumber);
    setRecipientName(u.name);
  };

  const handleInitiateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("يرجى إدخال مبلغ صحيح");
      return;
    }
    if (numAmount > user.balance) {
      alert("رصيد حسابك غير كافٍ لإتمام هذه المعاملة");
      return;
    }
    if (!recipientCCP.trim()) {
      alert("يرجى إدخال رقم حساب المستلم");
      return;
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(otp);

    // Send OTP SMS containing the user's Anti-Phishing Code!
    sendBankSMS({
      userId: user.id,
      user,
      type: "otp",
      content: `رمز التحقق السريع لتأكيد تحويل مبلغ ${numAmount.toLocaleString(
        "ar-DZ"
      )} دج إلى الحساب (${recipientCCP}) هو: [${otp}]. لا تشاركه مع أي شخص.`,
    });

    setStep("otp");
  };

  const handleConfirmOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputOTP.trim() !== generatedOTP) {
      setOtpError("رمز التحقق غير صحيح، يرجى مراجعة رسالة الـ SMS");
      return;
    }

    setLoading(true);
    const numAmount = parseFloat(amount);
    const newBalance = user.balance - numAmount;

    const updatedUser: MockUser = {
      ...user,
      balance: newBalance,
    };

    saveCurrentUser(updatedUser);
    setUser(updatedUser);

    // Record Transaction
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      fromUserId: user.id,
      toUserId: "recipient",
      amount: numAmount,
      type: "transfer",
      description: `تحويل إلى ${recipientName || recipientCCP}`,
      date: new Date().toISOString(),
      status: "completed",
      antiphishingCodeIncluded: user.antiphishingEnabled,
    };
    addTransaction(newTx);

    // Send Debit Confirmation SMS with Anti-Phishing Code!
    sendBankSMS({
      userId: user.id,
      user: updatedUser,
      type: "transfer",
      content: `إشعار خصم: تم بنجاح تحويل مبلغ ${numAmount.toLocaleString(
        "ar-DZ"
      )} دج من حسابك ${user.accountNumber} إلى ${recipientName || recipientCCP}. الرصيد المتبقي: ${newBalance.toLocaleString(
        "ar-DZ"
      )} دج.`,
    });

    setLoading(false);
    setStep("success");
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen pb-16 pt-4 px-4 max-w-2xl mx-auto"
      style={{ color: "#ffffff" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e3a5f]">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Send className="w-6 h-6 text-[#00b4a0]" />
            تحويل أموال فوري (CCP إلى CCP)
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            محمي بنظام التحقق برمز مكافحة التصيد الأحادي (ShieldCode)
          </p>
        </div>

        <button
          onClick={() => setSmsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0f2040] border border-[#00b4a0]/40 text-[#00b4a0] hover:bg-[#00b4a0] hover:text-white transition-all"
        >
          <Smartphone className="w-4 h-4" />
          عرض رسائل SMS الهاتف
        </button>
      </div>

      {/* Available Balance Pill */}
      <div
        className="rounded-2xl p-4 mb-6 flex items-center justify-between border"
        style={{ backgroundColor: "#0f2040", borderColor: "#1e3a5f" }}
      >
        <div>
          <span className="text-xs text-gray-400 block">رصيد حسابك المتاح</span>
          <span className="text-xl font-bold text-white font-mono">
            {user.balance.toLocaleString("ar-DZ", {
              minimumFractionDigits: 2,
            })}{" "}
            <span className="text-sm text-[#00b4a0]">دج</span>
          </span>
        </div>
        <div className="text-left">
          <span className="text-xs text-gray-400 block">حسابك المصرفي</span>
          <span className="text-sm font-mono font-bold text-gray-200">
            {user.accountNumber}
          </span>
        </div>
      </div>

      {step === "form" && (
        <form onSubmit={handleInitiateTransfer} className="space-y-5">
          {/* Quick Beneficiaries */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2">
              المستفيدون المقترحون:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {otherUsers.map((u) => (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => handleSelectQuick(u)}
                  className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                    recipientCCP === u.accountNumber
                      ? "border-[#00b4a0] bg-[#00b4a0]/15"
                      : "border-white/5 bg-[#0f2040] hover:border-white/20"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {u.name}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {u.accountNumber}
                    </span>
                  </div>
                  <UserCheck className="w-4 h-4 text-[#00b4a0]" />
                </button>
              ))}
            </div>
          </div>

          {/* Destination CCP */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              رقم حساب المستلم (CCP):
            </label>
            <input
              type="text"
              required
              value={recipientCCP}
              onChange={(e) => setRecipientCCP(e.target.value)}
              placeholder="مثال: CCP-987654321"
              className="w-full bg-[#071020] border border-[#1e3a5f] rounded-xl py-3 px-4 text-white font-mono focus:border-[#00b4a0] focus:outline-none"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              المبلغ المطلوب تحويله (دج):
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="100"
                max={user.balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#071020] border border-[#1e3a5f] rounded-xl py-3 px-4 text-white font-mono text-xl font-bold focus:border-[#00b4a0] focus:outline-none"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                دج
              </span>
            </div>
          </div>

          {/* Security Note banner */}
          <div className="rounded-xl p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
            <Shield className="w-4 h-4 shrink-0 mt-0.5 text-[#00b4a0]" />
            <div>
              <span className="font-bold block mb-0.5">
                تأكيد العملية برمز مكافحة التصيد:
              </span>
              ستصلك رسالة SMS تحتوي على رمز التحقق (OTP) ومرفقة برمزك السري{" "}
              <strong>[{user.antiphishingCode || "غير مفعل"}]</strong> لتضمن أن
              الطلب وارد من نظام البنك الحقيقي.
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90 shadow-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: "#00b4a0", color: "#ffffff" }}
          >
            <Lock className="w-4 h-4" />
            متابعة وإرسال رمز التحقق (OTP)
          </button>
        </form>
      )}

      {/* Step 2: OTP Verification */}
      {step === "otp" && (
        <form
          onSubmit={handleConfirmOTP}
          className="rounded-3xl p-6 border space-y-5"
          style={{ backgroundColor: "#0f2040", borderColor: "#1e3a5f" }}
        >
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[#00b4a0]/20 text-[#00b4a0] flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">تأكيد عملية التحويل</h2>
            <p className="text-xs text-gray-400 mt-1">
              تم إرسال رسالة SMS إلى رقم هاتفك المسجل ({user.phone})
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#091526] border border-white/5 text-xs text-center">
            <p className="text-gray-300">
              تحويل مبلغ{" "}
              <strong className="text-white font-mono text-sm">
                {parseFloat(amount).toLocaleString("ar-DZ")} دج
              </strong>{" "}
              إلى الحساب{" "}
              <strong className="text-[#00b4a0] font-mono">
                {recipientCCP}
              </strong>
            </p>
          </div>

          {/* Hint to open SMS box */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setSmsModalOpen(true)}
              className="text-xs text-[#00b4a0] underline font-semibold hover:text-white"
            >
              اضغط هنا لفتح صندوق رسائل الهاتف وقراءة الرمز السري 📱
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2 text-center">
              أدخل رمز التحقق (OTP) المكون من 6 أرقام:
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={inputOTP}
              onChange={(e) => {
                setInputOTP(e.target.value);
                setOtpError("");
              }}
              placeholder="------"
              className="w-48 mx-auto block text-center bg-[#071020] border-2 border-[#00b4a0] rounded-xl py-3 px-4 text-white font-mono text-2xl font-bold tracking-widest focus:outline-none"
            />
            {otpError && (
              <p className="text-rose-400 text-xs text-center mt-2 font-semibold">
                {otpError}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("form")}
              className="flex-1 py-3 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-gray-300 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 shadow-lg text-white"
              style={{ backgroundColor: "#00b4a0" }}
            >
              {loading ? "جارٍ التحقق..." : "تأكيد التحويل الآن"}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Success Screen */}
      {step === "success" && (
        <div
          className="rounded-3xl p-8 border text-center space-y-4"
          style={{ backgroundColor: "#0f2040", borderColor: "#00b4a0" }}
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold text-white">تم التحويل بنجاح!</h2>
          <p className="text-sm text-gray-300">
            تم خصم مبلغ{" "}
            <strong className="text-white font-mono">
              {parseFloat(amount).toLocaleString("ar-DZ")} دج
            </strong>{" "}
            وتحويله للمستفيد.
          </p>

          <div className="p-4 rounded-2xl bg-[#091526] border border-white/5 text-xs text-gray-300 max-w-sm mx-auto text-right space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-400">رقم الحساب المحول منه:</span>
              <span className="font-mono text-white">{user.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">المستفيد:</span>
              <span className="font-mono text-white">{recipientCCP}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">الرصيد المتبقي:</span>
              <span className="font-mono text-[#00b4a0] font-bold">
                {user.balance.toLocaleString("ar-DZ")} دج
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/10">
              <span className="text-gray-400">إشعار SMS:</span>
              <span className="text-emerald-400 font-bold">
                مرسل مع رمزك [{user.antiphishingCode}]
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 max-w-sm mx-auto">
            <button
              onClick={() => setSmsModalOpen(true)}
              className="flex-1 py-3 rounded-xl font-bold text-xs bg-[#00b4a0] text-white hover:opacity-90 transition-opacity"
            >
              عرض إشعار SMS في هاتفك
            </button>
            <button
              onClick={() => {
                setStep("form");
                setAmount("");
                setRecipientCCP("");
              }}
              className="flex-1 py-3 rounded-xl font-semibold text-xs bg-white/10 text-gray-200 hover:bg-white/15"
            >
              تحويل آخر
            </button>
          </div>
        </div>
      )}

      {/* SMS Inbox Modal */}
      <SMSInboxModal
        user={user}
        isOpen={smsModalOpen}
        onClose={() => setSmsModalOpen(false)}
      />
    </main>
  );
}
