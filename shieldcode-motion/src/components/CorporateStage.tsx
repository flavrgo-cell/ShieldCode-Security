import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { EASE, FONTS, PALETTE } from "../theme";

export type IconKind =
  | "shield"
  | "alert"
  | "card"
  | "lock"
  | "camera"
  | "link"
  | "key"
  | "phone"
  | "mail"
  | "bolt"
  | "layers"
  | "cpu"
  | "database"
  | "globe"
  | "building"
  | "rocket"
  | "chart"
  | "check";

export const SovereignIcon: React.FC<{
  readonly kind: IconKind;
  readonly color?: string;
  readonly size?: number;
}> = ({ kind, color = PALETTE.teal, size = 58 }) => {
  const s = Math.round(size * 0.5);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 30% 25%, ${color}2e 0%, rgba(6, 15, 30, 0.95) 75%)`,
        border: `2px solid ${color}88`,
        boxShadow: `0 8px 22px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.22)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {kind === "shield" && (
          <>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </>
        )}
        {kind === "alert" && (
          <>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </>
        )}
        {kind === "card" && (
          <>
            <rect width="20" height="14" x="2" y="5" rx="2.5" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </>
        )}
        {kind === "lock" && (
          <>
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </>
        )}
        {kind === "camera" && (
          <>
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </>
        )}
        {kind === "link" && (
          <>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </>
        )}
        {kind === "key" && (
          <>
            <circle cx="7.5" cy="15.5" r="5.5" />
            <path d="m21 2-9.6 9.6" />
            <path d="m15.5 7.5 3 3L22 7l-3-3" />
          </>
        )}
        {kind === "phone" && (
          <>
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
            <path d="M12 18h.01" />
          </>
        )}
        {kind === "mail" && (
          <>
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </>
        )}
        {kind === "bolt" && <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />}
        {kind === "layers" && (
          <>
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </>
        )}
        {kind === "cpu" && (
          <>
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <rect x="9" y="9" width="6" height="6" />
            <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
          </>
        )}
        {kind === "database" && (
          <>
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
          </>
        )}
        {kind === "globe" && (
          <>
            <circle cx="12" cy="12" r="10" />
            <line x1="2" x2="22" y1="12" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </>
        )}
        {kind === "building" && (
          <>
            <rect width="16" height="20" x="4" y="2" rx="2" />
            <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
          </>
        )}
        {kind === "rocket" && (
          <>
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          </>
        )}
        {kind === "chart" && (
          <>
            <line x1="18" x2="18" y1="20" y2="10" />
            <line x1="12" x2="12" y1="20" y2="4" />
            <line x1="6" x2="6" y1="20" y2="14" />
          </>
        )}
        {kind === "check" && (
          <>
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </>
        )}
      </svg>
    </div>
  );
};

export const AlgerianFlagBadge: React.FC<{ width?: number; height?: number }> = ({
  width = 30,
  height = 20,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 36 24"
    style={{ borderRadius: 4, flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
  >
    <rect width="18" height="24" x="0" y="0" fill="#006233" />
    <rect width="18" height="24" x="18" y="0" fill="#ffffff" />
    <circle cx="18" cy="12" r="6" fill="#d21034" />
    <circle cx="19.6" cy="12" r="4.8" fill="#ffffff" />
    <path d="M19.2 12L23.2 10.6L20.8 14L20.8 10L23.2 13.4Z" fill="#d21034" />
  </svg>
);

export const useCardMotion = (delayFrames: number, distanceY = 22) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - delayFrames,
    fps,
    config: { damping: 18, stiffness: 165, mass: 0.85 },
  });
  return {
    opacity: interpolate(p, [0, 1], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    translate: `0px ${interpolate(p, [0, 1], [distanceY, 0])}px`,
    scale: interpolate(p, [0, 1], [0.955, 1]),
    progress: p,
  };
};

export const CorporateHeaderBlock: React.FC<{
  readonly title: string;
  readonly subtitle: string;
  readonly accentColor?: string;
}> = ({ title, subtitle, accentColor = PALETTE.teal }) => {
  const frame = useCurrentFrame();
  const titleIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outStrong,
  });
  const subIn = interpolate(frame, [6, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outStrong,
  });

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: titleIn,
          translate: `0px ${interpolate(titleIn, [0, 1], [14, 0])}px`,
        }}
      >
        <div
          style={{
            width: 6,
            height: 44,
            borderRadius: 99,
            background: `linear-gradient(180deg, ${accentColor}, transparent)`,
          }}
        />
        <h1
          style={{
            margin: 0,
            fontSize: 44,
            fontWeight: 900,
            color: PALETTE.white,
            lineHeight: 1.2,
            unicodeBidi: "plaintext",
          }}
        >
          {title}
        </h1>
      </div>
      <p
        style={{
          margin: 0,
          paddingRight: 20,
          fontSize: 22,
          fontWeight: 600,
          color: PALETTE.soft,
          lineHeight: 1.4,
          opacity: subIn,
          translate: `0px ${interpolate(subIn, [0, 1], [10, 0])}px`,
          unicodeBidi: "plaintext",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
};

export const CorporateStage: React.FC<{
  readonly slideIndex: number;
  readonly accent?: string;
  readonly secondaryAccent?: string;
  readonly hideChrome?: boolean;
  readonly children: React.ReactNode;
}> = ({
  slideIndex,
  accent = PALETTE.teal,
  secondaryAccent = "#1d4ed8",
  hideChrome = false,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const orbX = Math.sin(frame / 65) * 55;
  const orbY = Math.cos(frame / 80) * 40;
  const gridShift = (frame * 0.45) % 72;

  // Exit micro-polish (subtle 0.985 scale on final 8 frames)
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const slideLabel = slideIndex < 10 ? `0${slideIndex}` : `${slideIndex}`;

  return (
    <AbsoluteFill
      dir="rtl"
      lang="ar"
      style={{
        backgroundColor: PALETTE.bgVoid,
        fontFamily: FONTS.arabic,
        color: PALETTE.white,
        overflow: "hidden",
      }}
    >
      {/* Ambient Radial Studio Lighting (Zero blur filter = blazing fast 1080p render) */}
      <div
        style={{
          position: "absolute",
          width: 1280,
          height: 1280,
          borderRadius: "50%",
          top: -460 + orbY,
          right: -280 + orbX,
          background: `radial-gradient(circle, ${accent}22 0%, ${accent}0c 36%, transparent 68%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1150,
          height: 1150,
          borderRadius: "50%",
          bottom: -440 - orbY,
          left: -260 - orbX,
          background: `radial-gradient(circle, ${secondaryAccent}20 0%, ${secondaryAccent}0a 36%, transparent 68%)`,
        }}
      />

      {/* Precision FinTech Blueprint Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.045) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          backgroundPosition: `${gridShift}px ${gridShift}px`,
        }}
      />

      {/* Top Executive Chrome */}
      {!hideChrome && (
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 72,
            left: 72,
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            paddingBottom: 12,
            zIndex: 25,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <AlgerianFlagBadge width={28} height={19} />
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 19,
                fontWeight: 700,
                color: PALETTE.white,
              }}
            >
              Shield<span style={{ color: PALETTE.teal }}>Code</span> & Secure
              <span style={{ color: PALETTE.amber }}>Pay</span>
            </span>
            <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 18 }}>|</span>
            <span style={{ fontSize: 17, fontWeight: 600, color: PALETTE.muted }}>
              الدرع السيادي للاتصالات والمدفوعات المالية في الجزائر
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(0, 212, 182, 0.12)",
                border: "1px solid rgba(0, 212, 182, 0.35)",
                borderRadius: 999,
                padding: "4px 14px",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: PALETTE.emerald,
                }}
              />
              <span
                dir="ltr"
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 13,
                  fontWeight: 700,
                  color: PALETTE.teal,
                }}
              >
                RUST VAULT • AES-256-GCM
              </span>
            </div>

            <div
              dir="ltr"
              style={{
                fontFamily: FONTS.mono,
                fontSize: 17,
                fontWeight: 700,
                color: PALETTE.white,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 999,
                padding: "4px 16px",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span style={{ color: accent }}>{slideLabel}</span> / 12
            </div>
          </div>
        </div>
      )}

      {/* Main Content Stage */}
      <div
        style={{
          position: "absolute",
          top: hideChrome ? 54 : 96,
          bottom: 58,
          right: 72,
          left: 72,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          scale: interpolate(exitProgress, [0, 1], [1, 0.99]),
          zIndex: 10,
        }}
      >
        {children}
      </div>

      {/* Bottom 12-Segment Progress Rail */}
      <div
        style={{
          position: "absolute",
          bottom: 22,
          right: 72,
          left: 72,
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 8,
          zIndex: 25,
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const idx = i + 1;
          const isDone = idx < slideIndex;
          const isCurrent = idx === slideIndex;
          const fillPct = isCurrent
            ? interpolate(frame, [0, durationInFrames], [0, 100], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : isDone
              ? 100
              : 0;
          return (
            <div
              key={idx}
              style={{
                height: 4,
                borderRadius: 99,
                background: "rgba(255,255,255,0.09)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${fillPct}%`,
                  background: isCurrent
                    ? accent
                    : "rgba(0, 212, 182, 0.58)",
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
