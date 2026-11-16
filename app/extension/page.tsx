"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Chrome,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Laptop,
  Layers,
  Sparkles,
  Copy,
  Check,
  Eye,
  EyeOff,
  Search,
  FileCode,
} from "lucide-react";

export default function ExtensionPage() {
  const [downloaded, setDownloaded] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Simulator State
  const [simCode, setSimCode] = useState("SECURE2026");
  const [simEnabled, setSimEnabled] = useState(true);
  const [showSimCode, setShowSimCode] = useState(false);
  const [simInput, setSimInput] = useState("");
  const [simResult, setSimResult] = useState<{
    status: "genuine" | "phishing" | null;
    message: string;
  }>({ status: null, message: "" });

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/shieldcode-extension.zip";
    link.download = "shieldcode-extension.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 4000);
  };

  const handleSimVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simInput.trim()) return;

    if (simInput.includes(simCode)) {
      setSimResult({
        status: "genuine",
        message: `✅ موثق وأصلي! تم العثور على رمزك السري [${simCode}]. الرسالة صادرة من المؤسسة الحقيقية المصرح بها.`,
      });
    } else {
      setSimResult({
        status: "phishing",
        message: `🚨 تحذير: الرسالة لا تحتوي على رمز مكافحة التصيد [${simCode}]. هذه محاولة احتيال واختراق!`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100 selection:bg-teal-500 selection:text-slate-950" dir="rtl">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0a1424]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-lg text-white tracking-tight">ShieldCode</span>
              <span className="block text-[10px] text-teal-400 font-bold -mt-1">إضافة المتصفح الرسمية</span>
            </div>
          </Link>

          <nav className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors">
              الرئيسية
            </Link>
            <Link href="/user-tool" className="text-slate-300 hover:text-white transition-colors">
              أداة الحساب (هاتف وحاسوب)
            </Link>
            <Link href="/enterprise" className="text-slate-300 hover:text-white transition-colors">
              تعاقد المؤسسات (B2B)
            </Link>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all shadow-md shadow-teal-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              تحميل الإضافة (.ZIP)
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              إضافة متصفح ذكية (Chrome / Edge / Firefox)
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              حماية فورية من التصيد في متصفحك <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
                تفحص كل رسالة وإيميل بمجرد وصوله
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              تتيح إضافة <strong>ShieldCode</strong> للمستخدمين ربط رمز مكافحة التصيد الخاص بهم مباشرة في المتصفح. تقوم الإضافة بفحص صفحات الويب والبريد الإلكتروني وبوابات الدفع لحظياً، والتأكد من وجود رمزك السري المشترك مع المؤسسة لحمايتك التلقائية من الروابط والرسائل الخبيثة.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-teal-500/25 active:scale-95"
              >
                <Download className="w-4 h-4" />
                تحميل حزمة الإضافة الآن (v2.2.0)
              </button>
              <a
                href="#install-guide"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all border border-slate-700"
              >
                طريقة التثبيت السريعة
              </a>
            </div>

            {downloaded && (
              <div className="p-3 rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                تم بدء تحميل ملف shieldcode-extension.zip بنجاح!
              </div>
            )}

            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-bold text-teal-400 text-xs mb-1">فحص فوري للرسائل</div>
                <div className="text-[11px] text-slate-400">لصق وفحص أي نص أو إيميل للتأكد من احتوائه على الرمز</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-bold text-teal-400 text-xs mb-1">شارة التحقق التلقائية</div>
                <div className="text-[11px] text-slate-400">حقن شارة أمان خضراء عند مطابقة الرمز على صفحات الدفع</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-bold text-teal-400 text-xs mb-1">خصوصية بنكية تامة</div>
                <div className="text-[11px] text-slate-400">تخزين محلي مشفر ومحمي في متصفحك دون تتبع بيانات</div>
              </div>
            </div>
          </div>

          {/* Right: Live Interactive Extension Simulator */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[360px] rounded-2xl bg-[#0a1628] border border-teal-500/30 p-4 shadow-2xl shadow-teal-500/10">
              {/* Simulator Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                    🛡️
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">ShieldCode Guard</div>
                    <div className="text-[10px] text-teal-400">إضافة المتصفح التفاعلية</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
                  {simEnabled ? "مفعّل" : "معطّل"}
                </span>
              </div>

              {/* Code Card in Simulator */}
              <div className="p-3 rounded-xl bg-[#0f2040] border border-[#1e3a5f] mb-3">
                <div className="text-[11px] text-slate-400 mb-1">رمز مكافحة التصيد المسجل لديك:</div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#06101e] border border-dashed border-teal-500/40">
                  <span className="font-mono text-sm font-bold text-teal-400 tracking-wider">
                    {showSimCode ? simCode : "••••••••"}
                  </span>
                  <button
                    onClick={() => setShowSimCode(!showSimCode)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    {showSimCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Quick Verifier inside Simulator */}
              <div className="p-3 rounded-xl bg-[#0f2040] border border-[#1e3a5f] space-y-2">
                <div className="text-[11px] font-bold text-slate-300">
                  فحص سريع لأي رسالة أو إيميل:
                </div>
                <textarea
                  value={simInput}
                  onChange={(e) => setSimInput(e.target.value)}
                  placeholder="الصق نص الرسالة الواردة للتجربة..."
                  rows={2}
                  className="w-full bg-[#06101e] border border-[#1e3a5f] rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={handleSimVerify}
                  className="w-full py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs hover:opacity-95 transition-opacity"
                >
                  فحص المصداقية فوراً
                </button>

                {simResult.status && (
                  <div
                    className={`p-2 rounded-lg text-[11px] font-medium leading-relaxed ${
                      simResult.status === "genuine"
                        ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    }`}
                  >
                    {simResult.message}
                  </div>
                )}
              </div>

              {/* Quick Samples to test */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">جرّب نص تجريبي:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setSimInput(`[رمزك الأمني: ${simCode}]\nتم تأكيد عملية الشراء برقم 99210.`)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-teal-300"
                  >
                    رسالة أصلية
                  </button>
                  <button
                    onClick={() => setSimInput("تنبيه: حسابك موقوف، اضغط هنا لتأكيد كلمة المرور فورا.")}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-300"
                  >
                    رسالة تصيد
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Guide Section */}
      <section id="install-guide" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-800">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold">
            <Chrome className="w-3.5 h-3.5" />
            دليل التثبيت السهل في 60 ثانية
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            كيفية تثبيت الإضافة في متصفحك (Google Chrome / Edge / Brave)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            خطوات بسيطة لتشغيل أداة الحماية مباشرة بصيغة المطور (Developer Mode) دون أي تعقيد.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative">
            <div className="w-8 h-8 rounded-full bg-teal-500 text-slate-950 font-black text-sm flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="font-bold text-white text-sm mb-2">تحميل وفك الضغط</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              قم بتحميل ملف <code className="text-teal-400 font-mono">shieldcode-extension.zip</code> وفك ضغطه في أي مجلد على جهازك.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative">
            <div className="w-8 h-8 rounded-full bg-teal-500 text-slate-950 font-black text-sm flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="font-bold text-white text-sm mb-2">فتح إدارة الإضافات</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              افتح متصفحك واذهب إلى <code className="text-teal-400 font-mono">chrome://extensions</code>، ثم فعّل خيار <strong>وضع مطوّر البرامج (Developer Mode)</strong> من الزاوية العلوية.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative">
            <div className="w-8 h-8 rounded-full bg-teal-500 text-slate-950 font-black text-sm flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="font-bold text-white text-sm mb-2">تحميل المجلد المفكوك</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              انقر على زر <strong>تحميل حزمة غير مضغوطة (Load Unpacked)</strong> واختر مجلد الإضافة. ستظهر أيقونة ShieldCode مباشرة في شريط متصفحك!
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileCode className="w-5 h-5 text-teal-400" />
            <span className="text-xs text-slate-300">
              ملفات الإضافة متوافقة مع معيار <strong>Manifest V3</strong> المعتمد رسمياً في كافة متصفحات الويب الحديثة.
            </span>
          </div>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-lg bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-colors"
          >
            تحميل الحزمة الآن
          </button>
        </div>
      </section>
    </div>
  );
}
