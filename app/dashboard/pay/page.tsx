"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Shield,
  Smartphone,
  CheckCircle2,
  Zap,
  PhoneCall,
  Droplets,
  Building,
} from "lucide-react";
import { getCurrentUser, saveCurrentUser } from "@/lib/auth";
import { addTransaction } from "@/lib/mock-data";
import type { MockUser, Transaction } from "@/lib/types";
import { sendBankSMS } from "@/lib/sms-service";
import { SMSInboxModal } from "@/components/sms-inbox-modal";

const BILL_PROVIDERS = [
  { id: "sonelgaz", name: "شركة سونلغاز (الكهرباء والغاز)", icon: Zap, color: "#f5a623" },
  { id: "algerietelecom", name: "اتصالات الجزائر (الإنترنت والهاتف الثابت)", icon: PhoneCall, color: "#00b4a0" },
  { id: "seaal", name: "سيال (المياه والتطهير)", icon: Droplets, color: "#38bdf8" },
  { id: "taxes", name: "مصلحة الضرائب والرسوم العمومية", icon: Building, color: "#a855f7" },
];

export default function PayPage() {
  const router = useRouter();
  const [user, setUser] = useState<MockUser | null>(null);
  const [selectedBill, setSelectedBill] = useState(BILL_PROVIDERS[0]);
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("3200");
  const [success, setSuccess] = useState(false);
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

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("يرجى إدخال مبلغ صحيح");
      return;
    }
    if (numAmount > user.balance) {
      alert("رصيد حسابك غير كافٍ");
      return;
    }

    const newBalance = user.balance - numAmount;
    const updatedUser: MockUser = {
      ...user,
      balance: newBalance,
    };
    saveCurrentUser(updatedUser);
    setUser(updatedUser);

    // Save transaction
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      fromUserId: user.id,
      toUserId: selectedBill.id,
      amount: numAmount,
      type: "payment",
      description: `تسديد فاتورة: ${selectedBill.name}`,
      date: new Date().toISOString(),
      status: "completed",
      antiphishingCodeIncluded: user.antiphishingEnabled,
    };
    addTransaction(tx);

    // Send confirmation SMS with Anti-Phishing Code!
    sendBankSMS({
      userId: user.id,
      user: updatedUser,
      type: "payment",
      content: `إشعار دفع: تم بنجاح تسديد فاتورة ${selectedBill.name} بمبلغ ${numAmount.toLocaleString(
        "ar-DZ"
      )} دج (مرجع: ${reference || "INV-8912"}). الرصيد المتبقي بحسابك ${user.accountNumber} هو: ${newBalance.toLocaleString(
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
            <CreditCard className="w-6 h-6 text-[#00b4a0]" />
            تسديد الفواتير والخدمات
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            دفع إلكتروني آمن مع إشعار SMS برمز مكافحة التصيد الخاص بك
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
          <h2 className="text-2xl font-bold text-white">تم تسديد الفاتورة بنجاح!</h2>
          <p className="text-sm text-gray-300">
            تم دفع مبلغ{" "}
            <strong className="text-white font-mono">
              {parseFloat(amount).toLocaleString("ar-DZ")} دج
            </strong>{" "}
            لصالح {selectedBill.name}.
          </p>
          <div className="flex gap-3 max-w-sm mx-auto pt-4">
            <button
              onClick={() => setSmsModalOpen(true)}
              className="flex-1 py-3 rounded-xl font-bold text-xs bg-[#00b4a0] text-white hover:opacity-90"
            >
              عرض إشعار الـ SMS بهاتفك
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setReference("");
              }}
              className="flex-1 py-3 rounded-xl font-semibold text-xs bg-white/10 text-gray-200"
            >
              دفع فاتورة أخرى
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handlePay} className="space-y-5">
          {/* Bill Selectors */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2">
              اختر الخدمة أو الفاتورة:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BILL_PROVIDERS.map((b) => {
                const Icon = b.icon;
                const active = selectedBill.id === b.id;
                return (
                  <button
                    type="button"
                    key={b.id}
                    onClick={() => setSelectedBill(b)}
                    className={`p-3.5 rounded-xl border text-right flex items-center gap-3 transition-all ${
                      active
                        ? "border-[#00b4a0] bg-[#00b4a0]/15"
                        : "border-white/5 bg-[#0f2040] hover:border-white/20"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${b.color}25`, color: b.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white leading-tight">
                      {b.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              رقم الفاتورة أو المرجع:
            </label>
            <input
              type="text"
              required
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="مثال: REF-984210"
              className="w-full bg-[#071020] border border-[#1e3a5f] rounded-xl py-3 px-4 text-white font-mono focus:border-[#00b4a0] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              المبلغ (دج):
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#071020] border border-[#1e3a5f] rounded-xl py-3 px-4 text-white font-mono text-xl font-bold focus:border-[#00b4a0] focus:outline-none"
            />
          </div>

          {/* Banner */}
          <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00b4a0] shrink-0" />
            <span>
              إشعار الخصم سيصلك فورياً عبر SMS متضمناً رمزك{" "}
              <strong>[{user.antiphishingCode || "غير مفعل"}]</strong>.
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90 shadow-lg text-white"
            style={{ backgroundColor: "#00b4a0" }}
          >
            تأكيد الدفع الآن
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
