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
    endSec: 7.4,
    text: "مع ShieldCode، نرجّعوا الثقة في الدفع الإلكتروني، ونحميوا دراهم كل مواطن جزائري 🛡️",
  },
  {
    startSec: 7.4,
    endSec: 15.2,
    text: "شكراً لإصغائكم أعضاء اللجنة الكرام.. وتفضلوا معانا دركا للتجربة الحية!",
  },
];

export const Scene7Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const emblemIn = spring({
    frame: frame - 8,
    fps,
    config: { damping: 13, stiffness: 150 },
  });

  const ctaIn = spring({
    frame: frame - 210,
    fps,
    config: { damping: 14, stiffness: 165 },
  });

  const pulse = 1 + Math.sin(frame * 0.12) * 0.035;

  return (
    <SceneShell
      sceneNumber="07"
      sceneTitle="الخاتمة والتجربة الحية"
      mood="teal"
      captions={CAPTIONS}
      hideHeader
    >
      <Sequence from={12} layout="none">
        <Audio src={staticFile("audio/vo_scene7.mp3")} volume={1} />
      </Sequence>
      <Sequence from={10} layout="none">
        <Audio src={staticFile("audio/sfx_chime.wav")} volume={0.4} />
      </Sequence>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
          width: "100%",
        }}
      >
        {/* Glowing Crest */}
        <div
          style={{
            width: 175,
            height: 175,
            borderRadius: 44,
            background:
              "linear-gradient(145deg, rgba(0,212,182,0.32), rgba(9,21,40,0.95))",
            border: `3px solid ${COLORS.teal}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: emblemIn,
            scale: interpolate(emblemIn, [0, 1], [0.4, 1]) * pulse,
            boxShadow: `0 24px 60px rgba(0,0,0,0.65), 0 0 55px ${COLORS.teal}55`,
          }}
        >
          <ShieldLogoSVG size={102} color={COLORS.teal} />
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 88,
            fontWeight: 700,
            color: COLORS.white,
            lineHeight: 1.05,
            textShadow: `0 0 40px ${COLORS.teal}55`,
          }}
        >
          Shield<span style={{ color: COLORS.teal }}>Code</span>
        </div>

        <div style={{ maxWidth: 1400 }}>
          <AnimatedArabicWords
            text="نرجّعوا الثقة في الدفع الإلكتروني.. ونحميوا دراهم كل مواطن جزائري"
            delayFrames={24}
            staggerFrames={3}
            fontSize={52}
            fontWeight={900}
            highlightWords={["الثقة", "الدفع", "الإلكتروني..", "مواطن", "جزائري"]}
            highlightColor={COLORS.teal}
          />
        </div>

        {/* Live Demo CTA Banner */}
        <div
          style={{
            marginTop: 14,
            background:
              "linear-gradient(135deg, rgba(0, 212, 182, 0.24), rgba(245, 158, 11, 0.22))",
            border: `2px solid ${COLORS.gold}`,
            borderRadius: 999,
            padding: "18px 48px",
            opacity: ctaIn,
            scale: interpolate(ctaIn, [0, 1], [0.85, 1]) * pulse,
            boxShadow: `0 20px 45px rgba(0,0,0,0.5), 0 0 35px ${COLORS.gold}33`,
            fontSize: 32,
            fontWeight: 900,
            color: COLORS.goldLight,
            textAlign: "center",
          }}
        >
          🎯 شكراً لإصغائكم أعضاء اللجنة الكرام • تفضلوا معانا للتجربة الحية!
        </div>
      </div>
    </SceneShell>
  );
};
