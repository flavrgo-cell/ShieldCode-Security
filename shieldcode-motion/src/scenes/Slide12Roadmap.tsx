import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { EASE, PALETTE } from "../theme";
import {
  CorporateHeaderBlock,
  CorporateStage,
  SovereignIcon,
  useCardMotion,
} from "../components/CorporateStage";

export const Slide12Roadmap: React.FC = () => {
  const frame = useCurrentFrame();

  const q1 = useCardMotion(12, 22);
  const q2 = useCardMotion(19, 22);
  const q3 = useCardMotion(25, 22);
  const q4 = useCardMotion(30, 22);
  const ctaMotion = useCardMotion(52, 20);

  const lineFill = interpolate(frame, [14, 65], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outStrong,
  });

  const shimmerX = interpolate(frame % 120, [0, 90], [-120, 220], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const PHASES = [
    {
      motion: q1,
      quarter: "المرحلة 1  •  Q1",
      title: "الإطلاق التجريبي (Pilot)",
      color: PALETTE.cyan,
      items: [
        "إطلاق تجريبي لشريحة مستخدمين.",
        "قوالب SMS/Email قياسية تعرض الرمز أولاً.",
        "حملة توعية: فيديو 30 ثانية وإرشادات سريعة.",
      ],
    },
    {
      motion: q2,
      quarter: "المرحلة 2  •  Q2",
      title: "التدقيق والدعم (Hardening)",
      color: PALETTE.teal,
      items: [
        "تفعيل سجلات رصد تغيير الرموز ومنع الإساءة.",
        "إطلاق قناة دعم مبسطة لتأكيد مصداقية الرسائل.",
        "قياس KPIs (90% فهم / 50% خفض تصيّد).",
      ],
    },
    {
      motion: q3,
      quarter: "المرحلة 3  •  Q3",
      title: "التوسع المصرفي (B2B Scale)",
      color: PALETTE.emerald,
      items: [
        "ربط المتاجر الكبرى وشركات التوصيل بالودجت.",
        "تفعيل مفاتيح sc_live_ للمؤسسات الـ 16.",
        "توسيع الدفع البيومتري بالبطاقة الذهبية وCIB.",
      ],
    },
    {
      motion: q4,
      quarter: "المرحلة 4  •  Q4+",
      title: "المعيار الوطني (Standard)",
      color: PALETTE.amber,
      items: [
        "اعتماد ShieldCode كطبقة أمان مالية قياسية.",
        "شراكات استراتيجية مع بريد الجزائر و GIE Monétique.",
        "التوسع الإقليمي في أسواق شمال إفريقيا.",
      ],
    },
  ];

  return (
    <CorporateStage
      slideIndex={12}
      accent={PALETTE.teal}
      secondaryAccent={PALETTE.amber}
    >
      <Sequence from={14} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={54} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.44} />
      </Sequence>

      <CorporateHeaderBlock
        title="خارطة الطريق التنفيذية والخطوات القادمة"
        subtitle="خطة إطلاق متدرجة تقلّل المخاطر التشغيلية وتحقق نتائج أمنية وتجارية سريعة في السوق الجزائري"
        accentColor={PALETTE.teal}
      />

      {/* Animated Timeline Progress Beam */}
      <div
        style={{
          height: 6,
          borderRadius: 99,
          background: "rgba(255,255,255,0.08)",
          marginBottom: 18,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${lineFill}%`,
            background: `linear-gradient(90deg, ${PALETTE.amber}, ${PALETTE.emerald}, ${PALETTE.teal}, ${PALETTE.cyan})`,
          }}
        />
      </div>

      {/* 4 Roadmap Quarters */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 18,
          marginBottom: 22,
        }}
      >
        {PHASES.map((ph) => (
          <div
            key={ph.quarter}
            style={{
              background: PALETTE.panel,
              border: `1.5px solid ${ph.color}66`,
              borderTop: "1.5px solid rgba(255,255,255,0.22)",
              borderRadius: 24,
              padding: "20px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              opacity: ph.motion.opacity,
              translate: ph.motion.translate,
              scale: ph.motion.scale,
            }}
          >
            <span
              style={{
                alignSelf: "flex-start",
                background: `${ph.color}1e`,
                border: `1px solid ${ph.color}55`,
                color: ph.color,
                borderRadius: 999,
                padding: "3px 12px",
                fontSize: 14.5,
                fontWeight: 800,
                unicodeBidi: "plaintext",
              }}
            >
              {ph.quarter}
            </span>
            <div
              style={{
                fontSize: 21,
                fontWeight: 900,
                color: PALETTE.white,
                unicodeBidi: "plaintext",
              }}
            >
              {ph.title}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 4,
              }}
            >
              {ph.items.map((it) => (
                <div
                  key={it}
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: PALETTE.soft,
                    lineHeight: 1.48,
                    unicodeBidi: "plaintext",
                  }}
                >
                  • {it}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Grand Executive Partnership CTA Finale */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(0, 212, 182, 0.18), rgba(11, 26, 52, 0.96), rgba(245, 166, 35, 0.16))",
          border: `2px solid ${PALETTE.teal}`,
          borderRadius: 28,
          padding: "22px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          opacity: ctaMotion.opacity,
          translate: ctaMotion.translate,
          scale: ctaMotion.scale,
          boxShadow: `0 24px 60px rgba(0,0,0,0.55), 0 0 40px ${PALETTE.teal}25`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <SovereignIcon kind="shield" color={PALETTE.teal} size={68} />
          <div>
            <div
              style={{
                fontSize: 23,
                fontWeight: 900,
                color: PALETTE.white,
                marginBottom: 4,
              }}
            >
              التنفيذ المبكر مع قياس الأداء يحقق نتائج سريعة ويقلّل المخاطر التشغيلية
            </div>
            <div
              style={{
                fontSize: 17.5,
                fontWeight: 600,
                color: PALETTE.soft,
                unicodeBidi: "plaintext",
              }}
            >
              ندعو الشركاء المصرفيين والمستثمرين للانضمام إلى المرحلة التجريبية (Pilot Program) وتفعيل الدرع السيادي ShieldCode & SecurePay لحماية ملايين المعاملات الرقمية في الجزائر.
            </div>
          </div>
        </div>

        <div
          style={{
            background: `linear-gradient(135deg, ${PALETTE.teal}, ${PALETTE.tealDark})`,
            color: "#021814",
            borderRadius: 18,
            padding: "16px 30px",
            fontSize: 21,
            fontWeight: 900,
            flexShrink: 0,
            boxShadow: `0 10px 28px ${PALETTE.teal}44`,
          }}
        >
          ابدأ الشراكة التجريبية الآن
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(110deg, transparent 38%, rgba(255,255,255,0.18) 50%, transparent 62%)",
            translate: `${shimmerX}% 0`,
            pointerEvents: "none",
          }}
        />
      </div>
    </CorporateStage>
  );
};
