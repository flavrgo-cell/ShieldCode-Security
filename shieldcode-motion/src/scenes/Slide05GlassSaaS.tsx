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

export const Slide05GlassSaaS: React.FC = () => {
  const frame = useCurrentFrame();

  const appMock = useCardMotion(12, 24);
  const kpi1 = useCardMotion(46, 18);
  const kpi2 = useCardMotion(52, 18);
  const kpi3 = useCardMotion(57, 18);

  const activeNav = Math.floor(frame / 38) % 6;

  const NAV_ITEMS = [
    "رمز الأمان الشامل",
    "درع البطاقة الذهبية",
    "دليل 16 بنكاً جزائرياً",
    "المتجر والدفع البيومتري",
    "محاكي الهاتف الفوري",
    "بوابة المطورين API",
  ];

  const METRICS = [
    {
      motion: kpi1,
      icon: "check" as const,
      color: PALETTE.emerald,
      big: "19 / 20",
      title: "تقييم فحص Impeccable UX",
      desc: "تباين يتجاوز 15:1 في الوضع الداكن (WCAG AA)، وأهداف لمس ≥44px، وأرقام مالية tabular-nums.",
    },
    {
      motion: kpi2,
      icon: "bolt" as const,
      color: PALETTE.cyan,
      big: "60–120 fps",
      title: "أداء مسرّع بالـ GPU",
      desc: "حركات transform/opacity خالصة بلا Layout Reflow، وتحميل كسول عبر next/dynamic.",
    },
    {
      motion: kpi3,
      icon: "layers" as const,
      color: PALETTE.teal,
      big: "RTL / LTR",
      title: "ثنائية لغة أصيلة",
      desc: 'عزل ذكي للأرقام المالية (+213 و RIP/RIB) بـ dir="ltr" داخل واجهة عربية RTL كاملة بخط Cairo.',
    },
  ];

  return (
    <CorporateStage
      slideIndex={5}
      accent={PALETTE.cyan}
      secondaryAccent={PALETTE.teal}
    >
      <Sequence from={14} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={48} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.34} />
      </Sequence>

      <CorporateHeaderBlock
        title="تجربة SaaS الزجاجية: نظام التصميم السيادي (Telemetry Vault)"
        subtitle="معمارية مكانية من منطقتين (Two-Zone Command Architecture) مصممة بلغة بصرية مصرفية داكنة ودعم RTL أصيل"
        accentColor={PALETTE.cyan}
      />

      {/* Simulated Two-Zone Glassmorphic SaaS Command Window */}
      <div
        style={{
          background: "rgba(9, 20, 39, 0.92)",
          border: `1.5px solid ${PALETTE.cyan}55`,
          borderTop: "1.5px solid rgba(255,255,255,0.24)",
          borderRadius: 26,
          padding: "18px 22px",
          marginBottom: 20,
          opacity: appMock.opacity,
          translate: appMock.translate,
          scale: appMock.scale,
          boxShadow: "0 24px 55px rgba(0,0,0,0.55)",
        }}
      >
        {/* Window Top Status Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.09)",
            paddingBottom: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 20,
                fontWeight: 700,
                color: PALETTE.teal,
              }}
            >
              ShieldCode
            </span>
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: PALETTE.muted,
              }}
            >
              التشفير نشط AES-256 • العرض الشامل / تركيز القسم
            </span>
          </div>

          <span
            style={{
              background: "rgba(52, 211, 153, 0.16)",
              border: `1px solid ${PALETTE.emerald}`,
              color: "#6ee7b7",
              borderRadius: 999,
              padding: "4px 16px",
              fontSize: 15,
              fontWeight: 800,
            }}
          >
            جلسة موثقة +213 ✓
          </span>
        </div>

        {/* Two-Zone Layout: Sidebar + Telemetry Workspace */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "270px 1fr 1fr",
            gap: 20,
            alignItems: "stretch",
          }}
        >
          {/* Zone 1: Command Sidebar */}
          <div
            style={{
              background: "rgba(4, 10, 22, 0.72)",
              borderRadius: 18,
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {NAV_ITEMS.map((item, idx) => {
              const active = idx === activeNav;
              return (
                <div
                  key={item}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 11,
                    fontSize: 15.5,
                    fontWeight: active ? 800 : 600,
                    background: active
                      ? "rgba(0, 212, 182, 0.18)"
                      : "transparent",
                    border: active
                      ? `1px solid ${PALETTE.teal}88`
                      : "1px solid transparent",
                    color: active ? PALETTE.white : PALETTE.muted,
                  }}
                >
                  {item}
                </div>
              );
            })}
          </div>

          {/* Zone 2A: Edahabia Zero-Exposure Card */}
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(245, 166, 35, 0.22), rgba(15, 29, 54, 0.94))",
              border: `1.5px solid ${PALETTE.amber}88`,
              borderRadius: 20,
              padding: "18px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: PALETTE.amberSoft,
                }}
              >
                درع البطاقة الذهبية
              </span>
              <span
                dir="ltr"
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 13,
                  color: PALETTE.amber,
                  background: "rgba(245,166,35,0.16)",
                  padding: "3px 10px",
                  borderRadius: 999,
                }}
              >
                BIN 6280
              </span>
            </div>

            <div
              dir="ltr"
              style={{
                fontFamily: FONTS.mono,
                fontSize: 28,
                fontWeight: 700,
                color: PALETTE.white,
                textAlign: "center",
                padding: "14px 0",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              6280 •••• •••• 4821
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 15,
                fontWeight: 700,
                color: PALETTE.soft,
              }}
            >
              <span>فهرسة عمياء HMAC-SHA256</span>
              <span style={{ color: "#6ee7b7" }}>بدون تخزين PAN/CVV2</span>
            </div>
          </div>

          {/* Zone 2B: Live Biometric & Modulo 97 Telemetry */}
          <div
            style={{
              background: "rgba(13, 30, 56, 0.88)",
              border: `1.5px solid ${PALETTE.teal}55`,
              borderRadius: 20,
              padding: "18px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: PALETTE.teal,
              }}
            >
              الدفع البيومتري الحي & محاكي الهاتف
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontSize: 16,
                fontWeight: 700,
                color: PALETTE.white,
              }}
            >
              <div>1. اختيار الوسيلة (الذهبية / CIB)</div>
              <div>2. سيلفي حي مباشر عبر WebRTC</div>
              <div>3. تأكيد رمز الأمان السري + فحص RIP Modulo 97</div>
            </div>
            <div
              style={{
                fontSize: 14.5,
                fontWeight: 600,
                color: PALETTE.muted,
              }}
            >
              تبديل سلس بين الوضعين الليلي والنهاري عبر View Transitions API
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 3 Engineering Excellence Benchmarks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}
      >
        {METRICS.map((m) => (
          <div
            key={m.big}
            style={{
              background: PALETTE.panel,
              border: `1.5px solid ${m.color}55`,
              borderRadius: 20,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              opacity: m.motion.opacity,
              translate: m.motion.translate,
              scale: m.motion.scale,
            }}
          >
            <SovereignIcon kind={m.icon} color={m.color} size={50} />
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span
                  dir="ltr"
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 24,
                    fontWeight: 700,
                    color: m.color,
                  }}
                >
                  {m.big}
                </span>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: PALETTE.white,
                  }}
                >
                  {m.title}
                </span>
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: PALETTE.soft,
                  lineHeight: 1.45,
                  marginTop: 4,
                  unicodeBidi: "plaintext",
                }}
              >
                {m.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CorporateStage>
  );
};
