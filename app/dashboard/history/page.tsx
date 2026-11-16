"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  History,
  Shield,
  Smartphone,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { MOCK_TRANSACTIONS } from "@/lib/mock-data";
import type { MockUser } from "@/lib/types";
import { SMSInboxModal } from "@/components/sms-inbox-modal";

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<MockUser | null>(null);
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

  const userTransactions = MOCK_TRANSACTIONS.filter(
    (tx) => tx.fromUserId === user.id || tx.toUserId === user.id
  );

  return (
    <main
      dir="rtl"
      className="min-h-screen pb-16 pt-4 px-4 max-w-3xl mx-auto"
      style={{ color: "#ffffff" }}
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e3a5f]">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-[#00b4a0]" />
            سجل العمليات المصرفية والتحويلات
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            سجل التدقيق البنكي لكافة المعاملات المالية الموثقة برمز مكافحة التصيد
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

      <div
        className="rounded-2xl overflow-hidden border divide-y divide-[#1e3a5f]"
        style={{
          backgroundColor: "#0f2040",
          borderColor: "#1e3a5f",
        }}
      >
        {userTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            لا توجد معاملات مسجلة حتى الآن
          </div>
        ) : (
          userTransactions.map((tx) => {
            const isDebit = tx.fromUserId === user.id;
            return (
              <div
                key={tx.id}
                className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isDebit
                        ? "bg-rose-500/15 text-rose-400"
                        : "bg-emerald-500/15 text-emerald-400"
                    }`}
                  >
                    {isDebit ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {tx.description}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(tx.date || Date.now()).toLocaleDateString("ar-DZ", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                        <Shield className="w-3 h-3" />
                        إشعار SMS برمز الحماية [{user.antiphishingCode}]
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-left font-mono">
                  <span
                    className={`text-base font-bold block ${
                      isDebit ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {isDebit ? "-" : "+"}
                    {tx.amount.toLocaleString("ar-DZ")} دج
                  </span>
                  <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    مكتملة ✅
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <SMSInboxModal
        user={user}
        isOpen={smsModalOpen}
        onClose={() => setSmsModalOpen(false)}
      />
    </main>
  );
}
