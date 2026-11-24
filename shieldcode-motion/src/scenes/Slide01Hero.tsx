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
import { EASE, FONTS, PALETTE } from "../theme";
import {
  AlgerianFlagBadge,
  CorporateStage,
  SovereignIcon,
  useCardMotion,
} from "../components/CorporateStage";

export const Slide01Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outStrong,
  });

  const titleIn = spring({
    frame: frame - 6,
    fps,
    config: { damping: 18, stiffness: 155, mass: 0.9 },
  });

  const subIn = spring({
    frame: frame - 16,
    fps,
    config: { damping: 18, stiffness: 165 },
  });

  const vaultCard = useCardMotion(14, 28);
  const p1 = useCardMotion(26, 18);
  const p2 = useCardMotion(32, 18);
  const p3 = useCardMotion(37, 18);

  const ringAngle = frame * 0.48;
  const shimmerX = interpolate(frame % 135, [0, 95], [-120, 220], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const CHANNELS = ["SMS فوري", "البريد الرسمي", "إشعارات التطبيق"];
  const activeChannelIdx = Math.floor(frame / 45) % 3;

  return (
    <CorporateStage
      slideIndex={1}
      accent={PALETTE.teal}
      secondaryAccent={PALETTE.amber}
      hideChrome
    >
      <Sequence from={10} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.42} />
      </Sequence>
      <Sequence from={28} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.28fr 0.92fr",
          gap: 48,
          alignItems: "center",
          width: "100%",
          height: "100%",
        }}
      >
        {/* RIGHT COLUMN: Executive Pitch Identity */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Eyebrow Pill */}
          <div
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(245, 166, 35, 0.14)",
              border: "1px solid rgba(245, 166, 35, 0.48)",
              borderRadius: 999,
              padding: "9px 24px",
              opacity: badgeIn,
              translate: `0px ${interpolate(badgeIn, [0, 1], [12, 0])}px`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <AlgerianFlagBadge width={30} height={20} />
            <span
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: PALETTE.amberSoft,
              }}
            >
              عرض تنفيذي للمستثمرين والشركاء • الجزائر 2026
            </span>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.28) 50%, transparent 65%)",
                translate: `${shimmerX}% 0`,
              }}
            />
          </div>

          {/* Main Display Title */}
          <div
            style={{
              opacity: titleIn,
              translate: `0px ${interpolate(titleIn, [0, 1], [24, 0])}px`,
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                lineHeight: 1.16,
                color: PALETTE.white,
              }}
            >
              رمز مكافحة التصيّد
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                lineHeight: 1.18,
                background: `linear-gradient(90deg, ${PALETTE.teal} 0%, ${PALETTE.cyan} 55%, ${PALETTE.amberSoft} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              والدرع المالي السيادي
            </div>
          </div>

          {/* Sub-Brand Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              opacity: subIn,
            }}
          >
            <span
              dir="ltr"
              style={{
                fontFamily: FONTS.mono,
                fontSize: 26,
                fontWeight: 700,
                color: PALETTE.teal,
                background: "rgba(0, 212, 182, 0.12)",
                border: "1px solid rgba(0, 212, 182, 0.35)",
                borderRadius: 12,
                padding: "6px 18px",
              }}
            >
              ShieldCode & SecurePay
            </span>
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: PALETTE.amberSoft,
              }}
            >
              (منظومة موثوق / DzExpress)
            </span>
          </div>

          {/* Executive Summary Lead */}
          <p
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 600,
              lineHeight: 1.62,
              color: PALETTE.soft,
              opacity: subIn,
              maxWidth: 960,
              unicodeBidi: "plaintext",
            }}
          >
            البنية التحتية السيادية الأولى في الجزائر لحماية الاتصالات المالية والمدفوعات الرقمية: دمج كود الأمان الشخصي المسبق مع المصادقة البيومترية الحية ونواة التشفير{" "}
            <span
              dir="ltr"
              style={{ fontFamily: FONTS.mono, color: PALETTE.cyan, fontWeight: 700 }}
            >
              Rust / Axum
            </span>
            .
          </p>

          {/* 3 Sovereign Metric Pillars */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 18,
              marginTop: 8,
            }}
          >
            {[
              {
                motion: p1,
                title: "نواة Rust / Axum",
                sub: "AES-256-GCM + Zeroize",
                accent: PALETTE.cyan,
                icon: "cpu" as const,
              },
              {
                motion: p2,
                title: "القانون 18-07",
                sub: "سيادة كاملة + عزل RLS",
                accent: PALETTE.teal,
                icon: "globe" as const,
              },
              {
                motion: p3,
                title: "16 مؤسسة مالية",
                sub: "بريد الجزائر + 27 مساراً",
                accent: PALETTE.amber,
                icon: "building" as const,
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: PALETTE.panel,
                  border: `1.5px solid ${item.accent}55`,
                  borderTop: "1.5px solid rgba(255,255,255,0.2)",
                  borderRadius: 20,
                  padding: "16px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  opacity: item.motion.opacity,
                  translate: item.motion.translate,
                  scale: item.motion.scale,
                  boxShadow: "0 16px 36px rgba(0,0,0,0.42)",
                }}
              >
                <SovereignIcon kind={item.icon} color={item.accent} size={48} />
                <div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: PALETTE.white,
                      unicodeBidi: "plaintext",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: item.accent,
                      unicodeBidi: "plaintext",
                    }}
                  >
                    {item.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LEFT COLUMN: Live Active Verification Seal Vault Showcase */}
        <div
          style={{
            background:
              "linear-gradient(155deg, rgba(13, 31, 60, 0.94), rgba(6, 14, 28, 0.98))",
            border: `2px solid ${PALETTE.teal}77`,
            borderTop: "2px solid rgba(255,255,255,0.28)",
            borderRadius: 34,
            padding: "36px 34px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            opacity: vaultCard.opacity,
            translate: vaultCard.translate,
            scale: vaultCard.scale,
            boxShadow: `0 30px 70px rgba(0,0,0,0.65), 0 0 60px ${PALETTE.teal}22`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Rotating Radar Emblem */}
          <div
            style={{
              position: "relative",
              width: 196,
              height: 196,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: `2px dashed ${PALETTE.teal}66`,
                rotate: `${ringAngle}deg`,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 18,
                borderRadius: "50%",
                border: `1.5px solid ${PALETTE.amber}55`,
                rotate: `${-ringAngle * 0.7}deg`,
              }}
            />
            <SovereignIcon kind="shield" color={PALETTE.teal} size={118} />
          </div>

          {/* Active Stamp Display */}
          <div
            style={{
              width: "100%",
              background: "rgba(4, 9, 20, 0.88)",
              border: `2px solid ${PALETTE.teal}`,
              borderRadius: 22,
              padding: "20px 24px",
              textAlign: "center",
              boxShadow: `0 0 32px ${PALETTE.teal}2e`,
            }}
          >
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: PALETTE.muted,
                marginBottom: 8,
              }}
            >
              ختم التحقق السيادي النشط
            </div>
            <div
              dir="ltr"
              style={{
                fontFamily: FONTS.mono,
                fontSize: 38,
                fontWeight: 700,
                color: PALETTE.teal,
                letterSpacing: "0.06em",
              }}
            >
              DZ-SHIELD-94
            </div>
          </div>

          {/* Multi-Channel Live Pulse Pills */}
          <div style={{ width: "100%" }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: PALETTE.soft,
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              حماية فورية موحّدة عبر القنوات الرسمية:
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
              }}
            >
              {CHANNELS.map((ch, idx) => {
                const active = idx === activeChannelIdx;
                return (
                  <div
                    key={ch}
                    style={{
                      textAlign: "center",
                      padding: "10px 8px",
                      borderRadius: 14,
                      fontSize: 16,
                      fontWeight: 800,
                      background: active
                        ? "rgba(0, 212, 182, 0.22)"
                        : "rgba(255,255,255,0.04)",
                      border: `1.5px solid ${
                        active ? PALETTE.teal : "rgba(255,255,255,0.09)"
                      }`,
                      color: active ? PALETTE.white : PALETTE.muted,
                    }}
                  >
                    ✓ {ch}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </CorporateStage>
  );
};
