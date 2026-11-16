"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Key,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Building,
  Smartphone,
  Laptop,
  Chrome,
  Terminal,
  Zap,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Layers,
  Send,
  Eye,
  EyeOff,
  Save,
  Download,
  Server,
  FileCheck,
} from "lucide-react";
import { defaultShieldCode } from "@/lib/shieldcode-sdk";

export default function HomePage() {
  const [copiedCli, setCopiedCli] = useState(false);

  // Live Interactive Lab State (No mock names, pure user input)
  const [labUserId, setLabUserId] = useState("user_8820");
  const [labCode, setLabCode] = useState("SECURE2026");
  const [labEnabled, setLabEnabled] = useState(true);
  const [labRawMessage, setLabRawMessage] = useState("رمز التحقق OTP الخاص بك هو: 554190 لتأكيد المعاملة المالية.");
  const [injectedResult, setInjectedResult] = useState<any>(null);

  // Verification Test State
  const [verifyInput, setVerifyInput] = useState("");
  const [verifyResult, setVerifyResult] = useState<{
    status: "genuine" | "phishing" | null;
    message: string;
  }>({ status: null, message: "" });

  // Handle Lab Protect Action
  const handleLabProtect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labUserId || !labCode) return;
    defaultShieldCode.setCode(labUserId, labCode, labEnabled);
    const result = defaultShieldCode.injectNotification({
      userId: labUserId,
      rawMessage: labRawMessage,
      channel: "sms",
    });
    setInjectedResult(result);
  };

  // Handle Lab Verify Action
  const handleLabVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyInput.trim()) return;

    defaultShieldCode.setCode(labUserId, labCode, labEnabled);
    const result = defaultShieldCode.verifyMessage({
      userId: labUserId,
      fullMessageText: verifyInput,
      providedCode: labCode,
    });

    if (result.isAuthentic) {
      setVerifyResult({
        status: "genuine",
        message: `✅ تم التحقق: الرسالة تحتوي على رمزك الأمني السري [${labCode}]. وهي رسالة أصلية موثقة وصادرة من المؤسسة الحقيقية.`,
      });
    } else {
      setVerifyResult({
        status: "phishing",
        message: `🚨 إنذار أمني خطير: الرسالة لا تحتوي على رمزك الأمني [${labCode}]. هذه محاولة تصيد احتيالي بنسبة 99%!`,
      });
    }
  };

  const copyCliCommand = () => {
    navigator.clipboard.writeText("npx shieldcode set --user user_8820 --code SECURE2026");
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100 selection:bg-teal-500 selection:text-slate-950 font-sans" dir="rtl">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#0a1424]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-lg text-white tracking-tight">ShieldCode</span>
              <span className="block text-[10px] text-teal-400 font-bold -mt-1">بروتوكول مكافحة التصيد والاحتيال المالي</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
            <Link href="/extension" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
              <Chrome className="w-3.5 h-3.5 text-teal-400" />
              إضافة المتصفح
            </Link>
            <Link href="/user-tool" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-teal-400" />
              أداة الحساب (هاتف وحاسوب)
            </Link>
            <Link href="/enterprise" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-teal-400" />
              تعاقد المؤسسات (B2B)
            </Link>
            <Link href="/tool" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-teal-400" />
              أداة سطر الأوامر (CLI)
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/extension"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-teal-500/20 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              تحميل الإضافة
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold animate-fadeIn">
            <Sparkles className="w-4 h-4" />
            أداة أمان سيبراني مركزية لمكافحة هجمات التصيد المالي (Anti-Phishing Code)
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight">
            درع الأمان الشخصي <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400">
              لمكافحة التصيد والاحتيال في الحسابات المالية
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto">
            أداة أمان مستقلة تتيح للمستخدم تحديد <strong>رمز مكافحة تصيد سري</strong> خاص به، وتُمكّن المؤسسات والمنصات المالية من <strong>التعاقد مع أداتنا</strong> لحقن هذا الرمز تلقائياً في كافة رسائل الـ SMS وإشعارات الـ OTP الصادرة إلى هاتفه أو بريده، مما يجعل انتحال هوية المؤسسة مستحيلاً على المحتالين.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/extension"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-teal-500/25 active:scale-95"
            >
              <Chrome className="w-4 h-4" />
              تثبيت إضافة المتصفح
            </Link>
            <Link
              href="/user-tool"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all border border-slate-700"
            >
              <Smartphone className="w-4 h-4" />
              أداة الحساب للهاتف والحاسوب
            </Link>
            <Link
              href="/enterprise"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 font-bold text-sm transition-all border border-teal-500/30"
            >
              <Building className="w-4 h-4" />
              تعاقد المؤسسات (B2B Platform)
            </Link>
          </div>
        </div>
      </section>

      {/* The 3 Core Pillars */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-bold text-teal-400">تجسيد فكرة المشروع في 3 أشكال عملية</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            كيف يستفيد المستخدم والمؤسسة من أداة ShieldCode؟
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1: Browser Extension */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
              <Chrome className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
              1. إضافة المتصفح (Browser Extension)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              إضافة متصفح ذكية (Chrome, Edge, Firefox) تُثبّت بنقرة واحدة، وتقوم بفحص بوابات الدفع والبريد الإلكتروني تلقائياً للتحقق من وجود رمز مكافحة التصيد المسجل للعميل.
            </p>
            <Link
              href="/extension"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:underline pt-2"
            >
              استعراض وتحميل الإضافة ←
            </Link>
          </div>

          {/* Pillar 2: User Tool */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
              2. أداة الحساب (Mobile & Desktop Tool)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              أداة مدمجة ومتجاوبة تُضاف داخل إعدادات الحساب في أي تطبيق هاتف أو موقع حاسوب، تمكن المستخدم من إنشاء وتعديل رمزه الأمني واختيار قنوات الإشعار المحمية.
            </p>
            <Link
              href="/user-tool"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:underline pt-2"
            >
              معاينة أداة الحساب التفاعلية ←
            </Link>
          </div>

          {/* Pillar 3: Institutional B2B Platform */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
              3. تعاقد المؤسسات (B2B Integration)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              تتعاقد البنوك وشركات الدفع مع أداتنا للحصول على تراخيص برمجية وواجهات REST API جاهزة للربط الفوري وحقن أكواد الأمان في رسائل الـ OTP لعملائها.
            </p>
            <Link
              href="/enterprise"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:underline pt-2"
            >
              بوابة الشراكة والـ API للمؤسسات ←
            </Link>
          </div>
        </div>
      </section>

      {/* Threat Model & Comparison */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400">
            <Lock className="w-3.5 h-3.5" />
            النموذج الأمني (Threat Model)
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            لماذا يعتبر رمز مكافحة التصيد حلاً قاطعاً للاحتيال؟
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Before ShieldCode */}
          <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-900/40 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              قبل ShieldCode (الوضع التقليدي المعرض للخطر)
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                المخترق يستطيع تزوير اسم المرسل (SMS Spoofing) وإرسال رسائل تحمل اسم البنك الرسمي.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                العميل لا يمتلك أي طريقة للتأكد هل الرسالة حقيقية أم رابط تصيد لسرقة كلمة المرور والـ OTP.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                خسائر مالية ضخمة وسمعة سلبية تؤثر على ثقة العملاء في المؤسسات المالية.
              </li>
            </ul>
          </div>

          {/* With ShieldCode */}
          <div className="p-6 rounded-3xl bg-teal-950/20 border border-teal-500/40 space-y-4">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-base">
              <CheckCircle2 className="w-5 h-5" />
              مع ShieldCode (حماية سيبرانية مطلقة)
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-teal-400 font-bold">✓</span>
                المستخدم يحدد رمزاً سرياً مشتركاً لا يعلمه إلا هو والمؤسسة المتعاقدة مع أداتنا.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 font-bold">✓</span>
                المؤسسة تحقن الرمز في كل إشعار: <code className="text-teal-300 font-mono">[رمزك: SECURE99]</code>.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 font-bold">✓</span>
                إذا وصلت رسالة للمستخدم بدون رمزه، فهو يعلم يقيناً أنها محاولة تصيد احتيالي ولا يتجاوب معها!
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Live Interactive Lab / Sandbox */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <h3 className="text-xl font-black text-white">المختبر التفاعلي المباشر (ShieldCode Live Lab)</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                جرّب بنفسك: أدخل أي معرّف حساب، حدد رمز مكافحة تصيد سري، واختبر حقن الرمز وفحص الرسائل فوراً.
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
              بدون بيانات وهمية — تفاعل حر ومباشر
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Step 1 & 2: Set Code & Protect Message */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-teal-400 flex items-center gap-2">
                <Key className="w-4 h-4" />
                1. تعيين الرمز وحقنه في رسالة الإشعار:
              </h4>

              <form onSubmit={handleLabProtect} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">معرّف الحساب (User ID):</label>
                    <input
                      type="text"
                      value={labUserId}
                      onChange={(e) => setLabUserId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">رمز مكافحة التصيد (Secret Code):</label>
                    <input
                      type="text"
                      value={labCode}
                      onChange={(e) => setLabCode(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-teal-300 font-bold focus:outline-none focus:border-teal-500"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">نص الرسالة الأصلية الصادرة من المؤسسة:</label>
                  <textarea
                    value={labRawMessage}
                    onChange={(e) => setLabRawMessage(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-teal-500/20 active:scale-95"
                >
                  حفظ الرمز وتنفيذ الحقن الأمني (Inject Code)
                </button>
              </form>

              {injectedResult && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-teal-500/40 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-teal-400">الرسالة المحمية الصادرة للعميل:</span>
                    <span className="text-[10px] text-slate-500 font-mono">{injectedResult.auditId}</span>
                  </div>
                  <pre className="text-xs font-mono text-white bg-slate-900 p-3 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed">
                    {injectedResult.protectedMessage}
                  </pre>
                  <button
                    onClick={() => setVerifyInput(injectedResult.protectedMessage)}
                    className="text-[11px] text-teal-400 hover:underline font-semibold"
                  >
                    ← نقل الرسالة إلى صندوق الفحص أدناه
                  </button>
                </div>
              )}
            </div>

            {/* Step 3: Verification Check */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-teal-400 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                2. فحص الرسالة والتحقق من الأصالة (Message Verifier):
              </h4>

              <form onSubmit={handleLabVerify} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    الصق أي رسالة هنا للتأكد هل هي أصلية أم محاولة تصيد:
                  </label>
                  <textarea
                    value={verifyInput}
                    onChange={(e) => setVerifyInput(e.target.value)}
                    placeholder="الصق نص الرسالة الواردة إليك للفحص..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-teal-500/20"
                  >
                    فحص الرسالة ومطابقة الرمز
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyInput("تنبيه أمني عاجل: تم تجميد حسابك، اضغط هنا لتأكيد بياناتك فورا: http://fake-bank-login.com")}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold"
                  >
                    تجربة رسالة احتيالية
                  </button>
                </div>
              </form>

              {verifyResult.status && (
                <div
                  className={`p-4 rounded-2xl border text-xs font-medium leading-relaxed animate-fadeIn ${
                    verifyResult.status === "genuine"
                      ? "bg-teal-500/10 border-teal-500/50 text-teal-300"
                      : "bg-rose-500/10 border-rose-500/50 text-rose-300"
                  }`}
                >
                  {verifyResult.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CLI Quick Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-800/80">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">هل تفضل استخدام سطر الأوامر (CLI)؟</div>
              <div className="text-xs text-slate-400">يمكنك تشغيل الأداة مباشرة بدون تثبيت عبر npx</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <code className="text-xs font-mono bg-slate-950 px-3 py-2 rounded-xl text-teal-300 border border-slate-800" dir="ltr">
              npx shieldcode --help
            </code>
            <Link
              href="/tool"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              عرض دليل الـ CLI
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-slate-300">ShieldCode Universal Anti-Phishing Security Protocol</span>
          </div>
          <div>مشروع تخرج في الأمن السيبراني وحماية التعاملات المالية الرقمية © 2026</div>
        </div>
      </footer>
    </div>
  );
}
