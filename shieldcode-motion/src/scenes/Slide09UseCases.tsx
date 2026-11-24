import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { FONTS, PALETTE } from "../theme";
import {
  CorporateHeaderBlock,
  CorporateStage,
  SovereignIcon,
  useCardMotion,
} from "../components/CorporateStage";

export const Slide09UseCases: React.FC = () => {
  const u1 = useCardMotion(12, 20);
  const u2 = useCardMotion(18, 20);
  const u3 = useCardMotion(23, 20);
  const u4 = useCardMotion(32, 22);
  const u5 = useCardMotion(38, 22);
  const eq = useCardMotion(52, 16);

  const TOP_CASES = [
    {
      motion: u1,
      icon: "card" as const,
      color: PALETTE.amber,
      title: "تأكيدات التحويلات والدفع",
      desc: "دمغ إشعارات الدفع بالذهبية وCIB قبل خصم أي مبلغ مع التحقق البيومتري.",
    },
    {
      motion: u2,
      icon: "lock" as const,
      color: PALETTE.teal,
      title: "تنبيهات تسجيل الدخول",
      desc: "تأكيد صدور تنبيهات الدخول الجديد أو تغيير كلمة المرور من المنصة الرسمية.",
    },
    {
      motion: u3,
      icon: "mail" as const,
      color: PALETTE.cyan,
      title: "ردود دعم العملاء",
      desc: "إثبات هوية فريق الدعم في رسائل البريد والردود الحساسة لمنع الهندسة الاجتماعية.",
    },
  ];

  return (
    <CorporateStage
      slideIndex={9}
      accent={PALETTE.teal}
      secondaryAccent={PALETTE.amber}
    >
      <Sequence from={14} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={54} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.34} />
      </Sequence>

      <CorporateHeaderBlock
        title="حالات الاستخدام وسيناريوهات صدّ التهديدات الميدانية"
        subtitle="رمز الأمان الشخصي يعمل كدرع مركزي موحّد يحمي كافة نقاط التماس بين المؤسسة والعميل"
        accentColor={PALETTE.teal}
      />

      {/* Row 1: 3 Banking & Support Use Cases */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          marginBottom: 18,
        }}
      >
        {TOP_CASES.map((c) => (
          <div
            key={c.title}
            style={{
              background: PALETTE.panel,
              border: `1.5px solid ${c.color}55`,
              borderTop: "1.5px solid rgba(255,255,255,0.2)",
              borderRadius: 22,
              padding: "20px 22px",
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              opacity: c.motion.opacity,
              translate: c.motion.translate,
              scale: c.motion.scale,
            }}
          >
            <SovereignIcon kind={c.icon} color={c.color} size={50} />
            <div>
              <div
                style={{
                  fontSize: 21,
                  fontWeight: 900,
                  color: PALETTE.white,
                  marginBottom: 6,
                }}
              >
                {c.title}
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: PALETTE.soft,
                  lineHeight: 1.5,
                  unicodeBidi: "plaintext",
                }}
              >
                {c.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: 2 Flagship Ecosystem Scenarios (Mawthouq/DzExpress + Partner Widget) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            background: PALETTE.panelElevated,
            border: `1.5px solid ${PALETTE.emerald}66`,
            borderRadius: 22,
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 18,
            opacity: u4.opacity,
            translate: u4.translate,
            scale: u4.scale,
          }}
        >
          <SovereignIcon kind="rocket" color={PALETTE.emerald} size={56} />
          <div>
            <div
              style={{
                fontSize: 21,
                fontWeight: 900,
                color: PALETTE.white,
                marginBottom: 6,
                unicodeBidi: "plaintext",
              }}
            >
              إشعارات توصيل الطرود والتجارة الإلكترونية (Mawthouq / DzExpress)
            </div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: PALETTE.soft,
                lineHeight: 1.52,
                unicodeBidi: "plaintext",
              }}
            >
              تغليف روابط تتبع الطرود والدفع عند الاستلام عبر بوابة{" "}
              <span dir="ltr" style={{ fontFamily: FONTS.mono, color: PALETTE.emerald }}>
                /go/[hash]
              </span>{" "}
              المدموغة برمز العميل لإحباط رسائل التوصيل المزيفة.
            </div>
          </div>
        </div>

        <div
          style={{
            background: PALETTE.panelElevated,
            border: `1.5px solid ${PALETTE.cyan}66`,
            borderRadius: 22,
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 18,
            opacity: u5.opacity,
            translate: u5.translate,
            scale: u5.scale,
          }}
        >
          <SovereignIcon kind="phone" color={PALETTE.cyan} size={56} />
          <div>
            <div
              style={{
                fontSize: 21,
                fontWeight: 900,
                color: PALETTE.white,
                marginBottom: 6,
              }}
            >
              التحقق عبر قنوات الطرف الثالث والودجت المدمج
            </div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: PALETTE.soft,
                lineHeight: 1.52,
                unicodeBidi: "plaintext",
              }}
            >
              تمكين المتاجر والشركاء من عرض ختم الأمان الشخصي للعميل مباشرة داخل صفحاتهم عبر{" "}
              <span dir="ltr" style={{ fontFamily: FONTS.mono, color: PALETTE.cyan }}>
                shieldcode-widget.js
              </span>
              .
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Threat-Mitigation Equation Banner */}
      <div
        style={{
          background:
            "linear-gradient(90deg, rgba(239,68,68,0.14), rgba(0,212,182,0.2), rgba(52,211,153,0.18))",
          border: `1.5px solid ${PALETTE.teal}88`,
          borderRadius: 20,
          padding: "16px 26px",
          opacity: eq.opacity,
          translate: eq.translate,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: PALETTE.amberSoft,
            flexShrink: 0,
          }}
        >
          معادلة صدّ التهديد:
        </span>
        <span
          style={{
            fontSize: 18.5,
            fontWeight: 700,
            color: PALETTE.white,
            lineHeight: 1.5,
            unicodeBidi: "plaintext",
          }}
        >
          المهاجمون يرسلون رسائل بدون رمز أو برموز عشوائية مزيفة ◄ يلاحظ المستخدم غياب رمزه السري فوراً ويتجاهل الرابط ◄ سجل التدقيق يرصد أي محاولة غير متوقعة ويرسل تنبيهاً أمنياً لحظياً.
        </span>
      </div>
    </CorporateStage>
  );
};
