"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  ShieldCheck,
  Mail,
  Lock,
  Smartphone,
  Check,
  ChevronDown,
  Search,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  KeyRound,
  AlertCircle,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ============================================================================
// Zero-Config Framer-Motion-Compatible Web Animations Wrapper
// Runs out-of-the-box with fluid step transitions, shake animations, and progress bars.
// ============================================================================

const AnimatePresence: React.FC<{
  children: React.ReactNode;
  mode?: "wait" | "sync";
}> = ({ children }) => <>{children}</>;

const motion = {
  div: ({
    children,
    animate,
    initial,
    exit: _exit,
    transition: _transition,
    className,
    style,
    ...rest
  }: any) => {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const el = ref.current;
      if (!el) return;

      if (animate && Array.isArray(animate.x) && animate.x.length > 1) {
        el.animate(
          animate.x.map((xVal: number) => ({
            transform: `translateX(${xVal}px)`,
          })),
          { duration: 420, easing: "ease-in-out" }
        );
      } else if (initial && animate && initial.opacity !== undefined) {
        el.animate(
          [
            {
              opacity: initial.opacity ?? 0,
              transform: `translateY(${initial.y ?? 12}px) scale(${initial.scale ?? 0.98})`,
            },
            {
              opacity: animate.opacity ?? 1,
              transform: `translateY(${animate.y ?? 0}px) scale(${animate.scale ?? 1})`,
            },
          ],
          { duration: 360, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
        );
      }
    }, [animate, initial]);

    const parsedWidthRatio =
      typeof animate?.width === "string" && animate.width.endsWith("%")
        ? Math.max(0, Math.min(1, parseFloat(animate.width) / 100))
        : null;

    const mergedStyle: React.CSSProperties = {
      ...style,
      willChange: "transform, opacity",
      ...(parsedWidthRatio !== null
        ? {
            width: "100%",
            transform: `scaleX(${parsedWidthRatio}) translate3d(0, 0, 0)`,
            transformOrigin: "left center",
            transition: "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)",
          }
        : {}),
    };

    return (
      <div
        ref={ref}
        className={`transform-gpu will-change-transform ${className ?? ""}`}
        style={mergedStyle}
        {...rest}
      >
        {children}
      </div>
    );
  },
};

// ============================================================================
// Country Codes Catalog for Step 3 Interactive Selector
// ============================================================================

export interface CountryOption {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  placeholder: string;
}

const COUNTRY_OPTIONS: CountryOption[] = [
  {
    code: "DZ",
    name: "Algeria (الجزائر — Law 18-07)",
    dialCode: "+213",
    flag: "🇩🇿",
    placeholder: "550123456 (5, 6, or 7 + 8 digits)",
  },
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    flag: "🇺🇸",
    placeholder: "4155552671",
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    flag: "🇬🇧",
    placeholder: "7911123456",
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    dialCode: "+966",
    flag: "🇸🇦",
    placeholder: "501234567",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "+971",
    flag: "🇦🇪",
    placeholder: "501234567",
  },
  {
    code: "EG",
    name: "Egypt",
    dialCode: "+20",
    flag: "🇪🇬",
    placeholder: "1012345678",
  },
  {
    code: "DE",
    name: "Germany",
    dialCode: "+49",
    flag: "🇩🇪",
    placeholder: "15123456789",
  },
  {
    code: "FR",
    name: "France",
    dialCode: "+33",
    flag: "🇫🇷",
    placeholder: "612345678",
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "+1",
    flag: "🇨🇦",
    placeholder: "4165550199",
  },
  {
    code: "IN",
    name: "India",
    dialCode: "+91",
    flag: "🇮🇳",
    placeholder: "9876543210",
  },
  {
    code: "SG",
    name: "Singapore",
    dialCode: "+65",
    flag: "🇸🇬",
    placeholder: "81234567",
  },
  {
    code: "JP",
    name: "Japan",
    dialCode: "+81",
    flag: "🇯🇵",
    placeholder: "9012345678",
  },
  {
    code: "AU",
    name: "Australia",
    dialCode: "+61",
    flag: "🇦🇺",
    placeholder: "412345678",
  },
];

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

const STEP_METADATA: {
  step: OnboardingStep;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    step: 1,
    title: "Account",
    subtitle: "Email & Password",
    icon: Lock,
  },
  {
    step: 2,
    title: "Email OTP",
    subtitle: "6-Digit Inbox Code",
    icon: Mail,
  },
  {
    step: 3,
    title: "Link Phone",
    subtitle: "E.164 Mobile Number",
    icon: Globe,
  },
  {
    step: 4,
    title: "SMS OTP",
    subtitle: "6-Digit Mobile Code",
    icon: Smartphone,
  },
  {
    step: 5,
    title: "Vault Ready",
    subtitle: "JWT Issued",
    icon: ShieldCheck,
  },
];

// ============================================================================
// Reusable 60-Second Visual Countdown Timer + Resend Button Component
// ============================================================================

interface ResendCountdownProps {
  secondsLeft: number;
  isResending: boolean;
  onResend: () => void;
  channelLabel: string;
}

const ResendCodeTimer: React.FC<ResendCountdownProps> = ({
  secondsLeft,
  isResending,
  onResend,
  channelLabel,
}) => {
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const progressOffset =
    circumference - (secondsLeft / 60) * circumference;

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-3">
      <div className="flex items-center gap-3">
        {secondsLeft > 0 ? (
          <div className="relative flex h-8 w-8 items-center justify-center">
            <svg className="h-8 w-8 -rotate-90 transform-gpu" viewBox="0 0 32 32">
              <circle
                vectorEffect="non-scaling-stroke"
                cx="16"
                cy="16"
                r={radius}
                stroke="currentColor"
                strokeWidth="2.5"
                fill="transparent"
                className="text-slate-800"
              />
              <circle
                vectorEffect="non-scaling-stroke"
                cx="16"
                cy="16"
                r={radius}
                stroke="currentColor"
                strokeWidth="2.5"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
                className="text-cyan-400 transition-[stroke-dashoffset,opacity] duration-1000 ease-linear"
              />
            </svg>
            <span className="absolute text-[10px] font-mono font-bold text-cyan-300">
              {secondsLeft}
            </span>
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <RefreshCw className="h-4 w-4" />
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-slate-300">
            Didn&apos;t receive the {channelLabel} code?
          </p>
          <p className="text-[11px] text-slate-500">
            {secondsLeft > 0
              ? `Anti-spam cooldown active (${secondsLeft}s remaining)`
              : "You can now request a fresh 6-digit OTP"}
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={secondsLeft > 0 || isResending}
        onClick={onResend}
        className="border-slate-700 bg-slate-800/80 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white disabled:opacity-45"
      >
        {isResending ? (
          <>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin text-cyan-400" />
            Sending...
          </>
        ) : secondsLeft > 0 ? (
          `Resend in 00:${secondsLeft.toString().padStart(2, "0")}`
        ) : (
          <>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Resend Code
          </>
        )}
      </Button>
    </div>
  );
};

// ============================================================================
// Main Multi-Step SaaS Onboarding Component
// ============================================================================

export function SaasOnboardingFlow({
  onComplete,
  embedded = false,
}: {
  onComplete?: (jwtToken: string) => void;
  embedded?: boolean;
}) {
  const router = useRouter();

  // Current onboarding step (1..5)
  const [step, setStep] = useState<OnboardingStep>(1);
  const [userId, setUserId] = useState<string>("");

  // Step 1: Account Creation state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");

  // Step 2: Email OTP state
  const [emailOtpDigits, setEmailOtpDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const emailOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [emailCooldown, setEmailCooldown] = useState<number>(60);
  const [sandboxEmailOtp, setSandboxEmailOtp] = useState<string | null>(null);

  // Step 3: Phone Linking state
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    COUNTRY_OPTIONS[0]
  );
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [localPhoneDigits, setLocalPhoneDigits] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");

  // Step 4: SMS OTP state
  const [smsOtpDigits, setSmsOtpDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const smsOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [smsCooldown, setSmsCooldown] = useState<number>(60);
  const [sandboxSmsOtp, setSandboxSmsOtp] = useState<string | null>(null);

  // Step 5: Issued JWT & Redirect Countdown
  const [issuedJwt, setIssuedJwt] = useState<string>("");
  const [redirectCountdown, setRedirectCountdown] = useState<number>(4);

  // Loading & Error Shake states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpErrorShake, setOtpErrorShake] = useState(0);

  // Filtered countries for dropdown
  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return COUNTRY_OPTIONS;
    return COUNTRY_OPTIONS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  // Real-time password validation metrics
  const passwordMetrics = useMemo(() => {
    const minLen = password.length >= 8;
    const hasCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const hasNum = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const score =
      (minLen ? 25 : 0) +
      (hasCase ? 25 : 0) +
      (hasNum ? 25 : 0) +
      (hasSpecial ? 25 : 0);
    return {
      minLen,
      hasCase,
      hasNum,
      hasSpecial,
      score,
      isValid: minLen && hasCase && hasNum,
    };
  }, [password]);

  const isEmailValid = useMemo(
    () =>
      /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,24}$/.test(
        email.trim()
      ),
    [email]
  );

  const e164PhoneNumber = useMemo(() => {
    const cleaned = localPhoneDigits.replace(/\D/g, "").replace(/^0+/, "");
    return `${selectedCountry.dialCode}${cleaned}`;
  }, [selectedCountry, localPhoneDigits]);

  const isPhoneValid = useMemo(
    () => /^\+213[567][0-9]{8}$/.test(e164PhoneNumber),
    [e164PhoneNumber]
  );

  // 60-second countdown timer for Step 2 (Email OTP)
  useEffect(() => {
    if (step !== 2 || emailCooldown <= 0) return;
    const id = setInterval(() => {
      setEmailCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [step, emailCooldown]);

  // 60-second countdown timer for Step 4 (SMS OTP)
  useEffect(() => {
    if (step !== 4 || smsCooldown <= 0) return;
    const id = setInterval(() => {
      setSmsCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [step, smsCooldown]);

  // Auto-redirect countdown on Step 5
  useEffect(() => {
    if (step !== 5) return;
    if (redirectCountdown <= 0) {
      if (onComplete) {
        onComplete(issuedJwt);
      } else {
        router.push("/vault");
      }
      return;
    }
    const id = setTimeout(() => {
      setRedirectCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(id);
  }, [step, redirectCountdown, issuedJwt, onComplete, router]);

  // Helper for 6-digit OTP inputs
  const handleOtpDigitChange = (
    index: number,
    value: string,
    digits: string[],
    setDigits: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    // Handle multi-digit paste
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6).split("");
      const next = [...digits];
      pasted.forEach((char, idx) => {
        if (index + idx < 6) next[index + idx] = char;
      });
      setDigits(next);
      const focusIdx = Math.min(5, index + pasted.length);
      refs.current[focusIdx]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    if (index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    digits: string[],
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  // ==========================================================================
  // Step 1 Handler: Create Account & Send Real Email OTP
  // ==========================================================================
  const handleStep1CreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid || !passwordMetrics.isValid) {
      toast.error("Please enter a valid email and meet the password requirements.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_account",
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create account.");
        return;
      }

      setUserId(data.user_id);
      setMaskedEmail(data.email_masked);
      setEmailCooldown(data.cooldown_secs || 60);
      setSandboxEmailOtp(data.sandbox_otp_preview || null);
      setEmailOtpDigits(["", "", "", "", "", ""]);
      setStep(2);

      toast.success(`6-digit verification code sent to ${data.email_masked}`);
      setTimeout(() => emailOtpRefs.current[0]?.focus(), 120);
    } catch {
      toast.error("Network error while contacting registration server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================================================
  // Step 2 Handler: Verify Email 6-Digit OTP
  // ==========================================================================
  const handleStep2VerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = emailOtpDigits.join("");
    if (code.length !== 6) {
      setOtpErrorShake((prev) => prev + 1);
      toast.error("Please enter all 6 digits of your Email OTP.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_email_otp",
          user_id: userId,
          email_otp: code,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setOtpErrorShake((prev) => prev + 1);
        toast.error(data.message || "Invalid Email OTP code.");
        return;
      }

      toast.success("Email verified! Now link your mobile phone number.");
      setStep(3);
    } catch {
      toast.error("Failed to verify email OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================================================
  // Step 3 Handler: Link Real Phone Number & Send SMS OTP
  // ==========================================================================
  const handleStep3LinkPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "link_phone",
          user_id: userId,
          phone_number: e164PhoneNumber,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Unable to send SMS verification code.");
        return;
      }

      setMaskedPhone(data.phone_masked);
      setSmsCooldown(data.cooldown_secs || 60);
      setSandboxSmsOtp(data.sandbox_otp_preview || null);
      setSmsOtpDigits(["", "", "", "", "", ""]);
      setStep(4);

      toast.success(`SMS OTP dispatched to ${data.phone_masked}`);
      setTimeout(() => smsOtpRefs.current[0]?.focus(), 120);
    } catch {
      toast.error("SMS gateway connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================================================
  // Step 4 Handler: Verify SMS OTP & Issue JWT
  // ==========================================================================
  const handleStep4VerifySmsOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = smsOtpDigits.join("");
    if (code.length !== 6) {
      setOtpErrorShake((prev) => prev + 1);
      toast.error("Please enter the 6-digit SMS verification code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_sms_otp",
          user_id: userId,
          phone_otp: code,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setOtpErrorShake((prev) => prev + 1);
        toast.error(data.message || "Invalid SMS OTP code.");
        return;
      }

      // Persist the signed JWT for authenticated Code Vault requests
      if (typeof window !== "undefined" && data.access_token) {
        window.localStorage.setItem("shieldcode_jwt", data.access_token);
        window.localStorage.setItem(
          "shieldcode_verified_user",
          JSON.stringify({
            user_id: data.user_id,
            email_masked: data.email_masked,
            phone_masked: data.phone_masked,
            email_verified: true,
            phone_verified: true,
          })
        );
      }

      setIssuedJwt(data.access_token);
      setRedirectCountdown(4);
      setStep(5);
      toast.success("Both Email and Phone verified! Issuing secure Vault JWT...");
    } catch {
      toast.error("Verification request failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================================================
  // Resend OTP Handler (60-Second Cooldown Protected)
  // ==========================================================================
  const handleResendOtp = async (channel: "email" | "sms") => {
    setIsResending(true);
    try {
      const res = await fetch("/api/v1/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resend_otp",
          user_id: userId,
          channel,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Rate limit active. Please wait before resending.");
        return;
      }

      if (channel === "email") {
        setEmailCooldown(data.cooldown_secs || 60);
        setSandboxEmailOtp(data.sandbox_otp_preview || null);
        setEmailOtpDigits(["", "", "", "", "", ""]);
        toast.success(`Fresh 6-digit Email OTP sent to ${maskedEmail}`);
        emailOtpRefs.current[0]?.focus();
      } else {
        setSmsCooldown(data.cooldown_secs || 60);
        setSandboxSmsOtp(data.sandbox_otp_preview || null);
        setSmsOtpDigits(["", "", "", "", "", ""]);
        toast.success(`Fresh 6-digit SMS OTP sent to ${maskedPhone}`);
        smsOtpRefs.current[0]?.focus();
      }
    } catch {
      toast.error("Failed to resend OTP code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden flex flex-col justify-between">
      {/* Ambient Fintech Cyber-Grid & Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[780px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-0 right-10 h-[360px] w-[460px] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-lg shadow-cyan-500/20">
              <Shield className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white">
                  ShieldCode Vault
                </span>
                <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30 text-[10px]">
                  SaaS Onboarding
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Zero-Trust Dual-Channel Identity Verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="border-slate-800 bg-slate-900/90 text-slate-300 gap-1.5 py-1 px-3"
            >
              <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
              AES-256-GCM + HS256 JWT
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 mx-auto w-full max-w-2xl px-6 py-10">
        {/* 5-Step Progress Indicator */}
        <div className="mb-8">
          <div className="grid grid-cols-5 gap-2">
            {STEP_METADATA.map((item) => {
              const Icon = item.icon;
              const isCompleted = step > item.step;
              const isCurrent = step === item.step;

              return (
                <div
                  key={item.step}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative flex items-center justify-center w-full mb-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border will-change-transform transform-gpu transition-[transform,opacity,colors] duration-300 ${
                        isCompleted
                          ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/10"
                          : isCurrent
                          ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 ring-4 ring-cyan-500/15 shadow-lg shadow-cyan-500/20"
                          : "border-slate-800 bg-slate-900/70 text-slate-500"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? "text-cyan-300"
                        : isCompleted
                        ? "text-emerald-300"
                        : "text-slate-500"
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:block">
                    {item.subtitle}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Animated Progress Bar */}
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800/80">
            <motion.div
              animate={{ width: `${(step / 5) * 100}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400"
            />
          </div>
        </div>

        {/* Step Cards */}
        <AnimatePresence mode="wait">
          {/* ================================================================
              STEP 1: ACCOUNT CREATION (EMAIL & PASSWORD)
          ================================================================ */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
            >
              <Card className="border-slate-800/90 bg-slate-900/70 backdrop-blur-xl shadow-2xl text-slate-100">
                <CardHeader className="space-y-1 pb-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30">
                      Step 1 of 5 • Account Creation
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">
                      POST /register
                    </span>
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-white pt-2">
                    Create Your ShieldCode SaaS Account
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Enter your real email address and a strong master password. Both
                    email and phone verification are strictly required before
                    accessing the Anti-Phishing Code Vault.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleStep1CreateAccount} className="space-y-5">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Work or Personal Email Address
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          type="email"
                          required
                          placeholder="alex.morgan@fintech-corp.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-11 border-slate-700/80 bg-slate-950/80 pl-10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500"
                        />
                        {email.length > 3 && (
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                            {isEmailValid ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-400" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Master Vault Password
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="Minimum 8 characters with letters & digits"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-11 border-slate-700/80 bg-slate-950/80 pl-10 pr-10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {/* Password Strength Meter */}
                      <div className="space-y-2 pt-1">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                          <motion.div
                            animate={{ width: `${passwordMetrics.score}%` }}
                            className={`h-full transition-colors ${
                              passwordMetrics.score <= 25
                                ? "bg-rose-500"
                                : passwordMetrics.score <= 50
                                ? "bg-amber-500"
                                : passwordMetrics.score <= 75
                                ? "bg-cyan-400"
                                : "bg-emerald-400"
                            }`}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div
                            className={`flex items-center gap-1.5 ${
                              passwordMetrics.minLen
                                ? "text-emerald-400"
                                : "text-slate-500"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" /> 8+ characters
                          </div>
                          <div
                            className={`flex items-center gap-1.5 ${
                              passwordMetrics.hasCase
                                ? "text-emerald-400"
                                : "text-slate-500"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" /> Upper & lowercase
                          </div>
                          <div
                            className={`flex items-center gap-1.5 ${
                              passwordMetrics.hasNum
                                ? "text-emerald-400"
                                : "text-slate-500"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" /> At least 1 digit
                          </div>
                          <div
                            className={`flex items-center gap-1.5 ${
                              passwordMetrics.hasSpecial
                                ? "text-emerald-400"
                                : "text-slate-500"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" /> Special symbol
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={
                        isSubmitting || !isEmailValid || !passwordMetrics.isValid
                      }
                      className="h-11 w-full bg-gradient-to-r from-cyan-500 to-emerald-500 font-semibold text-slate-950 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Dispatching 6-Digit Email OTP via SMTP...
                        </>
                      ) : (
                        <>
                          Continue & Send Email OTP
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ================================================================
              STEP 2: EMAIL VERIFICATION (6-DIGIT OTP + 60S RESEND TIMER)
          ================================================================ */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
            >
              <Card className="border-slate-800/90 bg-slate-900/70 backdrop-blur-xl shadow-2xl text-slate-100">
                <CardHeader className="space-y-1 pb-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30">
                      Step 2 of 5 • Email Verification
                    </Badge>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Change email
                    </button>
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-white pt-2">
                    Check Your Email Inbox
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    We sent a 6-digit verification code via{" "}
                    <code className="text-cyan-300">lettre</code> SMTP to{" "}
                    <span className="font-semibold text-slate-200">
                      {maskedEmail || email}
                    </span>
                    . Enter it below to verify ownership.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Live Sandbox Helper Banner for instant testing */}
                  {sandboxEmailOtp && (
                    <div className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
                        <span className="text-slate-300">
                          Live SMTP Sandbox OTP:{" "}
                          <strong className="font-mono text-sm text-cyan-300 tracking-widest">
                            {sandboxEmailOtp}
                          </strong>
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setEmailOtpDigits(sandboxEmailOtp.split(""))
                        }
                        className="h-7 text-xs text-cyan-300 hover:bg-cyan-500/20 hover:text-white"
                      >
                        Auto-Fill OTP
                      </Button>
                    </div>
                  )}

                  <form onSubmit={handleStep2VerifyEmailOtp} className="space-y-6">
                    {/* 6-Digit Split OTP Input Grid with Shake on Invalid OTP */}
                    <motion.div
                      key={otpErrorShake}
                      animate={
                        otpErrorShake > 0
                          ? { x: [0, -10, 10, -7, 7, -3, 3, 0] }
                          : undefined
                      }
                      className="flex justify-center gap-2.5 sm:gap-3"
                    >
                      {emailOtpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            emailOtpRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          onChange={(e) =>
                            handleOtpDigitChange(
                              idx,
                              e.target.value,
                              emailOtpDigits,
                              setEmailOtpDigits,
                              emailOtpRefs
                            )
                          }
                          onKeyDown={(e) =>
                            handleOtpKeyDown(
                              idx,
                              e,
                              emailOtpDigits,
                              emailOtpRefs
                            )
                          }
                          className="h-14 w-11 sm:h-16 sm:w-13 rounded-xl border border-slate-700 bg-slate-950 text-center font-mono text-xl font-bold text-cyan-300 shadow-inner transition-colors duration-200 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                        />
                      ))}
                    </motion.div>

                    {/* 60-Second Visual Countdown Timer + Resend Button */}
                    <ResendCodeTimer
                      secondsLeft={emailCooldown}
                      isResending={isResending}
                      onResend={() => handleResendOtp("email")}
                      channelLabel="Email"
                    />

                    <Button
                      type="submit"
                      disabled={
                        isSubmitting || emailOtpDigits.join("").length !== 6
                      }
                      className="h-11 w-full bg-gradient-to-r from-cyan-500 to-emerald-500 font-semibold text-slate-950 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying Email OTP...
                        </>
                      ) : (
                        <>
                          Verify Email & Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ================================================================
              STEP 3: PHONE LINKING (INTERACTIVE COUNTRY CODE DROPDOWN)
          ================================================================ */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
            >
              <Card className="border-slate-800/90 bg-slate-900/70 backdrop-blur-xl shadow-2xl text-slate-100">
                <CardHeader className="space-y-1 pb-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                      Step 3 of 5 • Phone Linking
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-[11px]"
                    >
                      <Check className="mr-1 h-3 w-3" /> Email Verified
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-white pt-2">
                    Link Your Mobile Phone Number
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Select your country code and enter your mobile number. Our{" "}
                    <code className="text-cyan-300">reqwest</code> SMS Gateway will
                    dispatch a 6-digit OTP to complete dual-factor onboarding.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleStep3LinkPhone} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Mobile Phone Number (E.164 Standard)
                      </label>

                      <div className="relative flex gap-2">
                        {/* Interactive Country Code Dropdown Button */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setCountryDropdownOpen((prev) => !prev)
                            }
                            className="flex h-11 items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-950/90 px-3 text-sm font-medium text-slate-100 hover:border-cyan-500/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                          >
                            <span className="text-lg leading-none">
                              {selectedCountry.flag}
                            </span>
                            <span className="font-mono text-cyan-300">
                              {selectedCountry.dialCode}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                          </button>

                          {/* Searchable Country Dropdown Menu */}
                          {countryDropdownOpen && (
                            <div className="absolute left-0 top-12 z-50 w-72 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl">
                              <div className="relative mb-2">
                                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <input
                                  type="text"
                                  placeholder="Search country or +code..."
                                  value={countrySearch}
                                  onChange={(e) =>
                                    setCountrySearch(e.target.value)
                                  }
                                  className="h-8 w-full rounded-lg border border-slate-800 bg-slate-950 pl-8 pr-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
                                />
                              </div>

                              <div className="max-h-52 overflow-y-auto space-y-0.5">
                                {filteredCountries.map((country) => (
                                  <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCountry(country);
                                      setCountryDropdownOpen(false);
                                      setCountrySearch("");
                                    }}
                                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                                      selectedCountry.code === country.code
                                        ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                                        : "text-slate-300 hover:bg-slate-800"
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className="text-base">
                                        {country.flag}
                                      </span>
                                      <span>{country.name}</span>
                                    </span>
                                    <span className="font-mono text-slate-400">
                                      {country.dialCode}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Phone Digits Input */}
                        <div className="relative flex-1">
                          <Smartphone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            type="tel"
                            required
                            placeholder={selectedCountry.placeholder}
                            value={localPhoneDigits}
                            onChange={(e) =>
                              setLocalPhoneDigits(
                                e.target.value.replace(/[^\d\s\-]/g, "")
                              )
                            }
                            className="h-11 border-slate-700/80 bg-slate-950/80 pl-10 font-mono text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-500"
                          />
                        </div>
                      </div>

                      {/* Formatted E.164 Preview Bar */}
                      <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/60 px-3 py-2 text-xs">
                        <span className="text-slate-400">
                          Normalized E.164 Gateway Target:
                        </span>
                        <span
                          className={`font-mono font-semibold ${
                            isPhoneValid ? "text-emerald-400" : "text-amber-400"
                          }`}
                        >
                          {e164PhoneNumber}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || !isPhoneValid}
                      className="h-11 w-full bg-gradient-to-r from-cyan-500 to-emerald-500 font-semibold text-slate-950 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Calling External SMS Gateway API...
                        </>
                      ) : (
                        <>
                          Send 6-Digit SMS Code
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ================================================================
              STEP 4: SMS VERIFICATION (6-DIGIT OTP + 60S RESEND TIMER)
          ================================================================ */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
            >
              <Card className="border-slate-800/90 bg-slate-900/70 backdrop-blur-xl shadow-2xl text-slate-100">
                <CardHeader className="space-y-1 pb-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30">
                      Step 4 of 5 • SMS Verification
                    </Badge>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Change phone
                    </button>
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-white pt-2">
                    Enter Your 6-Digit SMS Code
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    We dispatched an SMS verification code to{" "}
                    <span className="font-mono font-semibold text-slate-200">
                      {maskedPhone || e164PhoneNumber}
                    </span>
                    . Verify to unlock your Anti-Phishing Code Vault.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Live Sandbox SMS OTP Preview */}
                  {sandboxSmsOtp && (
                    <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-300">
                          Live SMS Gateway OTP:{" "}
                          <strong className="font-mono text-sm text-emerald-300 tracking-widest">
                            {sandboxSmsOtp}
                          </strong>
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setSmsOtpDigits(sandboxSmsOtp.split(""))
                        }
                        className="h-7 text-xs text-emerald-300 hover:bg-emerald-500/20 hover:text-white"
                      >
                        Auto-Fill SMS
                      </Button>
                    </div>
                  )}

                  <form onSubmit={handleStep4VerifySmsOtp} className="space-y-6">
                    {/* 6-Digit SMS OTP Grid with Shake Animation */}
                    <motion.div
                      key={otpErrorShake}
                      animate={
                        otpErrorShake > 0
                          ? { x: [0, -10, 10, -7, 7, -3, 3, 0] }
                          : undefined
                      }
                      className="flex justify-center gap-2.5 sm:gap-3"
                    >
                      {smsOtpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            smsOtpRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          onChange={(e) =>
                            handleOtpDigitChange(
                              idx,
                              e.target.value,
                              smsOtpDigits,
                              setSmsOtpDigits,
                              smsOtpRefs
                            )
                          }
                          onKeyDown={(e) =>
                            handleOtpKeyDown(
                              idx,
                              e,
                              smsOtpDigits,
                              smsOtpRefs
                            )
                          }
                          className="h-14 w-11 sm:h-16 sm:w-13 rounded-xl border border-slate-700 bg-slate-950 text-center font-mono text-xl font-bold text-emerald-300 shadow-inner transition-colors duration-200 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      ))}
                    </motion.div>

                    {/* 60-Second Anti-SMS-Bombing Visual Timer + Resend Button */}
                    <ResendCodeTimer
                      secondsLeft={smsCooldown}
                      isResending={isResending}
                      onResend={() => handleResendOtp("sms")}
                      channelLabel="SMS"
                    />

                    <Button
                      type="submit"
                      disabled={
                        isSubmitting || smsOtpDigits.join("").length !== 6
                      }
                      className="h-11 w-full bg-gradient-to-r from-emerald-500 to-cyan-500 font-semibold text-slate-950 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying SMS OTP & Minting JWT...
                        </>
                      ) : (
                        <>
                          Complete Verification & Issue JWT
                          <ShieldCheck className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ================================================================
              STEP 5: SUCCESS & REDIRECTION TO SECURE CODE VAULT
          ================================================================ */}
          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
            >
              <Card className="border-emerald-500/40 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 text-slate-100">
                <CardContent className="pt-8 pb-8 px-6 text-center space-y-6">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-emerald-400/40 shadow-lg shadow-emerald-500/20">
                    <ShieldCheck className="h-10 w-10 text-emerald-400" />
                  </div>

                  <div className="space-y-2">
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                      Step 5 of 5 • Dual Identity Verified
                    </Badge>
                    <h2 className="text-2xl font-bold text-white">
                      Your Code Vault Is Now Unlocked!
                    </h2>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                      Both your email inbox and E.164 mobile phone have been
                      cryptographically verified. A signed{" "}
                      <code className="text-emerald-300">HS256</code> session JWT
                      has been issued.
                    </p>
                  </div>

                  {/* Verification Summary Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                        Email Verified (SMTP)
                      </div>
                      <p className="mt-1 font-mono text-xs text-slate-300">
                        {maskedEmail || email}
                      </p>
                    </div>

                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                        Phone Verified (SMS)
                      </div>
                      <p className="mt-1 font-mono text-xs text-slate-300">
                        {maskedPhone || e164PhoneNumber}
                      </p>
                    </div>
                  </div>

                  {/* Issued JWT Preview Box */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Issued Session Bearer JWT
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        email_verified: true • phone_verified: true
                      </span>
                    </div>
                    <p className="truncate font-mono text-xs text-cyan-300">
                      {issuedJwt}
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      if (onComplete) {
                        onComplete(issuedJwt);
                      } else {
                        router.push("/vault");
                      }
                    }}
                    className="h-12 w-full bg-gradient-to-r from-emerald-500 to-cyan-500 font-bold text-slate-950 hover:from-emerald-400 hover:to-cyan-400"
                  >
                    Configure Your Anti-Phishing Code Now ({redirectCountdown}s)
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        ShieldCode Anti-Phishing API Vault • Enforcing Dual-OTP Verification &
        AES-256-GCM Memory Hygiene
      </footer>
    </div>
  );
}
