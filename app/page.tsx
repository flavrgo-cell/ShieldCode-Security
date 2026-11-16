"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Shield } from "lucide-react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: "#0a1628" }}
      dir="rtl"
    >
      <div className="flex flex-col items-center animate-pulse">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-xl"
          style={{ backgroundColor: "#00b4a0" }}
        >
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">باريدي باي — BaridiPay</h1>
        <p className="text-sm text-teal-400">جاري توجيهك إلى النظام المصرفي الآمن...</p>
      </div>
    </div>
  );
}
