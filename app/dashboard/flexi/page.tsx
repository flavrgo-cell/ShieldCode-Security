"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Smartphone,
  Shield,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { getCurrentUser, saveCurrentUser } from "@/lib/auth";
import { addTransaction } from "@/lib/mock-data";
import type { MockUser, Transaction } from "@/lib/types";
import { sendBankSMS } from "@/lib/sms-service";
import { SMSInboxModal } from "@/components/sms-inbox-modal";

const OPERATORS = [
  { id: "mobilis", name: "موبيليس (Mobilis)", color: "#10b981", prefix: "06" },
  { id: "djezzy", name: "جيزي (Djezzy)", color: "#ef4444", prefix: "07" },
  { id: "ooredoo", name: "أوريدو (Ooredoo)", color: "#f59e0b", prefix: "05" },
];

const PRESET_AMOUNTS = [500, 1000, 1500, 2000, 3000];

export default function FlexiPage() {
  const router = useRouter();
  const [user, setUser] = useState<MockUser | null>(null);
  const [operator, setOperator] = useState(OPERATORS[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState<number>(1000);
  const [success, setSuccess] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.replace("/login");
    } else {
      setUser(currentUser);
      setPhoneNumber(currentUser.phone);
    }
  }, [router]);

  if (!user) return null;

  const handleRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > user.balance) {
      alert("رصيد الحساب غير كافٍ أو المبلغ غير صحيح");
      return;
    }

    const newBalance = user.balance - amount;
    const updatedUser: MockUser = {
      ...user,
      balance: newBalance,
    };
    saveCurrentUser(updatedUser);
    setUser(updatedUser);

    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      fromUserId: user.id,
      toUserId: operator.id,
      amount,
      type: "flexi",
      description: `شحن رصيد ${operator.name} - ${phoneNumber}`,
      date: new Date().toISOString(),
      status: "completed",
      antiphishingCodeIncluded: user.antiphishingEnabled,
    };
    addTransaction(tx);

    // Send Bank SMS with Anti-Phishing Code!
    sendBankSMS({
      userId: user.id,
      user: updatedUser,
      type: "payment",
      content: `تم بنجاح شحن رصيد ${operator.name} للرقم (${phoneNumber}) بمبلغ ${amount.toLocaleString(
        "ar-DZ"
      )} دج. الرصيد المتبقي بحسابك ${user.accountNumber}: ${newBalance.toLocaleString(
        "ar-DZ"
      )} دج.`,
    });

    setSuccess(true);
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen pb-16 pt-4 px-4 max-w-2xl mx-auto"
      style={{ color: "#ffffff" }}
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e3a5f]">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-[#00b4a0]" />
            شحن رصيد الهاتف (فليكسي فوري)
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            شحن رصيد الهاتف لجميع الشبكات مع تأكيد SMS محمي بـ ShieldCode
          </p>
        </div>

        <button
          onClick={() => setSmsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0f2040] border border-[#00b4a0]/40 text-[#00b4a0] hover:bg-[#00b4a0] hover:text-white transition-all"
        >
          <Smartphone className="w-4 h-4" />
          رسائل SMS الهاتف
        </button>
      </div>

      {success ? (
        <div
          className="rounded-3xl p-8 border text-center space-y-4"
          style={{ backgroundColor: "#0f2040", borderColor: "#00b4a0" }}
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white">تم شحن الرصيد بنجاح!</h2>
          <p className="text-sm text-gray-300">
            تم إرسال {amount.toLocaleString("ar-DZ")} دج إلى الرقم ({phoneNumber}).
          </p>
          <div className="flex gap-3 max-w-sm mx-auto pt-4">
            <button
              onClick={() => setSmsModalOpen(true)}
              className="flex-1 py-3 rounded-xl font-bold text-xs bg-[#00b4a0] text-white hover:opacity-90"
            >
              عرض إشعار الـ SMS بهاتفك
            </button>
            <button
              onClick={() => setSuccess(false)}
              className="flex-1 py-3 rounded-xl font-semibold text-xs bg-white/10 text-gray-200"
            >
              شحن رقم آخر
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRecharge} className="space-y-5">
          {/* Operator Selectors */}
          <div className="grid grid-cols-3 gap-3">
            {OPERATORS.map((op) => (
              <button
                type="button"
                key={op.id}
                onClick={() => setOperator(op)}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  operator.id === op.id
                    ? "border-[#00b4a0] bg-[#00b4a0]/15"
                    : "border-white/5 bg-[#0f2040] hover:border-white/20"
                }`}
              >
                <span className="block font-bold text-sm text-white mb-0.5">
                  {op.name}
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  يبدأ بـ {op.prefix}
                </span>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              رقم الهاتف المراد شحنه:
            </label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="05XXXXXXXX"
              className="w-full bg-[#071020] border border-[#1e3a5f] rounded-xl py-3 px-4 text-white font-mono text-lg focus:border-[#00b4a0] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              اختر المبلغ:
            </label>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                    amount === amt
                      ? "bg-[#00b4a0] text-white border-[#00b4a0]"
                      : "bg-[#0f2040] text-gray-300 border-white/5 hover:border-white/20"
                  }`}
                >
                  {amt} دج
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00b4a0] shrink-0" />
            <span>
              إشعار الخصم الفوري سيتضمن رمزك السري{" "}
              <strong>[{user.antiphishingCode || "غير مفعل"}]</strong>.
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90 shadow-lg text-white"
            style={{ backgroundColor: "#00b4a0" }}
          >
            تأكيد الشحن ({amount.toLocaleString("ar-DZ")} دج)
          </button>
        </form>
      )}

      <SMSInboxModal
        user={user}
        isOpen={smsModalOpen}
        onClose={() => setSmsModalOpen(false)}
      />
    </main>
  );
}
