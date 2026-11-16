"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Eye, EyeOff, Phone, Lock } from "lucide-react";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = login(phone, password);
      if (user) {
        router.push("/dashboard");
      } else {
        setError("رقم الهاتف أو كلمة المرور غير صحيحة");
      }
    } catch {
      setError("رقم الهاتف أو كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ backgroundColor: "#0a1628" }}
      dir="rtl"
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
          style={{ backgroundColor: "#00b4a0" }}
        >
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-wide">باريدي باي</h1>
        <p className="text-sm mt-1" style={{ color: "#00b4a0" }}>
          BaridiPay
        </p>
      </div>

      {/* Welcome */}
      <h2 className="text-xl font-semibold text-white mb-6">مرحباً بك</h2>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        style={{ backgroundColor: "#0f2040" }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              رقم الهاتف
            </label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                required
                className="w-full pr-10 pl-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: "#0a1628",
                  border: "1px solid #1e3a5f",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#00b4a0")}
                onBlur={(e) => (e.target.style.borderColor = "#1e3a5f")}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              كلمة المرور
            </label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pr-10 pl-10 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all"
                style={{
                  backgroundColor: "#0a1628",
                  border: "1px solid #1e3a5f",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#00b4a0")}
                onBlur={(e) => (e.target.style.borderColor = "#1e3a5f")}
              />
              <button
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-xl px-4 py-3 text-center">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-bold text-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            style={{ backgroundColor: "#00b4a0" }}
          >
            {loading ? "جارٍ الدخول..." : "دخول"}
          </button>
        </form>

        {/* Register link */}
        <div className="text-center mt-5 text-sm text-gray-400">
          ليس لديك حساب؟{" "}
          <Link
            href="/register"
            className="font-semibold hover:underline transition-colors"
            style={{ color: "#00b4a0" }}
          >
            سجّل الآن
          </Link>
        </div>
      </div>

      {/* Demo accounts info box */}
      <div
        className="w-full max-w-sm mt-6 rounded-2xl p-5 border"
        style={{ backgroundColor: "#0f2040", borderColor: "#1e3a5f" }}
      >
        <p className="text-xs font-semibold text-center mb-3" style={{ color: "#00b4a0" }}>
          🧪 حسابات تجريبية للعرض
        </p>
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex justify-between items-center">
            <span className="font-mono text-white">0555123456</span>
            <span>أيوب بن علي</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono text-white">0666789012</span>
            <span>سارة حمدي</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono text-white">0777456789</span>
            <span>كريم دريدي</span>
          </div>
          <div className="pt-2 border-t text-center" style={{ borderColor: "#1e3a5f" }}>
            كلمة المرور لجميع الحسابات:{" "}
            <span className="font-mono font-bold text-white">1234</span>
          </div>
        </div>
      </div>
    </div>
  );
}
