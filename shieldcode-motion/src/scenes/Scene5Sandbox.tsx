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
} from "../components/SceneShell";

const CAPTIONS: readonly CaptionSegment[] = [
  {
    startSec: 0.4,
    endSec: 8.5,
    text: "وباش نبرهنوا الفكرة بالدليل التطبيقي قدامكم، بنينا منصة بنكية تحاكي بريدي موب والبطاقة الذهبية",
  },
  {
    startSec: 8.5,
    endSec: 16.4,
    text: "فيها تحويل الأموال بين الحسابات، الفليكسي، وحتى الدفع الخارجي بـ 16 رقم تاع البطاقة الذهبية",
  },
  {
    startSec: 16.4,
    endSec: 25.6,
    text: "وراح تشوفوا بعينيكم الفرق كي تكون الحماية ملغية (OFF).. وكيفاش تحبس السرقة فوراً كي تكون مفعلة (ON)! ✅",
  },
];

export const Scene5Sandbox: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Toggle flips from OFF (0) to ON (1) at frame 495 (~16.5s)
  const toggleProgress = spring({
    frame: frame - 495,
    fps,
    config: { damping: 14, stiffness: 160 },
  });
  const isProtected = frame >= 495;

  const SCENARIOS = [
    {
      icon: "💸",
      title: "تحويل داخلي (CCP ⇄ CCP)",
      sub: "بين حسابات مربوطة في قاعدة البيانات",
      delay: 30,
    },
    {
      icon: "📱",
      title: "دفع للشركاء والفليكسي",
      sub: "موبيليس • جيزي • أوريدو • فواتير",
      delay: 95,
    },
    {
      icon: "💳",
      title: "دفع خارجي بالبطاقة الذهبية",
      sub: "مواقع المنحة والتسوق (16 رقم)",
      delay: 160,
    },
  ];

  const mainStagePop = spring({
    frame: frame - 220,
    fps,
    config: { damping: 15, stiffness: 155 },
  });

  const cardFloatY = Math.sin(frame / 28) * 6;

  return (
    <SceneShell
      sceneNumber="05"
      sceneTitle="المنصة البنكية التفاعلية (البرهان التطبيقي)"
      mood={isProtected ? "teal" : "gold"}
      captions={CAPTIONS}
    >
      <Sequence from={12} layout="none">
        <Audio src={staticFile("audio/vo_scene5.mp3")} volume={1} />
      </Sequence>
      <Sequence from={32} layout="none">
        <Audio src={staticFile("audio/sfx_pop.wav")} volume={0.32} />
      </Sequence>
      <Sequence from={97} layout="none">
        <Audio src={staticFile("audio/sfx_pop.wav")} volume={0.32} />
      </Sequence>
      <Sequence from={162} layout="none">
        <Audio src={staticFile("audio/sfx_pop.wav")} volume={0.32} />
      </Sequence>
      <Sequence from={495} layout="none">
        <Audio src={staticFile("audio/sfx_chime.wav")} volume={0.42} />
      </Sequence>

      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <AnimatedArabicWords
          text="بيئة بنكية جزائرية تفاعلية: تجربة حية (مفعلة ON ضد ملغية OFF)"
          delayFrames={4}
          staggerFrames={2}
          fontSize={48}
          fontWeight={900}
          highlightWords={["جزائرية", "تفاعلية:", "(مفعلة", "ON"]}
          highlightColor={isProtected ? COLORS.teal : COLORS.gold}
        />

        {/* Top 3 Real Scenarios Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 24,
            width: "100%",
          }}
        >
          {SCENARIOS.map((sc) => {
            const p = spring({
              frame: frame - sc.delay,
              fps,
              config: { damping: 14, stiffness: 165 },
            });
            return (
              <div
                key={sc.title}
                style={{
                  background: "rgba(12, 26, 50, 0.88)",
                  border: `1.5px solid ${COLORS.gold}66`,
                  borderRadius: 22,
                  padding: "16px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  opacity: p,
                  translate: `0px ${interpolate(p, [0, 1], [28, 0])}px`,
                  boxShadow: "0 14px 30px rgba(0,0,0,0.4)",
                }}
              >
                <span style={{ fontSize: 40 }}>{sc.icon}</span>
                <div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 900,
                      color: COLORS.white,
                    }}
                  >
                    {sc.title}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: COLORS.textMuted,
                    }}
                  >
                    {sc.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Interactive Showcase: EDAHABIA Card + Live ON/OFF Simulation */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.95fr 1.25fr",
            gap: 30,
            width: "100%",
            alignItems: "center",
            opacity: mainStagePop,
            scale: interpolate(mainStagePop, [0, 1], [0.92, 1]),
          }}
        >
          {/* RIGHT: Golden EDAHABIA Card + Security Switch */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
            }}
          >
            {/* Realistic Golden Card */}
            <div
              style={{
                width: "100%",
                background:
                  "linear-gradient(135deg, #d97706 0%, #f59e0b 48%, #78350f 100%)",
                borderRadius: 26,
                padding: "24px 30px",
                border: "2px solid rgba(254, 243, 199, 0.65)",
                boxShadow: "0 22px 50px rgba(0,0,0,0.55)",
                translate: `0px ${cardFloatY}px`,
                display: "flex",
                flexDirection: "column",
                gap: 16,
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
                    fontSize: 26,
                    fontWeight: 900,
                    color: "#fffbeb",
                  }}
                >
                  البطاقة الذهبية • EDAHABIA
                </span>
                <div
                  style={{
                    width: 48,
                    height: 36,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #fef3c7, #fbbf24)",
                    border: "1px solid #92400e",
                  }}
                />
              </div>

              <div
                dir="ltr"
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 30,
                  fontWeight: 700,
                  color: "#ffffff",
                  textShadow: "0 2px 8px rgba(0,0,0,0.45)",
                  textAlign: "center",
                }}
              >
                6280  0091  4482  2026
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#fef3c7",
                }}
              >
                <span>مربوطة بحساب CCP البنكي</span>
                <span style={{ fontFamily: FONTS.mono }}>11/28</span>
              </div>
            </div>

            {/* Giant Live Security Switch */}
            <div
              style={{
                width: "100%",
                background: "rgba(9, 21, 40, 0.92)",
                border: `2px solid ${
                  isProtected ? COLORS.teal : COLORS.crimson
                }`,
                borderRadius: 22,
                padding: "14px 26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 23, fontWeight: 800 }}>
                حالة أداة ShieldCode:
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <span
                  style={{
                    fontSize: 23,
                    fontWeight: 900,
                    color: isProtected ? COLORS.teal : COLORS.crimson,
                  }}
                >
                  {isProtected ? "مفعّلة (ON)" : "ملغية (OFF)"}
                </span>
                {/* Toggle Track */}
                <div
                  style={{
                    width: 82,
                    height: 42,
                    borderRadius: 999,
                    background: isProtected ? COLORS.teal : "#450a0a",
                    border: `2px solid ${
                      isProtected ? "#99f6e4" : COLORS.crimson
                    }`,
                    position: "relative",
                    padding: 4,
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      translate: `${interpolate(
                        toggleProgress,
                        [0, 1],
                        [0, -38]
                      )}px 0px`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* LEFT: Dynamic Outcome Screen (OFF vs ON) */}
          <div
            style={{
              background: isProtected
                ? "linear-gradient(145deg, rgba(6, 78, 59, 0.86), rgba(9, 24, 38, 0.95))"
                : "linear-gradient(145deg, rgba(127, 29, 29, 0.82), rgba(24, 12, 20, 0.95))",
              border: `3px solid ${
                isProtected ? COLORS.emerald : COLORS.crimson
              }`,
              borderRadius: 28,
              padding: "28px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              boxShadow: isProtected
                ? `0 22px 55px rgba(16, 185, 129, 0.35)`
                : `0 22px 55px rgba(239, 68, 68, 0.35)`,
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
                  fontSize: 26,
                  fontWeight: 900,
                  color: isProtected ? "#6ee7b7" : "#fecaca",
                }}
              >
                {isProtected
                  ? "🛡️ سيناريو 2: عند تفعيل درع ShieldCode"
                  : "⚠️ سيناريو 1: بدون حماية ShieldCode"}
              </span>
              <span style={{ fontSize: 38 }}>
                {isProtected ? "✅" : "❌"}
              </span>
            </div>

            <div
              style={{
                background: "rgba(0,0,0,0.45)",
                borderRadius: 18,
                padding: "18px 22px",
                fontSize: 24,
                fontWeight: 700,
                lineHeight: 1.55,
                color: COLORS.white,
              }}
            >
              {isProtected ? (
                <>
                  <div>
                    الرسالة الواردة تحمل ختمك السري:{" "}
                    <span
                      style={{
                        background: `${COLORS.teal}33`,
                        border: `1px solid ${COLORS.teal}`,
                        color: COLORS.teal,
                        padding: "2px 12px",
                        borderRadius: 8,
                      }}
                    >
                      🦅 الصقر_2026
                    </span>
                  </div>
                  <div style={{ marginTop: 8, color: "#a7f3d0" }}>
                    + تفاصيل المتجر الحقيقي والمبلغ قبل خروج أي دينار!
                  </div>
                </>
              ) : (
                <>
                  <div>
                    المواطن يدخل أرقام البطاقة الذهبية في موقع خارجي مقلّد...
                  </div>
                  <div style={{ marginTop: 8, color: "#fca5a5" }}>
                    توصلو رسالة عادية بلا رمز سري ⬅️ يعطي الكود للمحتال وتنسرق الدراهم!
                  </div>
                </>
              )}
            </div>

            <div
              style={{
                background: isProtected ? COLORS.emerald : COLORS.crimson,
                color: isProtected ? "#022c22" : COLORS.white,
                borderRadius: 16,
                padding: "12px 20px",
                fontSize: 24,
                fontWeight: 900,
                textAlign: "center",
              }}
            >
              {isProtected
                ? "🎯 النتيجة أمام اللجنة: إحباط التصيد وحماية أموال الحساب 100%"
                : "🚨 النتيجة: وقوع الضحية في الفخ وسرقة رصيد البطاقة"}
            </div>
          </div>
        </div>
      </div>
    </SceneShell>
  );
};
