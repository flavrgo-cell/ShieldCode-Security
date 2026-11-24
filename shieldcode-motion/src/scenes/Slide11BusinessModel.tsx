import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { PALETTE } from "../theme";
import {
  CorporateHeaderBlock,
  CorporateStage,
  SovereignIcon,
  useCardMotion,
} from "../components/CorporateStage";

export const Slide11BusinessModel: React.FC = () => {
  const rev1 = useCardMotion(12, 22);
  const rev2 = useCardMotion(18, 22);
  const rev3 = useCardMotion(23, 22);

  const w1 = useCardMotion(40, 18);
  const w2 = useCardMotion(45, 18);
  const w3 = useCardMotion(49, 18);
  const w4 = useCardMotion(52, 18);

  const REVENUES = [
    {
      motion: rev1,
      tag: "B2B  •  البنوك والمؤسسات المالية",
      color: PALETTE.teal,
      title: "ترخيص واجهات API ومفاتيح الإنتاج (sc_live_)",
      desc: "اشتراك مؤسسي سنوي + تسعير حسب حجم رسائل الدمغ والتحقق (Pay-per-Stamp) مع استضافة سيادية متوافقة مع القانون 18-07.",
    },
    {
      motion: rev2,
      tag: "B2B2C  •  المتاجر وشركات التوصيل",
      color: PALETTE.cyan,
      title: "باقات المتاجر الإلكترونية ومنصات التوصيل",
      desc: "اشتراك شهري (SaaS) لدمج ودجت الحماية (shieldcode-widget.js)، وبوابة الروابط /go/[hash]، والدفع البيومتري لرفع معدل التحويل.",
    },
    {
      motion: rev3,
      tag: "B2C  •  حاملو الذهبية و CIB",
      color: PALETTE.amber,
      title: "حماية مجانية للمستهلك + باقة بريميوم",
      desc: "تفعيل مجاني لرمز مكافحة التصيد لبناء قاعدة مستخدمين واسعة، مع مزايا متقدمة لمراقبة البطاقات المتعددة والتنبيهات الفورية.",
    },
  ];

  const MOATS = [
    {
      motion: w1,
      icon: "bolt" as const,
      color: PALETTE.cyan,
      title: "تكلفة تنفيذ منخفضة",
      desc: "حل برمجي خالص لا يتطلب أجهزة Tokens أو تغييرات مكلفة.",
    },
    {
      motion: w2,
      icon: "shield" as const,
      color: PALETTE.teal,
      title: "سيادة وامتثال 100%",
      desc: "مصمم خصيصاً لقانون 18-07، وشبكات +213، و BIN 6280.",
    },
    {
      motion: w3,
      icon: "check" as const,
      color: PALETTE.emerald,
      title: "تعزيز ثقة العملاء",
      desc: "تجربة أمان مرئية ترفع ولاء العملاء وتميّز المؤسسة الشريكة.",
    },
    {
      motion: w4,
      icon: "key" as const,
      color: PALETTE.amber,
      title: "تكامل فوري للمطورين",
      desc: "بوابة /developer ومستندات OpenAPI 3.1 تختصر الربط إلى أيام.",
    },
  ];

  return (
    <CorporateStage
      slideIndex={11}
      accent={PALETTE.amber}
      secondaryAccent={PALETTE.teal}
    >
      <Sequence from={14} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={42} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.34} />
      </Sequence>

      <CorporateHeaderBlock
        title="نموذج العمل (B2B2C) والمزايا التنافسية المستدامة"
        subtitle="إيرادات متكررة عالية الهامش بفضل التكلفة التشغيلية المنخفضة وغياب الحاجة لأي أجهزة إضافية"
        accentColor={PALETTE.amber}
      />

      {/* Top 3 Revenue Engines */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 22,
          marginBottom: 22,
        }}
      >
        {REVENUES.map((r) => (
          <div
            key={r.tag}
            style={{
              background: PALETTE.panel,
              border: `1.5px solid ${r.color}66`,
              borderTop: "1.5px solid rgba(255,255,255,0.22)",
              borderRadius: 24,
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              opacity: r.motion.opacity,
              translate: r.motion.translate,
              scale: r.motion.scale,
            }}
          >
            <span
              style={{
                alignSelf: "flex-start",
                background: `${r.color}1e`,
                border: `1px solid ${r.color}66`,
                color: r.color,
                borderRadius: 999,
                padding: "4px 14px",
                fontSize: 15,
                fontWeight: 800,
                unicodeBidi: "plaintext",
              }}
            >
              {r.tag}
            </span>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: PALETTE.white,
                lineHeight: 1.35,
                unicodeBidi: "plaintext",
              }}
            >
              {r.title}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 17.5,
                fontWeight: 600,
                color: PALETTE.soft,
                lineHeight: 1.55,
                unicodeBidi: "plaintext",
              }}
            >
              {r.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom 4 Competitive Advantages (Why We Win) */}
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
            fontWeight: 900,
            color: PALETTE.amberSoft,
            marginBottom: 14,
            unicodeBidi: "plaintext",
          }}
        >
          المزايا التنافسية المستدامة (Why We Win):
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          {MOATS.map((m) => (
            <div
              key={m.title}
              style={{
                background: PALETTE.panelElevated,
                border: `1px solid ${m.color}44`,
                borderRadius: 18,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                opacity: m.motion.opacity,
                translate: m.motion.translate,
                scale: m.motion.scale,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <SovereignIcon kind={m.icon} color={m.color} size={40} />
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: PALETTE.white,
                  }}
                >
                  {m.title}
                </span>
              </div>
              <div
                style={{
                  fontSize: 15.5,
                  fontWeight: 600,
                  color: PALETTE.soft,
                  lineHeight: 1.48,
                  unicodeBidi: "plaintext",
                }}
              >
                {m.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CorporateStage>
  );
};
