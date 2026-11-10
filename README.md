# SecurePay Gateway - TechStore 🛡️💳

> **Anti-Phishing Payment Verification & Identity Protection System**  
> نظام حماية المدفوعات والتحقق من الهوية ضد التصيد والاحتيال الإلكتروني

---

## 📌 نبذة عن المشروع (Overview)
**SecurePay Gateway** هو تطبيق ويب متطور للتجارة الإلكترونية وبوابات الدفع الآمنة، مصمم لحماية العمليات المصرفية الرقمية من الاحتيال والتصيد. يدمج النظام تقنية **التحقق بالصورة الذاتية المباشرة (Selfie Verification)** وكود **مكافحة التصيد السري (Anti-Phishing Code)** للتأكد من هوية صاحب الحساب قبل إتمام أي معاملة شراء.

---

## 🚀 المميزات الرئيسية (Key Features)
- **Selfie Verification (التحقق بالصورة المباشرة):** التقاط صورة فورية بكاميرا المستخدم لمطابقة هوية صاحب الحساب، مع دعم رفع صورة بديلة.
- **Anti-Phishing Code (كود مكافحة التصيد):** كود سري مخصص يظهر في رسائل التأكيد ليطمئن العميل أن الإشعار وارد من البنك المعتمد وليس من صفحة احتيال.
- **Owner Approval (موافقة صاحب الحساب):** تعليق المعاملات مؤقتاً لحين موافقة مالك الحساب عبر البريد الإلكتروني أو لوحة التحكم.
- **Admin Dashboard (لوحة تحكم الإدارة):** متابعة جميع المعاملات المعلقة والمقبولة والمرفوضة وسجلات التدقيق فورياً (`/admin`).

---

## 🛠️ التقنيات المستخدمة (Tech Stack)
- **Framework:** Next.js 16 (Turbopack) & React 19
- **Styling:** Tailwind CSS & Radix UI Components
- **Icons:** Lucide React
- **Backend & Database:** Next.js Route Handlers & Supabase SSR Integration
- **Camera API:** HTML5 WebRTC MediaDevices API

---

## 💻 طريقة التثبيت والتشغيل (How to Run)

### 1. استنساخ المشروع
```bash
git clone https://github.com/flavrgo-cell/ShieldCode-Security.git
cd ShieldCode-Security
```

### 2. تثبيت الحزم (باستخدام pnpm أو npm)
```bash
pnpm install
# أو
npm install
```

### 3. تشغيل سيرفر التطوير
```bash
pnpm dev
# أو
npm run dev
```

افتح المتصفح على:
👉 **`http://localhost:3000`**
