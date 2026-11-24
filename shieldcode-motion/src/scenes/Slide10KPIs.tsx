import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { EASE, FONTS, PALETTE } from "../theme";
import {
  CorporateHeaderBlock,
  CorporateStage,
  SovereignIcon,
  useCardMotion,
} from "../components/CorporateStage";

export const Slide10KPIs: React.FC = () => {
  const frame = useCurrentFrame();

  const k1 = useCardMotion(12, 22);
  const k2 = useCardMotion(19, 22);
  const k3 = useCardMotion(25, 22);
  const methodCard = useCardMotion(42, 20);

  const KPIS = [
    {
      motion: k1,
      target: 90,
      delay: 16,
      color: PALETTE.teal,
      title: "معدل فهم المستخدم",
      desc: "90% من المستخدمين يستوعبون وظيفة الرمز بعد عرض توضيحي قصير (30 ثانية).",
    },
    {
      motion: k2,
      target: 70,
      delay: 24,
      color: PALETTE.cyan,
      title: "معدل التحقق الفعلي",
      desc: "70% من المستخدمين يتحققون من وجود الرمز قبل اتخاذ إجراء مالي خلال أول 3 أشهر.",
    },
    {
      motion: k3,
      target: 50,
      delay: 32,
      color: PALETTE.amber,
      title: "انخفاض التصيّد الناجح",
      desc: "خفض نسبة الاحتيال المرتبط بالرسائل إلى النصف في نطاق الاختبار التجريبي الأولي.",
    },
  ];

  const radius = 58;
  const circumference = 2 * Math.PI * radius;

  return (
    <CorporateStage
      slideIndex={10}
      accent={PALETTE.teal}
      secondaryAccent={PALETTE.cyan}
    >
      <Sequence from={14} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={46} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.34} />
      </Sequence>

      <CorporateHeaderBlock
        title="مؤشرات الأداء المستهدفة وقياس الأثر الأمني (KPIs)"
        subtitle="أهداف قابلة للقياس في المرحلة التجريبية (Pilot) مدعومة باختبارات A/B ومراقبة مستمرة لمعدلات الاحتيال"
        accentColor={PALETTE.teal}
      />

      {/* Top 3 Radial Gauge Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
          marginBottom: 22,
        }}
      >
        {KPIS.map((kpi) => {
          const fill = interpolate(
            frame,
            [kpi.delay, kpi.delay + 52],
            [0, kpi.target / 100],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: EASE.outStrong,
            }
          );
          const currentVal = Math.round(fill * 100);
          const dashOffset = circumference * (1 - fill);

          return (
            <div
              key={kpi.title}
              style={{
                background: PALETTE.panel,
                border: `1.5px solid ${kpi.color}66`,
                borderTop: "1.5px solid rgba(255,255,255,0.22)",
                borderRadius: 26,
                padding: "24px 26px",
                display: "flex",
                alignItems: "center",
                gap: 22,
                opacity: kpi.motion.opacity,
                translate: kpi.motion.translate,
                scale: kpi.motion.scale,
                boxShadow: "0 20px 44px rgba(0,0,0,0.44)",
              }}
            >
              {/* Animated SVG Radial Gauge */}
              <div
                style={{
                  position: "relative",
                  width: 138,
                  height: 138,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="138"
                  height="138"
                  viewBox="0 0 138 138"
                  style={{ rotate: "-90deg" }}
                >
                  <circle
                    cx="69"
                    cy="69"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="11"
                  />
                  <circle
                    cx="69"
                    cy="69"
                    r={radius}
                    fill="none"
                    stroke={kpi.color}
                    strokeWidth="11"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                  />
                </svg>
                <span
                  dir="ltr"
                  style={{
                    position: "absolute",
                    fontFamily: FONTS.mono,
                    fontSize: 34,
                    fontWeight: 700,
                    color: PALETTE.white,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {currentVal}%
                </span>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: PALETTE.white,
                    marginBottom: 8,
                  }}
                >
                  {kpi.title}
                </div>
                <div
                  style={{
                    fontSize: 17.5,
                    fontWeight: 600,
                    color: PALETTE.soft,
                    lineHeight: 1.55,
                    unicodeBidi: "plaintext",
                  }}
                >
                  {kpi.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Measurement & Continuous Improvement Methodology */}
      <div
        style={{
          background: PALETTE.panelElevated,
          border: `1.5px solid ${PALETTE.cyan}55`,
          borderRadius: 26,
          padding: "22px 28px",
          display: "flex",
          alignItems: "center",
          gap: 24,
          opacity: methodCard.opacity,
          translate: methodCard.translate,
          scale: methodCard.scale,
        }}
      >
        <SovereignIcon kind="chart" color={PALETTE.cyan} size={64} />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: PALETTE.cyan,
              marginBottom: 12,
            }}
          >
            منهجية القياس والتحسين المستمر
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px 32px",
              fontSize: 18,
              fontWeight: 700,
              color: PALETTE.white,
            }}
          >
            <div style={{ unicodeBidi: "plaintext" }}>
              • اختبارات A/B على قوالب الرسائل لتحديد أوضح موضع للرمز.
            </div>
            <div>• تتبع استبيانات التعلّم وسرعة التعرف البصري لدى المستخدمين.</div>
            <div style={{ unicodeBidi: "plaintext" }}>
              • مراقبة لحظية لمحاولات الاحتيال المبلّغ عنها عبر لوحة /admin.
            </div>
            <div style={{ unicodeBidi: "plaintext" }}>
              • تقارير تدقيق دورية (vault_audit_logs) للشركاء والبنوك.
            </div>
          </div>
        </div>
      </div>
    </CorporateStage>
  );
};
