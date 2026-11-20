"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";

/**
 * Minimalist Navbar Language Switcher strictly locked to Arabic (`AR`) and English (`EN`).
 * Smoothly updates `document.documentElement.dir` (`rtl` <-> `ltr`) without reloading the page.
 */
export const LanguageSwitcher = React.memo(function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div
      role="group"
      aria-label="Language switcher (Arabic / English)"
      className="inline-flex items-center rounded-xl border border-teal-500/30 bg-teal-50/90 dark:bg-slate-900/80 dark:border-white/10 ring-1 ring-teal-500/15 dark:ring-white/10 p-0.5 shadow-xs"
    >
      <button
        type="button"
        onClick={() => setLocale("ar")}
        aria-pressed={locale === "ar"}
        className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition-colors duration-150 ${
          locale === "ar"
            ? "anti-banding-teal text-white shadow-xs"
            : "text-teal-800 dark:text-slate-300 hover:bg-teal-100/70 dark:hover:bg-slate-800/60"
        }`}
      >
        AR
      </button>

      <span className="px-0.5 text-[10px] text-teal-400 select-none">/</span>

      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition-colors duration-150 ${
          locale === "en"
            ? "anti-banding-teal text-white shadow-xs"
            : "text-teal-800 dark:text-slate-300 hover:bg-teal-100/70 dark:hover:bg-slate-800/60"
        }`}
      >
        EN
      </button>
    </div>
  );
});
