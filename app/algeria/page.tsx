"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Building,
  Smartphone,
  Radio,
  Server,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  Zap,
  Activity,
  ArrowRight,
  Send,
  Layers,
  Sparkles,
  PhoneCall,
  CreditCard,
} from "lucide-react";
import {
  ALGERIAN_BANKS_DATABASE,
  ALGERIAN_TELECOM_OPERATORS,
  AlgerianBank,
  AlgerianTelecomOperator,
} from "@/lib/algerian-registry";

export default function AlgerianRegistryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [liveStats, setLiveStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  // Test Route Modal / State
  const [testModalBank, setTestModalBank] = useState<AlgerianBank | null>(null);
  const [testPhone, setTestPhone] = useState("0661223344");
  const [testResult, setTestResult] = useState<any>(null);
  const [sendingTest, setSendingTest] = useState(false);

  // Fetch live statistics
  useEffect(() => {
    fetch("/api/v1/algeria/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLiveStats(data.stats);
          setRecentLogs(data.recentLogs || []);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const filteredBanks = ALGERIAN_BANKS_DATABASE.filter((bank) => {
    const matchSearch =
      bank.nameAr.includes(searchTerm) ||
      bank.nameFr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.code.includes(searchTerm);

    if (selectedFilter === "all") return matchSearch;
    if (selectedFilter === "public") return matchSearch && bank.type === "public_bank";
    if (selectedFilter === "private") return matchSearch && bank.type === "private_bank";
    if (selectedFilter === "islamic") return matchSearch && bank.type === "islamic_bank";
    if (selectedFilter === "central")
      return matchSearch && (bank.type === "central_switch" || bank.type === "postal");
    return matchSearch;
  });

  const handleExecuteTestRoute = async () => {
    if (!testModalBank) return;
    setSendingTest(true);
    try {
      const res = await fetch("/api/v1/algeria/route-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: testPhone,
          bankId: testModalBank.id,
          rawMessage: `رمز تأكيد العملية OTP هو: ${Math.floor(100000 + Math.random() * 900000)}.`,
          channel: "sms",
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100 selection:bg-teal-500 selection:text-slate-950" dir="rtl">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#0a1424]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-lg text-white tracking-tight">ShieldCode DZ</span>
              <span className="block text-[10px] text-teal-400 font-bold -mt-1">
                قاعدة بيانات البنوك والمتعاملين في الجزائر
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors">
              الرئيسية
            </Link>
            <Link href="/user-tool" className="text-slate-300 hover:text-white transition-colors">
              أداة الحساب
            </Link>
            <Link href="/extension" className="text-slate-300 hover:text-white transition-colors">
              إضافة المتصفح
            </Link>
            <Link href="/enterprise" className="text-slate-300 hover:text-white transition-colors">
              تعاقد المؤسسات
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Hero Banner */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            شبكة الربط الحي الموحدة للقطاع المالي والاتصالات بالجزائر
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            قاعدة البيانات الحية للبنوك والمتعاملين
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            ربط مباشر وموثق يجمع <strong>بريد الجزائر، ساتيم (SATIM)، و16 بنكاً عمومياً وخاصاً</strong>، مع <strong>كافة متعاملي الهاتف النقال (موبيليس، جيزي، أوريدو)</strong> لحقن أكواد مكافحة التصيد في كافة الرسائل الصادرة للعملاء في الجزائر.
          </p>
        </div>

        {/* Live Network Health KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>المؤسسات المالية والبنوك:</span>
              <Building className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-black text-white">18 مؤسسة</div>
            <div className="text-[11px] text-teal-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> متصلة وجاهزة 100%
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>متعاملو الهاتف النقال:</span>
              <Smartphone className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-black text-white">3 متعاملين</div>
            <div className="text-[11px] text-teal-400 font-semibold">موبيليس • جيزي • أوريدو</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>زمن الاستجابة (Latency):</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">14 ms</div>
            <div className="text-[11px] text-emerald-400 font-semibold">فائق السرعة (Real-Time)</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>حماية بطاقات الدفع:</span>
              <CreditCard className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-black text-white">الذهبية & CIB</div>
            <div className="text-[11px] text-teal-400 font-semibold">المعيار الموحد المعتمد</div>
          </div>
        </div>

        {/* Section 1: Algerian Telecom Carriers Gateways */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-teal-400" />
              بوابات الربط مع متعاملي الهاتف النقال في الجزائر (SMS Gateways)
            </h2>
            <span className="text-xs text-slate-400">توجيه وحقن الرسائل عبر SMS Center الوطني</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ALGERIAN_TELECOM_OPERATORS.map((op) => (
              <div
                key={op.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 transition-all space-y-4 relative overflow-hidden"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-lg"
                  style={{ backgroundColor: op.color }}
                >
                  {op.companyName[0]}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">{op.companyName}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      بوابة نشطة 🟢
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{op.nameAr}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>مفاتيح الترقيم المعتمدة:</span>
                    <span className="font-mono text-white font-bold">
                      {op.prefixes.join(" • ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>كود الشبكة (MCC-MNC):</span>
                    <span className="font-mono text-teal-300">{op.carrierCode}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>مركز الرسائل (SMSC):</span>
                    <span className="font-mono text-slate-300" dir="ltr">{op.smscCenter}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>زمن الاستجابة:</span>
                    <span className="font-mono text-emerald-400 font-bold">{op.latencyMs} ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Algerian Banks & Postal Institutions Directory */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-teal-400" />
                سجل البنوك والمؤسسات المالية الجزائرية (18 مؤسسة مسجلة)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تصفح البنوك المتعاقدة والمفعلة لبروتوكول حقن رمز مكافحة التصيد
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث باسم البنك أو كود الـ RIB..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "جميع المؤسسات (18)" },
              { id: "central", label: "المحول المركزي والبريد (ساتيم وبريد الجزائر)" },
              { id: "public", label: "البنوك العمومية (BNA, BEA, CPA, BDL, BADR, CNEP)" },
              { id: "private", label: "البنوك الخاصة" },
              { id: "islamic", label: "الصيرفة الإسلامية" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedFilter === tab.id
                    ? "bg-teal-500 text-slate-950 font-bold shadow-md"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Banks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBanks.map((bank) => (
              <div
                key={bank.id}
                className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-xs shadow-md flex-shrink-0"
                      style={{ backgroundColor: bank.color }}
                    >
                      {bank.shortName.slice(0, 4)}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950 text-teal-300 border border-slate-800 font-bold">
                        RIB Code: {bank.code}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1">
                        بطاقة: {bank.cardNetwork}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-sm">{bank.nameAr}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-sans">{bank.nameFr}</p>
                  <div className="text-[11px] text-teal-400 mt-1 font-semibold">{bank.categoryLabel}</div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>معرّف مرسل الـ SMS الرسمي:</span>
                    <span className="font-mono text-white font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {bank.smsSenderId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500">
                      هاتف الخدمة: {bank.supportPhone}
                    </span>
                    <button
                      onClick={() => {
                        setTestModalBank(bank);
                        setTestResult(null);
                      }}
                      className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1"
                    >
                      تجربة التوجيه والحقن ←
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Route Modal / Drawer */}
        {testModalBank && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-teal-500/40 p-6 space-y-5 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: testModalBank.color }}
                  >
                    {testModalBank.shortName}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">اختبار التوجيه مع {testModalBank.nameAr}</h3>
                    <p className="text-xs text-slate-400">بوابة الرسائل المعتمدة: {testModalBank.smsSenderId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setTestModalBank(null)}
                  className="text-slate-400 hover:text-white text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    رقم هاتف المواطن الجزائري (موبيليس / جيزي / أوريدو):
                  </label>
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                    dir="ltr"
                  />
                </div>

                <button
                  onClick={handleExecuteTestRoute}
                  disabled={sendingTest}
                  className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-500/20"
                >
                  {sendingTest ? "جارِ معالجة التوجيه..." : "تنفيذ التوجيه وحقن الرمز (Route & Inject)"}
                </button>
              </div>

              {testResult && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-teal-500/40 space-y-2 text-xs animate-fadeIn font-mono">
                  <div className="text-teal-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    تم التوجيه بنجاح عبر شبكة {testResult.telecomRoute.operator}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    SMSC: {testResult.telecomRoute.smscCenter} | Sender: {testResult.bankDetails.senderId}
                  </div>
                  <pre className="text-xs text-white bg-slate-900 p-2.5 rounded-xl border border-slate-800 whitespace-pre-wrap font-sans">
                    {testResult.protectedMessage}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
