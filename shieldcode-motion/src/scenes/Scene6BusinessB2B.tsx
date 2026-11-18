import React from "react";
import { Audio } from "@remotion/media";
import {
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "../theme";
import {
  AnimatedArabicWords,
  CaptionSegment,
  SceneShell,
  ShieldLogoSVG,
} from "../components/SceneShell";

const CAPTIONS: readonly CaptionSegment[] = [
  {
    startSec: 0.4,
    endSec: 7.8,
    text: "وكمؤسسة ناشئة جاهزة للسوق، حنا ما نبيعوش البنك التجريبي، بل نبيعوا خدمة أمنية احترافية (B2B SaaS)",
  },
  {
    startSec: 7.8,
    endSec: 15.2,
    text: "نقدموا للبنوك والشركات الجزائرية API و SDK جاهزة تتركب في أنظمتهم في 5 دقائق وبلا أي تكلفة عتاد!",
  },
  {
    startSec: 15.2,
    endSec: 22.4,
    text: "ومربوطة مباشرة وبذكاء مع متعاملي الهاتف في الجزائر: موبيليس، جيزي، وأوريدو 📡",
  },
];

export const Scene6BusinessB2B: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const banksIn = spring({
    frame: frame - 24,
    fps,
    config: { damping: 15, stiffness: 155 },
  });
  const hubIn = spring({
    frame: frame - 160,
    fps,
    config: { damping: 14, stiffness: 160 },
  });
  const telecomIn = spring({
    frame: frame - 340,
    fps,
    config: { damping: 15, stiffness: 155 },
  });

  const BANKS = [
    "🏦 بريد الجزائر (BaridiMob)",
    "🏛️ البنك الوطني الجزائري (BNA)",
    "💳 القرض الشعبي الجزائري (CPA)",
    "🛒 منصات الدفع والتجارة الإلكترونية",
  ];

  const TELECOMS = [
    { name: "موبيليس Mobilis", prefix: "06", color: "#22c55e" },
    { name: "جيزي Djezzy", prefix: "07", color: "#ef4444" },
    { name: "أوريدو Ooredoo", prefix: "05", color: "#f59e0b" },
  ];

  const KPIS = [
    { label: "⚡ دمج برمجي في 5 دقائق", delay: 430 },
    { label: "💰 صفر تكلفة أجهزة (0 دج)", delay: 450 },
    { label: "📈 نموذج ربحي B2B SaaS", delay: 470 },
  ];

  return (
    <SceneShell
      sceneNumber="06"
      sceneTitle="نموذج المؤسسة الناشئة والتكامل مع السوق"
      mood="gold"
      captions={CAPTIONS}
    >
      <Sequence from={12} layout="none">
        <Audio src={staticFile("audio/vo_scene6.mp3")} volume={1} />
      </Sequence>
      <Sequence from={28} layout="none">
        <Audio src={staticFile("audio/sfx_pop.wav")} volume={0.32} />
      </Sequence>
      <Sequence from={165} layout="none">
        <Audio src={staticFile("audio/sfx_chime.wav")} volume={0.35} />
      </Sequence>
      <Sequence from={345} layout="none">
        <Audio src={staticFile("audio/sfx_pop.wav")} volume={0.32} />
      </Sequence>

      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
        }}
      >
        <AnimatedArabicWords
          text="كيفاش تستفاد البنوك والشركات في السوق الجزائري؟"
          delayFrames={4}
          staggerFrames={2}
          fontSize={50}
          fontWeight={900}
          highlightWords={["البنوك", "والشركات", "السوق", "الجزائري؟"]}
          highlightColor={COLORS.gold}
        />

        {/* 3-Column Ecosystem Hub */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.15fr 1fr",
            gap: 28,
            width: "100%",
            alignItems: "stretch",
          }}
        >
          {/* RIGHT: Algerian Banks & Enterprises */}
          <div
            style={{
              background: COLORS.panelDark,
              border: `2px solid ${COLORS.gold}66`,
              borderRadius: 26,
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 12,
              opacity: banksIn,
              translate: `${interpolate(banksIn, [0, 1], [50, 0])}px 0px`,
            }}
          >
            <div
              style={{
                fontSize: 23,
                fontWeight: 900,
                color: COLORS.goldLight,
                textAlign: "center",
                marginBottom: 4,
              }}
            >
              عملاؤنا (البنوك والمؤسسات)
            </div>
            {BANKS.map((b) => (
              <div
                key={b}
                style={{
                  background: "rgba(5, 11, 22, 0.78)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 14,
                  padding: "12px 16px",
                  fontSize: 21,
                  fontWeight: 700,
                  color: COLORS.white,
                }}
              >
                {b}
              </div>
            ))}
          </div>

          {/* CENTER: ShieldCode B2B Cloud API & SDK */}
          <div
            style={{
              background:
                "linear-gradient(150deg, rgba(0, 212, 182, 0.22), rgba(9, 21, 40, 0.96))",
              border: `2.5px solid ${COLORS.teal}`,
              borderRadius: 28,
              padding: "24px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 14,
              opacity: hubIn,
              scale: interpolate(hubIn, [0, 1], [0.85, 1]),
              boxShadow: `0 20px 55px rgba(0,0,0,0.55), 0 0 40px ${COLORS.teal}33`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <ShieldLogoSVG size={44} color={COLORS.teal} />
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 28,
                  fontWeight: 700,
                  color: COLORS.white,
                }}
              >
                ShieldCode <span style={{ color: COLORS.teal }}>API / SDK</span>
              </span>
            </div>

            <div
              style={{
                fontSize: 21,
                fontWeight: 700,
                color: COLORS.textSoft,
                textAlign: "center",
              }}
            >
              يركّبها أي بنك داخل نظامو بـ 3 أسطر برمجية برك!
            </div>

            {/* Code Snippet Box */}
            <div
              dir="ltr"
              style={{
                width: "100%",
                background: "#040914",
                border: `1px solid ${COLORS.teal}55`,
                borderRadius: 16,
                padding: "14px 18px",
                fontFamily: FONTS.mono,
                fontSize: 17,
                lineHeight: 1.6,
                color: "#e2e8f0",
              }}
            >
              <div style={{ color: "#94a3b8" }}>
                {"// 5-Minute Bank Integration"}
              </div>
              <div>
                <span style={{ color: "#38bdf8" }}>await</span> shieldcode.
                <span style={{ color: COLORS.teal }}>sendSecureOTP</span>({"{"}
              </div>
              <div style={{ paddingLeft: 18 }}>
                bank: <span style={{ color: COLORS.goldLight }}>"POSTE_DZ"</span>,
              </div>
              <div style={{ paddingLeft: 18 }}>
                userPhone: <span style={{ color: "#86efac" }}>"+213661..."</span>
              </div>
              <div>{"});"}</div>
            </div>

            <div
              style={{
                background: `${COLORS.teal}25`,
                border: `1px solid ${COLORS.teal}`,
                borderRadius: 999,
                padding: "6px 22px",
                fontSize: 19,
                fontWeight: 800,
                color: COLORS.teal,
              }}
            >
              🔑 مفتاح API مخصّص لكل مؤسسة مالية
            </div>
          </div>

          {/* LEFT: Algerian Telecom Routing */}
          <div
            style={{
              background: COLORS.panelDark,
              border: `2px solid ${COLORS.cyan}66`,
              borderRadius: 26,
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 14,
              opacity: telecomIn,
              translate: `${interpolate(telecomIn, [0, 1], [-50, 0])}px 0px`,
            }}
          >
            <div
              style={{
                fontSize: 23,
                fontWeight: 900,
                color: COLORS.cyan,
                textAlign: "center",
              }}
            >
              توجيه ذكي عبر متعاملي الجزائر
            </div>

            {TELECOMS.map((t) => (
              <div
                key={t.name}
                style={{
                  background: "rgba(5, 11, 22, 0.82)",
                  border: `1.5px solid ${t.color}66`,
                  borderRadius: 16,
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: COLORS.white,
                  }}
                >
                  📡 {t.name}
                </span>
                <span
                  dir="ltr"
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 20,
                    fontWeight: 700,
                    background: `${t.color}28`,
                    color: t.color,
                    padding: "4px 12px",
                    borderRadius: 8,
                  }}
                >
                  {t.prefix}XX
                </span>
              </div>
            ))}

            <div
              style={{
                textAlign: "center",
                fontSize: 19,
                fontWeight: 800,
                color: "#6ee7b7",
              }}
            >
              ✅ وصول فوري مختوم لهاتف المواطن
            </div>
          </div>
        </div>

        {/* Bottom 3 Startup KPI Pills */}
        <div style={{ display: "flex", gap: 24 }}>
          {KPIS.map((kpi) => {
            const p = spring({
              frame: frame - kpi.delay,
              fps,
              config: { damping: 14, stiffness: 170 },
            });
            return (
              <div
                key={kpi.label}
                style={{
                  background: "rgba(245, 158, 11, 0.16)",
                  border: `1.5px solid ${COLORS.gold}`,
                  borderRadius: 999,
                  padding: "10px 28px",
                  fontSize: 23,
                  fontWeight: 800,
                  color: COLORS.goldLight,
                  opacity: p,
                  scale: interpolate(p, [0, 1], [0.85, 1]),
                }}
              >
                {kpi.label}
              </div>
            );
          })}
        </div>
      </div>
    </SceneShell>
  );
};
