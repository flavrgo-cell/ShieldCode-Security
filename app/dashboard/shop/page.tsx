"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Shield,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import type { MockUser } from "@/lib/types";
import { SMSInboxModal } from "@/components/sms-inbox-modal";

export default function ShopPage() {
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

  return (
    <main
      dir="rtl"
      className="min-h-screen pb-16 pt-4 px-4 max-w-3xl mx-auto"
      style={{ color: "#ffffff" }}
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e3a5f]">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#00b4a0]" />
            التسوق الآمن عبر بوابة الدفع الإلكتروني
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            بوابة دفع إلكترونية متصلة بحسابك البنكي CCP ومحمية بنظام التحقق بالصورة والرمز السري
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
        className="rounded-3xl p-8 border text-center space-y-6"
        style={{
          background: "linear-gradient(145deg, #0f2244 0%, #0a172e 100%)",
          borderColor: "#1e3a5f",
        }}
      >
        <div className="w-16 h-16 rounded-2xl bg-[#00b4a0]/20 text-[#00b4a0] flex items-center justify-center mx-auto">
          <Shield className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-2">
            متجر TechStore المعتمد لـ BaridiPay
          </h2>
          <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
            يمكنك تجربة الشراء من متجر المنتجات الرقمية. عند استخدام بطاقتك أو حسابك{" "}
            <span className="font-mono text-[#00b4a0] font-bold">
              {user.accountNumber}
            </span>
            ، سيتم إرسال إشعار شراء يتضمن رمز مكافحة التصيد الخاص بك.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#071020] border border-white/5 max-w-sm mx-auto text-xs text-right space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            حسابك البنكي جاهز للدفع الآمن
          </div>
          <p className="text-gray-400">
            معرف الحساب: <span className="text-white font-mono">{user.accountNumber}</span>
          </p>
          <p className="text-gray-400">
            رمز مكافحة التصيد:{" "}
            <span className="text-[#00b4a0] font-mono font-bold">
              [{user.antiphishingCode || "غير مفعل"}]
            </span>
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 shadow-lg"
            style={{ backgroundColor: "#00b4a0", color: "#ffffff" }}
          >
            <span>الانتقال إلى متجر TechStore والبدء في الشراء</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <SMSInboxModal
        user={user}
        isOpen={smsModalOpen}
        onClose={() => setSmsModalOpen(false)}
      />
    </main>
  );
}
