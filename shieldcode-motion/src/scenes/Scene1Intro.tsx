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
  AlgerianFlagSVG,
  AnimatedArabicWords,
  CaptionSegment,
  SceneShell,
  ShieldLogoSVG,
} from "../components/SceneShell";

const CAPTIONS: readonly CaptionSegment[] = [
  {
    startSec: 0.5,
    endSec: 5.5,
    text: "بسم الله الرحمن الرحيم، مرحبا بكم أعضاء اللجنة الكرام 👋",
  },
  {
    startSec: 5.5,
    endSec: 11.2,
    text: "اليوم نقدمولكم مشروع ShieldCode — أول درع جزائري ذكي للأمن المالي",
  },
  {
    startSec: 11.2,
    endSec: 18.2,
    text: "يحمي الحسابات البنكية والبطاقة الذهبية من سرقة الأموال والتصيد الاحتيالي!",
  },
];

export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoPop = spring({
    frame: frame - 6,
    fps,
    config: { damping: 13, stiffness: 150, mass: 0.9 },
  });

  const badgePop = spring({
    frame: frame - 18,
    fps,
    config: { damping: 16, stiffness: 170 },
  });

  const ringRotate = frame * 0.55;
  const ringRotateReverse = -frame * 0.35;

  const shimmerX = interpolate(frame % 120, [0, 90], [-120, 220], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const PILLS = [
    { icon: "🏦", label: "حماية بريدي موب والبنوك", delay: 75 },
    { icon: "💳", label: "تأمين البطاقة الذهبية", delay: 88 },
    { icon: "🛡️", label: "كشف الرسائل المزورة فوراً", delay: 101 },
  ];

  return (
    <SceneShell
      sceneNumber="01"
      sceneTitle="تقديم المشروع"
      mood="teal"
      captions={CAPTIONS}
      hideHeader
    >
      {/* Audio Track */}
      <Sequence from={15} layout="none">
        <Audio src={staticFile("audio/vo_scene1.mp3")} volume={1} />
      </Sequence>
      <Sequence from={8} layout="none">
        <Audio src={staticFile("audio/sfx_chime.wav")} volume={0.35} />
      </Sequence>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          width: "100%",
        }}
      >
        {/* Top Startup Ribbon */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            opacity: badgePop,
            scale: interpolate(badgePop, [0, 1], [0.85, 1]),
            background:
              "linear-gradient(135deg, rgba(245, 158, 11, 0.20), rgba(0, 212, 182, 0.18))",
            border: `1.5px solid ${COLORS.gold}88`,
            borderRadius: 999,
            padding: "12px 36px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              fontSize: 26,
              fontWeight: 800,
              color: COLORS.goldLight,
            }}
          >
            <AlgerianFlagSVG width={34} height={23} />
            <span>مشروع تخرج • مؤسسة ناشئة في الأمن السيبراني والمالي</span>
          </span>
          {/* Shimmer sweep */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.35) 50%, transparent 65%)",
              translate: `${shimmerX}% 0`,
            }}
          />
        </div>

        {/* Hero Animated Shield Emblem with Orbiting Cyber Rings */}
        <div
          style={{
            position: "relative",
            width: 220,
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            scale: interpolate(logoPop, [0, 1], [0.4, 1]),
            opacity: logoPop,
          }}
        >
          {/* Outer dashed orbit */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `2px dashed ${COLORS.teal}55`,
              rotate: `${ringRotate}deg`,
            }}
          />
          {/* Inner glowing orbit */}
          <div
            style={{
              position: "absolute",
              inset: 22,
              borderRadius: "50%",
              border: `2px solid ${COLORS.cyan}44`,
              rotate: `${ringRotateReverse}deg`,
              boxShadow: `0 0 50px ${COLORS.teal}33 inset`,
            }}
          />
          {/* Core Hexagon Card */}
          <div
            style={{
              width: 144,
              height: 144,
              borderRadius: 36,
              background:
                "linear-gradient(145deg, rgba(0,212,182,0.28), rgba(9,21,40,0.95))",
              border: `2.5px solid ${COLORS.teal}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 20px 55px rgba(0,0,0,0.65), 0 0 45px ${COLORS.teal}55`,
            }}
          >
            <ShieldLogoSVG size={86} color={COLORS.teal} />
          </div>
        </div>

        {/* Brand Name */}
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 96,
            fontWeight: 700,
            color: COLORS.white,
            lineHeight: 1.05,
            opacity: spring({ frame: frame - 26, fps }),
            translate: `0px ${interpolate(
              spring({ frame: frame - 26, fps }),
              [0, 1],
              [28, 0]
            )}px`,
            textShadow: `0 0 42px ${COLORS.teal}66`,
          }}
        >
          Shield<span style={{ color: COLORS.teal }}>Code</span>
        </div>

        {/* Darija Hero Subtitle */}
        <div style={{ maxWidth: 1380 }}>
          <AnimatedArabicWords
            text="أول درع جزائري ذكي يحمي الحسابات البنكية والبطاقة الذهبية من التصيد والسرقة"
            delayFrames={38}
            staggerFrames={3}
            fontSize={48}
            fontWeight={800}
            color={COLORS.textSoft}
            highlightWords={["جزائري", "ذكي", "البطاقة", "الذهبية"]}
            highlightColor={COLORS.teal}
          />
        </div>

        {/* 3 Feature Pills */}
        <div
          style={{
            display: "flex",
            gap: 26,
            marginTop: 12,
          }}
        >
          {PILLS.map((pill) => {
            const p = spring({
              frame: frame - pill.delay,
              fps,
              config: { damping: 14, stiffness: 170 },
            });
            return (
              <div
                key={pill.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: "rgba(12, 26, 50, 0.86)",
                  border: `1.5px solid ${COLORS.teal}55`,
                  borderRadius: 20,
                  padding: "16px 30px",
                  opacity: p,
                  scale: interpolate(p, [0, 1], [0.8, 1]),
                  translate: `0px ${interpolate(p, [0, 1], [24, 0])}px`,
                  boxShadow: "0 14px 30px rgba(0,0,0,0.38)",
                }}
              >
                <span style={{ fontSize: 32 }}>{pill.icon}</span>
                <span
                  style={{
                    fontSize: 27,
                    fontWeight: 700,
                    color: COLORS.white,
                  }}
                >
                  {pill.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </SceneShell>
  );
};
