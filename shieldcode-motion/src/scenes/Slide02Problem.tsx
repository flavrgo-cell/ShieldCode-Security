import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONTS, PALETTE } from "../theme";
import {
  CorporateHeaderBlock,
  CorporateStage,
  SovereignIcon,
  useCardMotion,
} from "../components/CorporateStage";

export const Slide02Problem: React.FC = () => {
  const frame = useCurrentFrame();

  // Non-uniform wave stagger per choreograph skill
  const c1 = useCardMotion(14, 24);
  const c2 = useCardMotion(21, 24);
  const c3 = useCardMotion(26, 24);

  const fakeBox = useCardMotion(52, 26);
  const realBox = useCardMotion(72, 26);

  // Subtle warning pulse on fake SMS after frame 90
  const alertPulse =
    frame > 90 ? 1 + Math.sin((frame - 90) * 0.16) * 0.015 : 1;

  const THREATS = [
    {
      motion: c1,
      icon: "alert" as const,
      color: PALETTE.crimson,
      num: "01",
      title: "التصيّد عبر الرسائل والروابط (Phishing & Smishing)",
      desc: "انتحال صفة بريد الجزائر وشركات التوصيل عبر رسائل SMS وروابط دفع مزيفة لسرقة بيانات البطاقة الذهبية ورموز التأكيد (OTP) دون أي علامة بصرية يميّز بها المواطن الرسالة الرسمية.",
    },
    {
      motion: c2,
      icon: "card" as const,
      color: PALETTE.amber,
      num: "02",
      title: "غياب التحقق من الهوية الحية (Card-Not-Present)",
      desc: "إمكانية استغلال بيانات البطاقة المسروقة في عمليات شراء فورية عبر الإنترنت دون إثبات وجود صاحب الحساب الحقيقي أمام الشاشة وقت تنفيذ المعاملة.",
    },
    {
      motion: c3,
      icon: "lock" as const,
      color: PALETTE.teal,
      num: "03",
      title: "مخاطر تخزين البطاقات وغياب الفهرسة العمياء",
      desc: "افتقار المتاجر والمنصات المحلية لتقنيات التشفير صفري المعرفة (Zero-Knowledge) مما يعرّض أرقام البطاقات والحسابات لخطر التسريب ومخالفة القانون 18-07.",
    },
  ];

  return (
    <CorporateStage
      slideIndex={2}
      accent={PALETTE.crimson}
      secondaryAccent={PALETTE.amber}
    >
      <Sequence from={16} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={55} layout="none">
        <Audio src={staticFile("sfx/threat_pulse.wav")} volume={0.32} />
      </Sequence>
      <Sequence from={76} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.38} />
      </Sequence>

      <CorporateHeaderBlock
        title="المشكلة: تصاعد الاحتيال الرقمي في منظومة الدفع الجزائرية"
        subtitle="مع تسارع استخدام البطاقة الذهبية (Edahabia) و BaridiMob و CIB، يواجه المواطن والتاجر 3 ثغرات حرجة"
        accentColor={PALETTE.crimson}
      />

      {/* Top 3 Critical Threat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 22,
          marginBottom: 22,
        }}
      >
        {THREATS.map((t) => (
          <div
            key={t.num}
            style={{
              background: PALETTE.panel,
              border: `1.5px solid ${t.color}55`,
              borderTop: "1.5px solid rgba(255,255,255,0.18)",
              borderRadius: 24,
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              opacity: t.motion.opacity,
              translate: t.motion.translate,
              scale: t.motion.scale,
              boxShadow: "0 18px 40px rgba(0,0,0,0.42)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <SovereignIcon kind={t.icon} color={t.color} size={52} />
              <span
                dir="ltr"
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 16,
                  fontWeight: 700,
                  color: t.color,
                  background: `${t.color}1c`,
                  border: `1px solid ${t.color}44`,
                  borderRadius: 999,
                  padding: "4px 14px",
                }}
              >
                THREAT {t.num}
              </span>
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: PALETTE.white,
                lineHeight: 1.35,
                unicodeBidi: "plaintext",
              }}
            >
              {t.title}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 17.5,
                fontWeight: 600,
                color: PALETTE.soft,
                lineHeight: 1.58,
                unicodeBidi: "plaintext",
              }}
            >
              {t.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom Live Comparison: Why Users Fall for Phishing vs ShieldCode */}
      <div
        style={{
          background: "rgba(7, 16, 32, 0.85)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 26,
          padding: "18px 24px",
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: PALETTE.amberSoft,
            marginBottom: 14,
          }}
        >
          مقارنة ميدانية حية — لماذا ينخدع المستخدم اليوم؟
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          {/* Fake Phishing Message */}
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(88, 16, 24, 0.78), rgba(32, 8, 12, 0.92))",
              border: `2px solid ${PALETTE.crimson}99`,
              borderRadius: 20,
              padding: "18px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              opacity: fakeBox.opacity,
              translate: fakeBox.translate,
              scale: fakeBox.scale * alertPulse,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: PALETTE.crimsonSoft,
                }}
              >
                ✗ رسالة تصيّد مزيفة (منتحلة)
              </span>
              <span
                style={{
                  background: PALETTE.crimson,
                  color: PALETTE.white,
                  borderRadius: 999,
                  padding: "3px 14px",
                  fontSize: 15,
                  fontWeight: 800,
                }}
              >
                خطر سرقة فوري
              </span>
            </div>
            <div
              style={{
                background: "rgba(0,0,0,0.4)",
                borderRadius: 14,
                padding: "12px 16px",
                fontSize: 18,
                fontWeight: 600,
                color: PALETTE.white,
                lineHeight: 1.5,
              }}
            >
              "عزيزي العميل، تم تعليق بطاقتك الذهبية مؤقتاً. يرجى تحديث بياناتك فوراً عبر الرابط التالي لتفادي الإغلاق..."
            </div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: PALETTE.crimsonSoft,
              }}
            >
              ← لا يوجد رمز شخصي — تشبه الرسائل الرسمية تماماً!
            </div>
          </div>

          {/* Authenticated ShieldCode Message */}
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(6, 78, 59, 0.78), rgba(4, 34, 30, 0.94))",
              border: `2px solid ${PALETTE.emerald}`,
              borderRadius: 20,
              padding: "18px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              opacity: realBox.opacity,
              translate: realBox.translate,
              scale: realBox.scale,
              boxShadow: `0 12px 35px rgba(16, 185, 129, 0.22)`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#6ee7b7",
                }}
              >
                ✓ رسالة موثّقة بدرع ShieldCode
              </span>
              <span
                style={{
                  background: PALETTE.emerald,
                  color: "#022c22",
                  borderRadius: 999,
                  padding: "3px 14px",
                  fontSize: 15,
                  fontWeight: 900,
                }}
              >
                موثوقة 100%
              </span>
            </div>
            <div
              style={{
                background: "rgba(0,0,0,0.42)",
                borderRadius: 14,
                padding: "12px 16px",
                fontSize: 18,
                fontWeight: 700,
                color: PALETTE.white,
                lineHeight: 1.5,
                unicodeBidi: "plaintext",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  background: "rgba(0, 212, 182, 0.24)",
                  border: `1.5px solid ${PALETTE.teal}`,
                  color: PALETTE.teal,
                  borderRadius: 8,
                  padding: "1px 10px",
                  marginLeft: 8,
                  scale: interpolate(
                    frame,
                    [82, 95],
                    [0.92, 1],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  ),
                }}
              >
                رمزك الأمني: BACHIR34
              </span>
              — تأكيد معاملة بقيمة{" "}
              <b dir="ltr" style={{ fontFamily: FONTS.mono, color: PALETTE.amberSoft }}>
                14,500 د.ج
              </b>{" "}
              عبر بوابة{" "}
              <span dir="ltr" style={{ fontFamily: FONTS.mono, color: PALETTE.cyan }}>
                /go/a8f9...
              </span>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#6ee7b7" }}>
              ← تحقق بصري فوري خلال ثانية واحدة دون معدات إضافية!
            </div>
          </div>
        </div>
      </div>
    </CorporateStage>
  );
};
