import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONTS, LIGHT } from "../theme";

export type StudioIconName =
  | "shield"
  | "alert"
  | "card"
  | "lock"
  | "unlock"
  | "camera"
  | "link"
  | "key"
  | "phone"
  | "mail"
  | "bolt"
  | "cpu"
  | "database"
  | "globe"
  | "building"
  | "truck"
  | "chart"
  | "check"
  | "userOff";

export const StudioIcon: React.FC<{
  readonly name: StudioIconName;
  readonly color?: string;
  readonly bg?: string;
  readonly size?: number;
}> = ({
  name,
  color = LIGHT.teal,
  bg = LIGHT.tealSoft,
  size = 84,
}) => {
  const iconPx = Math.round(size * 0.48);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
        background: `linear-gradient(145deg, #FFFFFF 0%, ${bg} 100%)`,
        border: `2px solid ${color}30`,
        boxShadow: `0 16px 34px -8px ${color}28, 0 4px 10px rgba(15,23,42,0.05)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={iconPx}
        height={iconPx}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {name === "shield" && (
          <>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={`${color}18`} />
            <path d="m9 12 2 2 4-4" />
          </>
        )}
        {name === "alert" && (
          <>
            <path
              d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
              fill={`${color}16`}
            />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </>
        )}
        {name === "card" && (
          <>
            <rect width="20" height="14" x="2" y="5" rx="2.5" fill={`${color}16`} />
            <line x1="2" x2="22" y1="10" y2="10" />
          </>
        )}
        {name === "lock" && (
          <>
            <rect width="18" height="11" x="3" y="11" rx="2.5" fill={`${color}16`} />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </>
        )}
        {name === "unlock" && (
          <>
            <rect width="18" height="11" x="3" y="11" rx="2.5" fill={`${color}16`} />
            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
          </>
        )}
        {name === "camera" && (
          <>
            <path
              d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"
              fill={`${color}14`}
            />
            <circle cx="12" cy="13" r="3.2" />
          </>
        )}
        {name === "link" && (
          <>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </>
        )}
        {name === "key" && (
          <>
            <circle cx="7.5" cy="15.5" r="5.5" fill={`${color}16`} />
            <path d="m21 2-9.6 9.6" />
            <path d="m15.5 7.5 3 3L22 7l-3-3" />
          </>
        )}
        {name === "phone" && (
          <>
            <rect width="14" height="20" x="5" y="2" rx="2.5" fill={`${color}14`} />
            <path d="M12 18h.01" />
          </>
        )}
        {name === "mail" && (
          <>
            <rect width="20" height="16" x="2" y="4" rx="2.5" fill={`${color}14`} />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </>
        )}
        {name === "bolt" && (
          <polygon
            points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
            fill={`${color}18`}
          />
        )}
        {name === "cpu" && (
          <>
            <rect x="4" y="4" width="16" height="16" rx="2.5" fill={`${color}14`} />
            <rect x="9" y="9" width="6" height="6" />
            <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
          </>
        )}
        {name === "database" && (
          <>
            <ellipse cx="12" cy="5" rx="9" ry="3" fill={`${color}18`} />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
          </>
        )}
        {name === "globe" && (
          <>
            <circle cx="12" cy="12" r="10" fill={`${color}12`} />
            <line x1="2" x2="22" y1="12" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </>
        )}
        {name === "building" && (
          <>
            <rect width="16" height="20" x="4" y="2" rx="2" fill={`${color}14`} />
            <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
          </>
        )}
        {name === "truck" && (
          <>
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" fill={`${color}14`} />
            <path d="M15 18H9" />
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
            <circle cx="17" cy="18" r="2" />
            <circle cx="7" cy="18" r="2" />
          </>
        )}
        {name === "chart" && (
          <>
            <line x1="18" x2="18" y1="20" y2="10" />
            <line x1="12" x2="12" y1="20" y2="4" />
            <line x1="6" x2="6" y1="20" y2="14" />
          </>
        )}
        {name === "check" && (
          <>
            <circle cx="12" cy="12" r="10" fill={`${color}18`} />
            <path d="m9 12 2 2 4-4" />
          </>
        )}
        {name === "userOff" && (
          <>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" fill={`${color}14`} />
            <line x1="17" x2="22" y1="8" y2="13" />
            <line x1="22" x2="17" y1="8" y2="13" />
          </>
        )}
      </svg>
    </div>
  );
};

export const AlgerianFlagIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 34,
  height = 23,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 36 24"
    style={{
      borderRadius: 5,
      flexShrink: 0,
      boxShadow: "0 3px 10px rgba(15, 23, 42, 0.14)",
      border: "1px solid rgba(15, 23, 42, 0.08)",
    }}
  >
    <rect width="18" height="24" x="0" y="0" fill="#006233" />
    <rect width="18" height="24" x="18" y="0" fill="#ffffff" />
    <circle cx="18" cy="12" r="6" fill="#d21034" />
    <circle cx="19.6" cy="12" r="4.8" fill="#ffffff" />
    <path d="M19.2 12L23.2 10.6L20.8 14L20.8 10L23.2 13.4Z" fill="#d21034" />
  </svg>
);

export const EdahabiaCardIllustration: React.FC<{
  readonly maskedNumber?: string;
  readonly statusLabel?: string;
  readonly statusColor?: string;
  readonly width?: number;
}> = ({
  maskedNumber = "6280  ••••  ••••  4821",
  statusLabel = "بريد الجزائر • EDAHABIA",
  statusColor = "#FEF3C7",
  width = 500,
}) => {
  const frame = useCurrentFrame();
  const floatY = Math.sin(frame / 26) * 6;
  const tiltDeg = Math.cos(frame / 35) * 1.4;

  return (
    <div
      style={{
        width,
        borderRadius: 30,
        padding: "30px 34px",
        background:
          "linear-gradient(135deg, #F59E0B 0%, #D97706 52%, #B45309 100%)",
        boxShadow:
          "0 32px 65px -15px rgba(217, 119, 6, 0.38), 0 10px 24px rgba(15,23,42,0.12), inset 0 2px 2px rgba(255,255,255,0.45)",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        translate: `0px ${floatY}px`,
        rotate: `${tiltDeg}deg`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle geometric card sheen */}
      <div
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: "50%",
          top: -90,
          left: -70,
          background: "rgba(255,255,255,0.14)",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 23, fontWeight: 900, color: statusColor }}>
          {statusLabel}
        </span>
        {/* Gold EMV Chip */}
        <div
          style={{
            width: 54,
            height: 40,
            borderRadius: 9,
            background: "linear-gradient(135deg, #FEF9C3 0%, #FDE047 100%)",
            border: "1.5px solid rgba(120, 53, 15, 0.35)",
            boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8)",
          }}
        />
      </div>

      <div
        dir="ltr"
        style={{
          fontFamily: FONTS.mono,
          fontSize: 33,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textAlign: "center",
          textShadow: "0 2px 8px rgba(0,0,0,0.22)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {maskedNumber}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 17,
          fontWeight: 800,
          color: "#FEF3C7",
        }}
      >
        <span>حماية فورية عبر ShieldCode</span>
        <span dir="ltr" style={{ fontFamily: FONTS.mono }}>
          BIN 6280
        </span>
      </div>
    </div>
  );
};

export const useSpringPop = (delay = 0, distanceY = 26) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - delay,
    fps,
    config: { damping: 17, stiffness: 165, mass: 0.85 },
  });
  return {
    opacity: interpolate(p, [0, 1], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    translate: `0px ${interpolate(p, [0, 1], [distanceY, 0])}px`,
    scale: interpolate(p, [0, 1], [0.94, 1]),
    p,
  };
};

export const KineticHeadline: React.FC<{
  readonly text: string;
  readonly highlight?: string;
  readonly highlightColor?: string;
  readonly size?: number;
  readonly delay?: number;
  readonly align?: "center" | "right";
}> = ({
  text,
  highlight,
  highlightColor = LIGHT.teal,
  size = 58,
  delay = 4,
  align = "center",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: Math.round(size * 0.24),
        rowGap: 6,
        fontFamily: FONTS.arabic,
        fontSize: size,
        fontWeight: 900,
        lineHeight: 1.28,
        color: LIGHT.ink,
        unicodeBidi: "plaintext",
      }}
    >
      {words.map((w, i) => {
        const sp = spring({
          frame: frame - delay - i * 2,
          fps,
          config: { damping: 18, stiffness: 185, mass: 0.8 },
        });
        const isHl = highlight ? highlight.split(" ").some((hw) => w.includes(hw)) : false;
        return (
          <span
            key={`${w}-${i}`}
            style={{
              display: "inline-block",
              opacity: interpolate(sp, [0, 1], [0, 1]),
              translate: `0px ${interpolate(sp, [0, 1], [20, 0])}px`,
              color: isHl ? highlightColor : LIGHT.ink,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const DaylightStage: React.FC<{
  readonly beatIndex: number;
  readonly totalBeats?: number;
  readonly tintA?: string;
  readonly tintB?: string;
  readonly tag?: string;
  readonly tagColor?: string;
  readonly children: React.ReactNode;
}> = ({
  beatIndex,
  totalBeats = 17,
  tintA = LIGHT.tealBg,
  tintB = LIGHT.blueBg,
  tag,
  tagColor = LIGHT.teal,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const driftX = Math.sin(frame / 55) * 45;
  const driftY = Math.cos(frame / 65) * 35;

  const overallPct =
    ((beatIndex - 1 + frame / durationInFrames) / totalBeats) * 100;

  return (
    <AbsoluteFill
      dir="rtl"
      lang="ar"
      style={{
        backgroundColor: LIGHT.canvas,
        fontFamily: FONTS.arabic,
        color: LIGHT.ink,
        overflow: "hidden",
      }}
    >
      {/* Airy Daylight Pastel Light Washes */}
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          top: -480 + driftY,
          right: -260 + driftX,
          background: `radial-gradient(circle, ${tintA}AA 0%, ${tintA}33 42%, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1150,
          height: 1150,
          borderRadius: "50%",
          bottom: -480 - driftY,
          left: -240 - driftX,
          background: `radial-gradient(circle, ${tintB}99 0%, ${tintB}28 42%, transparent 70%)`,
        }}
      />

      {/* Crisp Subtle Studio Dot Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(15, 23, 42, 0.075) 1.25px, transparent 1.25px)",
          backgroundSize: "38px 38px",
        }}
      />

      {/* Minimal Studio Top Corner Pill (Clean, never PowerPoint-heavy) */}
      <div
        style={{
          position: "absolute",
          top: 38,
          right: 68,
          left: 68,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(255,255,255,0.85)",
            border: `1px solid ${LIGHT.border}`,
            borderRadius: 999,
            padding: "8px 20px",
            boxShadow: "0 4px 14px rgba(15,23,42,0.04)",
          }}
        >
          <AlgerianFlagIcon width={26} height={18} />
          <span
            dir="ltr"
            style={{
              fontFamily: FONTS.mono,
              fontSize: 17,
              fontWeight: 700,
              color: LIGHT.ink,
            }}
          >
            Shield<span style={{ color: LIGHT.teal }}>Code</span> & Secure
            <span style={{ color: LIGHT.gold }}>Pay</span>
          </span>
        </div>

        {tag && (
          <div
            style={{
              background: `${tagColor}14`,
              border: `1.5px solid ${tagColor}35`,
              color: tagColor,
              borderRadius: 999,
              padding: "7px 22px",
              fontSize: 18,
              fontWeight: 800,
              unicodeBidi: "plaintext",
            }}
          >
            {tag}
          </div>
        )}
      </div>

      {/* Generous Single-Focus Center Stage */}
      <div
        style={{
          position: "absolute",
          top: 108,
          bottom: 64,
          right: 96,
          left: 96,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        {children}
      </div>

      {/* Ultra-Minimal Continuous Film Progress Line at Bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          left: 0,
          height: 6,
          background: "rgba(15, 23, 42, 0.06)",
          zIndex: 25,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${overallPct}%`,
            background: `linear-gradient(90deg, ${LIGHT.goldBright}, ${LIGHT.teal})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
