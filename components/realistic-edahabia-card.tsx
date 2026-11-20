"use client";

import React, { useEffect, useRef } from "react";
import { ShieldCheck } from "lucide-react";

export interface RealisticEdahabiaCardProps {
  maskedPan: string;
  holderName: string;
  phoneMasked: string;
  secretWord: string;
  last4: string;
  protectSmsLinks: boolean;
  isAr: boolean;
}

/**
 * Photorealistic ISO Algerian Algérie Poste "Edahabia" Card showcase.
 * Uses requestAnimationFrame + CSS custom properties for zero-re-render 120fps pointer tilt.
 */
export const RealisticEdahabiaCard = React.memo(function RealisticEdahabiaCard({
  maskedPan,
  holderName,
  phoneMasked,
  secretWord,
  protectSmsLinks,
  isAr,
}: RealisticEdahabiaCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 7;
    const rx = (0.5 - py) * 7;
    const gx = Math.round(px * 100);
    const gy = Math.round(py * 100);

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      el.style.setProperty("--gx", `${gx}%`);
      el.style.setProperty("--gy", `${gy}%`);
      el.style.setProperty("--glow-opacity", "0.22");
      rafRef.current = null;
    });
  };

  const handlePointerLeave = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--gx", "52%");
    el.style.setProperty("--gy", "32%");
    el.style.setProperty("--glow-opacity", "0.08");
  };

  return (
    <div
      dir="ltr"
      className="w-full flex flex-col items-center [perspective:1200px]"
    >
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
          transition: "transform 150ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        className="relative aspect-[1240/819] w-full max-w-[445px] select-none overflow-hidden rounded-[20px] border border-sky-900/70 bg-[#051a30] ring-1 ring-inset ring-sky-200/35 shadow-[0_20px_42px_-14px_rgba(2,12,18,0.55),0_10px_20px_-8px_rgba(8,145,178,0.28)]"
      >
        {/* 1. Unaltered 1:1 Official Algérie Poste Edahabia Reference Artwork */}
        <img
          src="/images/edahabia-card-plate.jpg?v=2"
          alt={
            isAr
              ? "بطاقة بريد الجزائر الذهبية الرسمية"
              : "Official Algérie Poste Edahabia Card"
          }
          width={1240}
          height={819}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="pointer-events-none block h-full w-full object-cover"
        />

        {/* 2. Subtle Interactive Studio Specular Sheen & Satin Edge Bevel */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[20px]"
          style={{
            background:
              "radial-gradient(circle 220px at var(--gx, 52%) var(--gy, 32%), rgba(224, 247, 255, var(--glow-opacity, 0.08)) 0%, rgba(125, 211, 252, 0.05) 45%, transparent 78%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[20px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),inset_0_-2px_6px_rgba(2,10,24,0.45)]"
        />
      </div>

      {/* 3. Live Protected Card Binding Telemetry (Positioned below card without altering card face) */}
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="mt-3 w-full max-w-[445px] rounded-2xl border border-teal-500/25 dark:border-cyan-400/20 bg-white/95 dark:bg-[#061820]/95 px-4 py-3 shadow-sm space-y-2"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-teal-500/35 bg-teal-50 dark:bg-[#031017] px-2.5 py-1">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-cyan-300 shrink-0" />
            <span className="font-mono text-xs font-extrabold tracking-wide text-teal-900 dark:text-cyan-200">
              [{secretWord}]
            </span>
          </div>
          <span className="rounded-full border border-teal-500/30 bg-teal-500/10 dark:bg-teal-500/20 px-2.5 py-0.5 text-[11px] font-extrabold text-teal-800 dark:text-cyan-200">
            {protectSmsLinks
              ? isAr
                ? "محمية • /go/:hash ✓"
                : "Shielded • /go/:hash ✓"
              : isAr
              ? "ختم SMS مفعل"
              : "SMS Stamp Active"}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs pt-1 border-t border-slate-200/70 dark:border-teal-900/50">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
              {isAr ? "حامل البطاقة المحمية" : "Protected Cardholder"}
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white truncate block">
              {holderName}
            </span>
          </div>
          <div dir="ltr" className="text-right">
            <span className="font-mono text-[11px] font-extrabold text-slate-800 dark:text-cyan-100 tabular-nums block">
              {maskedPan}
            </span>
            <span className="font-mono text-[10px] font-bold text-teal-700 dark:text-teal-300 tabular-nums block">
              BaridiMob: {phoneMasked}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
