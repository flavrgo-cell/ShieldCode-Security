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
import { FONTS, LIGHT } from "../theme";
import {
  AlgerianFlagIcon,
  DaylightStage,
  EdahabiaCardIllustration,
  KineticHeadline,
  StudioIcon,
  useSpringPop,
} from "../components/DaylightStage";

/* ============================================================================
   BEAT 01: Daylight Brand Reveal (Single Hero Emblem + Crisp Identity)
   ============================================================================ */
export const Beat01BrandReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const emblem = spring({
    frame: frame - 4,
    fps,
    config: { damping: 15, stiffness: 150 },
  });
  const pill = useSpringPop(24, 18);
  const seal = useSpringPop(42, 20);
  const orbitDeg = frame * 0.55;

  return (
    <DaylightStage
      beatIndex={1}
      tintA={LIGHT.tealBg}
      tintB={LIGHT.goldBg}
      tag="الجزائر 2026 • عرض تنفيذي"
      tagColor={LIGHT.teal}
    >
      <Sequence from={8} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.4} />
      </Sequence>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        }}
      >
        {/* Hero Luminous 3D Porcelain Shield Emblem */}
        <div
          style={{
            position: "relative",
            width: 210,
            height: 210,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: emblem,
            scale: interpolate(emblem, [0, 1], [0.82, 1]),
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `2.5px dashed ${LIGHT.teal}45`,
              rotate: `${orbitDeg}deg`,
            }}
          />
          <div
            style={{
              width: 152,
              height: 152,
              borderRadius: 42,
              background: "#FFFFFF",
              boxShadow: LIGHT.shadowHero,
              border: `2px solid ${LIGHT.teal}35`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <StudioIcon
              name="shield"
              color={LIGHT.teal}
              bg={LIGHT.tealSoft}
              size={112}
            />
          </div>
        </div>

        {/* Brand Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            background: "#FFFFFF",
            border: `1.5px solid ${LIGHT.border}`,
            borderRadius: 999,
            padding: "10px 28px",
            boxShadow: LIGHT.shadowSoft,
            opacity: pill.opacity,
            translate: pill.translate,
          }}
        >
          <AlgerianFlagIcon width={30} height={20} />
          <span
            dir="ltr"
            style={{
              fontFamily: FONTS.mono,
              fontSize: 24,
              fontWeight: 700,
              color: LIGHT.teal,
            }}
          >
            ShieldCode & SecurePay
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, color: LIGHT.gold }}>
            • منظومة موثوق / DzExpress
          </span>
        </div>

        <KineticHeadline
          text="رمز مكافحة التصيّد والدرع المالي السيادي"
          highlight="مكافحة التصيّد السيادي"
          highlightColor={LIGHT.teal}
          size={66}
          delay={16}
        />

        {/* Active Seal Example Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            background: LIGHT.tealSoft,
            border: `2px solid ${LIGHT.teal}`,
            borderRadius: 20,
            padding: "14px 32px",
            opacity: seal.opacity,
            translate: seal.translate,
            scale: seal.scale,
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 800, color: LIGHT.inkSecondary }}>
            ختم التحقق النشط:
          </span>
          <span
            dir="ltr"
            style={{
              fontFamily: FONTS.mono,
              fontSize: 26,
              fontWeight: 700,
              color: LIGHT.teal,
              background: "#FFFFFF",
              padding: "4px 18px",
              borderRadius: 12,
              border: `1px solid ${LIGHT.teal}40`,
            }}
          >
            DZ-SHIELD-94 ✓
          </span>
        </div>
      </div>
    </DaylightStage>
  );
};

/* ============================================================================
   BEAT 02: Rapid Growth of Digital Payments in Algeria + The Threat Shadow
   ============================================================================ */
export const Beat02EdahabiaBoom: React.FC = () => {
  const cardIn = useSpringPop(6, 30);
  const alertPill = useSpringPop(62, 22);

  return (
    <DaylightStage
      beatIndex={2}
      tintA={LIGHT.goldBg}
      tintB={LIGHT.roseBg}
      tag="السياق الوطني • المدفوعات الرقمية"
      tagColor={LIGHT.gold}
    >
      <Sequence from={10} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={64} layout="none">
        <Audio src={staticFile("sfx/threat_pulse.wav")} volume={0.3} />
      </Sequence>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 34,
        }}
      >
        <div
          style={{
            position: "relative",
            opacity: cardIn.opacity,
            translate: cardIn.translate,
            scale: cardIn.scale,
          }}
        >
          {/* Floating CIB companion card behind */}
          <div
            style={{
              position: "absolute",
              top: -18,
              left: -65,
              width: 240,
              padding: "16px 22px",
              borderRadius: 22,
              background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
              color: "#FFFFFF",
              fontFamily: FONTS.mono,
              fontSize: 20,
              fontWeight: 700,
              rotate: "-8deg",
              boxShadow: LIGHT.shadowSoft,
            }}
          >
            CIB • BaridiMob
          </div>
          <EdahabiaCardIllustration width={540} />
        </div>

        <KineticHeadline
          text="ملايين المعاملات الرقمية يومياً بالبطاقة الذهبية و CIB"
          highlight="بالبطاقة الذهبية CIB"
          highlightColor={LIGHT.gold}
          size={54}
          delay={22}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: LIGHT.roseSoft,
            border: `2px solid ${LIGHT.rose}`,
            borderRadius: 22,
            padding: "16px 34px",
            boxShadow: LIGHT.shadowSoft,
            opacity: alertPill.opacity,
            translate: alertPill.translate,
            scale: alertPill.scale,
          }}
        >
          <StudioIcon
            name="alert"
            color={LIGHT.rose}
            bg={LIGHT.roseBg}
            size={54}
          />
          <span style={{ fontSize: 27, fontWeight: 900, color: LIGHT.rose }}>
            لكن 3 ثغرات خطيرة يستغلها المحتالون يومياً!
          </span>
        </div>
      </div>
    </DaylightStage>
  );
};

/* ============================================================================
   BEAT 03: Threat 1 — Live Fake Smishing SMS Example on One Smartphone
   ============================================================================ */
export const Beat03FakeSmsExample: React.FC = () => {
  const frame = useCurrentFrame();
  const phoneIn = useSpringPop(6, 32);
  const smsBubble = useSpringPop(30, 20);
  const stamp = useSpringPop(68, 16);

  const shakeX =
    frame >= 68 && frame <= 92 ? Math.sin((frame - 68) * 1.4) * 7 : 0;

  return (
    <DaylightStage
      beatIndex={3}
      tintA={LIGHT.roseBg}
      tintB={LIGHT.goldBg}
      tag="الثغرة 01 • التصيّد عبر الرسائل (Smishing)"
      tagColor={LIGHT.rose}
    >
      <Sequence from={30} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={68} layout="none">
        <Audio src={staticFile("sfx/threat_pulse.wav")} volume={0.34} />
      </Sequence>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "0.95fr 1.05fr",
          gap: 56,
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* RIGHT: Single Big Headline & Explanation */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <StudioIcon
            name="phone"
            color={LIGHT.rose}
            bg={LIGHT.roseBg}
            size={88}
          />
          <KineticHeadline
            text="رسالة مزيفة تنتحل صفة بريد الجزائر أو شركة توصيل"
            highlight="مزيفة تنتحل"
            highlightColor={LIGHT.rose}
            size={52}
            delay={10}
            align="right"
          />
          <p
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 600,
              color: LIGHT.inkSecondary,
              lineHeight: 1.6,
            }}
          >
            لا توجد أي علامة بصرية يميّز بها المواطن بين رسالة البنك الحقيقية ورسالة السارق!
          </p>
        </div>

        {/* LEFT: Clean Daylight Smartphone Mockup Showing the Exact Scam SMS */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 42,
            border: "8px solid #1E293B",
            padding: "28px 26px",
            boxShadow: LIGHT.shadowHero,
            opacity: phoneIn.opacity,
            translate: `${shakeX}px ${interpolate(phoneIn.p, [0, 1], [32, 0])}px`,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Phone Top Sender Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${LIGHT.border}`,
              paddingBottom: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: LIGHT.goldBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 18,
                  color: LIGHT.gold,
                }}
              >
                DZ
              </div>
              <div>
                <div
                  dir="ltr"
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 20,
                    fontWeight: 700,
                    color: LIGHT.ink,
                  }}
                >
                  AlgeriePoste-Info
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: LIGHT.rose }}>
                  مرسل منتحل (Spoofed ID)
                </div>
              </div>
            </div>
            <span style={{ fontSize: 15, color: LIGHT.inkMuted, fontWeight: 700 }}>
              الآن
            </span>
          </div>

          {/* Scam SMS Bubble */}
          <div
            style={{
              background: LIGHT.roseSoft,
              border: `2px solid ${LIGHT.rose}55`,
              borderRadius: 24,
              padding: "22px 24px",
              fontSize: 22,
              fontWeight: 700,
              color: LIGHT.ink,
              lineHeight: 1.6,
              opacity: smsBubble.opacity,
              scale: smsBubble.scale,
            }}
          >
            "عزيزي العميل، تم تعليق بطاقتك الذهبية مؤقتاً. يرجى تحديث بياناتك ورمز OTP فوراً عبر الرابط لتفادي الإغلاق..."
          </div>

          {/* Big Red Verdict Stamp */}
          <div
            style={{
              background: LIGHT.rose,
              color: "#FFFFFF",
              borderRadius: 18,
              padding: "14px 20px",
              fontSize: 21,
              fontWeight: 900,
              textAlign: "center",
              opacity: stamp.opacity,
              scale: stamp.scale,
            }}
          >
            ✗ بدون رمز شخصي — تشبه الرسائل الرسمية تماماً!
          </div>
        </div>
      </div>
    </DaylightStage>
  );
};

/* ============================================================================
   BEAT 04: Threat 2 — Card-Not-Present Fraud (Absent Account Owner)
   ============================================================================ */
export const Beat04GhostBuyer: React.FC = () => {
  const frame = useCurrentFrame();
  const card = useSpringPop(8, 28);
  const typedLen = Math.floor(
    interpolate(frame, [22, 85], [0, 19], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const badge = useSpringPop(72, 18);

  return (
    <DaylightStage
      beatIndex={4}
      tintA={LIGHT.goldBg}
      tintB={LIGHT.roseBg}
      tag="الثغرة 02 • غياب التحقق من الهوية الحية"
      tagColor={LIGHT.gold}
    >
      <Sequence from={12} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={74} layout="none">
        <Audio src={staticFile("sfx/threat_pulse.wav")} volume={0.3} />
      </Sequence>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
          width: "100%",
        }}
      >
        <KineticHeadline
          text="شراء فوري بالبطاقة المسروقة.. دون وجود صاحب الحساب!"
          highlight="المسروقة.. دون وجود"
          highlightColor={LIGHT.rose}
          size={54}
          delay={4}
        />

        {/* Single Visual Illustration: Stolen Checkout + Absent Real Owner */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 34,
            border: `1.5px solid ${LIGHT.border}`,
            boxShadow: LIGHT.shadowHero,
            padding: "34px 44px",
            display: "flex",
            alignItems: "center",
            gap: 44,
            opacity: card.opacity,
            translate: card.translate,
            scale: card.scale,
          }}
        >
          {/* Absent Owner Illustration */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              background: LIGHT.roseSoft,
              border: `2px dashed ${LIGHT.rose}70`,
              borderRadius: 26,
              padding: "28px 34px",
            }}
          >
            <StudioIcon
              name="userOff"
              color={LIGHT.rose}
              bg="#FFFFFF"
              size={96}
            />
            <span style={{ fontSize: 22, fontWeight: 900, color: LIGHT.rose }}>
              هوية المشتري مجهولة!
            </span>
          </div>

          {/* Checkout Form Typing Stolen Digits */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              minWidth: 480,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color: LIGHT.inkMuted }}>
              عملية دفع عن بُعد (Card-Not-Present)
            </div>
            <div
              dir="ltr"
              style={{
                background: LIGHT.cardSubtle,
                border: `2px solid ${LIGHT.gold}`,
                borderRadius: 16,
                padding: "16px 22px",
                fontFamily: FONTS.mono,
                fontSize: 30,
                fontWeight: 700,
                color: LIGHT.ink,
                textAlign: "center",
              }}
            >
              {"6280 0094 8812 4821".slice(0, typedLen) || "6280 ••••"}
            </div>
            <div
              style={{
                background: LIGHT.roseBg,
                color: LIGHT.rose,
                borderRadius: 14,
                padding: "12px 20px",
                fontSize: 20,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                opacity: badge.opacity,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={LIGHT.rose} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>لا يوجد إثبات حضور حي أمام الشاشة وقت الدفع!</span>
            </div>
          </div>
        </div>
      </div>
    </DaylightStage>
  );
};

/* ============================================================================
   BEAT 05: Threat 3 — Raw Card Storage Risk & Law 18-07 Exposure
   ============================================================================ */
export const Beat05ExposedDb: React.FC = () => {
  const dbIn = useSpringPop(8, 28);
  const warnIn = useSpringPop(52, 18);

  return (
    <DaylightStage
      beatIndex={5}
      tintA={LIGHT.blueBg}
      tintB={LIGHT.roseBg}
      tag="الثغرة 03 • غياب الفهرسة العمياء (Zero-Knowledge)"
      tagColor={LIGHT.blue}
    >
      <Sequence from={12} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        <StudioIcon
          name="unlock"
          color={LIGHT.rose}
          bg={LIGHT.roseBg}
          size={96}
        />

        <KineticHeadline
          text="تخزين أرقام البطاقات المكشوفة يعرّضها للتسريب"
          highlight="المكشوفة للتسريب"
          highlightColor={LIGHT.rose}
          size={56}
          delay={8}
        />

        {/* Single Clear Visual Diagram of Exposed Plaintext DB Row */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 28,
            border: `2px solid ${LIGHT.rose}45`,
            boxShadow: LIGHT.shadowHero,
            padding: "28px 42px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            opacity: dbIn.opacity,
            translate: dbIn.translate,
            scale: dbIn.scale,
          }}
        >
          <div style={{ fontSize: 21, fontWeight: 800, color: LIGHT.inkMuted }}>
            قاعدة بيانات تقليدية بدون تشفير صفري المعرفة:
          </div>
          <div
            dir="ltr"
            style={{
              display: "flex",
              gap: 16,
              fontFamily: FONTS.mono,
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            <span
              style={{
                background: LIGHT.roseSoft,
                color: LIGHT.rose,
                border: `1.5px solid ${LIGHT.rose}`,
                padding: "10px 20px",
                borderRadius: 14,
              }}
            >
              PAN: 6280882144904821
            </span>
            <span
              style={{
                background: LIGHT.roseSoft,
                color: LIGHT.rose,
                border: `1.5px solid ${LIGHT.rose}`,
                padding: "10px 20px",
                borderRadius: 14,
              }}
            >
              CVV2: 841
            </span>
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: LIGHT.inkSecondary,
              opacity: warnIn.opacity,
            }}
          >
            مخاطرة أمنية عالية ومخالفة لقانون حماية البيانات الجزائري{" "}
            <b style={{ color: LIGHT.rose }}>18-07</b>
          </div>
        </div>
      </div>
    </DaylightStage>
  );
};

/* ============================================================================
   BEAT 06: The Solution — Layer 1: Personal Anti-Phishing Secret Seal
   ============================================================================ */
export const Beat06PersonalSeal: React.FC = () => {
  const frame = useCurrentFrame();
  const boxIn = useSpringPop(6, 26);

  const secret = "BACHIR34";
  const chars = Math.floor(
    interpolate(frame, [24, 72], [0, secret.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const locked = frame >= 76;
  const lockPop = useSpringPop(76, 14);

  return (
    <DaylightStage
      beatIndex={6}
      tintA={LIGHT.tealBg}
      tintB={LIGHT.emeraldBg}
      tag="الحل • الطبقة 01 — رمز مكافحة التصيّد الشخصي"
      tagColor={LIGHT.teal}
    >
      <Sequence from={76} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.42} />
      </Sequence>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
        }}
      >
        <StudioIcon
          name={locked ? "shield" : "key"}
          color={LIGHT.teal}
          bg={LIGHT.tealSoft}
          size={98}
        />

        <KineticHeadline
          text="الحل يبدأ بكلمة سرية شخصية يختارها العميل بنفسه!"
          highlight="بكلمة سرية شخصية"
          highlightColor={LIGHT.teal}
          size={56}
          delay={6}
        />

        {/* Interactive Typing Vault Input Card */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 32,
            border: `2.5px solid ${locked ? LIGHT.teal : LIGHT.border}`,
            boxShadow: LIGHT.shadowHero,
            padding: "30px 52px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            opacity: boxIn.opacity,
            translate: boxIn.translate,
            scale: boxIn.scale,
          }}
        >
          <span style={{ fontSize: 21, fontWeight: 800, color: LIGHT.inkMuted }}>
            إعداد الرمز الشخصي المسبق (6 إلى 12 حرفاً أو رقماً):
          </span>

          <div
            dir="ltr"
            style={{
              minWidth: 380,
              background: LIGHT.tealSoft,
              border: `2px solid ${LIGHT.teal}`,
              borderRadius: 20,
              padding: "18px 34px",
              fontFamily: FONTS.mono,
              fontSize: 48,
              fontWeight: 700,
              color: LIGHT.teal,
              textAlign: "center",
              letterSpacing: "0.08em",
            }}
          >
            {secret.slice(0, chars)}
            {!locked && <span style={{ opacity: frame % 16 < 8 ? 1 : 0 }}>|</span>}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 22,
              fontWeight: 800,
              color: LIGHT.emerald,
              opacity: lockPop.opacity,
              scale: lockPop.scale,
            }}
          >
            <span>✓ مشفّر بـ AES-256-GCM • سر حصري بينك وبين مؤسستك المالية!</span>
          </div>
        </div>
      </div>
    </DaylightStage>
  );
};
