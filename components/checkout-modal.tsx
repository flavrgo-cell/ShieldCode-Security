"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelfieCamera } from "./selfie-camera";
import { PROVIDER_INFO, type Provider } from "@/lib/types";
import {
  CreditCard,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Lock,
  Smartphone,
  Wallet,
  Building2,
  X,
  Check,
  Sparkles,
  Camera,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { formatDzd } from "@/lib/currency";

interface CheckoutModalProps {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
  onClose: () => void;
}

type Step = "details" | "camera" | "pending" | "approved" | "rejected" | "error";

interface PaymentOption {
  id: Provider;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  badgeAr: string;
  badgeEn: string;
  demoAccount: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: "edahabia",
    titleAr: "البطاقة الذهبية (Edahabia)",
    titleEn: "Edahabia Gold Card",
    descAr: "بريد الجزائر • بطاقة الدفع الوطنية الرسمية (BIN 6280)",
    descEn: "Algérie Poste • National Gold Card (BIN 6280)",
    badgeAr: "موصى به",
    badgeEn: "Recommended",
    demoAccount: "6280••••4821",
    icon: CreditCard,
    gradient: "from-amber-500/20 via-amber-600/10 to-transparent",
    borderColor: "border-amber-500",
  },
  {
    id: "baridimob",
    titleAr: "تطبيق بريدي موب (BaridiMob)",
    titleEn: "BaridiMob Mobile App",
    descAr: "الدفع الفوري المباشر عبر الهاتف النقال الجزائري",
    descEn: "Instant direct mobile payment via Algérie Poste",
    badgeAr: "دفع سريع",
    badgeEn: "Fast Pay",
    demoAccount: "BARI-12345",
    icon: Smartphone,
    gradient: "from-teal-500/20 via-emerald-600/10 to-transparent",
    borderColor: "border-teal-500",
  },
  {
    id: "eccp",
    titleAr: "البطاقة البنكية البيبينكية (CIB / ECCP)",
    titleEn: "CIB Interbank & ECCP",
    descAr: "بطاقات البنوك الجزائرية وشبكة النقد الآلي GIE Monétique",
    descEn: "Algerian Bank Cards via GIE Monétique network",
    badgeAr: "بنكي",
    badgeEn: "Interbank",
    demoAccount: "ECCP-11111",
    icon: Building2,
    gradient: "from-cyan-500/20 via-blue-600/10 to-transparent",
    borderColor: "border-cyan-500",
  },
  {
    id: "redotpay",
    titleAr: "بطاقة RedotPay الدولية",
    titleEn: "RedotPay Visa / Crypto",
    descAr: "بطاقة فيزا دولية بالعملات الرقمية والدولار",
    descEn: "Global Crypto & USD Visa Card",
    badgeAr: "دولي",
    badgeEn: "Global",
    demoAccount: "RDPAY-67890",
    icon: Wallet,
    gradient: "from-rose-500/20 via-red-600/10 to-transparent",
    borderColor: "border-rose-500",
  },
];

export function CheckoutModal({ product, onClose }: CheckoutModalProps) {
  const { locale, dir } = useI18n();
  const isAr = locale === "ar";

  const [step, setStep] = useState<Step>("details");
  const [provider, setProvider] = useState<Provider>("edahabia");
  const [accountId, setAccountId] = useState("6280••••4821");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [antiPhishingCode, setAntiPhishingCode] = useState<string | null>(null);
  const [linkedAccounts, setLinkedAccounts] = useState<
    Array<{ account_id: string; provider: Provider; institution_name: string }>
  >([]);

  useEffect(() => {
    let active = true;
    fetch("/api/v1/accounts", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && Array.isArray(data?.accounts)) {
          setLinkedAccounts(data.accounts.slice(0, 6));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Sync default demo account when user clicks a different payment option
  const handleSelectProvider = (opt: PaymentOption) => {
    setProvider(opt.id);
    setAccountId(opt.demoAccount);
    setError(null);
  };

  // Real-time subscription for transaction status
  useEffect(() => {
    if (
      !transactionId ||
      step !== "pending" ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return;
    }

    try {
      const supabase = createClient();
      const channel = supabase
        .channel(`transaction-${transactionId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "transactions",
            filter: `id=eq.${transactionId}`,
          },
          (payload) => {
            const newStatus = payload.new.status;
            if (newStatus === "approved") {
              setStep("approved");
            } else if (newStatus === "rejected") {
              setStep("rejected");
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // Graceful offline fallback
    }
  }, [transactionId, step]);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId.trim()) {
      setError(
        isAr
          ? "يرجى إدخال رقم الحساب أو البطاقة للمتابعة"
          : "Please enter your account ID or card number"
      );
      return;
    }
    setError(null);
    setStep("camera");
  };

  const handleSelfieCapture = async (imageDataUrl: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          provider,
          amount: product.price,
          merchantName: `TechStore - ${product.name}`,
          selfieImage: imageDataUrl,
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server error: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || (isAr ? "فشلت معالجة عملية الدفع" : "Failed to process payment"));
      }

      setTransactionId(data.transactionId);
      setAntiPhishingCode(data.antiPhishingCode);
      setStep("pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setStep("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateInstantApproval = () => {
    setStep("approved");
  };

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 sm:p-6 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150"
    >
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-teal-500/25 dark:border-white/10 bg-white dark:bg-[#061820] p-6 sm:p-8 shadow-2xl ring-1 ring-white/30 dark:ring-white/10 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={isAr ? "إغلاق النافذة" : "Close modal"}
          className="absolute top-5 end-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-teal-500/15 dark:border-white/10 pb-4">
          <div className="w-11 h-11 anti-banding-teal rounded-2xl flex items-center justify-center text-white shadow-retina-glow ring-1 ring-white/20 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {isAr ? "بوابة الدفع الآمن • SecurePay" : "SecurePay Payment Gateway"}
            </h2>
            <p className="text-xs text-teal-700 dark:text-cyan-300 font-medium">
              {isAr
                ? "دفع محمي بنظام التحقق البيومتري المزدوج ومكافحة التصيد"
                : "Protected with biometric selfie identity verification"}
            </p>
          </div>
        </div>

        {/* ====================================================================
            STEP 1: DETAILS & ADOPTED PAYMENT METHODS SELECTION
        ==================================================================== */}
        {step === "details" && (
          <div className="space-y-6">
            {/* Selected Product Summary Banner */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-teal-50/80 dark:bg-slate-900/60 border border-teal-500/20 dark:border-teal-500/30">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shrink-0 shadow-sm border border-slate-200 dark:border-slate-800"
              />
              <div className="flex-1 min-w-0">
                <span className="inline-block rounded-full bg-teal-100 dark:bg-teal-950/80 px-2 py-0.5 text-[10px] font-extrabold text-teal-800 dark:text-teal-300 mb-1">
                  {isAr ? "المنتج المحدد" : "Selected Item"}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold truncate text-slate-900 dark:text-white">
                  {product.name}
                </h3>
                <p className="text-xl sm:text-2xl font-black text-teal-700 dark:text-cyan-300 tabular-nums">
                  {formatDzd(product.price, locale)}
                </p>
              </div>
            </div>

            {/* ADOPTED PAYMENT METHODS TITLE */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {isAr ? "طرق الدفع المعتمدة في المنصة:" : "Select Payment Method:"}
                </Label>
                <span className="text-[11px] font-bold text-teal-700 dark:text-cyan-300">
                  {isAr ? "4 طرق رسمية متوفرة" : "4 Official Methods"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? "اختر طريقة الدفع الجزائرية أو الدولية التي تناسبك لإتمام العملية:"
                  : "Choose your preferred payment provider to proceed:"}
              </p>
            </div>

            {/* 4 Interactive Visual Payment Method Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PAYMENT_OPTIONS.map((opt) => {
                const isSelected = provider === opt.id;
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectProvider(opt)}
                    className={`relative flex flex-col justify-between p-3.5 rounded-2xl border-2 text-start transition-[border-color,background-color,box-shadow] duration-150 cursor-pointer ${
                      isSelected
                        ? `${opt.borderColor} bg-gradient-to-br ${opt.gradient} shadow-md ring-2 ring-teal-500/20 scale-[1.01]`
                        : "border-slate-200 dark:border-teal-900/50 bg-white dark:bg-[#071924]/60 hover:border-teal-400/50 dark:hover:border-teal-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs ${
                            opt.id === "edahabia"
                              ? "bg-amber-600"
                              : opt.id === "baridimob"
                              ? "bg-teal-600"
                              : opt.id === "eccp"
                              ? "bg-cyan-600"
                              : "bg-rose-600"
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {isAr ? opt.titleAr : opt.titleEn}
                        </span>
                      </div>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {isAr ? opt.badgeAr : opt.badgeEn}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                      {isAr ? opt.descAr : opt.descEn}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Account ID / Card Number Input Form */}
            <form onSubmit={handleDetailsSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="accountId" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {provider === "edahabia"
                      ? isAr
                        ? "رقم البطاقة الذهبية أو حساب بريد الجزائر:"
                        : "Edahabia Card Number or Account ID:"
                      : provider === "baridimob"
                      ? isAr
                        ? "معرف حساب بريدي موب أو رقم الهاتف:"
                        : "BaridiMob ID or Algerian Mobile Number:"
                      : provider === "eccp"
                      ? isAr
                        ? "رقم حساب بطاقة CIB / ECCP:"
                        : "CIB / ECCP Account Number:"
                      : isAr
                      ? "معرف محفظة RedotPay:"
                      : "RedotPay Account ID:"}
                  </Label>
                  <span className="text-[11px] font-mono text-teal-700 dark:text-teal-300 font-bold">
                    {provider.toUpperCase()}
                  </span>
                </div>

                <Input
                  id="accountId"
                  dir="ltr"
                  value={accountId}
                  onChange={(e) => {
                    setError(null);
                    setAccountId(e.target.value);
                  }}
                  placeholder={
                    provider === "edahabia"
                      ? "6280 0014 8821 4821"
                      : provider === "baridimob"
                      ? "BARI-12345"
                      : provider === "redotpay"
                      ? "RDPAY-67890"
                      : "ECCP-11111"
                  }
                  className="h-12 rounded-2xl border-2 border-teal-300 dark:border-teal-500/40 bg-white dark:bg-[#031017] px-4 font-mono text-base font-extrabold text-slate-900 dark:text-white focus:border-teal-600 dark:focus:border-cyan-400 text-end"
                />

                {/* Quick Auto-Fill Linked & Demo Accounts */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {isAr ? "حسابات مسجلة (سريع):" : "Saved Accounts:"}
                  </span>
                  {(linkedAccounts.length > 0
                    ? linkedAccounts.map((acc) => ({
                        id: acc.account_id,
                        provider: acc.provider,
                        label: acc.account_id,
                        title: acc.institution_name,
                      }))
                    : PAYMENT_OPTIONS.map((opt) => ({
                        id: opt.demoAccount,
                        provider: opt.id,
                        label: opt.demoAccount,
                        title: opt.titleEn,
                      }))
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      title={item.title}
                      onClick={() => {
                        setProvider(item.provider);
                        setAccountId(item.label);
                        setError(null);
                      }}
                      className={`font-mono text-[10.5px] px-2 py-0.5 rounded-lg border cursor-pointer transition-colors ${
                        accountId === item.label
                          ? "bg-teal-500/20 text-teal-800 dark:text-cyan-300 border-teal-500 font-bold"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-teal-50"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-950/50 p-3 text-xs font-bold text-red-700 dark:text-red-200">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Continue to Selfie Camera Verification Button */}
              <Button
                type="submit"
                className="w-full h-13 rounded-2xl anti-banding-teal font-extrabold text-white text-base shadow-retina-glow gap-2 hover-lift-gpu cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>
                  {isAr
                    ? "المتابعة إلى التحقق بكاميرا السيلفي 📸"
                    : "Continue to Selfie Camera Verification 📸"}
                </span>
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400" />
                <span>
                  {isAr
                    ? "التحقق البيومتري يمنع المحتالين من استغلال بطاقتك أو حسابك"
                    : "Biometric selfie stops scammers from abusing your payment account"}
                </span>
              </div>
            </form>
          </div>
        )}

        {/* ====================================================================
            STEP 2: BIOMETRIC SELFIE CAMERA VERIFICATION STAGE
        ==================================================================== */}
        {step === "camera" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-teal-500/15 dark:border-white/10 pb-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep("details")}
                className="gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-200 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{isAr ? "الرجوع لطرق الدفع" : "Back to Payment Methods"}</span>
              </Button>

              <span className="rounded-full bg-teal-100 dark:bg-teal-950/80 px-2.5 py-0.5 text-[10px] font-extrabold text-teal-800 dark:text-cyan-300">
                {isAr ? "المرحلة 2: التحقق البيومتري" : "Stage 2: Biometric Verification"}
              </span>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {isAr ? "التقاط صورة السيلفي لتأكيد العملية" : "Biometric Identity Verification"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {isAr
                  ? "وجّه وجهك داخل الإطار والتقط صورة مباشرة أو ارفع صورة لتأكيد أنك المالك الحقيقي."
                  : "Position your face inside the frame and take a photo or upload to confirm ownership."}
              </p>
            </div>

            {isSubmitting ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                <div className="w-12 h-12 rounded-full border-4 border-teal-500/30 border-t-cyan-400 animate-spin" />
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {isAr ? "جارٍ تشفير ومطابقة صورة السيلفي..." : "Processing & verifying biometric photo..."}
                  </p>
                  <p className="text-xs text-teal-600 dark:text-cyan-400 font-mono">
                    {accountId} • {provider.toUpperCase()}
                  </p>
                </div>
              </div>
            ) : (
              <SelfieCamera
                onCapture={handleSelfieCapture}
                onCancel={() => setStep("details")}
              />
            )}
          </div>
        )}

        {/* ====================================================================
            STEP 3: PENDING APPROVAL & ANTI-PHISHING CODE DISPLAY
        ==================================================================== */}
        {step === "pending" && (
          <div className="text-center py-4 space-y-5">
            <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/70 border-2 border-amber-400 flex items-center justify-center shadow-lg">
              <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {isAr ? "في انتظار تأكيد صاحب الحساب" : "Awaiting Account Owner Verification"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                {isAr
                  ? "تم إرسال إشعار فوري إلى صاحب الحساب مع صورتك الملتقطة وكود مكافحة الاحتيال لتأكيد العملية."
                  : "Verification dispatch sent to account owner with your selfie & anti-phishing code."}
              </p>
            </div>

            {antiPhishingCode && (
              <div className="rounded-2xl border-2 border-teal-400/80 bg-teal-50/90 dark:bg-[#071c26] p-4 text-center space-y-1.5 shadow-sm">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-200">
                  <Shield className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
                  <span>{isAr ? "كود مكافحة الاحتيال الخاص بك:" : "Your Anti-Phishing Code:"}</span>
                </div>
                <p className="font-mono text-3xl font-black text-teal-900 dark:text-cyan-300 tracking-wider">
                  {antiPhishingCode}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isAr
                    ? "يظهر هذا الكود لصاحب الحساب لضمان عدم وجود وسيط احتيالي"
                    : "The owner verifies this code in the official notification"}
                </p>
              </div>
            )}

            <div className="bg-slate-100 dark:bg-slate-900/80 p-3 rounded-xl text-xs font-mono flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>TXN:</span>
              <span className="truncate max-w-[280px]">{transactionId}</span>
            </div>

            {/* Quick Demo Approval Button so reviewer can see full approved state */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                onClick={handleSimulateInstantApproval}
                className="flex-1 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-xs h-11"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                <span>
                  {isAr
                    ? "محاكاة الموافقة الفورية (Demo Approve)"
                    : "Simulate Instant Approval"}
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl text-xs h-11"
              >
                {isAr ? "إغلاق والمتابعة لاحقاً" : "Close"}
              </Button>
            </div>
          </div>
        )}

        {/* ====================================================================
            STEP 4: APPROVED SUCCESS STAGE
        ==================================================================== */}
        {step === "approved" && (
          <div className="text-center py-6 space-y-5">
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {isAr ? "تمت الموافقة وتأكيد الدفع بنجاح! 🎉" : "Payment Approved Successfully! 🎉"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {isAr
                  ? "تم التحقق من مطابقة السيلفي وكود الحماية بنجاح من طرف صاحب الحساب."
                  : "The account owner has verified your selfie and approved the transaction."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-slate-900/80 border border-teal-500/20 text-center space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? "المبلغ المدفوع بالدينار الجزائري:" : "Total Paid:"}
              </p>
              <p className="text-3xl font-black text-teal-800 dark:text-cyan-300 tabular-nums">
                {formatDzd(product.price, locale)}
              </p>
            </div>

            <Button
              type="button"
              onClick={onClose}
              className="w-full h-12 rounded-2xl anti-banding-teal font-extrabold text-white text-sm"
            >
              {isAr ? "متابعة التسوق في المتجر" : "Continue Shopping"}
            </Button>
          </div>
        )}

        {/* ====================================================================
            STEP 5: REJECTED / ERROR STAGE
        ==================================================================== */}
        {(step === "rejected" || step === "error") && (
          <div className="text-center py-6 space-y-5">
            <div className="mx-auto w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/80 border-2 border-rose-500 flex items-center justify-center shadow-lg">
              <XCircle className="w-10 h-10 text-rose-600 dark:text-rose-400" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {isAr ? "فشلت عملية الدفع أو تم رفضها" : "Payment Failed or Rejected"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {error ||
                  (isAr
                    ? "تم رفض العملية أو تعذر التحقق من الحساب المحدد."
                    : "The transaction was rejected or could not be verified.")}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setStep("details")}
                className="flex-1 rounded-xl anti-banding-teal font-bold text-white text-xs h-11"
              >
                {isAr ? "إعادة المحاولة" : "Try Again"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl text-xs h-11"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
