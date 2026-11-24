import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONTS, PALETTE } from "../theme";
import {
  CorporateHeaderBlock,
  CorporateStage,
  SovereignIcon,
  useCardMotion,
} from "../components/CorporateStage";

export const Slide07SovereignLaw: React.FC = () => {
  const frame = useCurrentFrame();

  const g1 = useCardMotion(12, 20);
  const g2 = useCardMotion(18, 20);
  const g3 = useCardMotion(23, 20);
  const g4 = useCardMotion(27, 20);
  const telecomCard = useCardMotion(34, 24);

  // Live Zeroize RAM visualization after frame 85
  const isZeroized = frame > 85;

  const CONTROLS = [
    {
      motion: g1,
      icon: "globe" as const,
      color: PALETTE.teal,
      title: "السيادة الجغرافية (قانون 18-07)",
      desc: "حارس جغرافي محلي AlgerianGeoIpEnforcer يعتمد قاعدة MaxMind .mmdb داخلية لحصر الوصول في النطاق الجزائري (DZ) دون تسريب أي IP لطرف ثالث.",
      chip: "GEO-IP: DZ ONLY (.mmdb LOCAL)",
    },
    {
      motion: g2,
      icon: "lock" as const,
      color: PALETTE.cyan,
      title: "تطهير الذاكرة والتشفير المعزول",
      desc: "مفتاح DEK مشتق لكل مستخدم عبر HKDF-SHA256، وتغليف الأسرار بـ ZeroizeOnDrop لمسحها بالبايت الصفري من RAM فور انتهاء الطلب.",
      chip: isZeroized
        ? "RAM ZEROIZED: 00 00 00 00 ✓"
        : "DEK IN RAM: 8F 4A C9 1E ...",
    },
    {
      motion: g3,
      icon: "shield" as const,
      color: PALETTE.amber,
      title: "حماية ضد إغراق SMS (Rate Limiting)",
      desc: "محدّد معدل صارم في Axum: حد أقصى 2 طلب OTP كل 60 ثانية، و5 محاولات تحقق، و20 فحص رابط لمنع استنزاف الرصيد وهجمات التخمين.",
      chip: "MAX 2 OTP / 60s • ANTI-PUMPING",
    },
    {
      motion: g4,
      icon: "database" as const,
      color: PALETTE.emerald,
      title: "عزل Supabase RLS ورؤوس الأمان",
      desc: "سياسات Row-Level Security لعزل كل مؤسسة مالية، مع تفعيل HSTS و X-Frame-Options و Permissions-Policy: camera=(self).",
      chip: "RLS TENANT ISOLATION • HSTS",
    },
  ];

  return (
    <CorporateStage
      slideIndex={7}
      accent={PALETTE.teal}
      secondaryAccent={PALETTE.amber}
    >
      <Sequence from={14} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={85} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.34} />
      </Sequence>

      <CorporateHeaderBlock
        title="الأمان السيادي، مصادقة شبكات +213، والامتثال للقانون 18-07"
        subtitle="ضوابط هندسية صارمة تحمي بيانات المواطن الجزائري وتمنع هجمات استنزاف رسائل الـ OTP والتصيد"
        accentColor={PALETTE.teal}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.35fr 0.95fr",
          gap: 24,
          flex: 1,
        }}
      >
        {/* RIGHT: 2x2 Sovereign Security Controls */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
          }}
        >
          {CONTROLS.map((ctrl) => (
            <div
              key={ctrl.title}
              style={{
                background: PALETTE.panel,
                border: `1.5px solid ${ctrl.color}55`,
                borderTop: "1.5px solid rgba(255,255,255,0.2)",
                borderRadius: 22,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 10,
                opacity: ctrl.motion.opacity,
                translate: ctrl.motion.translate,
                scale: ctrl.motion.scale,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <SovereignIcon kind={ctrl.icon} color={ctrl.color} size={46} />
                <div
                  style={{
                    fontSize: 21,
                    fontWeight: 900,
                    color: PALETTE.white,
                    unicodeBidi: "plaintext",
                  }}
                >
                  {ctrl.title}
                </div>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: 16.5,
                  fontWeight: 600,
                  color: PALETTE.soft,
                  lineHeight: 1.52,
                  unicodeBidi: "plaintext",
                }}
              >
                {ctrl.desc}
              </p>

              <div
                dir="ltr"
                style={{
                  background: "rgba(4, 9, 20, 0.86)",
                  border: `1px solid ${ctrl.color}44`,
                  borderRadius: 10,
                  padding: "7px 12px",
                  fontFamily: FONTS.mono,
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: ctrl.color,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {ctrl.chip}
              </div>
            </div>
          ))}
        </div>

        {/* LEFT: Algerian +213 Dual Telecom Gateway */}
        <div
          style={{
            background:
              "linear-gradient(155deg, rgba(13, 33, 62, 0.94), rgba(6, 15, 30, 0.98))",
            border: `2px solid ${PALETTE.teal}77`,
            borderTop: "2px solid rgba(255,255,255,0.24)",
            borderRadius: 26,
            padding: "24px 26px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            opacity: telecomCard.opacity,
            translate: telecomCard.translate,
            scale: telecomCard.scale,
            boxShadow: "0 24px 55px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <SovereignIcon kind="phone" color={PALETTE.teal} size={52} />
            <div>
              <div
                style={{
                  fontSize: 23,
                  fontWeight: 900,
                  color: PALETTE.white,
                }}
              >
                بوابة التوثيق المزدوج للاتصالات الجزائرية
              </div>
              <div
                dir="ltr"
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 17,
                  fontWeight: 700,
                  color: PALETTE.teal,
                }}
              >
                +213 [5 / 6 / 7] XX XX XX XX
              </div>
            </div>
          </div>

          {/* 3 Carrier Badges */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
            }}
          >
            {[
              { name: "Mobilis (06)", c: "#22c55e" },
              { name: "Djezzy (07)", c: "#ef4444" },
              { name: "Ooredoo (05)", c: "#f5a623" },
            ].map((op) => (
              <div
                key={op.name}
                dir="ltr"
                style={{
                  background: `${op.c}1c`,
                  border: `1.5px solid ${op.c}88`,
                  borderRadius: 12,
                  padding: "10px 8px",
                  textAlign: "center",
                  fontFamily: FONTS.mono,
                  fontSize: 15,
                  fontWeight: 700,
                  color: PALETTE.white,
                }}
              >
                {op.name}
              </div>
            ))}
          </div>

          {/* 4 Cryptographic Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {[
              "1. توليد رمزي OTP (6 أرقام) للبريد الإلكتروني والهاتف الجزائري.",
              "2. مطابقة الرمزين بالزمن الثابت (ConstantTimeEq) لمنع هجمات التوقيت.",
              "3. إصدار جلسة مشفرة HttpOnly Cookie + Bearer JWT بعد نجاح الطرفين.",
              "4. تسجيل كل محاولة في سجل تدقيق غير قابل للتعديل (vault_audit_logs).",
            ].map((line) => (
              <div
                key={line}
                style={{
                  background: "rgba(4, 9, 20, 0.65)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontSize: 16.5,
                  fontWeight: 700,
                  color: PALETTE.soft,
                  unicodeBidi: "plaintext",
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </CorporateStage>
  );
};
