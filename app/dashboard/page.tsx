"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { MOCK_TRANSACTIONS } from "@/lib/mock-data";
import {
  Bell,
  Send,
  CreditCard,
  Smartphone,
  ShoppingCart,
  Settings,
  History,
  Shield,
  CheckCircle,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  Landmark,
  Code2,
} from "lucide-react";

import { SMSInboxModal } from "@/components/sms-inbox-modal";
import { ensureInitialSMS } from "@/lib/sms-service";
import type { MockUser } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [smsModalOpen, setSmsModalOpen] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.replace("/login");
    } else {
      setUser(currentUser as MockUser);
      ensureInitialSMS(currentUser as MockUser);
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

  // Get initials from name
  const initials = user.name
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("");

  // Last 3 transactions relevant to this user
  const recentTransactions = MOCK_TRANSACTIONS.filter(
    (tx) => tx.fromUserId === user.id || tx.toUserId === user.id
  ).slice(0, 3);

  const quickActions = [
    {
      icon: <Landmark size={22} />,
      label: "بوابة SATIM الوطنية",
      emoji: "🏛️",
      href: "/dashboard/satim",
    },
    {
      icon: <Send size={22} />,
      label: "تحويل فوري",
      emoji: "💸",
      href: "/dashboard/transfer",
    },
    {
      icon: <CreditCard size={22} />,
      label: "دفع فاتورة",
      emoji: "💳",
      href: "/dashboard/pay",
    },
    {
      icon: <Smartphone size={22} />,
      label: "شحن رصيد (فليكسي)",
      emoji: "📱",
      href: "/dashboard/flexi",
    },
    {
      icon: <Code2 size={22} />,
      label: "أداة المؤسسات (SDK Tool)",
      emoji: "⚙️",
      href: "/tool",
    },
    {
      icon: <Settings size={22} />,
      label: "إعدادات الأمان",
      emoji: "🔐",
      href: "/dashboard/settings",
    },
    {
      icon: <History size={22} />,
      label: "سجل المعاملات",
      emoji: "📊",
      href: "/dashboard/history",
    },
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "transfer":
        return <Send size={18} />;
      case "payment":
        return <CreditCard size={18} />;
      case "flexi":
        return <Smartphone size={18} />;
      case "purchase":
        return <ShoppingCart size={18} />;
      default:
        return <History size={18} />;
    }
  };

  const isDebit = (tx: { fromUserId?: string; toUserId?: string }) =>
    tx.fromUserId === user.id;

  return (
    <main
      dir="rtl"
      className="min-h-screen"
      style={{ backgroundColor: "#0a1628", color: "#ffffff" }}
    >
      <div className="max-w-2xl mx-auto px-4 pb-10 pt-0">
        {/* ===== TOP HEADER BAR ===== */}
        <header
          className="flex items-center justify-between py-5"
          style={{ borderBottom: "1px solid rgba(0,180,160,0.15)" }}
        >
          {/* Right: greeting + avatar */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base select-none"
              style={{
                background: "linear-gradient(135deg, #00b4a0, #007a6e)",
                color: "#fff",
                letterSpacing: "0.05em",
              }}
            >
              {initials}
            </div>
            <div>
              <p className="text-xs" style={{ color: "#8da0b8" }}>
                مرحباً،
              </p>
              <p className="font-semibold text-sm">{user.name}</p>
            </div>
          </div>

          {/* Left: SMS simulator button + notification bell */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSmsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 shadow-sm"
              style={{
                backgroundColor: "rgba(0,180,160,0.15)",
                color: "#00b4a0",
                border: "1px solid rgba(0,180,160,0.3)",
              }}
              title="فتح هاتف العميل واستعراض رسائل SMS"
            >
              <Smartphone size={16} />
              <span>رسائل الهاتف (SMS)</span>
            </button>

            <button
              className="relative p-2 rounded-full"
              style={{ backgroundColor: "#0f2040" }}
              aria-label="الإشعارات"
            >
              <Bell size={20} style={{ color: "#00b4a0" }} />
              <span
                className="absolute top-1 left-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: "#f5a623" }}
              />
            </button>
          </div>
        </header>

        {/* ===== ACCOUNT BALANCE CARD ===== */}
        <section
          className="mt-5 rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #00b4a0 0%, #007a6e 60%, #004d47 100%)",
            boxShadow: "0 8px 32px rgba(0,180,160,0.25)",
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute -left-8 -top-8 w-32 h-32 rounded-full opacity-10"
            style={{ backgroundColor: "#fff" }}
          />
          <div
            className="absolute -left-4 bottom-0 w-20 h-20 rounded-full opacity-10"
            style={{ backgroundColor: "#fff" }}
          />

          <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>
            رصيدك الحالي
          </p>
          <h2 className="text-4xl font-bold mb-1">
            {user.balance.toLocaleString("ar-DZ", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            <span className="text-2xl font-semibold">دج</span>
          </h2>
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>
            {user.accountNumber}
          </p>

          {/* ShieldCode badge */}
          {user.antiphishingEnabled ? (
            <span
              className="inline-flex items-center gap-1 text-xs font-medium rounded-full px-3 py-1 mb-5"
              style={{ backgroundColor: "rgba(0,0,0,0.25)", color: "#a7f3d0" }}
            >
              🛡️ ShieldCode: <strong>{user.antiphishingCode}</strong> — نشط
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 text-xs font-medium rounded-full px-3 py-1 mb-5"
              style={{ backgroundColor: "rgba(0,0,0,0.25)", color: "#fcd34d" }}
            >
              ⚠️ ShieldCode غير مفعّل
            </span>
          )}

          {/* Quick actions on card */}
          <div className="flex gap-3 mt-1">
            {[
              { label: "تحويل", href: "/dashboard/transfer" },
              { label: "دفع", href: "/dashboard/pay" },
              { label: "فليكسي", href: "/dashboard/flexi" },
            ].map((btn) => (
              <Link
                key={btn.href}
                href={btn.href}
                className="flex-1 text-center rounded-xl py-2 text-sm font-semibold transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: "rgba(255,255,255,0.18)",
                  color: "#fff",
                  backdropFilter: "blur(4px)",
                }}
              >
                {btn.label}
              </Link>
            ))}
          </div>
        </section>

        {/* ===== SHIELDCODE FEATURE BANNER ===== */}
        <section className="mt-4">
          {!user.antiphishingEnabled ? (
            <div
              className="rounded-xl p-4 flex items-center justify-between gap-3"
              style={{
                background: "linear-gradient(135deg, #7c4a00, #4a2800)",
                border: "1px solid #f5a623",
              }}
            >
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <AlertTriangle
                  size={20}
                  className="shrink-0 mt-0.5"
                  style={{ color: "#f5a623" }}
                />
                <p className="text-sm leading-snug" style={{ color: "#fde68a" }}>
                  حماية ShieldCode غير مفعّلة — فعّل الآن لحماية حسابك من التصيد الاحتيالي
                </p>
              </div>
              <Link
                href="/dashboard/settings"
                className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#f5a623", color: "#1a0a00" }}
              >
                تفعيل الآن
              </Link>
            </div>
          ) : (
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{
                background: "linear-gradient(135deg, #064e3b, #022c22)",
                border: "1px solid #00b4a0",
              }}
            >
              <CheckCircle size={20} className="shrink-0" style={{ color: "#00b4a0" }} />
              <p className="text-sm leading-snug" style={{ color: "#a7f3d0" }}>
                ✅ ShieldCode مفعّل — جميع رسائل البنك ستحتوي على رمزك{" "}
                <strong style={{ color: "#fff" }}>{user.antiphishingCode}</strong>
              </p>
            </div>
          )}
        </section>

        {/* ===== QUICK ACTIONS GRID ===== */}
        <section className="mt-6">
          <h3 className="text-base font-semibold mb-3" style={{ color: "#c8d8ea" }}>
            الخدمات السريعة
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-2 rounded-xl py-4 px-2 transition-transform hover:scale-105 hover:opacity-90"
                style={{ backgroundColor: "#0f2040" }}
              >
                <span className="text-2xl">{action.emoji}</span>
                <span
                  className="text-xs text-center leading-tight font-medium"
                  style={{ color: "#c8d8ea" }}
                >
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ===== RECENT TRANSACTIONS ===== */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold" style={{ color: "#c8d8ea" }}>
              آخر المعاملات
            </h3>
            <Link
              href="/dashboard/history"
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: "#00b4a0" }}
            >
              عرض الكل
              <ChevronLeft size={14} />
            </Link>
          </div>

          <div
            className="rounded-xl overflow-hidden divide-y"
            style={{ backgroundColor: "#0f2040", borderColor: "rgba(0,180,160,0.1)" }}
          >
            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-sm" style={{ color: "#8da0b8" }}>
                لا توجد معاملات حتى الآن
              </div>
            ) : (
              recentTransactions.map((tx) => {
                const debit = isDebit(tx);
                return (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: debit
                          ? "rgba(239,68,68,0.15)"
                          : "rgba(0,180,160,0.15)",
                        color: debit ? "#f87171" : "#00b4a0",
                      }}
                    >
                      {debit ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                    </div>

                    {/* Description */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description}</p>
                      <p className="text-xs" style={{ color: "#8da0b8" }}>
                        {new Date(tx.date || Date.now()).toLocaleDateString("ar-DZ", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Amount */}
                    <span
                      className="text-sm font-bold shrink-0"
                      style={{ color: debit ? "#f87171" : "#34d399" }}
                    >
                      {debit ? "-" : "+"}
                      {tx.amount.toLocaleString("ar-DZ")} دج
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ===== SECURITY STATUS SECTION ===== */}
        <section className="mt-6">
          <h3 className="text-base font-semibold mb-3" style={{ color: "#c8d8ea" }}>
            حالة الأمان
          </h3>
          <div
            className="rounded-xl p-4 grid grid-cols-2 gap-4"
            style={{ backgroundColor: "#0f2040" }}
          >
            {/* ShieldCode */}
            <div className="flex items-center gap-2">
              <Shield size={18} style={{ color: user.antiphishingEnabled ? "#00b4a0" : "#f5a623" }} />
              <div>
                <p className="text-xs font-medium">ShieldCode</p>
                <p
                  className="text-xs"
                  style={{ color: user.antiphishingEnabled ? "#34d399" : "#fbbf24" }}
                >
                  {user.antiphishingEnabled ? "✅ نشط" : "⚠️ غير مفعّل"}
                </p>
              </div>
            </div>

            {/* 2FA */}
            <div className="flex items-center gap-2">
              <CheckCircle size={18} style={{ color: "#00b4a0" }} />
              <div>
                <p className="text-xs font-medium">المصادقة الثنائية</p>
                <p className="text-xs" style={{ color: "#34d399" }}>
                  ✅ مفعّلة
                </p>
              </div>
            </div>

            {/* Encryption */}
            <div className="flex items-center gap-2">
              <CheckCircle size={18} style={{ color: "#00b4a0" }} />
              <div>
                <p className="text-xs font-medium">تشفير البيانات</p>
                <p className="text-xs" style={{ color: "#34d399" }}>
                  ✅ مفعّل
                </p>
              </div>
            </div>

            {/* 24/7 monitoring */}
            <div className="flex items-center gap-2">
              <CheckCircle size={18} style={{ color: "#00b4a0" }} />
              <div>
                <p className="text-xs font-medium">مراقبة 24/7</p>
                <p className="text-xs" style={{ color: "#34d399" }}>
                  ✅ نشطة
                </p>
              </div>
            </div>
          </div>
        </section>
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
