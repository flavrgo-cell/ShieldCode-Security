import React from "react";
import { Audio } from "@remotion/media";
import {
  Easing,
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
    endSec: 7.4,
    text: "في الجزائر، آلاف المواطنين راهم يطيحوا كل يوم في فخ الرسائل والمواقع المزورة باسم بريدي موب والبنوك",
  },
  {
    startSec: 7.4,
    endSec: 15.6,
    text: "المحتال يزوّر اسم المرسل، أو يدير صفحة تشبه لصفحة البطاقة الذهبية خارج التطبيق",
  },
  {
    startSec: 15.6,
    endSec: 23.0,
    text: "وغير المواطن يدخل 16 رقم تاع البطاقة والكود.. يفرّغولوا حسابو في ثواني! 🚨",
  },
];

export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const card1 = spring({
    frame: frame - 24,
    fps,
    config: { damping: 15, stiffness: 155 },
  });
  const card2 = spring({
    frame: frame - 190,
    fps,
    config: { damping: 15, stiffness: 155 },
  });
  const card3 = spring({
    frame: frame - 390,
    fps,
    config: { damping: 14, stiffness: 165 },
  });

  // Live balance drain starting at frame 450 (~15s) when speaker says "يفرغولوا حسابو في ثواني"
  const drainProgress = interpolate(frame, [450, 545], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.3, 0, 0.7, 1),
  });
  const currentBalance = Math.round(65000 * (1 - drainProgress));

  // Shake when drained
  const isDraining = frame >= 460 && frame <= 555;
  const shakeX = isDraining ? Math.sin(frame * 1.4) * 9 : 0;

  // Typed digits animation on fake card form
  const typedChars = Math.floor(
    interpolate(frame, [220, 340], [0, 19], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const fullCardNum = "6280 0094 8812 3019";

  return (
    <SceneShell
      sceneNumber="02"
      sceneTitle="المشكلة الواقعية في الجزائر"
      mood="danger"
      captions={CAPTIONS}
    >
      <Sequence from={12} layout="none">
        <Audio src={staticFile("audio/vo_scene2.mp3")} volume={1} />
      </Sequence>
      <Sequence from={25} layout="none">
        <Audio src={staticFile("audio/sfx_pop.wav")} volume={0.35} />
      </Sequence>
      <Sequence from={192} layout="none">
        <Audio src={staticFile("audio/sfx_pop.wav")} volume={0.35} />
      </Sequence>
      <Sequence from={455} layout="none">
        <Audio src={staticFile("audio/sfx_alert.wav")} volume={0.4} />
      </Sequence>

      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 34,
        }}
      >
        {/* Scene Headline */}
        <AnimatedArabicWords
          text="كيفاش راهي تصرا سرقة الحسابات البنكية والذهبية كل يوم؟"
          delayFrames={4}
          staggerFrames={2}
          fontSize={54}
          fontWeight={900}
          highlightWords={["سرقة", "الحسابات", "والذهبية"]}
          highlightColor={COLORS.crimson}
        />

        {/* 3-Step Visual Attack Chain (RTL: Step 1 Right -> Step 2 Center -> Step 3 Left) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 30,
            width: "100%",
            alignItems: "stretch",
          }}
        >
          {/* STEP 1: Spoofed SMS / Fake Link */}
          <div
            style={{
              background: "rgba(24, 14, 24, 0.88)",
              border: "2px solid rgba(239, 68, 68, 0.45)",
              borderRadius: 28,
              padding: "26px 28px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              opacity: card1,
              translate: `0px ${interpolate(card1, [0, 1], [40, 0])}px`,
              boxShadow: "0 20px 45px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  background: "rgba(239,68,68,0.2)",
                  color: "#fca5a5",
                  padding: "6px 16px",
                  borderRadius: 999,
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                1️⃣ الفخ الأول: انتحال الهوية
              </span>
              <span style={{ fontSize: 34 }}>📱</span>
            </div>

            {/* Mock Phone Bubble */}
            <div
              style={{
                background: "#0b1322",
                border: "1.5px solid rgba(255,255,255,0.12)",
                borderRadius: 20,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  paddingBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 20,
                    fontWeight: 700,
                    color: COLORS.gold,
                  }}
                >
                  BaridiMob-DZ
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: COLORS.crimson,
                  }}
                >
                  ⚠️ مرسل مزوّر!
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 23,
                  lineHeight: 1.5,
                  color: COLORS.white,
                  fontWeight: 600,
                }}
              >
                "عاجل: سيتم غلق حسابك! ادخل للرابط لتحديث معلومات البطاقة الذهبية أو الاستفادة من المنحة..."
              </p>
            </div>

            <div
              style={{
                fontSize: 22,
                color: "#fda4af",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              المواطن يحسبها رسالة رسمية من البنك!
            </div>
          </div>

          {/* STEP 2: Fake External EDAHABIA Form */}
          <div
            style={{
              background: "rgba(24, 14, 24, 0.88)",
              border: "2px solid rgba(245, 158, 11, 0.55)",
              borderRadius: 28,
              padding: "26px 28px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              opacity: card2,
              translate: `0px ${interpolate(card2, [0, 1], [40, 0])}px`,
              boxShadow: "0 20px 45px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  background: "rgba(245,158,11,0.2)",
                  color: COLORS.goldLight,
                  padding: "6px 16px",
                  borderRadius: 999,
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                2️⃣ صفحة دفع خارجية مزورة
              </span>
              <span style={{ fontSize: 34 }}>💳</span>
            </div>

            {/* Golden Card Input Mockup */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(245,158,11,0.22), rgba(15,23,42,0.95))",
                border: `1.5px solid ${COLORS.gold}77`,
                borderRadius: 20,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 12,
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
                    fontWeight: 800,
                    color: COLORS.goldLight,
                  }}
                >
                  بوابة البطاقة الذهبية (مقلدة)
                </span>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 16,
                    color: "#f87171",
                  }}
                >
                  fake-pay-dz.com
                </span>
              </div>

              <div
                dir="ltr"
                style={{
                  background: "#060d1b",
                  border: "1px solid rgba(255,255,255,0.16)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontFamily: FONTS.mono,
                  fontSize: 24,
                  fontWeight: 700,
                  color: COLORS.white,
                  textAlign: "center",
                }}
              >
                {fullCardNum.slice(0, typedChars) || "•••• •••• •••• ••••"}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <div
                  dir="ltr"
                  style={{
                    flex: 1,
                    background: "#060d1b",
                    borderRadius: 10,
                    padding: "8px 12px",
                    fontFamily: FONTS.mono,
                    fontSize: 19,
                    color: COLORS.textSoft,
                    textAlign: "center",
                  }}
                >
                  CVV: {frame > 345 ? "842" : "•••"}
                </div>
                <div
                  dir="ltr"
                  style={{
                    flex: 1,
                    background: "#060d1b",
                    borderRadius: 10,
                    padding: "8px 12px",
                    fontFamily: FONTS.mono,
                    fontSize: 19,
                    color: COLORS.gold,
                    textAlign: "center",
                  }}
                >
                  OTP: {frame > 365 ? "591024" : "••••••"}
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: 22,
                color: COLORS.goldLight,
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              يدخل 16 رقم تاع البطاقة + الكود بيدو!
            </div>
          </div>

          {/* STEP 3: Instant Account Drain */}
          <div
            style={{
              background:
                drainProgress > 0.5
                  ? "linear-gradient(145deg, rgba(127, 29, 29, 0.92), rgba(24, 10, 14, 0.95))"
                  : "rgba(24, 14, 24, 0.88)",
              border: `2.5px solid ${COLORS.crimson}`,
              borderRadius: 28,
              padding: "26px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 16,
              opacity: card3,
              translate: `${shakeX}px ${interpolate(card3, [0, 1], [40, 0])}px`,
              boxShadow:
                drainProgress > 0.2
                  ? `0 20px 55px rgba(239, 68, 68, 0.42)`
                  : "0 20px 45px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  background: "rgba(239,68,68,0.28)",
                  color: "#fecaca",
                  padding: "6px 16px",
                  borderRadius: 999,
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                3️⃣ النتيجة الكارثية
              </span>
              <span style={{ fontSize: 34 }}>💸</span>
            </div>

            {/* Balance Counter */}
            <div
              style={{
                background: "rgba(0,0,0,0.45)",
                borderRadius: 20,
                padding: "24px 20px",
                textAlign: "center",
                border: "1px solid rgba(239,68,68,0.35)",
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  color: COLORS.textMuted,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                رصيد الحساب الجاري (CCP)
              </div>
              <div
                dir="ltr"
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 54,
                  fontWeight: 700,
                  color:
                    currentBalance === 0 ? COLORS.crimson : COLORS.white,
                }}
              >
                {currentBalance.toLocaleString("en-US")} DA
              </div>
            </div>

            <div
              style={{
                background: COLORS.crimson,
                color: COLORS.white,
                borderRadius: 16,
                padding: "12px 18px",
                fontSize: 23,
                fontWeight: 900,
                textAlign: "center",
                scale:
                  currentBalance === 0
                    ? interpolate(
                        spring({ frame: frame - 540, fps }),
                        [0, 1],
                        [0.9, 1.04]
                      )
                    : 1,
              }}
            >
              🚨 تصفير الحساب وسرقة الأموال!
            </div>
          </div>
        </div>
      </div>
    </SceneShell>
  );
};
