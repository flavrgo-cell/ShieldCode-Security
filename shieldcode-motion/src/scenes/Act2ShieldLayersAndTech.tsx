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
  DaylightStage,
  EdahabiaCardIllustration,
  KineticHeadline,
  StudioIcon,
  useSpringPop,
} from "../components/DaylightStage";

/* ============================================================================
   BEAT 07: Live Verified SMS Example — 1-Second Visual Recognition
   ============================================================================ */
export const Beat07InstantVerifySms: React.FC = () => {
  const phoneIn = useSpringPop(6, 30);
  const sealBadge = useSpringPop(34, 16);
  const verdict = useSpringPop(64, 16);

  return (
    <DaylightStage
      beatIndex={7}
      tintA={LIGHT.emeraldBg}
      tintB={LIGHT.tealBg}
      tag="مثال تطبيقي • التحقق في ثانية واحدة"
      tagColor={LIGHT.emerald}
    >
      <Sequence from={34} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.42} />
      </Sequence>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "0.95fr 1.05fr",
          gap: 54,
          alignItems: "center",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <StudioIcon
            name="check"
            color={LIGHT.emerald}
            bg={LIGHT.emeraldBg}
            size={88}
          />
          <KineticHeadline
            text="بمجرد رؤية رمزك السري.. تتأكد فوراً أن الرسالة أصلية!"
            highlight="رمزك السري.. أصلية!"
            highlightColor={LIGHT.emerald}
            size={50}
            delay={8}
            align="right"
          />
          <p
            style={{
              margin: 0,
              fontSize: 25,
              fontWeight: 600,
              color: LIGHT.inkSecondary,
              lineHeight: 1.6,
            }}
          >
            يظهر الرمز في السطر الأول دائماً قبل أي مبلغ أو رابط، دون حاجة لأي جهاز إضافي.
          </p>
        </div>

        {/* Crisp Daylight Phone with Verified ShieldCode SMS */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 42,
            border: "8px solid #0F172A",
            padding: "28px 26px",
            boxShadow: LIGHT.shadowHero,
            opacity: phoneIn.opacity,
            translate: phoneIn.translate,
            scale: phoneIn.scale,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `1px solid ${LIGHT.border}`,
              paddingBottom: 12,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.arabic,
                fontSize: 20,
                fontWeight: 800,
                color: LIGHT.ink,
              }}
            >
              بريد الجزائر • <span dir="ltr" style={{ fontFamily: FONTS.mono }}>ShieldCode</span>
            </span>
            <span
              style={{
                background: LIGHT.emeraldBg,
                color: LIGHT.emerald,
                borderRadius: 999,
                padding: "4px 14px",
                fontSize: 15,
                fontWeight: 900,
              }}
            >
              قناة رسمية ✓
            </span>
          </div>

          <div
            style={{
              background: LIGHT.tealSoft,
              border: `2px solid ${LIGHT.teal}`,
              borderRadius: 24,
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* First Line Fixed Seal */}
            <div
              style={{
                alignSelf: "flex-start",
                background: LIGHT.teal,
                color: "#FFFFFF",
                borderRadius: 12,
                padding: "6px 18px",
                fontSize: 21,
                fontWeight: 900,
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: sealBadge.opacity,
                scale: sealBadge.scale,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>رمزك الأمني: <span dir="ltr" style={{ fontFamily: FONTS.mono }}>BACHIR34</span></span>
            </div>

            <div
              style={{
                fontSize: 21,
                fontWeight: 700,
                color: LIGHT.ink,
                lineHeight: 1.55,
                unicodeBidi: "plaintext",
              }}
            >
              هذه الرسالة رسمية من منصتنا. تأكيد معاملة بقيمة{" "}
              <b style={{ color: LIGHT.teal }}>14,500 د.ج</b> عبر بوابة{" "}
              <span dir="ltr" style={{ fontFamily: FONTS.mono, color: LIGHT.blue }}>
                /go/a8f9
              </span>
            </div>
          </div>

          <div
            style={{
              background: LIGHT.emerald,
              color: "#FFFFFF",
              borderRadius: 18,
              padding: "14px 20px",
              fontSize: 20,
              fontWeight: 900,
              textAlign: "center",
              opacity: verdict.opacity,
              scale: verdict.scale,
            }}
          >
            ✓ تحقق بصري فوري خلال ثانية واحدة!
          </div>
        </div>
      </div>
    </DaylightStage>
  );
};

/* ============================================================================
   BEAT 08: Layer 2 — Live Biometric WebRTC Selfie Liveness
   ============================================================================ */
export const Beat08BiometricSelfie: React.FC = () => {
  const frame = useCurrentFrame();
  const lensIn = useSpringPop(6, 26);
  const scanY = interpolate(frame % 70, [0, 70], [18, 200]);
  const approved = frame >= 75;
  const approveBadge = useSpringPop(75, 16);

  return (
    <DaylightStage
      beatIndex={8}
      tintA={LIGHT.blueBg}
      tintB={LIGHT.tealBg}
      tag="الطبقة 02 • إثبات الحضور الحي (WebRTC Selfie)"
      tagColor={LIGHT.blue}
    >
      <Sequence from={12} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={76} layout="none">
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
        {/* Single Hero Biometric Viewfinder Illustration */}
        <div
          style={{
            position: "relative",
            width: 248,
            height: 248,
            borderRadius: "50%",
            background: "#FFFFFF",
            border: `5px solid ${approved ? LIGHT.emerald : LIGHT.blue}`,
            boxShadow: LIGHT.shadowHero,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            opacity: lensIn.opacity,
            scale: lensIn.scale,
          }}
        >
          {/* Clean Vector Person Portrait SVG */}
          <svg width="136" height="136" viewBox="0 0 64 64" fill="none">
            <circle
              cx="32"
              cy="23"
              r="11"
              fill={`${LIGHT.blue}22`}
              stroke={approved ? LIGHT.emerald : LIGHT.blue}
              strokeWidth="3"
            />
            <path
              d="M14 54C14 43.5 22 37 32 37C42 37 50 43.5 50 54"
              fill={`${LIGHT.teal}22`}
              stroke={approved ? LIGHT.emerald : LIGHT.blue}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>

          {/* Sweeping Laser Scan Bar */}
          {!approved && (
            <div
              style={{
                position: "absolute",
                left: 16,
                right: 16,
                top: scanY,
                height: 4,
                borderRadius: 99,
                background: `linear-gradient(90deg, transparent, ${LIGHT.tealBright}, transparent)`,
                boxShadow: `0 0 16px ${LIGHT.tealBright}`,
              }}
            />
          )}
        </div>

        <KineticHeadline
          text="المصادقة البيومترية الحية عبر المتصفح (WebRTC)"
          highlight="البيومترية الحية (WebRTC)"
          highlightColor={LIGHT.blue}
          size={54}
          delay={12}
        />

        <div
          style={{
            background: "#FFFFFF",
            border: `2px solid ${LIGHT.emerald}`,
            borderRadius: 22,
            padding: "16px 36px",
            boxShadow: LIGHT.shadowSoft,
            fontSize: 24,
            fontWeight: 800,
            color: LIGHT.emerald,
            opacity: approveBadge.opacity,
            translate: approveBadge.translate,
            scale: approveBadge.scale,
          }}
        >
          ✓ التقاط سيلفي حي مباشر وإرساله مع رمز الأمان لمالك الحساب للموافقة الفورية!
        </div>
      </div>
    </DaylightStage>
  );
};

/* ============================================================================
   BEAT 09: Layer 3 — Encrypted Link Gateway (/go/[hash]) for E-Commerce & Parcels
   ============================================================================ */
export const Beat09SafeLinkGateway: React.FC = () => {
  const cardIn = useSpringPop(8, 28);
  const gateIn = useSpringPop(46, 22);

  return (
    <DaylightStage
      beatIndex={9}
      tintA={LIGHT.tealBg}
      tintB={LIGHT.goldBg}
      tag="الطبقة 03 • بوابة العبور المشفرة (/go/[hash])"
      tagColor={LIGHT.teal}
    >
      <Sequence from={12} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={48} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.38} />
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
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <StudioIcon name="truck" color={LIGHT.gold} bg={LIGHT.goldBg} size={82} />
          <StudioIcon name="link" color={LIGHT.teal} bg={LIGHT.tealSoft} size={82} />
        </div>

        <KineticHeadline
          text="تغليف روابط الدفع وتوصيل الطرود (موثوق / DzExpress)"
          highlight="تغليف روابط (موثوق"
          highlightColor={LIGHT.teal}
          size={52}
          delay={8}
        />

        {/* Single Visual Gateway Browser Capsule */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 30,
            border: `2px solid ${LIGHT.teal}55`,
            boxShadow: LIGHT.shadowHero,
            padding: "28px 42px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            opacity: cardIn.opacity,
            translate: cardIn.translate,
            scale: cardIn.scale,
            minWidth: 820,
          }}
        >
          {/* Browser Address Bar */}
          <div
            dir="ltr"
            style={{
              width: "100%",
              background: LIGHT.cardSubtle,
              borderRadius: 16,
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: FONTS.mono,
              fontSize: 24,
              fontWeight: 700,
              color: LIGHT.ink,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={LIGHT.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>
                https://securepay.dz
                <span style={{ color: LIGHT.teal }}>/go/a8f9k2x9</span>
              </span>
            </span>
            <span
              style={{
                fontSize: 15,
                background: LIGHT.tealBg,
                color: LIGHT.teal,
                padding: "4px 14px",
                borderRadius: 999,
              }}
            >
              128-bit Base64URL
            </span>
          </div>

          {/* Interstitial Trust Preview */}
          <div
            style={{
              width: "100%",
              background: LIGHT.tealSoft,
              border: `1.5px solid ${LIGHT.teal}`,
              borderRadius: 20,
              padding: "18px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              opacity: gateIn.opacity,
              scale: gateIn.scale,
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 900, color: LIGHT.ink }}>
              ✓ يعرض ختمك السري <b style={{ color: LIGHT.teal }}>[BACHIR34]</b> واسم المتجر الموثّق قبل التوجيه!
            </span>
            <span
              style={{
                background: "#FFFFFF",
                border: `1px solid ${LIGHT.teal}`,
                color: LIGHT.teal,
                borderRadius: 12,
                padding: "6px 16px",
                fontSize: 17,
                fontWeight: 800,
              }}
            >
              ميزانية فتح محدودة 1/3
            </span>
          </div>
        </div>
      </div>
    </DaylightStage>
  );
};

/* ============================================================================
   BEAT 10: Layer 4 — Edahabia Zero-Exposure Shield (BIN 6280 & HMAC-SHA256)
   ============================================================================ */
export const Beat10EdahabiaZeroExposure: React.FC = () => {
  const frame = useCurrentFrame();
  const masked = frame >= 52;
  const pillIn = useSpringPop(54, 18);

  return (
    <DaylightStage
      beatIndex={10}
      tintA={LIGHT.goldBg}
      tintB={LIGHT.tealBg}
      tag="الطبقة 04 • درع البطاقة الذهبية (BIN 6280)"
      tagColor={LIGHT.gold}
    >
      <Sequence from={52} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.4} />
      </Sequence>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
        }}
      >
        <EdahabiaCardIllustration
          width={560}
          maskedNumber={
            masked ? "6280  ••••  ••••  4821" : "6280  8821  4490  4821"
          }
          statusLabel={
            masked
              ? "محمية ببصمة HMAC-SHA256 ✓"
              : "البطاقة الذهبية • بريد الجزائر"
          }
        />

        <KineticHeadline
          text="فهرسة عمياء للبطاقة الذهبية بدون تخزين الأرقام نهائياً!"
          highlight="فهرسة عمياء بدون تخزين"
          highlightColor={LIGHT.gold}
          size={52}
          delay={8}
        />

        <div
          style={{
            display: "flex",
            gap: 18,
            opacity: pillIn.opacity,
            translate: pillIn.translate,
            scale: pillIn.scale,
          }}
        >
          {[
            "✓ بصمة عمياء HMAC-SHA256",
            "✓ منع برمجي لتخزين PAN",
            "✓ صفر تخزين لـ CVV2 أو PIN",
          ].map((item) => (
            <div
              key={item}
              style={{
                background: "#FFFFFF",
                border: `1.5px solid ${LIGHT.teal}55`,
                borderRadius: 18,
                padding: "14px 26px",
                boxShadow: LIGHT.shadowSoft,
                fontSize: 21,
                fontWeight: 800,
                color: LIGHT.teal,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </DaylightStage>
  );
};

/* ============================================================================
   BEAT 11: Sequential Spotlight — One Channel at a Time (SMS -> Email -> Push)
   ============================================================================ */
export const Beat11OmniChannel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sequential single spotlight: 0..69 = SMS, 70..139 = Email, 140..210 = Push
  const stageIdx = frame < 70 ? 0 : frame < 140 ? 1 : 2;
  const localFrame = stageIdx === 0 ? frame : stageIdx === 1 ? frame - 70 : frame - 140;

  const pop = spring({
    frame: localFrame,
    fps,
    config: { damping: 16, stiffness: 180 },
  });

  const ITEMS = [
    {
      icon: "phone" as const,
      color: LIGHT.blue,
      bg: LIGHT.blueBg,
      label: "القناة 1 / 3 • الرسائل النصية (SMS)",
      example: '"رمزك الأمني: ABC123 — هذه الرسالة رسمية من منصتنا."',
      sub: "يظهر دائماً في السطر الأول قبل أي مبلغ أو رابط",
    },
    {
      icon: "mail" as const,
      color: LIGHT.teal,
      bg: LIGHT.tealSoft,
      label: "القناة 2 / 3 • البريد الإلكتروني الرسمي (Email)",
      example: "ترويسة البريد: [اسم المرسل الرسمي  |  الرمز: ABC123]",
      sub: "مدمج في الترويسة العلوية بجانب عنوان الدعم الموثق",
    },
    {
      icon: "bolt" as const,
      color: LIGHT.gold,
      bg: LIGHT.goldBg,
      label: "القناة 3 / 3 • إشعارات التطبيق الفورية (App Push)",
      example: "تنبيه دفع موثق  •  رمز الأمان: ABC123",
      sub: "يظهر بخط بارز أسفل عنوان الإشعار لسرعة التحقق",
    },
  ];

  const active = ITEMS[stageIdx];

  return (
    <DaylightStage
      beatIndex={11}
      tintA={active.bg}
      tintB={LIGHT.tealBg}
      tag="تجربة موحّدة • كافة قنوات الاتصال"
      tagColor={active.color}
    >
      <Sequence from={2} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={70} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={140} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.35} />
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
        <KineticHeadline
          text="نفس الرمز الشخصي يرافقك في كل قناة اتصال رسمية"
          highlight="نفس الرمز الشخصي"
          highlightColor={active.color}
          size={52}
          delay={2}
        />

        {/* ONE Single Spotlight Card Morphing Cleanly */}
        <div
          style={{
            width: 920,
            background: "#FFFFFF",
            borderRadius: 34,
            border: `2.5px solid ${active.color}66`,
            boxShadow: LIGHT.shadowHero,
            padding: "36px 46px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            opacity: interpolate(pop, [0, 1], [0, 1]),
            scale: interpolate(pop, [0, 1], [0.94, 1]),
            translate: `0px ${interpolate(pop, [0, 1], [22, 0])}px`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <StudioIcon
              name={active.icon}
              color={active.color}
              bg={active.bg}
              size={78}
            />
            <span
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: active.color,
              }}
            >
              {active.label}
            </span>
          </div>

          <div
            style={{
              width: "100%",
              background: active.bg,
              border: `1.5px solid ${active.color}`,
              borderRadius: 20,
              padding: "20px 28px",
              fontSize: 27,
              fontWeight: 900,
              color: LIGHT.ink,
              textAlign: "center",
              unicodeBidi: "plaintext",
            }}
          >
            {active.example}
          </div>

          <div style={{ fontSize: 22, fontWeight: 700, color: LIGHT.inkSecondary }}>
            {active.sub}
          </div>
        </div>

        {/* 3 Step Dots */}
        <div style={{ display: "flex", gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: i === stageIdx ? 42 : 14,
                height: 14,
                borderRadius: 99,
                background:
                  i === stageIdx ? active.color : "rgba(15,23,42,0.15)",
              }}
            />
          ))}
        </div>
      </div>
    </DaylightStage>
  );
};

/* ============================================================================
   BEAT 12: Dual Architecture — Next.js 16 Speed + Rust / Axum Vault Core
   ============================================================================ */
export const Beat12RustNextEngine: React.FC = () => {
  const frame = useCurrentFrame();
  const rightNode = useSpringPop(8, 26);
  const leftNode = useSpringPop(24, 26);
  const pulseX = interpolate(frame % 60, [0, 60], [100, 0]);

  return (
    <DaylightStage
      beatIndex={12}
      tintA={LIGHT.blueBg}
      tintB={LIGHT.goldBg}
      tag="المعمارية الهندسية • Next.js 16 + Rust Vault"
      tagColor={LIGHT.blue}
    >
      <Sequence from={10} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={28} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.36} />
      </Sequence>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 34,
          width: "100%",
        }}
      >
        <KineticHeadline
          text="معمارية مزدوجة تفصل تجربة المستخدم عن نواة التشفير"
          highlight="معمارية مزدوجة نواة التشفير"
          highlightColor={LIGHT.blue}
          size={52}
          delay={4}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 160px 1fr",
            alignItems: "center",
            gap: 20,
            width: "100%",
          }}
        >
          {/* Node 1: Next.js 16 UX */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 30,
              border: `2px solid ${LIGHT.blue}45`,
              boxShadow: LIGHT.shadowHero,
              padding: "32px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 16,
              opacity: rightNode.opacity,
              translate: rightNode.translate,
              scale: rightNode.scale,
            }}
          >
            <StudioIcon name="bolt" color={LIGHT.blue} bg={LIGHT.blueBg} size={86} />
            <div style={{ fontSize: 30, fontWeight: 900, color: LIGHT.ink }}>
              واجهة Next.js 16 السريعة
            </div>
            <div
              dir="ltr"
              style={{
                fontFamily: FONTS.mono,
                fontSize: 18,
                fontWeight: 700,
                color: LIGHT.blue,
                background: LIGHT.blueBg,
                padding: "6px 18px",
                borderRadius: 999,
              }}
            >
              60–120 fps • 19/20 UX • 27+ Routes
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, color: LIGHT.inkSecondary }}>
              دعم أصيل للعربية RTL، كاميرا WebRTC، وودجت الشركاء المدمج
            </div>
          </div>

          {/* Animated Optical Data Bridge */}
          <div
            style={{
              position: "relative",
              height: 12,
              borderRadius: 99,
              background: "rgba(37, 99, 235, 0.14)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${pulseX}%`,
                width: 60,
                borderRadius: 99,
                background: `linear-gradient(90deg, transparent, ${LIGHT.teal}, transparent)`,
              }}
            />
          </div>

          {/* Node 2: Rust / Axum Sovereign Core */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 30,
              border: `2px solid ${LIGHT.gold}55`,
              boxShadow: LIGHT.shadowHero,
              padding: "32px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 16,
              opacity: leftNode.opacity,
              translate: leftNode.translate,
              scale: leftNode.scale,
            }}
          >
            <StudioIcon name="cpu" color={LIGHT.gold} bg={LIGHT.goldBg} size={86} />
            <div style={{ fontSize: 30, fontWeight: 900, color: LIGHT.ink }}>
              نواة الخزنة Rust / Axum
            </div>
            <div
              dir="ltr"
              style={{
                fontFamily: FONTS.mono,
                fontSize: 18,
                fontWeight: 700,
                color: LIGHT.gold,
                background: LIGHT.goldBg,
                padding: "6px 18px",
                borderRadius: 999,
              }}
            >
              AES-256-GCM • HKDF • Argon2id
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, color: LIGHT.inkSecondary }}>
              أمان ذاكري صارم وتحديد معدل يمنع إغراق واستنزاف رسائل الـ OTP
            </div>
          </div>
        </div>
      </div>
    </DaylightStage>
  );
};
