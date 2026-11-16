"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Terminal,
  Code2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Layers,
  Laptop,
  Smartphone,
  ExternalLink,
} from "lucide-react";

export default function ToolDocsPage() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const cliCommands = [
    {
      cmd: "npx shieldcode init",
      desc: "تهيئة ملف إعدادات أداة ShieldCode في مشروعكم",
    },
    {
      cmd: "npx shieldcode set --user user_101 --code SAFE2026",
      desc: "تعيين أو تحديث رمز مكافحة التصيد السري للعميل",
    },
    {
      cmd: "npx shieldcode protect --user user_101 --msg 'كود تأكيد OTP هو 449102'",
      desc: "حقن الرمز السري في نص رسالة الإشعار أو OTP قبل إرسالها",
    },
    {
      cmd: "npx shieldcode verify --user user_101 --msg '[رمزك: SAFE2026] كود تأكيد OTP هو 449102'",
      desc: "فحص رسالة واردة والتأكد من مطابقة الرمز السري المشترك",
    },
    {
      cmd: "npx shieldcode list",
      desc: "عرض قائمة الحسابات المحمية المسجلة",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100 selection:bg-teal-500 selection:text-slate-950" dir="rtl">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-[#0a1424]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-lg text-white tracking-tight">ShieldCode CLI & SDK</span>
              <span className="block text-[10px] text-teal-400 font-bold -mt-1">دليل المطورين وأداة سطر الأوامر</span>
            </div>
          </Link>

          <nav className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors">
              الرئيسية
            </Link>
            <Link href="/extension" className="text-slate-300 hover:text-white transition-colors">
              إضافة المتصفح
            </Link>
            <Link href="/user-tool" className="text-slate-300 hover:text-white transition-colors">
              أداة الحساب
            </Link>
            <Link href="/enterprise" className="text-slate-300 hover:text-white transition-colors">
              تعاقد المؤسسات (B2B)
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold">
            <Terminal className="w-3.5 h-3.5" />
            أداة CLI خفيفة تعمل مباشرة عبر npx
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            تشغيل أداة ShieldCode عبر لوحة الأوامر (Terminal)
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            يمكن للمطورين والمهندسين في البنوك والمؤسسات اختبار وإدارة بروتوكول مكافحة التصيد مباشرة من سطر الأوامر دون أي إعداد مسبق.
          </p>
        </div>

        {/* CLI Commands List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-teal-400" />
            الأوامر الأساسية المتاحة:
          </h2>

          <div className="space-y-3">
            {cliCommands.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-mono text-xs text-teal-300 font-bold" dir="ltr">
                    {item.cmd}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
                </div>

                <button
                  onClick={() => copyCommand(item.cmd, String(idx))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors flex-shrink-0"
                >
                  {copiedCmd === String(idx) ? (
                    <Check className="w-3.5 h-3.5 text-teal-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedCmd === String(idx) ? "تم النسخ" : "نسخ الأمر"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
          <Link
            href="/extension"
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-all space-y-2 group"
          >
            <div className="font-bold text-white text-sm group-hover:text-teal-400 transition-colors">
              إضافة المتصفح (Browser Extension) ←
            </div>
            <p className="text-xs text-slate-400">
              تثبيت إضافة المتصفح لفحص الروابط والمراسلات تلقائياً.
            </p>
          </Link>

          <Link
            href="/user-tool"
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-all space-y-2 group"
          >
            <div className="font-bold text-white text-sm group-hover:text-teal-400 transition-colors">
              أداة الحساب (Mobile & Desktop) ←
            </div>
            <p className="text-xs text-slate-400">
              واجهة المستخدم التي تُدمج في إعدادات الأمان.
            </p>
          </Link>

          <Link
            href="/enterprise"
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-all space-y-2 group"
          >
            <div className="font-bold text-white text-sm group-hover:text-teal-400 transition-colors">
              بوابة تعاقد المؤسسات (B2B) ←
            </div>
            <p className="text-xs text-slate-400">
              واجهات برمجة التطبيقات ونماذج الترخيص للمؤسسات.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
