# 🛡️ ShieldCode Security SDK

> **أداة وحزمة الأمان المالي لمكافحة التصيد والاحتيال في البنوك والمنصات المالية**

حزمة برمجية ومكون جاهز (Plug & Play SDK & Widget) تتيح لأي بنك أو منصة دفع مالية (مثل بريدي موب، SATIM، البنوك الوطنية والخاصة) إضافة طبقة حماية **Anti-Phishing Code** للمستخدمين في دقائق معدودة.

---

## 🚀 التثبيت (Installation)

```bash
npm install @shieldcode/security
# أو عبر Yarn
yarn add @shieldcode/security
```

---

## 💻 الاستخدام السريع (Quick Start)

### 1. في واجهة المستخدم (React / Next.js)

```tsx
import { ShieldCodeWidget } from '@shieldcode/security/react';

export function UserSecuritySettings({ currentUser }) {
  return (
    <div className="settings-container">
      {/* سطر واحد فقط لإدراج الأداة كاملة في حساب المستخدم */}
      <ShieldCodeWidget 
        userId={currentUser.id}
        bankName="BaridiMob"
        theme="dark"
        onCodeUpdated={(newCode, isEnabled) => {
          console.log(`تم ربط رمز مكافحة التصيد: ${newCode}`);
        }}
      />
    </div>
  );
}
```

### 2. في خادم البنك (Node.js / Express / Backend)

```typescript
import { ShieldCodeCore } from '@shieldcode/security';

const shield = new ShieldCodeCore({
  institutionName: 'BaridiMob',
  apiKey: process.env.SHIELDCODE_API_KEY
});

// قبل إرسال أي رسالة SMS أو إيميل للمستخدم:
export async function sendBankSMS(userId: string, rawMessage: string) {
  const result = shield.injectNotification({
    userId,
    rawMessage,
    channel: 'sms'
  });

  // النتيجة المحمية: "[رمزك: AYOUB2026]\nكود التحقق لتأكيد العملية هو 889102"
  await smsGateway.send(userId, result.protectedMessage);
}
```

### 3. عبر الـ REST API المباشر (أي لغة: Python, Java, PHP, cURL)

```bash
curl -X POST https://api.shieldcode.dz/v1/shieldcode/inject \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "0555123456",
    "rawMessage": "كود التحقق لتأكيد دفع 5,000 دج هو 889102",
    "channel": "sms"
  }'
```

---

## 🌟 الميزات الأمنية (Features)

* **Zero-Knowledge Storage:** الرمز السري مشفر ومحمى بالكامل.
* **Double-Verification (2-Way):** يظهر في صفحات الدفع لتوثيق أصالة الموقع، ويظهر في رسائل الـ SMS لتوثيق أصالة المرسل.
* **Lightweight:** حجم المكتبة أقل من 15 كيلوبايت.
* **Standard-Compliant:** مطابق لمعايير بنك الجزائر و PCI-DSS.

---

## 📄 الترخيص
MIT License © 2026 ShieldCode Security Team
