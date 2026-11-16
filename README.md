# 🛡️ ShieldCode — بروتوكول وأداة مكافحة التصيد والاحتيال المالي

[![version](https://img.shields.io/badge/version-2.2.0-teal.svg?style=flat-square)](#)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![platform](https://img.shields.io/badge/platform-Extension%20%7C%20Web%20%7C%20Mobile%20%7C%20CLI%20%7C%20API-teal.svg?style=flat-square)](#)
[![cybersecurity](https://img.shields.io/badge/security-Anti--Phishing%20Standard-emerald.svg?style=flat-square)](#)

> **أداة أمان سيبراني مركزية ومستقلة تتيح للمستخدمين تحديد رمز مكافحة تصيد سري خاص بهم، وتُمكّن المؤسسات والمنصات المالية من التعاقد مع أداتنا لتوفير وحقن الأكواد في كافة الإشعارات والـ OTP لحماية الحسابات من هجمات التصيد والاحتيال.**

---

## 🌟 أشكال تجسيد الأداة (3 Core Implementations)

### 1. 🧩 إضافة المتصفح (Browser Extension)
- تعمل على متصفحات Google Chrome, Microsoft Edge, Brave, Mozilla Firefox (وفق معيار Manifest V3).
- تتيح للمستخدم استعراض رمزه السري وتفعيله بنقرة واحدة.
- فحص فوري وسريع لأي نص رسالة أو بريد إلكتروني مشبوه.
- فحص تلقائي لصفحات الويب وبوابات الدفع وحقن شارة التوثيق الخضراء `[🛡️ ShieldCode Verified]` عند مطابقة الرمز.
- مجلد الإضافة: `extension/` وحزمة التحميل الجاهزة: `public/shieldcode-extension.zip`.

### 2. 📱 أداة حسابات المستخدمين للهاتف والحاسوب (Embeddable User Tool)
- مكوّن واجهة مستخدم متجاوب وخفيف الوزن (`ShieldCodeUserTool`).
- يمكن إضافته في إعدادات الحساب في أي تطبيق مصرفي للهاتف (Mobile App) أو منصة ويب على الحاسوب (Desktop Web).
- يتيح للمستخدم إنشاء وتعديل رمزه الأمني (4-20 خانة تشمل أحرف وأرقام).
- تحديد قنوات الإشعار المحمية: الرسائل النصية SMS، البريد الإلكتروني Email، إشعارات التطبيق Push Notifications.
- صندوق فحص تجريبي مدمج للتحقق من أي رسالة واردة.

### 3. 🏢 منصة تعاقد المؤسسات (Institutional B2B Platform & APIs)
- منصة موجهة للمؤسسات المالية، البنوك، شركات التكنولوجيا المالية (Fintech)، منصات التجارة الإلكترونية، والبوابات الحكومية.
- تتعاقد المؤسسة مع ShieldCode للحصول على تراخيص الربط ومفاتيح الـ API (`sc_live_...`).
- واجهات REST API جاهزة وسريعة:
  - `POST /api/v1/shieldcode/inject`: لحقن رمز العميل السري في الرسالة قبل إرسالها.
  - `POST /api/v1/shieldcode/verify`: للتحقق من مصداقية الرسالة أو مطابقة الرمز.
  - `GET / POST /api/v1/shieldcode/user`: لإدارة وتحديث أكواد العملاء مركزياً.
- مكتبات ربط وتكامل بعدة لغات: Node.js, Python, Java (Spring Boot), PHP, cURL.

---

## ⚡ أداة سطر الأوامر (CLI Tool)

يمكن للمطورين والمهندسين في المؤسسات استخدام الأداة مباشرة من لوحة الأوامر عبر **npx**:

```bash
# عرض قائمة الأوامر والمساعدة
npx shieldcode --help

# تهيئة ملف إعدادات الأداة في مشروع المؤسسة
npx shieldcode init

# تعيين رمز أمان سري لحساب عميل
npx shieldcode set --user user_101 --code SAFE2026

# حقن الرمز في رسالة إشعار أو OTP قبل الإرسال
npx shieldcode protect --user user_101 --msg "رمز تأكيد العملية OTP هو: 440219"

# فحص رسالة واردة للتأكد هل هي أصلية أم محاولة تصيد احتيالي
npx shieldcode verify --user user_101 --msg "[رمزك الأمني: SAFE2026] رمز تأكيد العملية OTP هو: 440219"

# عرض قائمة الحسابات المحمية
npx shieldcode list
```

---

## 🏗️ بنية المشروع (Clean Project Architecture)

```
├── app/
│   ├── page.tsx                 # الواجهة الرئيسية للمنصة والمختبر التفاعلي
│   ├── extension/page.tsx       # صفحة إضافة المتصفح مع المحاكي ورابط التحميل
│   ├── user-tool/page.tsx       # صفحة استعراض أداة الحساب (وضع الهاتف والحاسوب)
│   ├── enterprise/page.tsx      # بوابة تعاقد المؤسسات واستدعاءات الـ API
│   ├── tool/page.tsx            # دليل المطورين وأوامر الـ CLI
│   └── api/v1/shieldcode/       # واجهات REST API المركزية (inject, verify, user, health)
├── bin/
│   └── shieldcode.js            # أداة سطر الأوامر المستقلة (CLI)
├── components/
│   └── shieldcode/
│       ├── ShieldCodeUserTool.tsx           # أداة المستخدم المتجاوبة للهاتف والحاسوب
│       ├── ShieldCodeWidget.tsx             # ويدجت إعداد الرمز المدمجة
│       └── AntiPhishingSecurityOption.tsx   # خيار أمان مدمج قابل للطي
├── extension/                   # ملفات إضافة المتصفح الرسمية (Manifest V3)
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.css
│   ├── popup.js
│   ├── content.js
│   ├── content.css
│   ├── background.js
│   └── icons/
├── lib/
│   ├── shieldcode-sdk/          # محرك الأمان الأساسي المستقل (Core Engine & SDK)
│   └── types.ts                 # تعريفات الأنواع والواجهات البرمجية
└── public/
    └── shieldcode-extension.zip # حزمة الإضافة المضغوطة القابلة للتحميل والتثبيت
```

---

## 🔒 النموذج الأمني (Security Model)

```
[ المستخدم ]  ──( يحدد رمزه السري مرة واحدة )──>  [ أداة ShieldCode ]
                                                           │
                                             (حفظ مشفر بروتوكولياً)
                                                           ▼
[ المؤسسة المتعاقدة ] ──( استدعاء injectNotification )──> [ حقن الرمز الأمني في الرسالة ]
                                                           │
                                             (إرسال الرسالة المحمية)
                                                           ▼
[ هاتف / بريد المستخدم ] <── "[رمزك: SECURE99] رمز الـ OTP هو 881204"

* النتيجة:
- إذا وصلت الرسالة وفيها الرمز [SECURE99] = رسالة أصلية موثقة من المؤسسة.
- إذا وصلت رسالة بدون الرمز = محاولة تصيد احتيالي (Phishing/Smishing) بنسبة 99%!
```

---

## 🚀 التشغيل والتطوير المحلي

```bash
# تثبيت الاعتماديات
npm install

# تشغيل خادم التطوير
npm run dev

# بناء المشروع للإنتاج
npm run build
```
