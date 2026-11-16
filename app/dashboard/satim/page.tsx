"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  CreditCard,
  Lock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  Building,
  RefreshCw,
  Info,
  ArrowRight,
  Flame,
  GraduationCap,
  Home as HomeIcon,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import type { MockUser } from "@/lib/types";
import { sendBankSMS, saveSMSMessage } from "@/lib/sms-service";
import { SMSInboxModal } from "@/components/sms-inbox-modal";

interface Merchant {
  id: string;
  name: string;
  category: string;
  amount: number;
  icon: any;
  color: string;
  orderId: string;
}

const MERCHANTS: Merchant[] = [
  {
    id: "sonelgaz",
    name: "سونلغاز — فاتورة الكهرباء والغاز",
    category: "فواتير الخدمات العمومية",
    amount: 4850,
    icon: Flame,
    color: "#f59e0b",
    orderId: "SNLG-2026-99128",
  },
  {
    id: "anem",
    name: "منصة منحة البطالة (ANEM)",
    category: "الخدمات الحكومية والتحقق المالي",
    amount: 200,
    icon: GraduationCap,
    color: "#3b82f6",
    orderId: "ANEM-VERIF-7721",
  },
  {
    id: "aadl",
    name: "سكنات عدل — دفع الشطر المالي",
    category: "السكن والعمران",
    amount: 25000,
    icon: HomeIcon,
    color: "#10b981",
    orderId: "AADL-PAY-44019",
  },
  {
    id: "ecommerce",
    name: "المتجر الجزائري للتجارة الإلكترونية",
    category: "شراء وتجهيزات إلكترونية",
    amount: 14500,
    icon: ShoppingBag,
    color: "#8b5cf6",
    orderId: "SHOP-ALG-88301",
  },
];

export default function SatimNationalGatewayPage() {
  const router = useRouter();
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Merchant selection
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant>(MERCHANTS[0]);

  // Card form states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");

  // Gateway mode: Official SATIM vs Phishing Fake Gateway
  const [isPhishingMode, setIsPhishingMode] = useState(false);

  // Transaction flow states
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "verifying" | "success" | "phished" | "error">("idle");
  const [smsModalOpen, setSmsModalOpen] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.replace("/login");
    } else {
      setUser(currentUser);
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

  // Quick fill user's registered card details
  const fillUserCard = () => {
    setCardNumber(user.cardNumber || "4532 1234 5678 9012");
    setCardExpiry(user.cardExpiry || "12/27");
    setCardCVV(user.cardCVV || "123");
  };

  // Format card number with spaces (#### #### #### ####)
  const handleCardNumberChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    setCardNumber(formatted);
  };

  // Check if current card belongs to the user
  const isCardRecognized =
    cardNumber.replace(/\s/g, "").length >= 8 &&
    (user.cardNumber.replace(/\s/g, "").startsWith(cardNumber.replace(/\s/g, "").slice(0, 8)) ||
      cardNumber.replace(/\s/g, "") === user.cardNumber.replace(/\s/g, ""));

  // Send OTP
  const handleSendOtp = () => {
    if (!cardNumber || !cardExpiry || !cardCVV) {
      alert("يرجى ملء جميع بيانات البطاقة");
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);

    if (isPhishingMode) {
      // IN PHISHING MODE:
      // Scammer server intercepts the request and sends a FAKE SMS WITHOUT the user's Anti-Phishing code!
      const fakeMsg = {
        id: `sms_phish_${Date.now()}`,
        userId: user.id,
        accountNumber: user.accountNumber,
        sender: "SATIM-ALGERIE",
        text: `[⚠️ رسالة غير موثقة - لا يوجد رمز حماية]\nتأكيد دفع ${selectedMerchant.amount} دج لـ ${selectedMerchant.name}. رمز التحقق OTP هو: ${otp}. لا تشارك هذا الرمز مع أي شخص.`,
        date: new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now(),
        type: "otp" as const,
        isPhishing: true,
      };
      saveSMSMessage(fakeMsg);
    } else {
      // IN OFFICIAL NATIONAL STANDARD MODE:
      // SATIM Central Server looks up user's Anti-Phishing code and injects it at the very start!
      sendBankSMS({
        userId: user.id,
        user: user,
        sender: "SATIM-CIB",
        type: "otp",
        content: `بوابة SATIM الوطنية: رمز تأكيد عملية دفع ${selectedMerchant.amount.toLocaleString()} دج لـ (${selectedMerchant.name}) هو: ${otp}. صالح لمدة 10 دقائق.`,
      });
    }

    // Auto open SMS inbox modal after short delay for demonstration
    setTimeout(() => {
      setSmsModalOpen(true);
    }, 600);
  };

  // Confirm Payment
  const handleConfirmPayment = () => {
    if (enteredOtp !== generatedOtp) {
      alert("رمز الـ OTP المدخل غير مطابق");
      return;
    }

    setPaymentStatus("verifying");
    setTimeout(() => {
      if (isPhishingMode) {
        setPaymentStatus("phished");
      } else {
        setPaymentStatus("success");
      }
    }, 1200);
  };

  return (
    <div
      className="min-h-screen text-white p-4 md:p-8"
      style={{ backgroundColor: "#0a1628" }}
      dir="rtl"
    >
      {/* ── Top Header ── */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: "rgba(0, 180, 160, 0.15)", color: "#00b4a0" }}
              >
                النموذج الأول: المعيار الوطني الموحد
              </span>
              <span className="text-xs text-gray-400">SATIM & Algérie Poste Edahabia</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-2">
              بوابة الدفع الإلكتروني الوطنية (SATIM CIB / الذهبية)
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              محاكاة المعيار المركزي: المواطن يحدد رمزه مرة واحدة، وSATIM تحقن الرمز في كل عمليات الدفع الخارجية عبر الإنترنت
            </p>
          </div>

          {/* Toggle between Official SATIM vs Phishing Clone */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-900/80 border border-gray-800">
            <span className="text-xs text-gray-300 font-medium">الوضع المعروض:</span>
            <button
              onClick={() => {
                setIsPhishingMode(false);
                setOtpSent(false);
                setPaymentStatus("idle");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !isPhishingMode
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              ✅ بوابة SATIM الرسمية
            </button>
            <button
              onClick={() => {
                setIsPhishingMode(true);
                setOtpSent(false);
                setPaymentStatus("idle");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isPhishingMode
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🚨 هجوم تصيد (صفحة مزورة)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left Column: Select Merchant & Architecture Info (5 cols) ── */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Select External Merchant */}
          <div
            className="rounded-2xl p-5 border"
            style={{ backgroundColor: "#0f2040", borderColor: "#1e3a5f" }}
          >
            <h2 className="text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-400" />
              1. اختر الجهة الخارجية التي يدفع لها المواطن:
            </h2>
            <div className="space-y-2">
              {MERCHANTS.map((m) => {
                const isSelected = selectedMerchant.id === m.id;
                const IconComponent = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMerchant(m);
                      setOtpSent(false);
                      setPaymentStatus("idle");
                    }}
                    className={`w-full text-right p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-teal-400 bg-teal-950/30 shadow-md"
                        : "border-gray-800 bg-gray-900/40 hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${m.color}20`, color: m.color }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-white">{m.name}</div>
                        <div className="text-xs text-gray-400">{m.category}</div>
                      </div>
                    </div>
                    <div className="text-left font-bold text-teal-400 font-mono text-sm">
                      {m.amount.toLocaleString()} دج
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* National Standard Explanation Card */}
          <div
            className="rounded-2xl p-5 border"
            style={{ backgroundColor: "#0f2040", borderColor: "#1e3a5f" }}
          >
            <h3 className="text-sm font-bold text-teal-300 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              كيف يعمل المعيار الوطني الموحد (SATIM Standard)؟
            </h3>
            <ul className="text-xs text-gray-300 space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-teal-400 font-bold">•</span>
                <span>
                  <strong>نقطة ربط وحيدة:</strong> بدلاً من إلزام كل بنك جزائري بتطوير نظامه، يتم ربط خوارزمية <strong>ShieldCode</strong> في المجمع البنكي المركزي <strong>(SATIM / بريد الجزائر)</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 font-bold">•</span>
                <span>
                  <strong>تأمين تلقائي لكل المواقع:</strong> كل موقع جزائري يدعم الدفع بـ CIB أو الذهبية محمي تلقائياً، لأن بوابة SATIM هي التي ترسل رسالة الـ OTP.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 font-bold">•</span>
                <span>
                  <strong>الحماية في الاتجاهين (2-Way Security):</strong>
                  الرمز يظهر في صفحة البوابة لتأكيد أنها صفحة SATIM الحقيقية، ويصل في رسالة الـ SMS لتأكيد أن البنك هو المرسل الحقيقي!
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Right Column: The SATIM Gateway Payment Screen (7 cols) ── */}
        <div className="lg:col-span-7">
          <div
            className={`rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 ${
              isPhishingMode
                ? "border-red-500/80 shadow-red-500/20"
                : "border-teal-500/40 shadow-teal-500/10"
            }`}
            style={{ backgroundColor: "#0b1527" }}
          >
            {/* Fake browser URL bar indicator */}
            <div
              className={`px-4 py-2 text-xs flex items-center justify-between border-b ${
                isPhishingMode
                  ? "bg-red-950/60 text-red-300 border-red-900/60"
                  : "bg-gray-900/90 text-gray-300 border-gray-800"
              }`}
            >
              <div className="flex items-center gap-2 font-mono" dir="ltr">
                <Lock
                  className={`w-3.5 h-3.5 ${
                    isPhishingMode ? "text-red-400" : "text-emerald-400"
                  }`}
                />
                {isPhishingMode ? (
                  <span className="text-red-400 font-bold">
                    http://satim-paiement-cib-secure.xyz/order?id=9928
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">
                    https://epay.satim.dz/gateway/payment/cib
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  isPhishingMode
                    ? "bg-red-500/20 text-red-400"
                    : "bg-emerald-500/20 text-emerald-400"
                }`}
              >
                {isPhishingMode ? "🚨 موقع وهمي (Phishing)" : "🔒 اتصال بنكي رسمي مشفر"}
              </span>
            </div>

            {/* SATIM & CIB & Edahabia Official Header */}
            <div className="p-6 bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center font-bold text-teal-400 text-xl tracking-wider">
                  SATIM
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">بوابة الدفع الإلكتروني الوطنية</h3>
                  <p className="text-xs text-gray-400">شبكة النقد الآلي للبنوك وبريد الجزائر (CIB / الذهبية)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  الذهبية
                </span>
                <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                  CIB
                </span>
              </div>
            </div>

            {/* Merchant Details Bar */}
            <div className="px-6 py-4 bg-gray-900/40 border-b border-gray-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block">الجهة المستفيدة:</span>
                <span className="font-bold text-sm text-gray-200">{selectedMerchant.name}</span>
              </div>
              <div className="text-left">
                <span className="text-xs text-gray-400 block">المبلغ المطلوب:</span>
                <span className="font-mono font-bold text-lg text-teal-400">
                  {selectedMerchant.amount.toLocaleString()} دج
                </span>
              </div>
            </div>

            {/* Gateway Body */}
            <div className="p-6 space-y-6">
              {/* Payment Success State */}
              {paymentStatus === "success" && (
                <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-white">تمت عملية الدفع بنجاح!</h4>
                  <p className="text-xs text-gray-300 max-w-md mx-auto">
                    تم تأكيد العملية بالمعيار الوطني الموحد. استلمت المؤسسة المبلغ وتم توثيق العملية برمز الحماية الشخصي <strong>[{user.antiphishingCode}]</strong>.
                  </p>
                  <button
                    onClick={() => {
                      setPaymentStatus("idle");
                      setOtpSent(false);
                    }}
                    className="mt-2 px-6 py-2 rounded-xl bg-teal-500 text-black font-bold text-xs"
                  >
                    إجراء معاملة أخرى
                  </button>
                </div>
              )}

              {/* Phishing Detected Alert State */}
              {paymentStatus === "phished" && (
                <div className="p-6 rounded-2xl bg-red-950/50 border border-red-500 text-right space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-red-200">
                        🚨 تم رصد هجوم تصيد احتيالي بنجاح!
                      </h4>
                      <p className="text-xs text-red-300">
                        الرسالة وصلت بدون رمز الحماية الشخصي للمواطن.
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-red-900/30 text-xs text-gray-200 leading-relaxed">
                    <strong>التحليل الأمني للجنة:</strong> نظراً لأن الموقع مزور وخادم المخترق لا يعلم الرمز السري <strong>[{user.antiphishingCode}]</strong>، فقد أرسل رسالة SMS عادية فارغة من الرمز. المواطن الذكي يرفض الدفع فوراً ويحمي حسابه!
                  </div>
                  <button
                    onClick={() => {
                      setPaymentStatus("idle");
                      setOtpSent(false);
                      setIsPhishingMode(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs"
                  >
                    العودة للبوابة الرسمية الآمنة
                  </button>
                </div>
              )}

              {/* Card Input Form (When idle or waiting OTP) */}
              {paymentStatus === "idle" && (
                <div className="space-y-4">
                  {/* Quick autofill button */}
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-300">
                      بيانات البطاقة البنكية (الذهبية / CIB):
                    </label>
                    <button
                      type="button"
                      onClick={fillUserCard}
                      className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium underline"
                    >
                      <Zap className="w-3 h-3" />
                      تعبئة تلقائية ببطاقة {user.name}
                    </button>
                  </div>

                  {/* Card Number */}
                  <div>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="رقم البطاقة (16 رقماً): 4532 1234 5678 9012"
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-teal-500"
                      dir="ltr"
                    />
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-2 gap-3" dir="ltr">
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-teal-500 text-center"
                    />
                    <input
                      type="password"
                      maxLength={3}
                      value={cardCVV}
                      onChange={(e) => setCardCVV(e.target.value)}
                      placeholder="CVV2 (3 أرقام)"
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-teal-500 text-center"
                    />
                  </div>

                  {/* ── THE CORE INNOVATION: ShieldCode Verification Banner on SATIM Page ── */}
                  {isCardRecognized && (
                    <div
                      className={`p-4 rounded-2xl border transition-all ${
                        isPhishingMode
                          ? "bg-red-950/40 border-red-500/60"
                          : "bg-teal-950/40 border-teal-500/50"
                      }`}
                    >
                      {isPhishingMode ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                            <AlertTriangle className="w-4 h-4" />
                            <span>⚠️ تعذر التحقق من رمز الحماية (صفحة غير معتمدة من SATIM)</span>
                          </div>
                          <p className="text-[11px] text-gray-300">
                            الموقع لا يستطيع إظهار رمزك الشخصي لأنه لا يتصل بقاعدة بيانات بريد الجزائر الرسمية.
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                              <Shield className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-300">
                                تم التحقق من هويتك عبر السجل الوطني:
                              </div>
                              <div className="text-sm font-bold text-teal-300 font-mono">
                                رمز الأمان المسجل لك: [{user.antiphishingCode || "AYOUB2026"}]
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
                            بوابة SATIM الأصلية ✅
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Request SMS OTP */}
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                        isPhishingMode
                          ? "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30"
                          : "bg-teal-500 hover:bg-teal-400 text-black shadow-teal-500/20"
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      إرسال كود التحقق (SMS OTP) إلى الهاتف
                    </button>
                  ) : (
                    /* Step 3: Enter OTP */
                    <div className="p-4 rounded-2xl bg-gray-900 border border-teal-500/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-teal-400 font-bold flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4" />
                          أدخل رمز التحقق (OTP) الذي وصلك في الـ SMS:
                        </span>
                        <button
                          type="button"
                          onClick={() => setSmsModalOpen(true)}
                          className="text-[11px] text-teal-300 underline font-semibold"
                        >
                          عرض محاكي الهاتف 📱
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value)}
                          placeholder="مثال: 889102"
                          className="flex-1 px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono text-center text-base tracking-widest focus:outline-none focus:border-teal-500"
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={handleConfirmPayment}
                          className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs"
                        >
                          تأكيد الدفع النهائي
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SMS Inbox Modal */}
      <SMSInboxModal
        user={user}
        isOpen={smsModalOpen}
        onClose={() => setSmsModalOpen(false)}
      />
    </div>
  );
}
