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
    endSec: 8.2,
    text: "كي نشوفوا المنصات المالية العالمية الكبيرة كيما Binance و Bybit.. نلقاوهم حاميين مستخدميهم برمز مكافحة التصيد الشخصي",
  },
  {
    startSec: 8.2,
    endSec: 15.8,
    text: "بينما أنظمتنا البنكية المحلية مازال تفتقر لهاذ الحماية المهمة في الرسائل والمعاملات",
  },
  {
    startSec: 15.8,
    endSec: 22.8,
    text: "والمواطن ما عندوش حتى طريقة يفرق بيها بين رسالة البنك الحقيقية والرسالة المزورة!",
  },
];

export const Scene3Benchmark: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rightCard = spring({
    frame: frame - 24,
    fps,
    config: { damping: 15, stiffness: 155 },
  });

  const leftCard = spring({
    frame: frame - 235,
    fps,
    config: { damping: 15, stiffness: 155 },
  });

  const bridgeBanner = spring({
    frame: frame - 460,
    fps,
    config: { damping: 14, stiffness: 165 },
  });

  return (
    <SceneShell
      sceneNumber="03"
      sceneTitle="المقارنة العالمية والفجوة الأمنية"
      mood="gold"
      captions={CAPTIONS}
    >
      <Sequence from={12} layout="none">
        <Audio src={staticFile("audio/vo_scene3.mp3")} volume={1} />
      </Sequence>
      <Sequence from={26} layout="none">
        <Audio src={staticFile("audio/sfx_chime.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={238} layout="none">
        <Audio src={staticFile("audio/sfx_alert.wav")} volume={0.32} />
      </Sequence>
      <Sequence from={462} layout="none">
        <Audio src={staticFile("audio/sfx_pop.wav")} volume={0.35} />
      </Sequence>

      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        }}
      >
        <AnimatedArabicWords
          text="علاش المنصات العالمية محمية.. والأنظمة المحلية مستهدفة؟"
          delayFrames={4}
          staggerFrames={2}
          fontSize={52}
          fontWeight={900}
          highlightWords={["المنصات", "العالمية", "محمية.."]}
          highlightColor={COLORS.gold}
        />

        {/* Two Big Comparison Panels */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 36,
            width: "100%",
          }}
        >
          {/* RIGHT PANEL: Global Platforms (Binance / Bybit) */}
          <div
            style={{
              background:
                "linear-gradient(145deg, rgba(6, 78, 59, 0.55), rgba(9, 21, 40, 0.92))",
              border: `2.5px solid ${COLORS.teal}`,
              borderRadius: 30,
              padding: "30px 34px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              opacity: rightCard,
              translate: `${interpolate(rightCard, [0, 1], [60, 0])}px 0px`,
              boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 35px ${COLORS.teal}25`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 42 }}>🛡️</span>
                <div>
                  <div
                    style={{
                      fontSize: 30,
                      fontWeight: 900,
                      color: COLORS.white,
                    }}
                  >
                    المنصات العالمية المتطورة
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 19,
                      fontWeight: 700,
                      color: COLORS.gold,
                    }}
                  >
                    Binance • Bybit • Global FinTech
                  </div>
                </div>
              </div>
              <span
                style={{
                  background: `${COLORS.emerald}28`,
                  border: `1px solid ${COLORS.emerald}`,
                  color: "#6ee7b7",
                  padding: "6px 18px",
                  borderRadius: 999,
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                محمية 100%
              </span>
            </div>

            {/* Sample Authenticated Message */}
            <div
              style={{
                background: "rgba(5, 11, 22, 0.85)",
                border: `1.5px solid ${COLORS.teal}77`,
                borderRadius: 18,
                padding: "16px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 700 }}>
                كود السحب: <b style={{ fontFamily: FONTS.mono }}>910442</b>
              </span>
              <span
                style={{
                  background: `${COLORS.teal}25`,
                  border: `1.5px solid ${COLORS.teal}`,
                  color: COLORS.teal,
                  borderRadius: 12,
                  padding: "6px 16px",
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                🔒 رمزك السري: DZ_KING
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "✅ ميزة Anti-Phishing Code مدمجة في كل حساب",
                "✅ المنصة تثبت هويتها للمستخدم قبل أي عملية",
                "✅ مستحيل المحتال يخمن الكلمة السرية للعميل",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#d1fae5",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* LEFT PANEL: Current Local Banking Gap */}
          <div
            style={{
              background:
                "linear-gradient(145deg, rgba(127, 29, 29, 0.50), rgba(15, 18, 32, 0.92))",
              border: `2.5px solid ${COLORS.crimson}`,
              borderRadius: 30,
              padding: "30px 34px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              opacity: leftCard,
              translate: `${interpolate(leftCard, [0, 1], [-60, 0])}px 0px`,
              boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 35px ${COLORS.crimson}25`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 42 }}>🔓</span>
                <div>
                  <div
                    style={{
                      fontSize: 30,
                      fontWeight: 900,
                      color: COLORS.white,
                    }}
                  >
                    الأنظمة البنكية المحلية حالياً
                  </div>
                  <div
                    style={{
                      fontSize: 19,
                      fontWeight: 700,
                      color: "#fca5a5",
                    }}
                  >
                    رسائل SMS عادية بدون بصمة شخصية
                  </div>
                </div>
              </div>
              <span
                style={{
                  background: `${COLORS.crimson}28`,
                  border: `1px solid ${COLORS.crimson}`,
                  color: "#fecaca",
                  padding: "6px 18px",
                  borderRadius: 999,
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                ثغرة خطيرة
              </span>
            </div>

            {/* Plain Unprotected Message */}
            <div
              style={{
                background: "rgba(5, 11, 22, 0.85)",
                border: `1.5px dashed ${COLORS.crimson}88`,
                borderRadius: 18,
                padding: "16px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 700 }}>
                كود التحقق هو: <b style={{ fontFamily: FONTS.mono }}>910442</b>
              </span>
              <span
                style={{
                  background: "rgba(239,68,68,0.2)",
                  color: "#fca5a5",
                  borderRadius: 12,
                  padding: "6px 16px",
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                ⚠️ بدون أي ختم شخصي!
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "❌ غياب تام لرمز مكافحة التصيد الشخصي",
                "❌ المحتال يقدر يبعث نفس النص ونفس اسم المرسل",
                "❌ المواطن البسيط ما يقدرش يفرق بين الصحيح والمزور",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#fecdd3",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Insight Bridge */}
        <div
          style={{
            background:
              "linear-gradient(90deg, rgba(245,158,11,0.18), rgba(0,212,182,0.22), rgba(245,158,11,0.18))",
            border: `1.5px solid ${COLORS.gold}88`,
            borderRadius: 20,
            padding: "14px 40px",
            opacity: bridgeBanner,
            scale: interpolate(bridgeBanner, [0, 1], [0.9, 1]),
            fontSize: 27,
            fontWeight: 800,
            color: COLORS.goldLight,
            textAlign: "center",
          }}
        >
          💡 مهمتنا في ShieldCode: نقل أقوى معايير الحماية العالمية وتوطينها للبنوك والمواطن الجزائري!
        </div>
      </div>
    </SceneShell>
  );
};
