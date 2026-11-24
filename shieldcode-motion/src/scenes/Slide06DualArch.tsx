import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONTS, PALETTE } from "../theme";
import {
  CorporateHeaderBlock,
  CorporateStage,
  SovereignIcon,
  useCardMotion,
} from "../components/CorporateStage";

export const Slide06DualArch: React.FC = () => {
  const frame = useCurrentFrame();

  const t1 = useCardMotion(12, 24);
  const t2 = useCardMotion(19, 24);
  const t3 = useCardMotion(25, 24);
  const t4 = useCardMotion(30, 24);

  const packetX = interpolate(frame % 90, [0, 90], [100, 0]);

  const TIERS = [
    {
      motion: t1,
      icon: "layers" as const,
      color: PALETTE.cyan,
      ar: "طبقة الواجهة الأمامية",
      en: "Frontend SaaS",
      stack: "Next.js 16 (Turbopack) • React 19.2 • TypeScript 5 • Tailwind v4",
      kpi: "27+ ACTIVE ROUTES • WEBRTC",
      desc: "إدارة الجلسات عبر الوسيط الحديث proxy.ts، تقديم 27+ مساراً، التقاط السيلفي بـ WebRTC، وودجت الشركاء القابل للتضمين.",
    },
    {
      motion: t2,
      icon: "cpu" as const,
      color: PALETTE.amber,
      ar: "نواة الخزنة السيادية",
      en: "Rust Vault Core",
      stack: "Rust 2021 (#![forbid(unsafe_code)]) • Axum 0.7 • Tokio • OpenAPI 3.1",
      kpi: "< 2ms LATENCY • MEMORY SAFE",
      desc: "خادم عالي الأداء وعديم الأعطال الذاكرية يعالج التشفير، وتحديد المعدل متعدد المستويات، وحجب الرؤوس الحساسة من السجلات.",
    },
    {
      motion: t3,
      icon: "lock" as const,
      color: PALETTE.teal,
      ar: "محرك التشفير والذاكرة",
      en: "Crypto Engine",
      stack: "AES-256-GCM (AEAD) • HKDF-SHA256 • Argon2id • Zeroize / Secrecy",
      kpi: "96-bit NONCE • 50B AAD • ZEROIZE",
      desc: "اشتقاق مفتاح DEK فريد لكل حساب مع AAD (50 بايت) و Nonce عشوائي 96-bit، ومسح فوري للأسرار من الذاكرة العشوائية (RAM).",
    },
    {
      motion: t4,
      icon: "database" as const,
      color: PALETTE.emerald,
      ar: "البيانات والامتثال",
      en: "Supabase + RLS",
      stack: "PostgreSQL 15+ • Row-Level Security (RLS) • SQLx Pool • Fallback",
      kpi: "16 BANKS ISOLATED • SHA-256 KEYS",
      desc: "عزل كامل للمستأجرين والمؤسسات المالية الـ 16، حفظ بصمات مفاتيح API بـ SHA-256، وتبديل تلقائي ذكي للوضع الاحتياطي.",
    },
  ];

  return (
    <CorporateStage
      slideIndex={6}
      accent={PALETTE.cyan}
      secondaryAccent={PALETTE.teal}
    >
      <Sequence from={14} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={36} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.34} />
      </Sequence>

      <CorporateHeaderBlock
        title="المعمارية التقنية المزدوجة: واجهة Next.js 16 + نواة Rust / Axum"
        subtitle="فصل معماري صارم بين طبقة تجربة المستخدم السريعة ونواة الخزنة المشفرة المصممة بمعايير البنوك"
        accentColor={PALETTE.cyan}
      />

      {/* Animated Encrypted Bus Line */}
      <div
        style={{
          position: "relative",
          height: 36,
          marginBottom: 16,
          background: "rgba(7, 16, 32, 0.85)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          overflow: "hidden",
        }}
      >
        <span
          dir="ltr"
          style={{
            fontFamily: FONTS.mono,
            fontSize: 14,
            fontWeight: 700,
            color: PALETTE.cyan,
          }}
        >
          TLS 1.3 + HttpOnly JWT
        </span>
        <span style={{ fontSize: 15, fontWeight: 800, color: PALETTE.soft }}>
          مسار نقل البيانات المشفرة وعزل الأسرار بين الطبقات الأربع
        </span>
        <span
          dir="ltr"
          style={{
            fontFamily: FONTS.mono,
            fontSize: 14,
            fontWeight: 700,
            color: PALETTE.emerald,
          }}
        >
          ZERO UNSAFE CODE • ZEROIZE RAM
        </span>

        {/* Flowing Data Pulse */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${packetX}%`,
            width: 180,
            background: `linear-gradient(90deg, transparent, ${PALETTE.teal}44, transparent)`,
          }}
        />
      </div>

      {/* 4 Architectural Columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 20,
          flex: 1,
        }}
      >
        {TIERS.map((tier) => (
          <div
            key={tier.en}
            style={{
              background: PALETTE.panel,
              border: `1.5px solid ${tier.color}66`,
              borderTop: "1.5px solid rgba(255,255,255,0.22)",
              borderRadius: 26,
              padding: "24px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 14,
              opacity: tier.motion.opacity,
              translate: tier.motion.translate,
              scale: tier.motion.scale,
              boxShadow: "0 20px 45px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <SovereignIcon kind={tier.icon} color={tier.color} size={54} />
                <span
                  dir="ltr"
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 14,
                    fontWeight: 700,
                    color: tier.color,
                    background: `${tier.color}1c`,
                    border: `1px solid ${tier.color}44`,
                    borderRadius: 999,
                    padding: "4px 12px",
                  }}
                >
                  {tier.en}
                </span>
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: PALETTE.white,
                }}
              >
                {tier.ar}
              </div>

              {/* Tech Stack Code Box */}
              <div
                dir="ltr"
                style={{
                  background: "rgba(4, 9, 20, 0.88)",
                  border: `1px solid ${tier.color}44`,
                  borderRadius: 14,
                  padding: "12px 14px",
                  fontFamily: FONTS.mono,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: tier.color,
                  lineHeight: 1.5,
                }}
              >
                {tier.stack}
              </div>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: 17.5,
                fontWeight: 600,
                color: PALETTE.soft,
                lineHeight: 1.58,
                unicodeBidi: "plaintext",
              }}
            >
              {tier.desc}
            </p>

            <div
              dir="ltr"
              style={{
                background: `${tier.color}16`,
                border: `1px solid ${tier.color}55`,
                borderRadius: 12,
                padding: "9px 12px",
                fontFamily: FONTS.mono,
                fontSize: 13,
                fontWeight: 700,
                color: tier.color,
                textAlign: "center",
              }}
            >
              ✓ {tier.kpi}
            </div>
          </div>
        ))}
      </div>
    </CorporateStage>
  );
};
