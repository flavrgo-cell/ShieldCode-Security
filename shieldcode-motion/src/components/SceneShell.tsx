import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "../theme";

export type CaptionSegment = {
  readonly startSec: number;
  readonly endSec: number;
  readonly text: string;
  readonly accentWord?: string;
};

type SceneShellProps = {
  readonly sceneNumber: string;
  readonly sceneTitle: string;
  readonly mood?: "teal" | "danger" | "gold" | "hybrid";
  readonly captions: readonly CaptionSegment[];
  readonly children: React.ReactNode;
  readonly hideHeader?: boolean;
};

export const AlgerianFlagSVG: React.FC<{ width?: number; height?: number }> = ({
  width = 34,
  height = 24,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 36 24"
    style={{ borderRadius: 4, flexShrink: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.35)" }}
  >
    <rect width="18" height="24" x="0" y="0" fill="#006233" />
    <rect width="18" height="24" x="18" y="0" fill="#ffffff" />
    <circle cx="18" cy="12" r="6" fill="#d21034" />
    <circle cx="19.6" cy="12" r="4.8" fill="#ffffff" />
    <path
      d="M19.2 12L23.2 10.6L20.8 14L20.8 10L23.2 13.4Z"
      fill="#d21034"
    />
  </svg>
);

export const ShieldLogoSVG: React.FC<{ size?: number; color?: string }> = ({
  size = 44,
  color = COLORS.teal,
}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path
      d="M32 4L8 14V30C8 45.2 18.2 58.6 32 62C45.8 58.6 56 45.2 56 30V14L32 4Z"
      fill={`${color}22`}
      stroke={color}
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <path
      d="M23 32.5L29 38.5L42 25.5"
      stroke="#ffffff"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AnimatedArabicWords: React.FC<{
  readonly text: string;
  readonly delayFrames?: number;
  readonly staggerFrames?: number;
  readonly fontSize?: number;
  readonly fontWeight?: number;
  readonly color?: string;
  readonly highlightWords?: readonly string[];
  readonly highlightColor?: string;
  readonly textAlign?: "right" | "center" | "left";
}> = ({
  text,
  delayFrames = 0,
  staggerFrames = 3,
  fontSize = 68,
  fontWeight = 800,
  color = COLORS.white,
  highlightWords = [],
  highlightColor = COLORS.teal,
  textAlign = "center",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        fontFamily: FONTS.arabic,
        fontSize,
        fontWeight,
        lineHeight: 1.32,
        textAlign,
        unicodeBidi: "plaintext",
        display: "flex",
        flexWrap: "wrap",
        justifyContent:
          textAlign === "center"
            ? "center"
            : textAlign === "right"
              ? "flex-start"
              : "flex-end",
        columnGap: Math.round(fontSize * 0.24),
        rowGap: Math.round(fontSize * 0.1),
      }}
    >
      {words.map((word, idx) => {
        const p = spring({
          frame: frame - delayFrames - idx * staggerFrames,
          fps,
          config: { damping: 15, stiffness: 170, mass: 0.8 },
        });
        const y = interpolate(p, [0, 1], [34, 0]);
        const opacity = interpolate(p, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const isHighlighted = highlightWords.some((hw) => word.includes(hw));

        return (
          <span
            key={`${word}-${idx}`}
            style={{
              display: "inline-block",
              opacity,
              translate: `0px ${y}px`,
              color: isHighlighted ? highlightColor : color,
              textShadow: isHighlighted
                ? `0 0 28px ${highlightColor}55`
                : "0 4px 20px rgba(0,0,0,0.45)",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

export const SceneShell: React.FC<SceneShellProps> = ({
  sceneNumber,
  sceneTitle,
  mood = "teal",
  captions,
  children,
  hideHeader = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentSec = frame / fps;

  const primaryGlow =
    mood === "danger"
      ? COLORS.crimson
      : mood === "gold"
        ? COLORS.gold
        : COLORS.teal;

  const secondaryGlow =
    mood === "danger"
      ? "#f97316"
      : mood === "gold"
        ? COLORS.teal
        : "#2563eb";

  // Ambient floating drift
  const orb1X = Math.sin(frame / 55) * 65;
  const orb1Y = Math.cos(frame / 70) * 45;
  const orb2X = Math.cos(frame / 60) * -70;
  const orb2Y = Math.sin(frame / 50) * 50;

  // Grid subtle motion
  const gridShift = (frame * 0.7) % 64;

  // Find active caption segment
  const activeCaption = captions.find(
    (c) => currentSec >= c.startSec && currentSec <= c.endSec
  );

  const sceneProgress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headerOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill
      dir="rtl"
      lang="ar"
      style={{
        backgroundColor: COLORS.bgDeep,
        fontFamily: FONTS.arabic,
        overflow: "hidden",
        color: COLORS.white,
      }}
    >
      {/* Layer 1: Deep Radial Cyber Aurora */}
      <div
        style={{
          position: "absolute",
          width: 980,
          height: 980,
          borderRadius: "50%",
          top: -280 + orb1Y,
          right: -180 + orb1X,
          background: `radial-gradient(circle, ${primaryGlow}29 0%, transparent 68%)`,
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          bottom: -300 + orb2Y,
          left: -160 + orb2X,
          background: `radial-gradient(circle, ${secondaryGlow}26 0%, transparent 68%)`,
          filter: "blur(45px)",
        }}
      />

      {/* Layer 2: Subtle Tech Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.055) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.055) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          backgroundPosition: `${gridShift}px ${gridShift}px`,
          maskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.12) 95%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.12) 95%)",
        }}
      />

      {/* Layer 3: Top Presentation HUD */}
      {!hideHeader && (
        <div
          style={{
            position: "absolute",
            top: 38,
            right: 80,
            left: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            opacity: headerOpacity,
            zIndex: 20,
          }}
        >
          {/* Brand Pill (Right in RTL) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "rgba(9, 21, 40, 0.78)",
              border: `1px solid ${primaryGlow}44`,
              borderRadius: 999,
              padding: "10px 24px 10px 28px",
              boxShadow: "0 10px 28px rgba(0,0,0,0.35)",
            }}
          >
            <ShieldLogoSVG size={34} color={primaryGlow} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: COLORS.white,
                  lineHeight: 1.1,
                }}
              >
                ShieldCode
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: COLORS.textMuted,
                }}
              >
                مشروع تخرج • مؤسسة ناشئة
              </span>
            </div>
          </div>

          {/* Chapter Indicator Pill (Left in RTL) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              background: "rgba(9, 21, 40, 0.82)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 999,
              padding: "10px 26px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 18,
                fontWeight: 700,
                color: primaryGlow,
                background: `${primaryGlow}1f`,
                padding: "3px 12px",
                borderRadius: 999,
              }}
            >
              {sceneNumber} / 07
            </span>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: COLORS.textSoft,
              }}
            >
              {sceneTitle}
            </span>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                height: 3,
                width: `${sceneProgress}%`,
                background: `linear-gradient(90deg, transparent, ${primaryGlow})`,
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Safe Area */}
      <div
        style={{
          position: "absolute",
          top: hideHeader ? 60 : 120,
          bottom: 135,
          right: 84,
          left: 84,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        {children}
      </div>

      {/* Bottom Synchronized Algerian Darija Subtitle Bar */}
      {activeCaption && (
        <div
          style={{
            position: "absolute",
            bottom: 34,
            right: 120,
            left: 120,
            display: "flex",
            justifyContent: "center",
            zIndex: 30,
          }}
        >
          <div
            dir="rtl"
            lang="ar"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              background: "rgba(6, 14, 28, 0.90)",
              border: `1.5px solid ${primaryGlow}55`,
              borderRadius: 22,
              padding: "14px 34px",
              boxShadow: `0 16px 40px rgba(0,0,0,0.65), 0 0 24px ${primaryGlow}22`,
              maxWidth: 1520,
            }}
          >
            {/* Animated Voice Equalizer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                height: 28,
                flexShrink: 0,
              }}
            >
              {[0, 1, 2, 3].map((bar) => {
                const h =
                  10 +
                  Math.abs(Math.sin((frame + bar * 7) * 0.32)) * 18;
                return (
                  <div
                    key={bar}
                    style={{
                      width: 4,
                      height: h,
                      borderRadius: 4,
                      backgroundColor: primaryGlow,
                    }}
                  />
                );
              })}
            </div>

            <span
              style={{
                fontSize: 31,
                fontWeight: 700,
                color: COLORS.white,
                lineHeight: 1.4,
                textAlign: "center",
                unicodeBidi: "plaintext",
              }}
            >
              {activeCaption.text}
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
