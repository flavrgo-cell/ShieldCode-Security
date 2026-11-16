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
} from "lucide-react";
import { defaultShieldCode } from "@/lib/shieldcode-sdk";

const PARTNER_INSTITUTIONS = [
  {
    id: "baridimob",
    name: "بريد الجزائر (BaridiMob)",
    type: "مؤسسة بريدية ونظام دفع وطني",
    color: "#00b4a0",
    badge: "الذهبية & CCP",
    sampleUser: "أيوب بن علي",
    sampleAccount: "CCP-123456789",
  },
  {
    id: "bna",
    name: "البنك الوطني الجزائري (BNA)",
    type: "بنك عمومي وتجاري",
    color: "#2563eb",
    badge: "CIB Network",
    sampleUser: "سارة حمدي",
    sampleAccount: "RIB-00100234567",
  },
  {
    id: "albaraka",
    name: "بنك البركة الجزائري (Al Baraka)",
    type: "صيرفة إسلامية وخدمات رقمية",
    color: "#16a34a",
    badge: "Visa & CIB",
    sampleUser: "كريم دريدي",
    sampleAccount: "RIB-00300987654",
  },
  {
    id: "telecom",
    name: "متعامل اتصالات ومحفظة فنتك (Telecom)",
    type: "شحن رصيد ودفع إلكتروني",
    color: "#f59e0b",
    badge: "Mobile Wallet",
    sampleUser: "محمد قاسمي",
    sampleAccount: "WALLET-05559988",
  },
];

export default function HomePage() {
  const [selectedPartner, setSelectedPartner] = useState(PARTNER_INSTITUTIONS[0]);
  const [copiedCode, setCopiedCode] = useState(false);

  // Live embedded tool state
  const [userCode, setUserCode] = useState("AYOUB2026");
  const [isProtectionActive, setIsProtectionActive] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Phone Emulator state
  const [emulatorMessage, setEmulatorMessage] = useState<{
    text: string;
    isPhishing: boolean;
    sender: string;
    time: string;
  }>({
    text: `[رمزك: AYOUB2026]\n${PARTNER_INSTITUTIONS[0].name}: رمز التحقق OTP هو 889102 لتأكيد عمليتك المالية.`,
    isPhishing: false,
    sender: PARTNER_INSTITUTIONS[0].name,
    time: "الآن",
  });

  const handleSaveCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userCode.trim()) return;
    defaultShieldCode.setCode(selectedPartner.id, userCode.trim(), isProtectionActive);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);

    // Update phone emulator message
    if (isProtectionActive) {
      setEmulatorMessage({
        text: `[رمزك: ${userCode.trim()}]\n${selectedPartner.name}: تم تحديث إعدادات الأمان الخاصة بك بنجاح.`,
        isPhishing: false,
        sender: selectedPartner.name,
        time: "الآن",
      });
    }
  };

  const simulateLegitNotification = () => {
    const codePrefix = isProtectionActive && userCode.trim() ? `[رمزك: ${userCode.trim()}]\n` : "";
    setEmulatorMessage({
      text: `${codePrefix}${selectedPartner.name}: تم تأكيد عملية تحويل مالي بمبلغ 15,000 دج. كود OTP: 591024.`,
      isPhishing: false,
      sender: selectedPartner.name,
      time: "الآن",
    });
  };

  const simulatePhishingAttack = () => {
    setEmulatorMessage({
      text: `AlertBank: تم تجميد حسابك في ${selectedPartner.name}! ادخل فوراً على الرابط http://bit.ly/fake-verify لتحديث بياناتك وسحب الرصيد!`,
      isPhishing: true,
      sender: "FakeAlert",
      time: "الآن",
    });
  };

  const copySnippet = () => {
    const snippet = `// استدعاء الأداة في حساب العميل لدى المؤسسة:\nimport { ShieldCodeWidget } from '@shieldcode/security';\n<ShieldCodeWidget userId={user.id} bankName="${selectedPartner.name}" />`;
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      className="min-h-screen text-white font-sans selection:bg-teal-500 selection:text-black"
      style={{ backgroundColor: "#060d1a" }}
      dir="rtl"
    >
      {/* ── Navbar ── */}
      <header className="border-b border-gray-800/80 sticky top-0 z-50 bg-[#060d1a]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20"
              style={{ backgroundColor: "#00b4a0" }}
            >
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white block">
                ShieldCode
              </span>
              <span className="text-[11px] text-teal-400 font-medium block">
                أداة مكافحة التصيد للمؤسسات المالية
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs text-gray-300 font-medium">
            <a href="#tool-demo" className="hover:text-teal-400 transition-colors">
              الأداة المدمجة
            </a>
            <a href="#integration" className="hover:text-teal-400 transition-colors">
              طريقة الدمج والتعاقد
            </a>
            <Link href="/tool" className="hover:text-teal-400 transition-colors">
              بوابة الـ API للمطورين
            </Link>
            <Link href="/dashboard/satim" className="hover:text-teal-400 transition-colors">
              بوابة SATIM الوطنية
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-black transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5"
            >
              <span>دخول المنصة المصرفية</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-6">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>أداة أمنية B2B مخصصة للبنوك، شركات الدفع، والمؤسسات المالية</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          أداة الأمان المالي لمكافحة التصيد والاحتيال في المؤسسات
        </h1>

        <p className="mt-5 text-sm sm:text-base text-gray-400 max-w-3xl mx-auto leading-relaxed">
          أداة برمجية ذكية وخفيفة تُضاف كـ <strong>خيار أمان بسيط</strong> داخل حسابات العملاء عند تعاقد المؤسسات المالية معنا.
          تتيح للعميل تحديد كلمته السرية الخاصة لتظهر في كل رسالة SMS وبريد إلكتروني رسمي، مما يقضي على انتحال هوية المؤسسة (Phishing/Smishing) بنسبة 99.9%.
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-3 mt-8 text-xs text-gray-300">
          <div className="px-3.5 py-2 rounded-xl bg-gray-900/90 border border-gray-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-teal-400" />
            <span>دمج في 3 أسطر كود برمجية</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-gray-900/90 border border-gray-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-400" />
            <span>بدون المساس بقواعد بيانات البنوك</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-gray-900/90 border border-gray-800 flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-400" />
            <span>متوافقة مع CIB، الذهبية، وSATIM</span>
          </div>
        </div>
      </section>

      {/* ── Interactive Enterprise Tool Simulator (The Main Event) ── */}
      <section id="tool-demo" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="border border-gray-800 rounded-3xl p-6 sm:p-8 bg-[#0a1426] shadow-2xl">
          {/* Partner Selector */}
          <div className="mb-8">
            <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Building className="w-4 h-4" />
              1. اختر المؤسسة أو الشركة المتعاقدة معنا لمعاينة الأداة في حساب عملائها:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PARTNER_INSTITUTIONS.map((partner) => {
                const isSelected = selectedPartner.id === partner.id;
                return (
                  <button
                    key={partner.id}
                    onClick={() => {
                      setSelectedPartner(partner);
                      setEmulatorMessage({
                        text: `[رمزك: ${userCode}]\n${partner.name}: رمز التحقق OTP هو 889102 لتأكيد عمليتك المالية.`,
                        isPhishing: false,
                        sender: partner.name,
                        time: "الآن",
                      });
                    }}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-teal-400 bg-teal-950/40 shadow-lg shadow-teal-500/10 ring-1 ring-teal-400"
                        : "border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-900/80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: partner.color }}
                        />
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 font-mono font-semibold">
                          {partner.badge}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-white">{partner.name}</div>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-2">{partner.type}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2-Column Live Sandbox: Embed Widget on Left + Phone Emulator on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: The Embed Tool Component (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span className="font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-teal-400" />
                  الأداة المدمجة كما تظهر داخل تطبيق {selectedPartner.name}:
                </span>
                <span className="text-[10px] text-teal-400 font-mono">
                  &lt;ShieldCodeOption /&gt;
                </span>
              </div>

              {/* The Actual Tool Tile */}
              <div className="rounded-2xl border border-teal-500/40 bg-[#0c1830] p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: selectedPartner.color }}
                    >
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-white">
                          رمز مكافحة التصيد (Anti-Phishing Code)
                        </h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isProtectionActive
                              ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                              : "bg-gray-800 text-gray-400"
                          }`}
                        >
                          {isProtectionActive ? `مفعّل: [${userCode}]` : "معطّل"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        خيار الأمان الرسمي المضاف لحساب العميل: {selectedPartner.sampleUser} ({selectedPartner.sampleAccount})
                      </p>
                    </div>
                  </div>

                  {/* Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isProtectionActive}
                      onChange={(e) => setIsProtectionActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>

                {/* Form to change code */}
                <form onSubmit={handleSaveCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      الكلمة السرية الشخصية الخاصة بك (Anti-Phishing Keyword):
                    </label>
                    <div className="relative">
                      <input
                        type={showCode ? "text" : "password"}
                        value={userCode}
                        onChange={(e) => setUserCode(e.target.value)}
                        placeholder="مثال: AYOUB2026"
                        disabled={!isProtectionActive}
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono text-sm tracking-wider outline-none focus:border-teal-500 transition-all"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCode(!showCode)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      هذه الكلمة لا يعرفها إلا أنت وخادم {selectedPartner.name}. المخترق لا يمكنه معرفتها أو تزويرها!
                    </p>
                  </div>

                  {saveToast && (
                    <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/80 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>تم تحديث وحفظ الرمز في حساب العميل بنجاح!</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-black transition-all flex items-center gap-1.5 shadow-md shadow-teal-500/20"
                    >
                      <Save className="w-4 h-4" />
                      حفظ وتفعيل في {selectedPartner.name}
                    </button>
                    <button
                      type="button"
                      onClick={copySnippet}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all flex items-center gap-1.5"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? "تم النسخ!" : "نسخ كود الربط للبنك"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Simulation triggers for Jury/Audience */}
              <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-2">
                <span className="text-xs text-gray-300 font-bold block">
                  جرّب إرسال إشعار لمعاينة النتيجة فوراً في هاتف العميل:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={simulateLegitNotification}
                    className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-right flex items-center justify-between"
                  >
                    <span>1. إرسال SMS بنكي رسمي ✅</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={simulatePhishingAttack}
                    className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 text-xs font-bold text-right flex items-center justify-between"
                  >
                    <span>2. محاكاة هجوم تصيد مزور 🚨</span>
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Phone Simulator (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-[340px] rounded-[36px] bg-[#05090f] border-[8px] border-[#1c2738] shadow-2xl p-4 flex flex-col min-h-[460px] relative overflow-hidden">
                {/* Phone Speaker & Notch */}
                <div className="w-24 h-4 bg-[#1c2738] rounded-full mx-auto mb-3" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-[10px]"
                      style={{ backgroundColor: selectedPartner.color }}
                    >
                      {selectedPartner.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-none">
                        {emulatorMessage.sender}
                      </div>
                      <div className="text-[10px] text-gray-400">إشعار بنكي SMS</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500">{emulatorMessage.time}</span>
                </div>

                {/* Message Bubble */}
                <div className="flex-1 space-y-3">
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed transition-all ${
                      emulatorMessage.isPhishing
                        ? "bg-red-950/60 border-2 border-red-500 text-red-200"
                        : "bg-[#16253d] border border-teal-500/40 text-gray-100"
                    }`}
                  >
                    <pre className="font-sans whitespace-pre-wrap">{emulatorMessage.text}</pre>
                  </div>

                  {/* Analysis Box */}
                  {emulatorMessage.isPhishing ? (
                    <div className="p-3 rounded-xl bg-red-900/40 border border-red-500/80 text-[11px] text-red-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-red-300">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>🚨 تم كشف التصيد الاحتيالي فوراً!</span>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        الرسالة خالية تماماً من رمزك الشخصي [{userCode}]. هذا يثبت للعميل أن الرسالة مزورة والمخترق ينتحل هوية البنك.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/50 text-[11px] text-teal-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-teal-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>✅ رسالة أصلية موثقة وآمنة 100%</span>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        الرسالة تبدأ برمزك الشخصي [{userCode}]. البنك هو الجهة الوحيدة القادرة على تضمين هذا الرمز.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer status */}
                <div className="pt-3 border-t border-gray-800 text-center text-[10px] text-gray-500">
                  محاكي هاتف العميل • ShieldCode Live Client Emulator
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLI Command Line Section: Like Top GitHub Projects ── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-gray-800/80">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-mono font-bold mb-3 border border-teal-500/20">
            <Terminal className="w-3.5 h-3.5 text-teal-400" />
            <span>npx shieldcode v2.1.0</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            إضافة الأداة إلى خوادم البنوك عبر لوحة الأوامر (CLI)
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            تماماً مثل أشهر أدوات ومشاريع GitHub، يستطيع مهندس البنك إضافة الأداة وحقن الرمز السري مباشرة من الـ Terminal بأمر واحد:
          </p>
        </div>

        {/* Terminal Window */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-[#030712] border border-gray-800 shadow-2xl overflow-hidden font-mono text-xs">
          {/* Top Bar */}
          <div className="px-4 py-3 bg-[#0a0f1d] border-b border-gray-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-gray-400 text-[11px] mr-2">bash — terminal@bank-server: ~</span>
            </div>
            <span className="text-[10px] text-teal-400 bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-500/30">
              GitHub CLI Ready
            </span>
          </div>

          {/* Quick Command Launcher Buttons */}
          <div className="p-3 bg-[#070c18] border-b border-gray-800 flex flex-wrap gap-2 text-[11px]" dir="ltr">
            <span className="text-gray-500 self-center mr-1">Quick Run:</span>
            <button
              onClick={() => {
                setEmulatorMessage({
                  text: `✓ تم تهيئة أداة ShieldCode في مشروع البنك.\nتم إنشاء ملف الإعدادات: shieldcode.config.json`,
                  isPhishing: false,
                  sender: "ShieldCode CLI",
                  time: "الآن",
                });
              }}
              className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-teal-300 transition-colors"
            >
              $ npx shieldcode init
            </button>
            <button
              onClick={() => {
                defaultShieldCode.setCode("0555123456", "AYOUB2026", true);
                setUserCode("AYOUB2026");
                simulateLegitNotification();
              }}
              className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-teal-300 transition-colors"
            >
              $ shieldcode protect --user 0555123456
            </button>
            <button
              onClick={simulatePhishingAttack}
              className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/50 transition-colors"
            >
              $ shieldcode verify (فحص تصيد احتيالي)
            </button>
          </div>

          {/* Terminal Screen Content */}
          <div className="p-5 text-gray-200 space-y-4 leading-relaxed text-left overflow-x-auto" dir="ltr">
            <div>
              <span className="text-emerald-400 font-bold">developer@bank-app</span>
              <span className="text-gray-500">:</span>
              <span className="text-teal-400">~/backend</span>
              <span className="text-gray-400">$ </span>
              <span className="text-white font-bold">npx shieldcode protect --user 0555123456 --msg &quot;كود التحقق OTP هو 889102&quot;</span>
            </div>

            <div className="text-teal-400 text-[11px] leading-tight select-none">
              {"  ███████╗██╗  ██╗██╗███████╗██╗     ██████╗  ██████╗  ██████╗ ███████╗"}<br />
              {"  ██╔════╝██║  ██║██║██╔════╝██║     ██╔══██╗██╔════╝ ██╔═══██╗██╔════╝"}<br />
              {"  ███████╗███████║██║█████╗  ██║     ██║  ██║██║      ██║   ██║█████╗  "}<br />
              {"  Anti-Phishing Security CLI Tool for Banking & Financial Platforms v2.1.0"}
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="text-emerald-400 font-bold">✓ تم حقن رمز مكافحة التصيد في الرسالة بنجاح:</div>
              <div className="p-3 rounded-xl bg-gray-900 border border-teal-500/30 text-white font-mono">
                <span className="text-teal-400 font-bold">[رمزك: AYOUB2026]</span>
                <br />
                كود التحقق OTP هو 889102 لتأكيد العملية.
              </div>
              <div className="text-gray-400 text-[11px]">
                الحساب: 0555123456 | القناة: SMS Telecom Gateway (Mobilis/Djezzy/Ooredoo) | الحالة: مؤمّن 100%
              </div>
            </div>

            <div className="pt-2 border-t border-gray-800/80">
              <div>
                <span className="text-emerald-400 font-bold">developer@bank-app</span>
                <span className="text-gray-500">:</span>
                <span className="text-teal-400">~/backend</span>
                <span className="text-gray-400">$ </span>
                <span className="text-white font-bold">npx shieldcode verify --user 0555123456 --msg &quot;Alert: تم تعليق حسابك اضغط الرابط&quot;</span>
              </div>
              <div className="text-red-400 font-bold mt-2">
                🚨 نتيجة الفحص: تحذير من محاولة تصيد احتيالي (SMISHING DETECTED)
              </div>
              <div className="text-gray-300 text-[11px]">
                الرسالة لا تحتوي على الرمز السري [AYOUB2026]. المخترق ينتحل اسم البنك!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How Institutions Integrate (Integration in 3 Lines) ── */}
      <section id="integration" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-gray-800/80">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            كيف تتعاقد المؤسسات وتدمج الأداة في أنظمتها؟
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            تم تصميم ShieldCode لتكون أداة Plug & Play خفيفة للغاية لا تتطلب أي تعديل في قواعد البيانات المصرفية الأساسية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#0a1426] border border-gray-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-bold text-base text-white">تثبيت الأداة كخيار أمان</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              يقوم فريق البنك بإضافة مكون <code>&lt;ShieldCodeWidget /&gt;</code> في صفحة إعدادات أمان حساب العميل. سطر برمجي واحد يتكفل بواجهة الرمز بالكامل.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0a1426] border border-gray-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-bold text-base text-white">حقن الرمز في الإشعارات (Middleware)</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              في خادم إرسال الـ SMS، تمر الرسالة عبر <code>shieldcode.protectNotification()</code> لحقن الرمز السري للعميل قبل إرسالها لمتعامل الهاتف.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0a1426] border border-gray-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-bold text-base text-white">حماية فورية ضد التصيد</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              كل رسالة تصل للعميل تحمل رمزه السري المشترك. أي محاولة تصيد انتحالية تفشل تلقائياً لعدم معرفة المخترق برمز العميل.
            </p>
          </div>
        </div>
      </section>

      {/* ── Partner Links & CTA ── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center border-t border-gray-800/80">
        <div className="max-w-2xl mx-auto space-y-4">
          <h3 className="text-xl font-bold text-white">
            جاهزون للتعاون مع البنوك والمؤسسات المالية
          </h3>
          <p className="text-xs text-gray-400">
            يمكنكم استكشاف المنصة المصرفية الكاملة التي تحاكي بيئة بريد الجزائر أو اختبار الـ API المباشر للمطورين.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs transition-all shadow-lg shadow-teal-500/20"
            >
              استعراض المنصة البنكية التجريبية (BaridiPay)
            </Link>
            <Link
              href="/tool"
              className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition-all border border-gray-700"
            >
              بوابة الـ SDK وأكواد الربط
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-900 text-center text-xs text-gray-500">
        ShieldCode Security Suite © 2026 — مشروع تخرج في الأمن السيبراني والأنظمة المالية
      </footer>
    </div>
  );
}
