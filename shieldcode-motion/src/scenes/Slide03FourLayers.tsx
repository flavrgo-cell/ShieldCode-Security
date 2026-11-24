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

export const Slide03FourLayers: React.FC = () => {
  const frame = useCurrentFrame();

  const l1 = useCardMotion(12, 22);
  const l2 = useCardMotion(19, 22);
  const l3 = useCardMotion(25, 22);
  const l4 = useCardMotion(30, 22);

  // Live micro-demo animations inside the 4 cards
  const scanLineY = interpolate(frame % 75, [0, 75], [0, 100]);

  const LAYERS = [
    {
      motion: l1,
      icon: "shield" as const,
      color: PALETTE.teal,
      tag: "الطبقة 1 • تحقق بشري فوري",
      title: "رمز مكافحة التصيّد الشخصي (Anti-Phishing)",
      desc: "سلسلة مخصصة (6–12 حرفاً/رقماً) يختارها المستخدم داخل منصتنا وتُدمج آلياً في كل رسالة SMS أو بريد إلكتروني أو إشعار تطبيق. غياب الرمز يعني فوراً أن الرسالة مزيفة.",
      badge: "SEAL: BACHIR34  ✓",
    },
    {
      motion: l2,
      icon: "camera" as const,
      color: PALETTE.cyan,
      tag: "الطبقة 2 • إثبات الحضور الحي",
      title: "المصادقة البيومترية الحية (WebRTC Selfie)",
      desc: "إلزام المشتري بالتقاط صورة ذاتية حية مباشرة عبر المتصفح (WebRTC / HTML5 Canvas) قبل إتمام الدفع، وإرسالها مع رمز الأمان لمالك الحساب للموافقة أو الرفض الفوري.",
      badge: "WEBRTC LIVENESS • LIVE SCAN",
      hasScanner: true,
    },
    {
      motion: l3,
      icon: "link" as const,
      color: PALETTE.emerald,
      tag: "الطبقة 3 • تغليف الروابط",
      title: "بوابة العبور الآمن المشفرة (/go/[hash])",
      desc: "تغليف الروابط المالية وروابط التوصيل بتواقيع مشفرة (128-bit Base64URL) مع ميزانية فتح محدودة، لعرض ختم الأمان الشخصي واسم المؤسسة الموثّقة قبل توجيه المستخدم.",
      badge: "/go/a8f9x2 • 128-bit Base64URL",
    },
    {
      motion: l4,
      icon: "card" as const,
      color: PALETTE.amber,
      tag: "الطبقة 4 • بريد الجزائر BIN 6280",
      title: "درع البطاقة الذهبية (Zero-Exposure Shield)",
      desc: "حماية البطاقة الذهبية (BIN 6280) وبطاقات CIB ببصمة HMAC-SHA256 مع عرض مقنّع ومنع برمجي صارم لتخزين الرقم الكامل PAN أو CVV2 أو PIN نهائياً.",
      badge: "6280 •••• •••• 4821  |  HMAC-SHA256",
    },
  ];

  return (
    <CorporateStage
      slideIndex={3}
      accent={PALETTE.teal}
      secondaryAccent={PALETTE.cyan}
    >
      <Sequence from={14} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={34} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.35} />
      </Sequence>

      <CorporateHeaderBlock
        title="الحل المقترح: درع حماية رباعي الطبقات يقضي على التصيّد"
        subtitle="منظومة متكاملة تجمع بساطة رمز مكافحة التصيّد للمستخدم مع صلابة التشفير والتحقق البيومتري"
        accentColor={PALETTE.teal}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          flex: 1,
        }}
      >
        {LAYERS.map((layer) => (
          <div
            key={layer.tag}
            style={{
              background: PALETTE.panel,
              border: `1.5px solid ${layer.color}66`,
              borderTop: "1.5px solid rgba(255,255,255,0.22)",
              borderRadius: 26,
              padding: "24px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 14,
              opacity: layer.motion.opacity,
              translate: layer.motion.translate,
              scale: layer.motion.scale,
              boxShadow: "0 20px 44px rgba(0,0,0,0.44)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <SovereignIcon
                  kind={layer.icon}
                  color={layer.color}
                  size={58}
                />
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: layer.color,
                      marginBottom: 2,
                      unicodeBidi: "plaintext",
                    }}
                  >
                    {layer.tag}
                  </div>
                  <div
                    style={{
                      fontSize: 25,
                      fontWeight: 900,
                      color: PALETTE.white,
                      unicodeBidi: "plaintext",
                    }}
                  >
                    {layer.title}
                  </div>
                </div>
              </div>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: 19,
                fontWeight: 600,
                lineHeight: 1.58,
                color: PALETTE.soft,
                unicodeBidi: "plaintext",
              }}
            >
              {layer.desc}
            </p>

            {/* Live Technical Proof Pill inside each Layer */}
            <div
              dir="ltr"
              style={{
                position: "relative",
                overflow: "hidden",
                background: "rgba(4, 9, 20, 0.85)",
                border: `1px solid ${layer.color}55`,
                borderRadius: 14,
                padding: "10px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: FONTS.mono,
                fontSize: 16,
                fontWeight: 700,
                color: layer.color,
              }}
            >
              <span>{layer.badge}</span>
              <span
                style={{
                  fontSize: 13,
                  color: PALETTE.emerald,
                  background: "rgba(52, 211, 153, 0.14)",
                  padding: "3px 10px",
                  borderRadius: 999,
                }}
              >
                ACTIVE
              </span>

              {layer.hasScanner && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: `${scanLineY}%`,
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${PALETTE.cyan}, transparent)`,
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </CorporateStage>
  );
};
