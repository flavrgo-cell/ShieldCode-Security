"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Home,
  Send,
  CreditCard,
  ShoppingBag,
  Settings,
  LogOut,
  Landmark,
} from "lucide-react";
import { getCurrentUser, logout } from "@/lib/auth";

const navItems = [
  { label: "الرئيسية", icon: Home, href: "/dashboard" },
  { label: "بوابة SATIM الوطنية", icon: Landmark, href: "/dashboard/satim" },
  { label: "التحويل", icon: Send, href: "/dashboard/transfer" },
  { label: "الدفع", icon: CreditCard, href: "/dashboard/pay" },
  { label: "المتجر", icon: ShoppingBag, href: "/dashboard/shop" },
  { label: "الإعدادات", icon: Settings, href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (!checked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0a1628" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ backgroundColor: "#00b4a0" }}
          >
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-sm">جارٍ التحميل...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "#0a1628" }}
      dir="rtl"
    >
      {/* ── Desktop Sidebar (right side, RTL) ── */}
      <aside
        className="hidden md:flex flex-col w-64 min-h-screen py-6 px-4 fixed right-0 top-0 bottom-0 z-30"
        style={{ backgroundColor: "#0f2040", borderLeft: "1px solid #1e3a5f" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#00b4a0" }}
          >
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg leading-none block">باريدي باي</span>
            <span className="text-xs" style={{ color: "#00b4a0" }}>
              BaridiPay
            </span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1">
          {navItems.map(({ label, icon: Icon, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all"
                style={
                  active
                    ? { backgroundColor: "#00b4a0", color: "#fff" }
                    : { color: "#94a3b8" }
                }
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#1e3a5f";
                    (e.currentTarget as HTMLElement).style.color = "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                  }
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all mt-4"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 md:mr-64 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-2"
        style={{
          backgroundColor: "#0f2040",
          borderTop: "1px solid #1e3a5f",
        }}
      >
        {navItems.map(({ label, icon: Icon, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all"
              style={{ color: active ? "#00b4a0" : "#64748b" }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs font-medium">خروج</span>
        </button>
      </nav>
    </div>
  );
}
