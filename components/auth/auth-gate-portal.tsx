"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";

type GateStep = "register" | "verify-otp";
type AuthMode = "signup" | "login";

interface RegistrationMeta {
  userId: string;
  emailMasked: string;
  phoneMasked: string;
  sandboxEmailOtp: string;
  sandboxPhoneOtp: string;
}

const COPY = {
  ar: {
    badge: "منصة محمية بنظام التحقق المزدوج (القانون 18-07)",
    titleRegister: "إنشاء حساب",
    titleLogin: "تسجيل الدخول",
    subtitleRegister:
      "لأسباب أمنية، يتطلب الوصول إلى خدمات الحماية توثيق البريد الإلكتروني ورقم الهاتف الجزائري (+213).",
    titleOtp: "تأكيد رموز التحقق (OTP)",
    subtitleOtp:
      "أدخل الرمزين المكونين من 6 أرقام المرسلين إلى بريدك وهاتفك لتفعيل جلستك الآمنة.",
    nameLabel: "الاسم الكامل",
    namePlaceholder: "الاسم الكامل",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "البريد الإلكتروني",
    phoneLabel: "رقم الهاتف الجزائري (+213)",
    phonePlaceholder: "+213 550 12 34 56",
    phoneHint: "أدخل الأرقام التسعة بعد 213+ (مثال: 550123456)",
    passwordLabel: "كلمة المرور",
    passwordPlaceholder: "كلمة المرور (8 أحرف أو أكثر)",
    forgotPassword: "نسيت كلمة المرور؟",
    submitRegister: "إنشاء الحساب ومتابعة التحقق",
    submitLogin: "تسجيل الدخول والمتابعة",
    submittingRegister: "جارٍ إرسال رمزي التحقق...",
    submittingLogin: "جارٍ التحقق من الحساب...",
    emailOtpLabel: "رمز البريد الإلكتروني (6 أرقام)",
    smsOtpLabel: "رمز رسالة SMS للهاتف (6 أرقام)",
    sentTo: "أُرسل إلى:",
    sandboxTitle: "رموز الاختبار المحلي (Sandbox OTP)",
    autoFillBtn: "تعبئة تلقائية",
    submitOtp: "تأكيد الرمزين والدخول",
    submittingOtp: "جارٍ إصدار رمز الجلسة JWT...",
    backToRegister: "تعديل البريد أو رقم الهاتف",
    cookieNote:
      "يتم حفظ رمز الجلسة (JWT) في الذاكرة وكوكيز مشفرة HttpOnly لحماية أمان حسابك.",
    agreementText:
      "بالتسجيل، أنت توافق على شروط الخدمة وسياسة الخصوصية وحماية البيانات الجزائري (القانون 18-07)",
    invalidPhoneErr:
      "يجب أن يبدأ الرقم الجزائري بـ 5 أو 6 أو 7 ويتبعه 8 أرقام (مثال: 550123456).",
    invalidEmailErr: "يرجى إدخال عنوان بريد إلكتروني صحيح.",
    invalidPasswordErr: "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل.",
    incompleteOtpErr: "يرجى إدخال جميع الأرقام الستة لكلٍ من البريد ورسالة SMS.",
    successToast: "تم توثيق الحساب بنجاح! مرحباً بك في ShieldCode.",
  },
  en: {
    badge: "Strict Auth-Gated SaaS • Dual-Channel Identity",
    titleRegister: "Create Account",
    titleLogin: "Sign In",
    subtitleRegister:
      "Access requires strict Email + Algerian Mobile (+213) verification under Law 18-07.",
    titleOtp: "Dual OTP Verification",
    subtitleOtp:
      "Enter the 6-digit codes sent to your inbox and +213 mobile to unlock the platform.",
    nameLabel: "Full Name",
    namePlaceholder: "Full Name",
    emailLabel: "Email Address",
    emailPlaceholder: "Email Address",
    phoneLabel: "Algerian Mobile (+213)",
    phonePlaceholder: "+213 550 12 34 56",
    phoneHint: "Enter 9 digits after +213 (e.g. 550123456)",
    passwordLabel: "Password",
    passwordPlaceholder: "Password (8+ characters)",
    forgotPassword: "Forgot Password?",
    submitRegister: "Create Account & Verify",
    submitLogin: "Sign In & Continue",
    submittingRegister: "Dispatching Dual OTPs...",
    submittingLogin: "Authenticating account...",
    emailOtpLabel: "Email Code (6 digits)",
    smsOtpLabel: "SMS Code (6 digits)",
    sentTo: "Sent to:",
    sandboxTitle: "Local Sandbox Codes",
    autoFillBtn: "Auto-Fill",
    submitOtp: "Verify Codes & Enter",
    submittingOtp: "Verifying & Issuing JWT...",
    backToRegister: "Change email or phone number",
    cookieNote:
      "Session JWT is stored strictly in memory and an HttpOnly SameSite=Strict cookie.",
    agreementText:
      "By signing up, you agree to Terms of Service & Algerian Data Privacy (Law 18-07)",
    invalidPhoneErr:
      "Algerian mobile suffix must start with 5, 6, or 7 followed by 8 digits (e.g. 550123456).",
    invalidEmailErr: "Please enter a valid email address.",
    invalidPasswordErr: "Password must be at least 8 characters long.",
    incompleteOtpErr: "Please enter all 6 digits for both Email and SMS OTPs.",
    successToast: "Account verified! Welcome to ShieldCode.",
  },
} as const;

interface SixDigitOtpGridProps {
  idPrefix: string;
  label: string;
  sentToText: string;
  maskedTarget: string;
  icon: React.ReactNode;
  digits: string[];
  onChange: (next: string[]) => void;
}

function SixDigitOtpGrid({
  idPrefix,
  label,
  sentToText,
  maskedTarget,
  icon,
  digits,
  onChange,
}: SixDigitOtpGridProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleDigitChange = (idx: number, raw: string) => {
    const clean = raw.replace(/[^0-9]/g, "");
    if (!clean) {
      const next = [...digits];
      next[idx] = "";
      onChange(next);
      return;
    }

    if (clean.length > 1) {
      const next = [...digits];
      for (let i = 0; i < 6 && idx + i < 6; i++) {
        next[idx + i] = clean[i] ?? "";
      }
      onChange(next);
      const focusIdx = Math.min(5, idx + clean.length);
      inputRefs.current[focusIdx]?.focus();
      return;
    }

    const next = [...digits];
    next[idx] = clean[0];
    onChange(next);

    if (idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] ?? "");
    onChange(next);
    inputRefs.current[Math.min(5, pasted.length - 1)]?.focus();
  };

  return (
    <div className="rounded-[24px] border border-teal-200 dark:border-teal-500/30 bg-teal-50/60 dark:bg-[#071d27]/90 p-3.5 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-1">
        <span className="flex items-center gap-1.5 text-xs font-extrabold text-teal-800 dark:text-cyan-300">
          {icon}
          <span>{label}</span>
        </span>
        <span className="text-[10.5px] font-medium text-slate-600 dark:text-slate-400">
          {sentToText}{" "}
          <strong dir="ltr" className="font-mono text-teal-700 dark:text-teal-300">
            {maskedTarget}
          </strong>
        </span>
      </div>

      <div dir="ltr" className="flex items-center justify-between gap-1.5">
        {digits.map((digit, idx) => (
          <input
            key={`${idPrefix}-${idx}`}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            aria-label={`${label} digit ${idx + 1}`}
            className="h-12 w-full max-w-[46px] rounded-[18px] border-2 border-teal-200 dark:border-teal-500/30 bg-white dark:bg-[#031017] text-center font-mono text-xl font-extrabold tabular-nums text-teal-900 dark:text-cyan-200 shadow-sm transition focus:border-teal-600 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        ))}
      </div>
    </div>
  );
}

export function AuthGatePortal() {
  const { locale, dir } = useI18n();
  const t = COPY[locale];
  const isAr = locale === "ar";
  const router = useRouter();
  const { accessToken, user, setAuthenticatedSession } = useAuth();

  const [step, setStep] = useState<GateStep>("register");
  const [authMode, setAuthMode] = useState<AuthMode>("signup");

  // Form Fields: Full Name, Email, Phone (+213), Password
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [phoneDisplay, setPhoneDisplay] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [meta, setMeta] = useState<RegistrationMeta | null>(null);
  const [emailOtp, setEmailOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [phoneOtp, setPhoneOtp] = useState<string[]>(["", "", "", "", "", ""]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already authenticated in RAM / HttpOnly cookie, redirect immediately into the app
  useEffect(() => {
    if (accessToken && user?.email_verified && user?.phone_verified) {
      router.replace("/");
    }
  }, [accessToken, user, router]);

  const operatorName = useMemo(() => {
    if (phoneDigits.startsWith("5")) return "Ooredoo DZ";
    if (phoneDigits.startsWith("6")) return "Mobilis DZ";
    if (phoneDigits.startsWith("7")) return "Djezzy DZ";
    return null;
  }, [phoneDigits]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    let digits = val.replace(/[^0-9]/g, "");
    if (digits.startsWith("213")) digits = digits.slice(3);
    if (digits.startsWith("0")) digits = digits.slice(1);
    digits = digits.slice(0, 9);
    setPhoneDigits(digits);
    setPhoneDisplay(digits.length > 0 ? `+213 ${digits}` : "");
    setErrorMsg(null);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (authMode === "signup" && fullName.trim().length < 2) {
      setErrorMsg(isAr ? "يرجى إدخال الاسم الكامل بشكل صحيح." : "Please enter your full name.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,24}$/.test(normalizedEmail)) {
      setErrorMsg(t.invalidEmailErr);
      return;
    }

    if (!/^[567][0-9]{8}$/.test(phoneDigits)) {
      setErrorMsg(t.invalidPhoneErr);
      return;
    }

    if (password.length < 8) {
      setErrorMsg(t.invalidPasswordErr);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: fullName.trim(),
          email: normalizedEmail,
          phone_number: `+213${phoneDigits}`,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || (isAr ? "فشل إنشاء الحساب." : "Registration failed."));
        return;
      }

      setMeta({
        userId: data.user_id,
        emailMasked: data.email_masked,
        phoneMasked: data.phone_masked,
        sandboxEmailOtp: data.sandbox_email_otp || "",
        sandboxPhoneOtp: data.sandbox_phone_otp || "",
      });
      setEmailOtp(["", "", "", "", "", ""]);
      setPhoneOtp(["", "", "", "", "", ""]);
      setStep("verify-otp");
    } catch {
      setErrorMsg(
        isAr
          ? "تعذر الاتصال بخادم التسجيل."
          : "Could not reach registration server."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoFillSandbox = () => {
    if (!meta) return;
    setErrorMsg(null);
    setEmailOtp(meta.sandboxEmailOtp.split("").slice(0, 6));
    setPhoneOtp(meta.sandboxPhoneOtp.split("").slice(0, 6));
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!meta) return;

    const emailCode = emailOtp.join("");
    const smsCode = phoneOtp.join("");
    if (emailCode.length !== 6 || smsCode.length !== 6) {
      setErrorMsg(t.incompleteOtpErr);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          user_id: meta.userId,
          email_otp: emailCode,
          phone_otp: smsCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || (isAr ? "فشل التحقق من الرموز." : "Verification failed."));
        return;
      }

      setAuthenticatedSession(data.access_token, {
        user_id: data.user_id,
        email_masked: data.email_masked,
        phone_masked: data.phone_masked,
        email_verified: true,
        phone_verified: true,
      });

      toast.success(t.successToast);
      router.replace("/");
    } catch {
      setErrorMsg(
        isAr
          ? "تعذر الاتصال بخادم التحقق."
          : "Could not reach verification server."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      dir={dir}
      className="grid-wrapper relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 text-slate-900 dark:text-slate-100"
    >
      <div className="grid-background" aria-hidden="true" />

      {/* Atmospheric Teal / Cyan Radial Glows (zero blur filter cost) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -start-24 h-96 w-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(20, 184, 166, 0.16) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -end-24 h-96 w-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(6, 182, 212, 0.16) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Top Brand + Theme & Language Toggles */}
        <div className="flex items-center justify-between gap-3 px-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl anti-banding-teal text-white shadow-retina-glow ring-1 ring-white/25">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                ShieldCode
              </p>
              <p className="text-[10px] font-medium text-teal-700 dark:text-teal-300 mt-0.5">
                {t.badge}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>

        {/* The Auth Card with 40px rounded corners & 400px max width */}
        <div className="auth-container">
          {step === "register" ? (
            <div
              key="step-register"
              className="animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
                <div className="heading">
                  {authMode === "signup" ? t.titleRegister : t.titleLogin}
                </div>

                <form onSubmit={handleRegisterSubmit} className="form">
                  {/* Field 1: الاسم الكامل (Full Name) */}
                  {authMode === "signup" && (
                    <input
                      type="text"
                      name="fullName"
                      placeholder={t.namePlaceholder}
                      value={fullName}
                      onChange={(e) => {
                        setErrorMsg(null);
                        setFullName(e.target.value);
                      }}
                      required
                      className="input"
                    />
                  )}

                  {/* Field 2: البريد الإلكتروني (Email Address) */}
                  <input
                    type="email"
                    name="email"
                    dir="ltr"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => {
                      setErrorMsg(null);
                      setEmail(e.target.value);
                    }}
                    required
                    className="input text-right"
                  />

                  {/* Field 3: رقم الهاتف الجزائري (+213) with dir="ltr" and text-right */}
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      dir="ltr"
                      placeholder={t.phonePlaceholder}
                      value={phoneDisplay}
                      onChange={handlePhoneChange}
                      required
                      className="input phone-input text-right font-mono"
                    />
                    {operatorName && (
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-teal-100 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-500/40 px-2 py-0.5 text-[9.5px] font-bold text-teal-800 dark:text-cyan-300 select-none">
                        {operatorName}
                      </span>
                    )}
                  </div>

                  {/* Field 4: كلمة المرور (Password) */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      dir="ltr"
                      placeholder={t.passwordPlaceholder}
                      value={password}
                      onChange={(e) => {
                        setErrorMsg(null);
                        setPassword(e.target.value);
                      }}
                      required
                      minLength={8}
                      className="input text-right pl-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label="Toggle password visibility"
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-cyan-400 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Forgot Password Link */}
                  <span className="forgot-password">
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault();
                        toast.info(
                          isAr
                            ? "سيتم إرسال رابط استعادة الحساب إلى بريدك الإلكتروني المسجل"
                            : "Account recovery link will be dispatched to your email"
                        );
                      }}
                    >
                      {t.forgotPassword}
                    </a>
                  </span>

                  {/* Error Message */}
                  {errorMsg && (
                    <div className="mt-3 flex items-center gap-2 rounded-2xl border border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-950/50 px-3.5 py-2 text-xs font-bold text-red-800 dark:text-red-200">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="login-button"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>
                          {authMode === "signup"
                            ? t.submittingRegister
                            : t.submittingLogin}
                        </span>
                      </span>
                    ) : (
                      <span>
                        {authMode === "signup"
                          ? t.submitRegister
                          : t.submitLogin}
                      </span>
                    )}
                  </button>
                </form>

                {/* Switcher between Register and Login */}
                <div className="flex items-center justify-center gap-2 mt-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {authMode === "signup"
                      ? isAr
                        ? "لديك حساب بالفعل؟"
                        : "Already have an account?"
                      : isAr
                      ? "ليس لديك حساب بعد؟"
                      : "Don't have an account?"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setAuthMode(authMode === "signup" ? "login" : "signup");
                    }}
                    className="font-bold text-teal-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    {authMode === "signup"
                      ? isAr
                        ? "تسجيل الدخول"
                        : "Sign In"
                      : isAr
                      ? "إنشاء حساب جديد"
                      : "Sign Up"}
                  </button>
                </div>

                {/* Social Accounts Section */}
                <div className="social-account-container">
                  <span className="title">
                    {isAr ? "أو تسجيل الدخول عبر" : "Or sign in with"}
                  </span>
                  <div className="social-accounts">
                    <button
                      type="button"
                      className="social-button"
                      title="Google"
                      onClick={() =>
                        toast.info(
                          isAr
                            ? "التسجيل عبر Google مفعل تجريبياً"
                            : "Google sign-in active in sandbox"
                        )
                      }
                    >
                      <svg className="svg h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.053 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="social-button"
                      title="Apple"
                      onClick={() =>
                        toast.info(
                          isAr
                            ? "التسجيل عبر Apple مفعل تجريبياً"
                            : "Apple sign-in active in sandbox"
                        )
                      }
                    >
                      <svg className="svg h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.78 1.07-1.85.95-2.94-.93.04-2.05.62-2.71 1.4-.58.67-1.1 1.76-.96 2.82 1.03.08 2.08-.53 2.72-1.28"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="social-button"
                      title="X (Twitter)"
                      onClick={() =>
                        toast.info(
                          isAr
                            ? "التسجيل عبر X مفعل تجريبياً"
                            : "X sign-in active in sandbox"
                        )
                      }
                    >
                      <svg className="svg h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Agreement Section */}
                <span className="agreement">
                  <a
                    href="#terms"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info(
                        isAr
                          ? "شروط الاستخدام متوافقة مع متطلبات بنك الجزائر وقانون 18-07"
                          : "Terms compliant with Bank of Algeria & Law 18-07"
                      );
                    }}
                  >
                    {t.agreementText}
                  </a>
                </span>
            </div>
          ) : (
            /* Step 2: Dual 6-Digit OTP Verification */
            <div
              key="step-verify-otp"
              className="animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setStep("register");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 hover:text-slate-900 dark:hover:text-white mb-2 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{t.backToRegister}</span>
                </button>

                <div className="heading !text-2xl">{t.titleOtp}</div>
                <p className="text-xs text-center font-medium leading-relaxed text-slate-600 dark:text-slate-400 mt-1">
                  {t.subtitleOtp}
                </p>

                {meta?.sandboxEmailOtp && meta?.sandboxPhoneOtp && (
                  <div className="mt-3.5 rounded-[22px] border border-teal-300/60 dark:border-cyan-500/40 bg-teal-50/80 dark:bg-cyan-950/40 p-3 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-extrabold text-teal-800 dark:text-cyan-300">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{t.sandboxTitle}</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleAutoFillSandbox}
                        className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs cursor-pointer hover:opacity-90"
                      >
                        {t.autoFillBtn}
                      </button>
                    </div>
                    <div
                      dir="ltr"
                      className="flex flex-wrap items-center justify-between font-mono text-[11px] font-bold text-teal-800 dark:text-teal-200"
                    >
                      <span>Email: {meta.sandboxEmailOtp}</span>
                      <span>SMS: {meta.sandboxPhoneOtp}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleVerifyOtpSubmit} className="form space-y-3.5">
                  <SixDigitOtpGrid
                    idPrefix="email-otp"
                    label={t.emailOtpLabel}
                    sentToText={t.sentTo}
                    maskedTarget={meta?.emailMasked || "***"}
                    icon={
                      <Mail className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    }
                    digits={emailOtp}
                    onChange={(next) => {
                      setErrorMsg(null);
                      setEmailOtp(next);
                    }}
                  />

                  <SixDigitOtpGrid
                    idPrefix="sms-otp"
                    label={t.smsOtpLabel}
                    sentToText={t.sentTo}
                    maskedTarget={meta?.phoneMasked || "+213***"}
                    icon={
                      <Smartphone className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    }
                    digits={phoneOtp}
                    onChange={(next) => {
                      setErrorMsg(null);
                      setPhoneOtp(next);
                    }}
                  />

                  {errorMsg && (
                    <div className="flex items-center gap-2 rounded-2xl border border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-950/50 px-3.5 py-2 text-xs font-bold text-red-800 dark:text-red-200">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="login-button"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t.submittingOtp}</span>
                      </span>
                    ) : (
                      <span>{t.submitOtp}</span>
                    )}
                  </button>
                </form>

                <p className="mt-4 border-t border-teal-100 dark:border-slate-800 pt-3 text-center text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  {t.cookieNote}
                </p>
              </div>
            )}
        </div>
      </div>
    </main>
  );
}
