"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Building,
  Key,
  Lock,
  Code2,
  Terminal,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Server,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  RefreshCw,
  Send,
  Database,
} from "lucide-react";
import { defaultShieldCode } from "@/lib/shieldcode-sdk";

export default function EnterprisePage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<"node" | "python" | "java" | "curl" | "php">("node");

  // Interactive B2B Test Console
  const [b2bUserId, setB2bUserId] = useState("client_acct_5521");
  const [b2bUserCode, setB2bUserCode] = useState("SAFE2026");
  const [b2bRawMsg, setB2bRawMsg] = useState("رمز التحقق OTP الخاص بك لتأكيد العملية هو: 672019");
  const [b2bChannel, setB2bChannel] = useState<"sms" | "email" | "push">("sms");
  const [b2bResult, setB2bResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Partnership Simulator
  const [instName, setInstName] = useState("");
  const [instType, setInstType] = useState("bank");
  const [generatedContract, setGeneratedContract] = useState<{
    apiKey: string;
    instId: string;
    timestamp: string;
  } | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestInject = () => {
    setLoading(true);
    // Setup code
    defaultShieldCode.setCode(b2bUserId, b2bUserCode, true);
    setTimeout(() => {
      const res = defaultShieldCode.injectNotification({
        userId: b2bUserId,
        rawMessage: b2bRawMsg,
        channel: b2bChannel,
        customSender: instName || "المؤسسة المالية المتعاقدة",
      });
      setB2bResult(res);
      setLoading(false);
    }, 300);
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instName.trim()) return;
    const newApiKey = `sc_live_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
    const newInstId = `inst_${instName.toLowerCase().replace(/\s+/g, '_')}`;
    setGeneratedContract({
      apiKey: newApiKey,
      instId: newInstId,
      timestamp: new Date().toLocaleDateString('ar-DZ'),
    });
  };

  const codeSnippets = {
    node: `import { ShieldCodeCore } from '@shieldcode/security';

// 1. تهيئة الأداة بمفتاح تعاقد المؤسسة
const shield = new ShieldCodeCore({
  apiKey: process.env.SHIELDCODE_API_KEY,
  institutionName: 'المؤسسة المتعاقدة'
});

// 2. حقن الرمز السري للمستخدم في نص الرسالة قبل إرسال الـ SMS
export async function sendProtectedOTP(userId: string, otpCode: string) {
  const originalMessage = \`رمز التحقق OTP لتأكيد العملية هو: \${otpCode}\`;
  
  const protectedResult = shield.injectNotification({
    userId: userId,
    rawMessage: originalMessage,
    channel: 'sms'
  });

  // إرسال الرسالة المحمية عبر مزود الـ SMS
  await smsGateway.send({
    to: userPhone,
    text: protectedResult.protectedMessage
  });
}`,
    python: `from shieldcode import ShieldCodeClient

# 1. تهيئة أداة ShieldCode لمؤسستكم
client = ShieldCodeClient(
    api_key="sc_live_enterprise_secret_key",
    institution_name="Fintech Platform"
)

# 2. حقن رمز مكافحة التصيد في الرسالة الصادرة
def send_secure_notification(user_id, raw_text):
    result = client.inject_notification(
        user_id=user_id,
        raw_message=raw_text,
        channel="sms"
    )
    # result['protected_message'] يحتوي على الرمز السري المشترك
    return sms_provider.send_message(result['protected_message'])`,
    java: `import io.shieldcode.sdk.ShieldCodeEngine;
import io.shieldcode.sdk.models.InjectResult;

public class NotificationService {
    private final ShieldCodeEngine shield = new ShieldCodeEngine("sc_live_enterprise_secret_key");

    public void sendTransferAlert(String userId, String rawMessage) {
        InjectResult result = shield.injectNotification(userId, rawMessage, "sms");
        // الرسالة المحمية أصبحت جاهزة مع رمز العميل السري
        smsSender.send(result.getProtectedMessage());
    }
}`,
    curl: `# استدعاء الـ REST API لحقن رمز مكافحة التصيد في الرسالة
curl -X POST https://api.shieldcode.io/v1/shieldcode/inject \\
  -H "Authorization: Bearer sc_live_enterprise_secret_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "client_acct_5521",
    "rawMessage": "رمز التحقق OTP الخاص بك هو: 881204",
    "channel": "sms"
  }'`,
    php: `<?php
require_once 'vendor/autoload.php';
use ShieldCode\\Security\\Client;

$shield = new Client(['api_key' => 'sc_live_enterprise_secret_key']);

$result = $shield->injectNotification([
    'userId'     => $userAccount,
    'rawMessage' => "تم خصم مبلغ 4,000 دج من حسابك",
    'channel'    => 'sms'
]);

// إرسال الرسالة المحمية
sendSms($userPhone, $result['protectedMessage']);
?>`,
  };

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100 selection:bg-teal-500 selection:text-slate-950" dir="rtl">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-[#0a1424]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-lg text-white tracking-tight">ShieldCode Enterprise</span>
              <span className="block text-[10px] text-teal-400 font-bold -mt-1">بوابة تعاقد المؤسسات</span>
            </div>
          </Link>

          <nav className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors">
              الرئيسية
            </Link>
            <Link href="/algeria" className="text-slate-300 hover:text-white transition-colors">
              بنوك ومتعاملو الجزائر
            </Link>
            <Link href="/extension" className="text-slate-300 hover:text-white transition-colors">
              إضافة المتصفح
            </Link>
            <Link href="/user-tool" className="text-slate-300 hover:text-white transition-colors">
              أداة الحساب (هاتف وحاسوب)
            </Link>
            <a
              href="#contract-simulator"
              className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all"
            >
              طلب تعاقد فوري
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold">
            <Building className="w-3.5 h-3.5" />
            حلول أمان B2B للبنوك، شركات الفنتك، ومنصات الدفع
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            تعاقد المؤسسات مع أداة ShieldCode <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
              لتوفير أكواد مكافحة التصيد لعملائكم
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            تتعاقد المؤسسات والشركات مع <strong>ShieldCode</strong> للاستفادة من بروتوكول مكافحة التصيد المركزي. نقوم بتوفير طبقة برمجية (API & SDK) تتيح لمستخدميكم تعيين رموزهم الشخصية وحقنها تلقائياً في كافة إشعارات الـ OTP والـ SMS الصادرة، مما يجعل انتحال مؤسستكم أمراً مستحيلاً على المحتالين.
          </p>
        </div>

        {/* 4 Pillars of Institutional Partnership */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-white text-sm">عقد شراكة وترخيص API</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              تحصل المؤسسة على مفاتيح ربط برمجية (Enterprise API Keys) مع بنية تحتية مشفرة بضمان معايير الأمان المالي.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-white text-sm">تضمين الأداة في تطبيقكم</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              تضاف أداة ShieldCode خفيفة الوزن كخيار أمان إضافي في تطبيق الهاتف وبوابة الحاسوب للمستخدمين.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-white text-sm">حقن تلقائي قبل الإرسال</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              تقوم خوادمكم باستدعاء دالة الحقن عند إرسال أي OTP أو تنبيه مصرفي، ليتم إدراج الرمز السري للعميل تلقائياً.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="font-bold text-white text-sm">حماية مطلقة من الانتحال</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              لا يستطيع أي مخترق إرسال رسالة تصيد مطابقة، لأن الرمز السري لا يعلمه سوى العميل والمؤسسة المتعاقدة.
            </p>
          </div>
        </div>

        {/* Live Interactive B2B Sandbox Console */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-bold text-white">منصة تجربة واجهة برمجة التطبيقات للمؤسسات (Live API Console)</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                اختبر استدعاء الـ API كما تنفذه خوادم المؤسسات المتعاقدة معنا لحقن أكواد الأمان في الرسائل
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-950 text-teal-300 border border-teal-500/30">
              POST /api/v1/shieldcode/inject
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Form */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">معرّف حساب العميل (userId):</label>
                <input
                  type="text"
                  value={b2bUserId}
                  onChange={(e) => setB2bUserId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">رمز مكافحة التصيد المسجل للعميل (User Code):</label>
                <input
                  type="text"
                  value={b2bUserCode}
                  onChange={(e) => setB2bUserCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-teal-300 focus:outline-none focus:border-teal-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">قناة الإشعار (Notification Channel):</label>
                <select
                  value={b2bChannel}
                  onChange={(e: any) => setB2bChannel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="sms">رسائل نصية قصيرة (SMS)</option>
                  <option value="email">بريد إلكتروني رسمي (Email)</option>
                  <option value="push">إشعار تطبيق الهاتف (Push Notification)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">نص الرسالة الأصلية الصادرة من نظامكم المصرفي:</label>
                <textarea
                  value={b2bRawMsg}
                  onChange={(e) => setB2bRawMsg(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                onClick={handleTestInject}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                تنفيذ استدعاء الحقن الأمني (Inject API Call)
              </button>
            </div>

            {/* API Output Viewer */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span>استجابة خادم ShieldCode (JSON Response):</span>
                  {b2bResult && <span className="text-teal-400 font-bold">200 OK</span>}
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-teal-300 overflow-x-auto min-h-[160px]" dir="ltr">
                  {b2bResult ? (
                    <pre>{JSON.stringify(b2bResult, null, 2)}</pre>
                  ) : (
                    <span className="text-slate-600">// اضغط على زر تنفيذ استدعاء الحقن لرؤية استجابة الـ API...</span>
                  )}
                </div>
              </div>

              {b2bResult && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-teal-500/30 space-y-2">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    الرسالة المحمية الجاهزة للإرسال لهاتف العميل:
                  </div>
                  <pre className="text-xs font-mono text-white bg-slate-900 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap leading-relaxed">
                    {b2bResult.protectedMessage}
                  </pre>
                  <p className="text-[11px] text-teal-400">
                    ✓ تم حقن الرمز بنجاح. إذا حاول محتال إرسال نفس الرسالة من رقم وهمي فلن يستطيع تضمين الرمز السري.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code Snippets Section in 5 Languages */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-teal-400" />
                أكواد الربط البرمجي للمؤسسات بمختلف اللغات
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                مكتبات جاهزة للاستخدام في مشاريع Node.js, Python, Java, PHP أو cURL
              </p>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
              {(["node", "python", "java", "curl", "php"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    activeLang === lang
                      ? "bg-teal-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => copyCode(codeSnippets[activeLang], activeLang)}
              className="absolute left-3 top-3 flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 z-10"
            >
              {copiedKey === activeLang ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === activeLang ? "تم النسخ" : "نسخ الكود"}
            </button>
            <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-2xl overflow-x-auto leading-relaxed border border-slate-800/80" dir="ltr">
              {codeSnippets[activeLang]}
            </pre>
          </div>
        </div>

        {/* Contract Inquiry & Registration Simulator */}
        <div id="contract-simulator" className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-[#0a1628] border border-teal-500/30 space-y-6">
          <div className="max-w-xl mx-auto text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400">
              <Sparkles className="w-4 h-4" />
              طلب تعاقد وشراكة فورية
            </div>
            <h3 className="text-2xl font-black text-white">
              ابدأ تأمين مستخدميك الآن عبر بروتوكول ShieldCode
            </h3>
            <p className="text-xs text-slate-400">
              أدخل اسم مؤسستك للحصول على مفتاح تجريبي للربط والبدء في استغلال الأداة
            </p>
          </div>

          <form onSubmit={handleCreateContract} className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">اسم المؤسسة أو الشركة:</label>
              <input
                type="text"
                required
                value={instName}
                onChange={(e) => setInstName(e.target.value)}
                placeholder="مثال: البنك المركزي / منصة الدفع الرقمي"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">نوع القطاع:</label>
              <select
                value={instType}
                onChange={(e) => setInstType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="bank">قطاع بنكي ومصرفي</option>
                <option value="fintech">شركة تكنولوجيا مالية (فنتك)</option>
                <option value="telecom">متعامل اتصالات وشبكات دفع</option>
                <option value="ecommerce">منصة تجارة إلكترونية ودفع وطني</option>
                <option value="gov">بوابة حكومية رقمية</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-xl shadow-teal-500/20 active:scale-95"
            >
              توليد مفتاح التعاقد والترخيص البرمجي (Generate API License)
            </button>
          </form>

          {generatedContract && (
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950 border border-teal-500/50 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                تم تسجيل طلب التعاقد وتوليد مفتاح الربط:
              </div>
              <div className="space-y-1 text-xs font-mono">
                <div className="text-slate-400">
                  Institution ID: <span className="text-white font-bold">{generatedContract.instId}</span>
                </div>
                <div className="text-slate-400">
                  API Key: <span className="text-teal-300 font-bold break-all">{generatedContract.apiKey}</span>
                </div>
                <div className="text-slate-400">
                  Contract Date: <span className="text-white">{generatedContract.timestamp}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-2">
                يمكنكم الآن إضافة هذا المفتاح في خوادمكم للبدء في حقن أكواد الحماية لمستخدميكم فوراً.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
