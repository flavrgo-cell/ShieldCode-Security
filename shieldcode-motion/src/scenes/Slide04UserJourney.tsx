import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { PALETTE } from "../theme";
import {
  CorporateHeaderBlock,
  CorporateStage,
  SovereignIcon,
  useCardMotion,
} from "../components/CorporateStage";

export const Slide04UserJourney: React.FC = () => {
  const frame = useCurrentFrame();

  const s1 = useCardMotion(12, 20);
  const s2 = useCardMotion(19, 20);
  const s3 = useCardMotion(25, 20);

  const m1 = useCardMotion(46, 24);
  const m2 = useCardMotion(54, 24);
  const m3 = useCardMotion(60, 24);

  const pulseArrow = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.45, 1]);

  const STEPS = [
    {
      motion: s1,
      icon: "key" as const,
      color: PALETTE.teal,
      step: "الخطوة 01",
      title: "الدخول والإعداد الآمن",
      desc: "يدخل المستخدم إلى صفحة الأمان بعد التوثيق المزدوج (+213 والبريد) ويختار تفعيل رمز مكافحة التصيّد.",
    },
    {
      motion: s2,
      icon: "shield" as const,
      color: PALETTE.cyan,
      step: "الخطوة 02",
      title: "اختيار الرمز والمعاينة الحية",
      desc: "إدخال 6–12 حرفاً/رقماً (بلا مسافات أو رموز معقدة) مع فحص القوة ومعاينة فورية لشكل الرسالة.",
    },
    {
      motion: s3,
      icon: "check" as const,
      color: PALETTE.emerald,
      step: "الخطوة 03",
      title: "التضمين الآلي والتحقق",
      desc: "تشفير الرمز بـ AES-256-GCM وتضمينه تلقائياً في كل اتصال رسمي ليتمكن العميل من التحقق الفوري.",
    },
  ];

  const CHANNELS = [
    {
      motion: m1,
      icon: "phone" as const,
      color: PALETTE.cyan,
      title: "الرسائل النصية (SMS)",
      preview: '"رمزك الأمني: ABC123 — هذه الرسالة رسمية من منصتنا."',
      note: "يظهر في السطر الأول مباشرة قبل أي رابط أو مبلغ.",
    },
    {
      motion: m2,
      icon: "mail" as const,
      color: PALETTE.teal,
      title: "البريد الإلكتروني (Email)",
      preview: "ترويسة البريد: [اسم المرسل الرسمي  |  الرمز: ABC123]",
      note: "مدمج في الترويسة بجانب عنوان الدعم الموثق.",
    },
    {
      motion: m3,
      icon: "bolt" as const,
      color: PALETTE.amber,
      title: "إشعارات التطبيق (App Push)",
      preview: "تنبيه دفع موثق  •  رمز الأمان: ABC123",
      note: "يظهر بخط بارز أسفل عنوان الإشعار لسرعة التحقق.",
    },
  ];

  return (
    <CorporateStage
      slideIndex={4}
      accent={PALETTE.teal}
      secondaryAccent={PALETTE.cyan}
    >
      <Sequence from={14} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={50} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.35} />
      </Sequence>

      <CorporateHeaderBlock
        title="تجربة المستخدم: إنشاء الرمز وظهوره عبر كافة القنوات"
        subtitle="عملية بسيطة من 3 خطوات بلا معدات إضافية، مع تضمين آلي موحّد يزيل العبء المعرفي عن العميل"
        accentColor={PALETTE.teal}
      />

      {/* Top 3-Step Flow */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr auto 1fr",
          gap: 14,
          alignItems: "center",
          marginBottom: 22,
        }}
      >
        {STEPS.map((st, idx) => (
          <React.Fragment key={st.step}>
            <div
              style={{
                background: PALETTE.panel,
                border: `1.5px solid ${st.color}55`,
                borderTop: "1.5px solid rgba(255,255,255,0.2)",
                borderRadius: 22,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                opacity: st.motion.opacity,
                translate: st.motion.translate,
                scale: st.motion.scale,
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <SovereignIcon kind={st.icon} color={st.color} size={48} />
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: st.color,
                    }}
                  >
                    {st.step}
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: PALETTE.white,
                    }}
                  >
                    {st.title}
                  </div>
                </div>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 17.5,
                  fontWeight: 600,
                  color: PALETTE.soft,
                  lineHeight: 1.52,
                  unicodeBidi: "plaintext",
                }}
              >
                {st.desc}
              </p>
            </div>
            {idx < 2 && (
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: PALETTE.teal,
                  opacity: pulseArrow,
                }}
              >
                ◀
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Bottom Multi-Channel Fixed Placement Showcase */}
      <div
        style={{
          background: "rgba(7, 16, 32, 0.84)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 24,
          padding: "18px 24px",
        }}
      >
        <div
          style={{
            fontSize: 19,
            fontWeight: 800,
            color: PALETTE.teal,
            marginBottom: 14,
          }}
        >
          أمثلة ظهور الرمز في مواضع ثابتة عبر قنوات الاتصال الرسمية:
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {CHANNELS.map((ch) => (
            <div
              key={ch.title}
              style={{
                background: PALETTE.panelElevated,
                border: `1.5px solid ${ch.color}55`,
                borderRadius: 18,
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                opacity: ch.motion.opacity,
                translate: ch.motion.translate,
                scale: ch.motion.scale,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <SovereignIcon kind={ch.icon} color={ch.color} size={44} />
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: PALETTE.white,
                  }}
                >
                  {ch.title}
                </span>
              </div>

              <div
                style={{
                  background: "rgba(4, 9, 20, 0.9)",
                  border: `1px solid ${ch.color}66`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  fontSize: 17,
                  fontWeight: 800,
                  color: ch.color,
                  lineHeight: 1.45,
                  unicodeBidi: "plaintext",
                }}
              >
                {ch.preview}
              </div>

              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: PALETTE.muted,
                }}
              >
                {ch.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CorporateStage>
  );
};
