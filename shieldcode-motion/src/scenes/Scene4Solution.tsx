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
    endSec: 8.6,
    text: "هنا يجي الحل تاع ShieldCode! المستخدم من داخل إعدادات البنك تاعو يخيّر كلمة سرية خاصة بيه وحدو",
  },
  {
    startSec: 8.6,
    endSec: 16.5,
    text: "ما يعرفها لا هاكر ولا محتال! ومن هاذ اللحظة، أي رسالة رسمية تخرج من البنك تجي مختومة برمزو السري",
  },
  {
    startSec: 16.5,
    endSec: 25.2,
    text: "وأي رسالة توصلك بلا هاذ الرمز السري.. تتكشف فوراً في رمشة عين بلي محاولة احتيال! 🛡️",
  },
];

export const Scene4Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const step1 = spring({
    frame: frame - 22,
    fps,
    config: { damping: 14, stiffness: 155 },
  });
  const step2 = spring({
    frame: frame - 210,
    fps,
    config: { damping: 14, stiffness: 155 },
  });
  const genuinePop = spring({
    frame: frame - 360,
    fps,
    config: { damping: 13, stiffness: 170 },
  });
  const scamPop = spring({
    frame: frame - 500,
    fps,
    config: { damping: 14, stiffness: 170 },
  });

  const pulseScale = 1 + Math.sin(frame * 0.14) * 0.04;

  return (
    <SceneShell
      sceneNumber="04"
      sceneTitle="آلية عمل الابتكار (ShieldCode)"
      mood="teal"
      captions={CAPTIONS}
    >
      <Sequence from={12} layout="none">
        <Audio src={staticFile("audio/vo_scene4.mp3")} volume={1} />
      </Sequence>
      <Sequence from={25} layout="none">
        <Audio src={staticFile("audio/sfx_pop.wav")} volume={0.35} />
      </Sequence>
      <Sequence from={362} layout="none">
        <Audio src={staticFile("audio/sfx_chime.wav")} volume={0.38} />
      </Sequence>
      <Sequence from={502} layout="none">
        <Audio src={staticFile("audio/sfx_alert.wav")} volume={0.38} />
      </Sequence>

      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
        }}
      >
        <AnimatedArabicWords
          text="مبدأ التوثيق المتبادل: البنك يثبت هويتو للمواطن أولاً!"
          delayFrames={4}
          staggerFrames={2}
          fontSize={52}
          fontWeight={900}
          highlightWords={["التوثيق", "المتبادل:", "يثبت", "هويتو"]}
          highlightColor={COLORS.teal}
        />

        {/* 3-Column Visual Flow (Right -> Center -> Left) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 0.85fr 1.25fr",
            gap: 28,
            width: "100%",
            alignItems: "center",
          }}
        >
          {/* STEP 1: User Inside Bank Settings */}
          <div
            style={{
              background: COLORS.panelDark,
              border: `2px solid ${COLORS.teal}77`,
              borderRadius: 28,
              padding: "28px 28px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              opacity: step1,
              translate: `0px ${interpolate(step1, [0, 1], [38, 0])}px`,
              boxShadow: "0 20px 45px rgba(0,0,0,0.48)",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: COLORS.teal,
              }}
            >
              1️⃣ من داخل إعدادات أمان البنك
            </div>

            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.textSoft,
                lineHeight: 1.45,
              }}
            >
              المستخدم يخيّر كلمة سرية خاصة بيه وحدو (سر بينو وبين البنك فقط):
            </div>

            <div
              style={{
                background: "#050d1c",
                border: `2px solid ${COLORS.teal}`,
                borderRadius: 18,
                padding: "18px 20px",
                textAlign: "center",
                boxShadow: `0 0 28px ${COLORS.teal}33`,
              }}
            >
              <div
                style={{
                  fontSize: 17,
                  color: COLORS.textMuted,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                الرمز الشخصي لمكافحة التصيد
              </div>
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 900,
                  color: COLORS.teal,
                }}
              >
                🦅 الصقر_2026
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 19,
                fontWeight: 700,
                color: "#6ee7b7",
              }}
            >
              <span>🔐 مشفّر في قاعدة البيانات</span>
              <span>✓ لا يعرفه أي محتال</span>
            </div>
          </div>

          {/* STEP 2: ShieldCode Injection Engine */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
              opacity: step2,
              scale: interpolate(step2, [0, 1], [0.8, 1]),
            }}
          >
            <div
              style={{
                fontSize: 28,
                color: COLORS.teal,
                fontWeight: 900,
              }}
            >
              ⬅️ دمج آلي فوري ⬅️
            </div>

            <div
              style={{
                width: 195,
                height: 195,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(0,212,182,0.28) 0%, rgba(9,21,40,0.96) 72%)",
                border: `3px solid ${COLORS.teal}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                scale: pulseScale,
                boxShadow: `0 0 55px ${COLORS.teal}44`,
              }}
            >
              <ShieldLogoSVG size={66} color={COLORS.teal} />
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 21,
                  fontWeight: 700,
                  color: COLORS.white,
                }}
              >
                ShieldCode
              </span>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: COLORS.teal,
                }}
              >
                ختم الرسائل آلياً
              </span>
            </div>

            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: COLORS.textSoft,
                textAlign: "center",
              }}
            >
              يختم كل إشعار أو كود OTP قبل الإرسال
            </div>
          </div>

          {/* STEP 3: Citizen's Phone — Instant Visual Verdict */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            {/* Genuine Message */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(6, 78, 59, 0.82), rgba(6, 36, 32, 0.94))",
                border: `2.5px solid ${COLORS.emerald}`,
                borderRadius: 24,
                padding: "22px 26px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                opacity: genuinePop,
                scale: interpolate(genuinePop, [0, 1], [0.85, 1]),
                boxShadow: `0 18px 42px rgba(16, 185, 129, 0.28)`,
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
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#6ee7b7",
                  }}
                >
                  ✅ رسالة البنك الحقيقية
                </span>
                <span
                  style={{
                    background: COLORS.emerald,
                    color: "#022c22",
                    borderRadius: 999,
                    padding: "4px 16px",
                    fontSize: 18,
                    fontWeight: 900,
                  }}
                >
                  آمنة 100%
                </span>
              </div>

              <div
                style={{
                  background: "rgba(0,0,0,0.42)",
                  borderRadius: 14,
                  padding: "12px 16px",
                  fontSize: 23,
                  fontWeight: 800,
                  color: COLORS.white,
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    background: `${COLORS.teal}33`,
                    border: `1px solid ${COLORS.teal}`,
                    color: COLORS.teal,
                    padding: "2px 12px",
                    borderRadius: 8,
                    marginLeft: 10,
                  }}
                >
                  🛡️ الصقر_2026
                </span>
                كود تأكيد العملية هو:{" "}
                <b style={{ fontFamily: FONTS.mono, color: COLORS.goldLight }}>
                  774190
                </b>
              </div>
            </div>

            {/* Scam Message */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(127, 29, 29, 0.84), rgba(45, 10, 14, 0.94))",
                border: `2.5px solid ${COLORS.crimson}`,
                borderRadius: 24,
                padding: "22px 26px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                opacity: scamPop,
                scale: interpolate(scamPop, [0, 1], [0.85, 1]),
                boxShadow: `0 18px 42px rgba(239, 68, 68, 0.28)`,
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
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#fecaca",
                  }}
                >
                  🚨 رسالة المحتال المزورة
                </span>
                <span
                  style={{
                    background: COLORS.crimson,
                    color: COLORS.white,
                    borderRadius: 999,
                    padding: "4px 16px",
                    fontSize: 18,
                    fontWeight: 900,
                  }}
                >
                  تصيد مرفوض!
                </span>
              </div>

              <div
                style={{
                  background: "rgba(0,0,0,0.42)",
                  borderRadius: 14,
                  padding: "12px 16px",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#fca5a5",
                  textDecoration: "line-through",
                }}
              >
                "حسابك موقوف! أدخل الكود 774190 في الرابط فوراً"
              </div>

              <div
                style={{
                  fontSize: 19,
                  fontWeight: 800,
                  color: COLORS.goldLight,
                }}
              >
                ⚠️ ما فيهاش رمز [الصقر_2026] = المواطن يرفضها فوراً!
              </div>
            </div>
          </div>
        </div>
      </div>
    </SceneShell>
  );
};
