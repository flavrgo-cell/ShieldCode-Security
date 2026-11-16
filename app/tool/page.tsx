"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Code2,
  Terminal,
  Copy,
  Check,
  Play,
  Layers,
  ArrowRight,
  ExternalLink,
  Laptop,
  Smartphone,
  Cpu,
  Zap,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { ShieldCodeWidget } from "@/components/shieldcode/ShieldCodeWidget";
import { defaultShieldCode } from "@/lib/shieldcode-sdk";

export default function ShieldCodeToolPage() {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<"react" | "node" | "curl" | "python">("react");

  // Interactive Sandbox states
  const [testUserId, setTestUserId] = useState("user_algeria_01");
  const [testCode, setTestCode] = useState("AYOUB2026");
  const [rawMessage, setRawMessage] = useState("كود التحقق لتأكيد دفع 5,000 دج هو: 991204");
  const [injectedResult, setInjectedResult] = useState<any>(null);
  const [verifyMessageText, setVerifyMessageText] = useState("");
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(id);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleTestInject = () => {
    // ensure code is set
    defaultShieldCode.setCode(testUserId, testCode, true);
    const result = defaultShieldCode.injectNotification({
      userId: testUserId,
      rawMessage,
      channel: "sms",
    });
    setInjectedResult(result);
  };

  const handleTestVerify = (isFake: boolean) => {
    defaultShieldCode.setCode(testUserId, testCode, true);
    const msg = isFake
      ? "BankAlert: حسابك معلق اضغط هنا للتحقق فورا http://fake-bank.tk"
      : `[رمزك: ${testCode}]\nBaridiMob: تم تأكيد عملية التحويل برقم 882103`;

    setVerifyMessageText(msg);
    const result = defaultShieldCode.verifyMessage({
      userId: testUserId,
      fullMessageText: msg,
    });
    setVerifyResult(result);
  };

  const codeSnippets = {
    react: `// 1. تثبيت الأداة
// npm install @shieldcode/security

// 2. إدراج المكون في صفحة إعدادات أي تطبيق بنكي أو مالي
import { ShieldCodeWidget } from '@shieldcode/react';

export function BankSecuritySettings({ user }) {
  return (
    <div className="security-page">
      <h2>أمان الحساب المصرفي</h2>
      
      {/* سطر واحد فقط يضيف حماية مكافحة التصيد كاملة */}
      <ShieldCodeWidget 
        userId={user.accountNumber}
        bankName="بريدي موب (BaridiMob)"
        onCodeUpdated={(code, enabled) => {
          console.log("تم تحديث رمز الحماية:", code);
        }}
      />
    </div>
  );
}`,
    node: `// في خادم البنك (Node.js / Express / NestJS)
import { ShieldCodeCore } from '@shieldcode/core';

const shield = new ShieldCodeCore({
  institutionName: 'BaridiMob',
  apiKey: process.env.SHIELDCODE_API_KEY
});

// عند إرسال أي رسالة SMS أو OTP للعميل:
export async function sendOtpSms(userId, rawOtpMessage) {
  // حقن رمز الحماية في الرسالة قبل الإرسال
  const { protectedMessage } = shield.injectNotification({
    userId: userId,
    rawMessage: rawOtpMessage,
    channel: 'sms'
  });

  // إرسال الرسالة المحمية عبر موزع الرسائل (Mobilis / Djezzy / Ooredoo)
  await telecomSmsGateway.send(userId, protectedMessage);
  // النتيجة: "[رمزك: AYOUB2026] كود التحقق هو 889102"
}`,
    curl: `# 1. حقن رمز الحماية في رسالة عبر REST API
curl -X POST https://api.shieldcode.dz/v1/shieldcode/inject \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "0555123456",
    "rawMessage": "كود التحقق لتأكيد دفع 4,500 دج هو 889102",
    "channel": "sms"
  }'

# 2. التحقق من مصداقية رسالة هل هي أصلية أم تصيد
curl -X POST https://api.shieldcode.dz/v1/shieldcode/verify \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "0555123456",
    "fullMessageText": "[رمزك: AYOUB2026] كود التحقق هو 889102"
  }'`,
    python: `# في خوادم البنوك المبنية بـ Python / Django / FastAPI
import requests

SHIELDCODE_API = "https://api.shieldcode.dz/v1/shieldcode"

def secure_bank_notification(user_id: str, message: str) -> str:
    response = requests.post(f"{SHIELDCODE_API}/inject", json={
        "userId": user_id,
        "rawMessage": message,
        "channel": "sms"
    })
    data = response.json()
    return data.get("protectedMessage", message)

# الاستخدام:
protected_sms = secure_bank_notification("0555123456", "تم تحويل 10,000 دج لحسابك")
print(protected_sms)
# الناتج: "[رمزك: AYOUB2026] تم تحويل 10,000 دج لحسابك"`,
  };

  return (
    <div
      className="min-h-screen text-white p-4 md:p-10 font-sans"
      style={{ backgroundColor: "#071022" }}
      dir="rtl"
    >
      {/* ── Top Bar ── */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ backgroundColor: "#00b4a0" }}
            >
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                  أداة وحزمة ShieldCode للأمان المالي
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                  SDK v2.1.0
                </span>
              </div>
              <p className="text-xs md:text-sm text-gray-400 mt-1">
                حزمة برمجية ومكون جاهز (Plug & Play Widget & API) لإضافة رمز مكافحة التصيد إلى أي تطبيق بنكي أو منصة مالية في 3 دقائق
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 transition-all flex items-center gap-1.5"
            >
              العودة للبنك التجريبي
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="#embed-demo"
              className="px-4 py-2 rounded-xl text-xs font-bold text-black transition-all shadow-md"
              style={{ backgroundColor: "#00b4a0" }}
            >
              معاينة المكون المدمج
            </a>
          </div>
        </div>

        {/* 3 Steps Value Proposition */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm mb-2">
              1
            </div>
            <h3 className="font-bold text-sm text-white mb-1">تثبيت واستدعاء الأداة</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              البنك يثبت حزمة <code>@shieldcode/security</code> أو يتصل بـ REST API بدون تغيير قاعدة بياناته المصرفية.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm mb-2">
              2
            </div>
            <h3 className="font-bold text-sm text-white mb-1">إدراج واجهة المستخدم للمواطن</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              إضافة مكون <code>&lt;ShieldCodeWidget /&gt;</code> الجاهز في صفحة أمان تطبيق البنك ليحدد المواطن رمزه.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm mb-2">
              3
            </div>
            <h3 className="font-bold text-sm text-white mb-1">حقن الرمز تلقائياً في الإشعارات</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              سطر واحد في خادم البنك <code>shield.injectNotification()</code> يحقن الرمز في كل رسائل الـ SMS والإيميل.
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Section 1: Developer Code Integration (7 cols) ── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-[#0b162a] border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-teal-400" />
                <h2 className="font-bold text-sm text-white">
                  أكواد الدمج في التطبيقات المالية (Integration Code):
                </h2>
              </div>
              {/* Language Tabs */}
              <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-xl text-xs font-mono" dir="ltr">
                {(["react", "node", "curl", "python"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeCodeTab === tab
                        ? "bg-teal-500 text-black"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Display Area */}
            <div className="relative rounded-2xl bg-[#040812] border border-gray-800 p-4 font-mono text-xs overflow-x-auto text-left" dir="ltr">
              <button
                onClick={() => copyToClipboard(codeSnippets[activeCodeTab], activeCodeTab)}
                className="absolute right-3 top-3 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] flex items-center gap-1.5 transition-all"
              >
                {copiedTab === activeCodeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الكود</span>
                  </>
                )}
              </button>
              <pre className="text-gray-300 leading-relaxed pt-6">
                <code>{codeSnippets[activeCodeTab]}</code>
              </pre>
            </div>
          </div>

          {/* ── Section 2: Interactive Tool Playground / Sandbox ── */}
          <div className="p-6 rounded-3xl bg-[#0b162a] border border-gray-800 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-5 h-5 text-teal-400" />
              <h2 className="font-bold text-sm text-white">
                مختبر تجربة الأداة البرمجية المباشر (Live SDK Sandbox)
              </h2>
            </div>
            <p className="text-xs text-gray-400">
              جرّب استدعاء دوال الأداة البرمجية وشاهد مخرجاتها فوراً:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">معرّف العميل (userId):</label>
                <input
                  type="text"
                  value={testUserId}
                  onChange={(e) => setTestUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">الرمز السري الشخصي (ShieldCode):</label>
                <input
                  type="text"
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-teal-300 font-mono font-bold"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 block mb-1 text-xs">
                نص الرسالة البنكية الخام المراد حمايتها وحقن الرمز بها:
              </label>
              <textarea
                value={rawMessage}
                onChange={(e) => setRawMessage(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleTestInject}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                تشغيل: shield.injectNotification()
              </button>
              <button
                onClick={() => handleTestVerify(false)}
                className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium"
              >
                فحص رسالة أصلية
              </button>
              <button
                onClick={() => handleTestVerify(true)}
                className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/60 text-xs font-medium"
              >
                فحص رسالة تصيد مزورة
              </button>
            </div>

            {/* Sandbox Output Results */}
            {injectedResult && (
              <div className="mt-3 p-4 rounded-xl bg-gray-950 border border-teal-500/40 font-mono text-xs text-left" dir="ltr">
                <span className="text-[10px] text-teal-400 font-bold block mb-1">
                  // OUTPUT: injectNotification() Result
                </span>
                <pre className="text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(injectedResult, null, 2)}
                </pre>
              </div>
            )}

            {verifyResult && (
              <div
                className={`mt-3 p-4 rounded-xl border text-xs text-right ${
                  verifyResult.isAuthentic
                    ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                    : "bg-red-950/40 border-red-500/50 text-red-300"
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {verifyResult.isAuthentic ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <span>نتيجة التحقق: {verifyResult.status}</span>
                </div>
                <p className="text-[11px] leading-relaxed">{verifyResult.reason}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Section 3: Live Embed Demo of the Widget (5 cols) ── */}
        <div className="lg:col-span-5 space-y-6" id="embed-demo">
          <div className="p-4 rounded-3xl bg-[#0b162a] border border-gray-800">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <h3 className="font-bold text-sm text-white">
                  معاينة المكون المدمج في أي تطبيق
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">
                &lt;ShieldCodeWidget /&gt;
              </span>
            </div>

            <p className="text-xs text-gray-400 mb-4 px-2">
              هكذا يظهر المكون تماماً داخل تطبيق البنك أو المنصة المالية عند استدعائه:
            </p>

            {/* Embedded Live Widget */}
            <ShieldCodeWidget
              userId="live_demo_customer"
              initialCode="AYOUB2026"
              initialEnabled={true}
              bankName="بريدي موب (BaridiMob)"
              theme="dark"
            />
          </div>

          {/* Standalone Package Info Card */}
          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 text-xs space-y-3">
            <h4 className="font-bold text-teal-300 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              مواصفات الأداة والمكتبة البرمجية:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-gray-300">
              <div className="p-2.5 rounded-lg bg-gray-950 border border-gray-800">
                <span className="text-gray-500 block text-[10px]">الترخيص والحجم</span>
                <span className="font-bold text-white text-xs">خفيف جداً (&lt; 15 KB)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-950 border border-gray-800">
                <span className="text-gray-500 block text-[10px]">التوافق</span>
                <span className="font-bold text-white text-xs">React, Vue, Node, REST</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-950 border border-gray-800">
                <span className="text-gray-500 block text-[10px]">الأمان</span>
                <span className="font-bold text-white text-xs">Zero-Knowledge Storage</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-950 border border-gray-800">
                <span className="text-gray-500 block text-[10px]">المعايير الدولية</span>
                <span className="font-bold text-white text-xs">مطابق لـ PCI-DSS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
