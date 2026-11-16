"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, User, CreditCard, Phone, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    nid: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    antiphishingCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!form.fullName.trim()) newErrors.fullName = "الاسم الكامل مطلوب";
    if (!form.nid.trim() || form.nid.length < 9)
      newErrors.nid = "رقم الهوية الوطنية غير صحيح (9 أرقام على الأقل)";
    if (!form.phone.match(/^0[5-7]\d{8}$/))
      newErrors.phone = "رقم الهاتف غير صحيح (يبدأ بـ 05/06/07)";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "البريد الإلكتروني غير صحيح";
    if (form.password.length < 4)
      newErrors.password = "كلمة المرور يجب أن تكون 4 أحرف على الأقل";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "كلمة المرور غير متطابقة";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function generateAccountNumber(): string {
    const digits = Math.floor(10000000 + Math.random() * 90000000);
    return `CCP-${digits}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      // Load existing users from localStorage
      const stored = localStorage.getItem("baridipay_users");
      const users = stored ? JSON.parse(stored) : [];

      // Check phone not already registered
      const phoneExists = users.some((u: { phone: string }) => u.phone === form.phone);
      if (phoneExists) {
        setErrors({ phone: "رقم الهاتف مسجّل مسبقاً" });
        setLoading(false);
        return;
      }

      const newUser = {
        id: `u${Date.now()}`,
        name: form.fullName.trim(),
        nid: form.nid.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        password: form.password,
        balance: 100000,
        cardNumber: "4532 " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000),
        cardExpiry: "12/28",
        cardCVV: Math.floor(100 + Math.random() * 900).toString(),
        antiphishingCode: form.antiphishingCode.trim().toUpperCase() || "",
        antiphishingEnabled: form.antiphishingCode.trim().length > 0,
        accountNumber: generateAccountNumber(),
      };

      users.push(newUser);
      localStorage.setItem("baridipay_users", JSON.stringify(users));

      // Redirect to login with success flag
      router.push("/login?registered=1");
    } catch {
      setErrors({ fullName: "حدث خطأ، يرجى المحاولة مجدداً" });
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all";
  const inputStyle = {
    backgroundColor: "#0a1628",
    border: "1px solid #1e3a5f",
  };

  function Field({
    icon: Icon,
    label,
    field,
    type = "text",
    placeholder,
    right,
    left,
  }: {
    icon: React.ElementType;
    label: string;
    field: string;
    type?: string;
    placeholder?: string;
    right?: React.ReactNode;
    left?: React.ReactNode;
  }) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <div className="relative">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-4 h-4" />
          </span>
          <input
            type={type}
            value={(form as Record<string, string>)[field]}
            onChange={(e) => set(field, e.target.value)}
            placeholder={placeholder}
            className={`${inputBase} pr-10 ${left ? "pl-10" : "pl-4"}`}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#00b4a0")}
            onBlur={(e) => (e.target.style.borderColor = "#1e3a5f")}
          />
          {left && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {left}
            </span>
          )}
          {right && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2">{right}</span>
          )}
        </div>
        {errors[field] && (
          <p className="text-xs text-red-400 mt-1">{errors[field]}</p>
        )}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ backgroundColor: "#0a1628" }}
      dir="rtl"
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
          style={{ backgroundColor: "#00b4a0" }}
        >
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">باريدي باي</h1>
        <p className="text-xs mt-0.5" style={{ color: "#00b4a0" }}>
          BaridiPay
        </p>
      </div>

      <h2 className="text-lg font-semibold text-white mb-5">إنشاء حساب جديد</h2>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4"
        style={{ backgroundColor: "#0f2040" }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">الاسم الكامل</label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="أيوب بن علي"
                className={`${inputBase} pr-10 pl-4`}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#00b4a0")}
                onBlur={(e) => (e.target.style.borderColor = "#1e3a5f")}
              />
            </div>
            {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
          </div>

          {/* NID */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">رقم الهوية الوطنية</label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <CreditCard className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={form.nid}
                onChange={(e) => set("nid", e.target.value)}
                placeholder="123456789"
                className={`${inputBase} pr-10 pl-4`}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#00b4a0")}
                onBlur={(e) => (e.target.style.borderColor = "#1e3a5f")}
              />
            </div>
            {errors.nid && <p className="text-xs text-red-400 mt-1">{errors.nid}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">رقم الهاتف</label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="05XXXXXXXX"
                className={`${inputBase} pr-10 pl-4`}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#00b4a0")}
                onBlur={(e) => (e.target.style.borderColor = "#1e3a5f")}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">البريد الإلكتروني</label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="example@email.com"
                className={`${inputBase} pr-10 pl-4`}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#00b4a0")}
                onBlur={(e) => (e.target.style.borderColor = "#1e3a5f")}
              />
            </div>
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">كلمة المرور</label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="••••••••"
                className={`${inputBase} pr-10 pl-10`}
                style={inputStyle}
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
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">تأكيد كلمة المرور</label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                placeholder="••••••••"
                className={`${inputBase} pr-10 pl-10`}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#00b4a0")}
                onBlur={(e) => (e.target.style.borderColor = "#1e3a5f")}
              />
              <button
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Anti-Phishing Code (Optional at registration) */}
          <div className="p-3.5 rounded-2xl bg-[#091526] border border-[#1e3a5f]">
            <label className="block text-sm font-semibold text-white mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#00b4a0]" />
                رمز مكافحة التصيد (Anti-Phishing)
              </span>
              <span className="text-[11px] text-[#00b4a0] font-normal">اختياري</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">
              رمز مخصص سري يظهر في كل رسائل SMS الصادرة من البنك لحمايتك
            </p>
            <input
              type="text"
              value={form.antiphishingCode}
              onChange={(e) => set("antiphishingCode", e.target.value)}
              placeholder="مثال: AYOUB2026 أو ايوب2026"
              maxLength={20}
              className={`${inputBase} px-4 font-mono font-bold tracking-wider`}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#00b4a0")}
              onBlur={(e) => (e.target.style.borderColor = "#1e3a5f")}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-bold text-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 mt-2"
            style={{ backgroundColor: "#00b4a0" }}
          >
            {loading ? "جارٍ التسجيل..." : "إنشاء الحساب"}
          </button>
        </form>

        {/* Login link */}
        <div className="text-center mt-4 text-sm text-gray-400">
          لديك حساب بالفعل؟{" "}
          <Link
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: "#00b4a0" }}
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
