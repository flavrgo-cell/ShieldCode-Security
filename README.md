# 🛡️ ShieldCode — Anti-Phishing Security CLI & Tool for Banking

[![npm version](https://img.shields.io/badge/npm-v2.1.0-teal.svg?style=flat-square)](https://www.npmjs.com)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![platform](https://img.shields.io/badge/platform-CLI%20%7C%20Node.js%20%7C%20React%20%7C%20REST-green.svg?style=flat-square)](#)
[![compliance](https://img.shields.io/badge/compliance-PCI--DSS%20%7C%20SATIM%20Ready-emerald.svg?style=flat-square)](#)

> **أداة وحزمة سطر أوامر مفتوحة المصدر لإضافة حماية رمز مكافحة التصيد والاحتيال (Anti-Phishing Code) إلى الحسابات والتطبيقات المصرفية والمالية بسهولة تامة وبأمر واحد.**

---

## ⚡ التثبيت السريع عبر لوحة الأوامر (CLI Installation)

يمكن إضافة وتشغيل الأداة مباشرة في أي مشروع أو خادم بنكي باستخدام **npx** دون الحاجة لتثبيت مسبق:

```bash
# تشغيل الأداة مباشرة
npx shieldcode --help

# أو التثبيت كأداة عامة في النظام
npm install -g shieldcode
```

---

## 💻 أوامر لوحة الأوامر (Command Line Interface)

### 1. تهيئة الأداة في تطبيق البنك
```bash
npx shieldcode init
```
*يقوم بإنشاء ملف الإعدادات `shieldcode.config.json` المعتمد لمعايير الحماية.*

### 2. تعيين رمز سري لحساب عميل
```bash
npx shieldcode set --user 0555123456 --code AYOUB2026
```
```
✓ تم تعيين وتفعيل رمز الحماية بنجاح!
الحساب: 0555123456
الرمز السري المشترك: [AYOUB2026]
```

### 3. حقن الرمز في رسالة SMS أو إيميل بنكي قبل الإرسال
```bash
npx shieldcode protect --user 0555123456 --msg "كود التحقق OTP هو 889102"
```
```
✓ تم حقن رمز مكافحة التصيد في الرسالة بنجاح:
[رمزك: AYOUB2026]
كود التحقق OTP هو 889102
```

### 4. فحص واكتشاف رسائل التصيد الاحتيالي فوراً
```bash
# فحص رسالة مشبوهة واردة
npx shieldcode verify --user 0555123456 --msg "Alert: تم تجميد حسابك اضغط هنا"
```
```
🚨 نتيجة الفحص: تحذير من محاولة تصيد احتيالي (SMISHING DETECTED)
الرسالة لا تحتوي على الرمز السري [AYOUB2026].
المخترق ينتحل اسم البنك! لا تضغط على أي رابط ولا تشارك بياناتك!
```

---

## 🚀 الدمج البرمجي في التطبيقات المصرفية (2 Lines of Code)

### في واجهة المستخدم (React / Next.js / Mobile):
أضف الأداة كخيار أمان بسيط ضمن إعدادات حساب العميل:

```tsx
import { ShieldCodeWidget } from '@shieldcode/security';

export function SecuritySettings({ user }) {
  return (
    <div className="security-menu">
      {/* سطر واحد فقط يضيف الخيار كاملاً مع المعاينة التلقائية */}
      <ShieldCodeWidget userId={user.id} bankName="بريدي موب (BaridiMob)" />
    </div>
  );
}
```

### في خادم الإشعارات والـ OTP (Node.js / Express / Backend):
قبل إرسال الرسالة إلى موزع الـ SMS (Mobilis, Djezzy, Ooredoo):

```typescript
import { shieldcode } from '@shieldcode/security';

export async function sendOtp(userId, rawOtpMessage) {
  // حقن الرمز السري في نص الرسالة
  const secureMessage = shieldcode.protect(userId, rawOtpMessage);
  
  // إرسال الرسالة الموثقة للمواطن
  await telecomSmsGateway.send(userId, secureMessage);
}
```

---

## 🏛️ كيف يمنع ShieldCode التصيد في الجزائر؟ (How it Works)

```
        ┌────────────────────────────────────────────────────────┐
        │     المواطن يعيّن كلمته السرية الخاصة (مثال: AYOUB2026) │
        │     (سر مشترك بين العميل وخادم البنك فقط)               │
        └───────────────────────────┬────────────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               ▼
[رسالة رسمية من بريد الجزائر / البنك]                 [محاولة تصيد احتيالي وانتحال صفة]
    │                                                               │
    ▼                                                               ▼
البنك يقرأ الرمز المشترك ويحقنه تلقائياً:             المخترق ينتحل اسم البنك لكنه مستحيل يعلم الرمز!
"[AYOUB2026] بريدي موب: كود OTP هو 8891..."          "Alert: تم تعليق حسابك اضغط الرابط..."
    │                                                               │
    ▼                                                               ▼
✅ العميل يرى رمزه = البنك حقيقي 100%                 🚨 غياب الرمز يفضح الاحتيال في ثانية واحدة!
```

---

## 📁 هيكلة المشروع (Project Structure)

```
ShieldCode-Security/
├── bin/
│   └── shieldcode.js           # أداة سطر الأوامر التنفيذية (CLI Tool)
├── components/
│   └── shieldcode/
│       ├── AntiPhishingSecurityOption.tsx  # خيار الأمان البسيط للتطبيقات
│       └── ShieldCodeWidget.tsx            # المكون المدمج المستقل
├── lib/
│   └── shieldcode-sdk/
│       ├── core.ts             # محرك الأداة (Validate, Inject, Verify)
│       └── types.ts            # واجهات المعطيات
├── app/
│   ├── page.tsx                # منصة عرض الأداة والمحاكي التفاعلي المباشر
│   ├── tool/                   # بوابة الـ SDK والمختبر الحي للشركاء
│   ├── api/v1/shieldcode/      # REST API للمؤسسات المتعاقدة
│   └── dashboard/satim/        # محاكاة المعيار الوطني الموحد (SATIM)
├── package.json
└── README.md
```

---

## 🛠️ التشغيل المحلي للمنصة والمحاكي (Local Development)

```bash
git clone https://github.com/flavrgo-cell/ShieldCode-Security.git
cd ShieldCode-Security
npm install
npm run dev
```
افتح المتصفح على: `http://localhost:3000`

---

## 📄 الترخيص (License)
مشروع مفتوح المصدر تحت ترخيص **MIT License** — صُمم كأداة أمنية لحماية المعاملات البنكية ومكافحة التصيد المالي.
