"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Smartphone,
  Laptop,
  CheckCircle2,
  Code2,
  Copy,
  Check,
  Layers,
  Sparkles,
  ArrowRight,
  Download,
} from "lucide-react";
import { ShieldCodeUserTool } from "@/components/shieldcode/ShieldCodeUserTool";

export default function UserToolPage() {
  const [copiedReact, setCopiedReact] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const reactSnippet = `import { ShieldCodeUserTool } from '@shieldcode/security';

export default function AccountSecurityPage() {
  return (
    <div className="account-settings">
      <h2>إعدادات الأمان والحماية</h2>
      {/* تضمين أداة مكافحة التصيد في حساب المستخدم */}
      <ShieldCodeUserTool 
        userId={currentUser.id}
        platformName="اسم منصتكم المالية"
        onCodeUpdated={(code, enabled) => {
          console.log('تم تحديث رمز مكافحة التصيد:', code, enabled);
        }}
      />
    </div>
  );
}`;

  const htmlSnippet = `<!-- تضمين الأداة في أي موقع أو تطبيق ويب عبر الـ Web Component -->
<script src="https://cdn.shieldcode.io/v2/shieldcode-tool.js"></script>
<shieldcode-guard 
  user-id="ACC_881902"
  theme="dark"
  platform="اسم البنك / المنصة">
</shieldcode-guard>`;

  const copyText = (text: string, type: "react" | "html") => {
    navigator.clipboard.writeText(text);
    if (type === "react") {
      setCopiedReact(true);
      setTimeout(() => setCopiedReact(false), 2000);
    } else {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    }
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
              <span className="font-black text-lg text-white tracking-tight">ShieldCode</span>
              <span className="block text-[10px] text-teal-400 font-bold -mt-1">أداة حسابات المستخدمين</span>
            </div>
          </Link>

          <nav className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors">
              الرئيسية
            </Link>
            <Link href="/extension" className="text-slate-300 hover:text-white transition-colors">
              إضافة المتصفح
            </Link>
            <Link href="/enterprise" className="text-slate-300 hover:text-white transition-colors">
              تعاقد المؤسسات (B2B)
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Intro Banner */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            أداة أمان مستقلة للهاتف والحاسوب
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            أداة تعيين رمز مكافحة التصيد للمستخدمين
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            أداة متجاوبة وخفيفة يمكن لأي مؤسسة مالية أو منصة دفع إضافتها داخل حسابات عملائها (على تطبيقات الهاتف أو منصات الحاسوب عبر الويب)، لتمكين المستخدم من تحديد رمزه السري بسهولة وسرعة.
          </p>
        </div>

        {/* Live Interactive Embed Area */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col items-center">
          <div className="w-full mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping"></span>
              <span className="text-xs font-bold text-teal-300">معاينة تفاعلية حية للأداة:</span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              يمكنك التبديل بين شاشة الهاتف وشاشة الحاسوب لتجربة مظهر الأداة
            </span>
          </div>

          {/* Embedded User Tool */}
          <ShieldCodeUserTool
            userId="user_live_demo"
            defaultView="desktop"
            allowViewSwitch={true}
            platformName="منصتكم المالية"
          />
        </section>

        {/* Integration Code Snippets for Developers */}
        <section className="space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400">
              <Code2 className="w-4 h-4" />
              تضمين فوري في 60 ثانية
            </div>
            <h2 className="text-2xl font-bold text-white">
              كيف تقوم المؤسسات بتضمين هذه الأداة في تطبيقاتها؟
            </h2>
            <p className="text-xs text-slate-400">
              الأداة مبنية لتكون متوافقة مع جميع أطر العمل: React, Next.js, Vue, Angular, أو تطبيقات الهاتف React Native و Flutter.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* React / Next.js */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-teal-300 font-mono">React / Next.js Component</span>
                <button
                  onClick={() => copyText(reactSnippet, "react")}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  {copiedReact ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedReact ? "تم النسخ" : "نسخ الكود"}
                </button>
              </div>
              <pre className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-xl overflow-x-auto leading-relaxed" dir="ltr">
                {reactSnippet}
              </pre>
            </div>

            {/* Standard HTML / Web Component */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-teal-300 font-mono">Universal Web Component / CDN</span>
                <button
                  onClick={() => copyText(htmlSnippet, "html")}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  {copiedHtml ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedHtml ? "تم النسخ" : "نسخ الكود"}
                </button>
              </div>
              <pre className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-xl overflow-x-auto leading-relaxed" dir="ltr">
                {htmlSnippet}
              </pre>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
