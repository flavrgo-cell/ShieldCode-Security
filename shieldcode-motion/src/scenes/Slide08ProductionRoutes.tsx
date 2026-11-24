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

export const Slide08ProductionRoutes: React.FC = () => {
  const r1 = useCardMotion(12, 18);
  const r2 = useCardMotion(18, 18);
  const r3 = useCardMotion(23, 18);
  const r4 = useCardMotion(27, 18);
  const statusMotion = useCardMotion(34, 14);
  const banksPanel = useCardMotion(20, 24);

  const ROUTES = [
    {
      motion: r1,
      domain: "واجهات المستخدم",
      count: "9",
      color: PALETTE.cyan,
      paths: "/  •  /vault  •  /verify  •  /go/[hash]  •  /developer",
      role: "المنصة الموحدة، الخزنة، الدفع البيومتري، بوابة العبور، والمطورين",
    },
    {
      motion: r2,
      domain: "المصادقة والـ OTP",
      count: "4",
      color: PALETTE.teal,
      paths: "/api/v1/auth/register  •  /verify-otp  •  /session",
      role: "التسجيل، التحقق المزدوج (+213)، إدارة الجلسة، والتأهيل ذو 5 مراحل",
    },
    {
      motion: r3,
      domain: "الخزنة والبطاقات",
      count: "8",
      color: PALETTE.amber,
      paths: "/api/v1/security/code  •  /cards/edahabia  •  /accounts",
      role: "حفظ وتدوير رمز الأمان، درع الذهبية، فحص RIP/RIB، ومحاكاة SMS",
    },
    {
      motion: r4,
      domain: "بوابة B2B والودجت",
      count: "7+",
      color: PALETTE.emerald,
      paths: "/api/v1/institutions/*  •  /widget/*  •  /health/db",
      role: "مفاتيح sc_live_، الدفع والتحقق، الودجت المدمج، وفحص صحة Supabase",
    },
  ];

  return (
    <CorporateStage
      slideIndex={8}
      accent={PALETTE.emerald}
      secondaryAccent={PALETTE.amber}
    >
      <Sequence from={14} layout="none">
        <Audio src={staticFile("sfx/glass_tick.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={36} layout="none">
        <Audio src={staticFile("sfx/shield_lock.wav")} volume={0.34} />
      </Sequence>

      <CorporateHeaderBlock
        title="جاهزية إنتاجية كاملة: تغطية 27+ مساراً و 16 مؤسسة مالية جزائرية"
        subtitle="بنية API-First متكاملة تجمع بين بوابات المستهلك، لوحة المطورين، ودليل البنوك والحسابات الجزائرية"
        accentColor={PALETTE.emerald}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.28fr 0.92fr",
          gap: 24,
          flex: 1,
        }}
      >
        {/* RIGHT: 27+ Compiled API & Frontend Routes Matrix */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          {ROUTES.map((row) => (
            <div
              key={row.domain}
              style={{
                background: PALETTE.panel,
                border: `1.5px solid ${row.color}55`,
                borderRadius: 20,
                padding: "14px 20px",
                display: "grid",
                gridTemplateColumns: "74px 1fr",
                gap: 18,
                alignItems: "center",
                opacity: row.motion.opacity,
                translate: row.motion.translate,
                scale: row.motion.scale,
              }}
            >
              <div
                dir="ltr"
                style={{
                  height: 64,
                  borderRadius: 16,
                  background: `${row.color}1e`,
                  border: `1.5px solid ${row.color}77`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONTS.mono,
                  fontSize: 28,
                  fontWeight: 700,
                  color: row.color,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {row.count}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
                      color: PALETTE.white,
                      unicodeBidi: "plaintext",
                    }}
                  >
                    {row.domain}
                  </span>
                  <span
                    dir="ltr"
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: row.color,
                    }}
                  >
                    {row.paths}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: PALETTE.soft,
                  }}
                >
                  {row.role}
                </div>
              </div>
            </div>
          ))}

          {/* Build Verification Strip */}
          <div
            style={{
              background: "rgba(6, 78, 59, 0.45)",
              border: `1.5px solid ${PALETTE.emerald}`,
              borderRadius: 16,
              padding: "12px 20px",
              fontSize: 17,
              fontWeight: 800,
              color: "#6ee7b7",
              textAlign: "center",
              opacity: statusMotion.opacity,
              unicodeBidi: "plaintext",
            }}
          >
            ✓ الحالة الإنتاجية: 0 أخطاء TypeScript • 0 تحذيرات بناء Turbopack • توثيق OpenAPI 3.1 حي في /api/docs
          </div>
        </div>

        {/* LEFT: 16 Algerian Financial Institutions Directory */}
        <div
          style={{
            background:
              "linear-gradient(155deg, rgba(16, 34, 62, 0.94), rgba(7, 16, 30, 0.98))",
            border: `2px solid ${PALETTE.amber}77`,
            borderTop: "2px solid rgba(255,255,255,0.22)",
            borderRadius: 26,
            padding: "24px 26px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 16,
            opacity: banksPanel.opacity,
            translate: banksPanel.translate,
            scale: banksPanel.scale,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <SovereignIcon kind="building" color={PALETTE.amber} size={54} />
            <div>
              <div
                style={{
                  fontSize: 25,
                  fontWeight: 900,
                  color: PALETTE.white,
                }}
              >
                16 مؤسسة مالية جزائرية
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: PALETTE.amberSoft,
                }}
              >
                دليل متكامل مع فحص رياضي Modulo 97
              </div>
            </div>
          </div>

          {/* Group 1: Algérie Poste */}
          <div
            style={{
              background: "rgba(245, 166, 35, 0.14)",
              border: `1.5px solid ${PALETTE.amber}88`,
              borderRadius: 18,
              padding: "14px 18px",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: PALETTE.amberSoft,
                marginBottom: 4,
              }}
            >
              بريد الجزائر Algérie Poste (007)
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: PALETTE.white,
                unicodeBidi: "plaintext",
              }}
            >
              دعم كامل للبطاقة الذهبية (BIN 6280) وحسابات RIP (00799999)
            </div>
          </div>

          {/* Group 2: 6 Public Banks */}
          <div
            style={{
              background: "rgba(4, 10, 22, 0.72)",
              border: `1px solid ${PALETTE.cyan}55`,
              borderRadius: 18,
              padding: "14px 18px",
            }}
          >
            <div
              style={{
                fontSize: 19,
                fontWeight: 900,
                color: PALETTE.cyan,
                marginBottom: 6,
              }}
            >
              البنوك العمومية الستة (6 بنوك)
            </div>
            <div
              dir="ltr"
              style={{
                fontFamily: FONTS.mono,
                fontSize: 15.5,
                fontWeight: 700,
                color: PALETTE.soft,
                lineHeight: 1.55,
              }}
            >
              BNA (001) • BEA (002) • BADR (003)
              <br />
              CPA (004) • CNEP (005) • BDL (006)
            </div>
          </div>

          {/* Group 3: 9 Private & Islamic Banks */}
          <div
            style={{
              background: "rgba(4, 10, 22, 0.72)",
              border: `1px solid ${PALETTE.teal}55`,
              borderRadius: 18,
              padding: "14px 18px",
            }}
          >
            <div
              style={{
                fontSize: 19,
                fontWeight: 900,
                color: PALETTE.teal,
                marginBottom: 6,
              }}
            >
              المصارف الخاصة والإسلامية (9 بنوك)
            </div>
            <div
              style={{
                fontSize: 15.5,
                fontWeight: 700,
                color: PALETTE.soft,
                lineHeight: 1.55,
                unicodeBidi: "plaintext",
              }}
            >
              بنك البركة (029) • مصرف السلام (034) • SGA (021) • BNP Paribas (020) • AGB (027) • Housing (031) • Fransabank (032) • Natixis (026) • Arab Bank (014)
            </div>
          </div>
        </div>
      </div>
    </CorporateStage>
  );
};
