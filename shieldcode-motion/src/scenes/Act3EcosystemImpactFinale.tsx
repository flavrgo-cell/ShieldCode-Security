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
import { EASE, FONTS, LIGHT } from "../theme";
import {
  AlgerianFlagIcon,
  DaylightStage,
  KineticHeadline,
  StudioIcon,
  useSpringPop,
} from "../components/DaylightStage";

/* ============================================================================
   BEAT 13: Live RAM Zeroize Wave + Algerian Law 18-07 Sovereignty
   ============================================================================ */
export const Beat13ZeroizeAndLaw1807: React.FC = () => {
  const frame = useCurrentFrame();
  const cardIn = useSpringPop(8, 26);
  const lawBadge = useSpringPop(86, 18);

  const RAW_HEX = ["8F", "4A", "C9", "1E", "D2", "7B", "30", "5A"];

  return (
    <DaylightStage
      beatIndex={13}
      tintA={LIGHT.tealBg}
      tintB={LIGHT.blueBg}
      tag="السيادة الوطنية • القانون 18-07 وتصفير الذاكرة"
      tagColor={LIGHT.teal}
    >
      <Sequence from={46} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.4} />
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
        <StudioIcon name="globe" color={LIGHT.teal} bg={LIGHT.tealSoft} size={90} />

        <KineticHeadline
          text="تطهير فوري للذاكرة (Zeroize) وسيادة كاملة داخل الجزائر"
          highlight="تطهير فوري داخل الجزائر"
          highlightColor={LIGHT.teal}
          size={52}
          delay={6}
        />

        {/* Visual 8-Cell RAM Zeroize Animation */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 30,
            border: `2px solid ${LIGHT.teal}45`,
            boxShadow: LIGHT.shadowHero,
            padding: "28px 42px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            opacity: cardIn.opacity,
            translate: cardIn.translate,
            scale: cardIn.scale,
          }}
        >
          <span style={{ fontSize: 21, fontWeight: 800, color: LIGHT.inkMuted }}>
            مسح مفتاح التشفير المشتق (DEK) من الذاكرة العشوائية فور انتهاء الطلب:
          </span>

          <div dir="ltr" style={{ display: "flex", gap: 14 }}>
            {RAW_HEX.map((hex, i) => {
              const cleared = frame >= 42 + i * 5;
              return (
                <div
                  key={i}
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 18,
                    background: cleared ? LIGHT.emeraldBg : LIGHT.cardSubtle,
                    border: `2px solid ${cleared ? LIGHT.emerald : LIGHT.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONTS.mono,
                    fontSize: 28,
                    fontWeight: 700,
                    color: cleared ? LIGHT.emerald : LIGHT.inkSecondary,
                  }}
                >
                  {cleared ? "00" : hex}
                </div>
              );
            })}
          </div>
        </div>

        {/* Law 18-07 Sovereign Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            background: "#FFFFFF",
            border: `2px solid ${LIGHT.blue}45`,
            borderRadius: 20,
            padding: "14px 32px",
            boxShadow: LIGHT.shadowSoft,
            opacity: lawBadge.opacity,
            translate: lawBadge.translate,
          }}
        >
          <AlgerianFlagIcon width={30} height={20} />
          <span style={{ fontSize: 22, fontWeight: 800, color: LIGHT.ink }}>
            امتثال تام للقانون 18-07 • حصر جغرافي محلي (DZ) وعزل Supabase RLS
          </span>
        </div>
      </div>
    </DaylightStage>
  );
};

/* ============================================================================
   BEAT 14: 16 Algerian Financial Institutions + +213 Telecom Networks
   ============================================================================ */
export const Beat14AlgerianEcosystem: React.FC = () => {
  const centerHub = useSpringPop(6, 24);
  const p1 = useSpringPop(24, 20);
  const p2 = useSpringPop(34, 20);
  const p3 = useSpringPop(44, 20);
  const p4 = useSpringPop(54, 20);

  return (
    <DaylightStage
      beatIndex={14}
      tintA={LIGHT.goldBg}
      tintB={LIGHT.tealBg}
      tag={"التغطية الوطنية • 16 مؤسسة مالية وشبكات \u2066+213\u2069"}
      tagColor={LIGHT.gold}
    >
      <Sequence from={10} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={54} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.36} />
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
          text={"جاهزية كاملة لـ 16 مؤسسة مالية جزائرية وشبكات \u2066+213\u2069"}
          highlight={"16 مؤسسة مالية \u2066+213\u2069"}
          highlightColor={LIGHT.gold}
          size={52}
          delay={4}
        />

        {/* Clean Hub + 4 Orbiting Pill Cards */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 32,
            border: `2px solid ${LIGHT.gold}55`,
            boxShadow: LIGHT.shadowHero,
            padding: "24px 44px",
            display: "flex",
            alignItems: "center",
            gap: 20,
            opacity: centerHub.opacity,
            scale: centerHub.scale,
          }}
        >
          <StudioIcon name="building" color={LIGHT.gold} bg={LIGHT.goldBg} size={74} />
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, color: LIGHT.ink }}>
              بريد الجزائر Algérie Poste (007)
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: LIGHT.gold }}>
              البطاقة الذهبية (BIN 6280) + فحص رياضي Modulo 97 لأرقام RIP/RIB
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 22,
            width: "100%",
          }}
        >
          {[
            {
              m: p1,
              color: LIGHT.blue,
              title: "6 بنوك عمومية",
              sub: "BNA • BEA • BADR • CPA • CNEP • BDL",
            },
            {
              m: p2,
              color: LIGHT.teal,
              title: "9 مصارف خاصة وإسلامية",
              sub: "البركة • السلام • \u2066SGA • BNP • AGB...\u2069",
            },
            {
              m: p3,
              color: LIGHT.emerald,
              title: "توثيق مزدوج \u2066+213\u2069",
              sub: "\u2066Mobilis (06) • Djezzy (07) • Ooredoo (05)\u2069",
            },
          ].map((b) => (
            <div
              key={b.title}
              style={{
                background: "#FFFFFF",
                borderRadius: 24,
                border: `1.5px solid ${b.color}45`,
                boxShadow: LIGHT.shadowSoft,
                padding: "22px 24px",
                textAlign: "center",
                opacity: b.m.opacity,
                translate: b.m.translate,
                scale: b.m.scale,
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: b.color,
                  marginBottom: 8,
                }}
              >
                {b.title}
              </div>
              <div
                style={{
                  fontSize: 19,
                  fontWeight: 700,
                  color: LIGHT.inkSecondary,
                  unicodeBidi: "plaintext",
                }}
              >
                {b.sub}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: LIGHT.emerald,
            opacity: p4.opacity,
          }}
        >
          ✓ تغطية 27+ مساراً برمجياً جاهزاً للإنتاج مع توثيق OpenAPI 3.1 حي
        </div>
      </div>
    </DaylightStage>
  );
};

/* ============================================================================
   BEAT 15: Sequential KPI Gauges (90% -> 70% -> 50%) on Luminous Porcelain
   ============================================================================ */
export const Beat15ImpactGauges: React.FC = () => {
  const frame = useCurrentFrame();

  const k1 = useSpringPop(8, 24);
  const k2 = useSpringPop(42, 24);
  const k3 = useSpringPop(76, 24);

  const KPIS = [
    {
      m: k1,
      start: 12,
      target: 90,
      color: LIGHT.teal,
      bg: LIGHT.tealSoft,
      label: "استيعاب فوري للمستخدم",
      sub: "بعد عرض توضيحي 30 ثانية فقط",
    },
    {
      m: k2,
      start: 46,
      target: 70,
      color: LIGHT.blue,
      bg: LIGHT.blueBg,
      label: "التزام بالتحقق الفعلي",
      sub: "قبل إتمام أي إجراء مالي",
    },
    {
      m: k3,
      start: 80,
      target: 50,
      color: LIGHT.gold,
      bg: LIGHT.goldBg,
      label: "انخفاض التصيّد الناجح",
      sub: "في المرحلة التجريبية الأولى",
    },
  ];

  const r = 64;
  const circ = 2 * Math.PI * r;

  return (
    <DaylightStage
      beatIndex={15}
      tintA={LIGHT.tealBg}
      tintB={LIGHT.blueBg}
      tag="قياس الأثر الأمني • مؤشرات الأداء المستهدفة"
      tagColor={LIGHT.teal}
    >
      <Sequence from={12} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={46} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={80} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.38} />
      </Sequence>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 36,
          width: "100%",
        }}
      >
        <KineticHeadline
          text="أثر أمني ملموس وقابل للقياس منذ اليوم الأول"
          highlight="ملموس وقابل للقياس"
          highlightColor={LIGHT.teal}
          size={54}
          delay={4}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 30,
            width: "100%",
          }}
        >
          {KPIS.map((item) => {
            const p = interpolate(
              frame,
              [item.start, item.start + 45],
              [0, item.target / 100],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: EASE.out,
              }
            );
            return (
              <div
                key={item.label}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 32,
                  border: `2px solid ${item.color}40`,
                  boxShadow: LIGHT.shadowHero,
                  padding: "32px 26px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 18,
                  opacity: item.m.opacity,
                  translate: item.m.translate,
                  scale: item.m.scale,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 156,
                    height: 156,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="156"
                    height="156"
                    viewBox="0 0 156 156"
                    style={{ rotate: "-90deg" }}
                  >
                    <circle
                      cx="78"
                      cy="78"
                      r={r}
                      fill="none"
                      stroke={item.bg}
                      strokeWidth="13"
                    />
                    <circle
                      cx="78"
                      cy="78"
                      r={r}
                      fill="none"
                      stroke={item.color}
                      strokeWidth="13"
                      strokeLinecap="round"
                      strokeDasharray={circ}
                      strokeDashoffset={circ * (1 - p)}
                    />
                  </svg>
                  <span
                    dir="ltr"
                    style={{
                      position: "absolute",
                      fontFamily: FONTS.mono,
                      fontSize: 40,
                      fontWeight: 700,
                      color: LIGHT.ink,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {Math.round(p * 100)}%
                  </span>
                </div>

                <div style={{ fontSize: 26, fontWeight: 900, color: LIGHT.ink }}>
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 19,
                    fontWeight: 600,
                    color: LIGHT.inkMuted,
                    textAlign: "center",
                  }}
                >
                  {item.sub}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DaylightStage>
  );
};

/* ============================================================================
   BEAT 16: Sustainable B2B2C Revenue Model (Zero Hardware Cost)
   ============================================================================ */
export const Beat16BusinessEngines: React.FC = () => {
  const b1 = useSpringPop(8, 24);
  const b2 = useSpringPop(26, 24);
  const b3 = useSpringPop(44, 24);
  const moat = useSpringPop(72, 18);

  const MODELS = [
    {
      m: b1,
      icon: "building" as const,
      tag: "B2B",
      color: LIGHT.teal,
      bg: LIGHT.tealSoft,
      title: "البنوك والمؤسسات المالية",
      desc: "ترخيص سنوي + مفاتيح \u2066sc_live_\u2069 وتسعير حسب حجم الدمغ \u2066(Pay-per-Stamp)\u2069",
    },
    {
      m: b2,
      icon: "truck" as const,
      tag: "B2B2C",
      color: LIGHT.blue,
      bg: LIGHT.blueBg,
      title: "المتاجر وشركات التوصيل",
      desc: "اشتراك SaaS شهري لدمج ودجت الحماية وبوابة \u2066/go/[hash]\u2069 والدفع البيومتري",
    },
    {
      m: b3,
      icon: "card" as const,
      tag: "B2C",
      color: LIGHT.gold,
      bg: LIGHT.goldBg,
      title: "حاملو الذهبية و CIB",
      desc: "تفعيل مجاني للمواطن لبناء انتشار وطني واسع + باقة بريميوم متقدمة",
    },
  ];

  return (
    <DaylightStage
      beatIndex={16}
      tintA={LIGHT.goldBg}
      tintB={LIGHT.tealBg}
      tag="نموذج العمل • B2B2C عالي الهامش"
      tagColor={LIGHT.gold}
    >
      <Sequence from={12} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={72} layout="none">
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
          text="ثلاثة محركات إيرادات متكاملة بتكلفة عتاد تساوي صفر!"
          highlight="ثلاثة محركات تساوي صفر!"
          highlightColor={LIGHT.teal}
          size={52}
          delay={4}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 26,
            width: "100%",
          }}
        >
          {MODELS.map((item) => (
            <div
              key={item.tag}
              style={{
                background: "#FFFFFF",
                borderRadius: 30,
                border: `2px solid ${item.color}45`,
                boxShadow: LIGHT.shadowHero,
                padding: "28px 28px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 14,
                opacity: item.m.opacity,
                translate: item.m.translate,
                scale: item.m.scale,
              }}
            >
              <StudioIcon
                name={item.icon}
                color={item.color}
                bg={item.bg}
                size={78}
              />
              <span
                dir="ltr"
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 18,
                  fontWeight: 700,
                  color: item.color,
                  background: item.bg,
                  padding: "4px 16px",
                  borderRadius: 999,
                }}
              >
                {item.tag}
              </span>
              <div style={{ fontSize: 25, fontWeight: 900, color: LIGHT.ink }}>
                {item.title}
              </div>
              <div
                style={{
                  fontSize: 19,
                  fontWeight: 600,
                  color: LIGHT.inkSecondary,
                  lineHeight: 1.55,
                  unicodeBidi: "plaintext",
                }}
              >
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: LIGHT.tealSoft,
            border: `1.5px solid ${LIGHT.teal}`,
            borderRadius: 999,
            padding: "12px 34px",
            fontSize: 21,
            fontWeight: 800,
            color: LIGHT.teal,
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: moat.opacity,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={LIGHT.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span>بدون أي أجهزة Tokens إضافية • ربط برمجي للمطورين في أيام عبر OpenAPI 3.1</span>
        </div>
      </div>
    </DaylightStage>
  );
};

/* ============================================================================
   BEAT 17: Roadmap Q1->Q4+ Stepping Stones & Grand Daylight Finale
   ============================================================================ */
export const Beat17RoadmapAndFinale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const q1 = useSpringPop(6, 20);
  const q2 = useSpringPop(18, 20);
  const q3 = useSpringPop(30, 20);
  const q4 = useSpringPop(42, 20);

  const ctaPop = spring({
    frame: frame - 74,
    fps,
    config: { damping: 15, stiffness: 155 },
  });

  const STEPS = [
    { m: q1, q: "Q1 • Pilot", title: "الإطلاق التجريبي", color: LIGHT.blue },
    { m: q2, q: "Q2 • Hardening", title: "التدقيق وقياس الأثر", color: LIGHT.teal },
    { m: q3, q: "Q3 • B2B Scale", title: "التوسع مع 16 بنكاً", color: LIGHT.emerald },
    { m: q4, q: "Q4+ • Standard", title: "المعيار الوطني والمغاربي", color: LIGHT.gold },
  ];

  return (
    <DaylightStage
      beatIndex={17}
      tintA={LIGHT.tealBg}
      tintB={LIGHT.goldBg}
      tag="خارطة الطريق والشراكة • الجزائر 2026"
      tagColor={LIGHT.teal}
    >
      <Sequence from={10} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={74} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.45} />
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
        {/* Clean 4-Quarter Stepping Stones */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
            width: "100%",
          }}
        >
          {STEPS.map((s) => (
            <div
              key={s.q}
              style={{
                background: "#FFFFFF",
                borderRadius: 24,
                border: `2px solid ${s.color}55`,
                boxShadow: LIGHT.shadowSoft,
                padding: "20px 22px",
                textAlign: "center",
                opacity: s.m.opacity,
                translate: s.m.translate,
                scale: s.m.scale,
              }}
            >
              <div
                dir="ltr"
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 17,
                  fontWeight: 700,
                  color: s.color,
                  marginBottom: 6,
                }}
              >
                {s.q}
              </div>
              <div style={{ fontSize: 23, fontWeight: 900, color: LIGHT.ink }}>
                {s.title}
              </div>
            </div>
          ))}
        </div>

        {/* Grand Luminous Corporate Sign-Off Card */}
        <div
          style={{
            width: "100%",
            background: "#FFFFFF",
            borderRadius: 38,
            border: `2.5px solid ${LIGHT.teal}`,
            boxShadow: LIGHT.shadowHero,
            padding: "42px 54px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 36,
            opacity: interpolate(ctaPop, [0, 1], [0, 1]),
            scale: interpolate(ctaPop, [0, 1], [0.93, 1]),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <StudioIcon
              name="shield"
              color={LIGHT.teal}
              bg={LIGHT.tealSoft}
              size={104}
            />
            <div>
              <div
                style={{
                  fontSize: 38,
                  fontWeight: 900,
                  color: LIGHT.ink,
                  marginBottom: 8,
                }}
              >
                ShieldCode & SecurePay — الدرع المالي السيادي
              </div>
              <div
                style={{
                  fontSize: 23,
                  fontWeight: 600,
                  color: LIGHT.inkSecondary,
                }}
              >
                ندعو الشركاء المصرفيين والمستثمرين للانضمام إلى المرحلة التجريبية (Pilot Program)
              </div>
            </div>
          </div>

          <div
            style={{
              background: `linear-gradient(135deg, ${LIGHT.teal}, ${LIGHT.emerald})`,
              color: "#FFFFFF",
              borderRadius: 22,
              padding: "20px 38px",
              fontSize: 25,
              fontWeight: 900,
              flexShrink: 0,
              boxShadow: `0 16px 34px -8px ${LIGHT.teal}66`,
            }}
          >
            ابدأ الشراكة الآن
          </div>
        </div>
      </div>
    </DaylightStage>
  );
};
