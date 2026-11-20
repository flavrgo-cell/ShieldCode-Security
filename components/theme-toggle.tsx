"use client";

import React from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { type Theme, useTheme } from "@/components/theme-provider";
import { useI18n } from "@/lib/i18n";

const ICON_SPRING = {
  type: "spring" as const,
  stiffness: 200,
  damping: 10,
};

/**
 * Lightweight Theme Toggle powered by the native View Transitions API.
 * Uses `document.startViewTransition` for a GPU-composited 300ms circular clip-path wipe,
 * while isolating Framer Motion spring physics strictly to the Sun/Moon SVG icons.
 */
export function triggerViewTransitionTheme(
  currentTheme: Theme,
  setTheme: (next: Theme) => void,
  triggerElement?: HTMLElement | null
) {
  const newTheme: Theme = currentTheme === "dark" ? "light" : "dark";

  const canUseViewTransition =
    typeof document !== "undefined" &&
    typeof document.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canUseViewTransition) {
    setTheme(newTheme);
    return;
  }

  const root = document.documentElement;
  if (triggerElement) {
    const rect = triggerElement.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    root.style.setProperty("--vt-x", `${x}px`);
    root.style.setProperty("--vt-y", `${y}px`);
    root.style.setProperty("--vt-r", `${endRadius}px`);
  } else {
    root.style.setProperty("--vt-x", "50%");
    root.style.setProperty("--vt-y", "50%");
    root.style.setProperty("--vt-r", "150vmax");
  }

  document.startViewTransition(() => {
    flushSync(() => {
      setTheme(newTheme);
    });
  });
}

export const ThemeToggle = React.memo(function ThemeToggle({
  className = "",
}: {
  className?: string;
}) {
  const { theme, isDark, setTheme } = useTheme();
  const { locale } = useI18n();

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    triggerViewTransitionTheme(theme, setTheme, event.currentTarget);
  };

  const label =
    locale === "ar"
      ? isDark
        ? "الوضع الليلي"
        : "الوضع النهاري"
      : isDark
      ? "Dark"
      : "Light";

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={
        locale === "ar"
          ? isDark
            ? "التبديل إلى الوضع النهاري"
            : "التبديل إلى الوضع الليلي"
          : isDark
          ? "Switch to Light Mode"
          : "Switch to Dark Mode"
      }
      aria-pressed={isDark}
      className={`group relative inline-flex h-9 items-center gap-2 overflow-hidden rounded-xl border border-teal-500/35 bg-teal-50/90 px-3 text-xs font-bold tracking-tight text-teal-900 ring-1 ring-teal-500/15 shadow-xs active:scale-95 hover:border-teal-500/60 hover:bg-teal-100/90 dark:border-white/10 dark:bg-slate-900/80 dark:ring-white/10 dark:text-cyan-300 dark:hover:border-cyan-400/50 dark:hover:bg-slate-900/95 transition-colors duration-150 ${className}`}
    >
      <span className="relative flex h-4 w-4 items-center justify-center">
        <LazyMotion features={domAnimation} strict>
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <m.span
                key="moon-icon"
                initial={{ rotate: 90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: -90, scale: 0, opacity: 0 }}
                transition={ICON_SPRING}
                className="flex items-center justify-center text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
              >
                <Moon className="h-4 w-4" strokeWidth={2.2} />
              </m.span>
            ) : (
              <m.span
                key="sun-icon"
                initial={{ rotate: 90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: -90, scale: 0, opacity: 0 }}
                transition={ICON_SPRING}
                className="flex items-center justify-center text-teal-600 drop-shadow-[0_0_8px_rgba(13,148,136,0.5)]"
              >
                <Sun className="h-4 w-4" strokeWidth={2.2} />
              </m.span>
            )}
          </AnimatePresence>
        </LazyMotion>
      </span>

      <span className="hidden sm:inline" data-theme={theme}>
        {label}
      </span>
    </button>
  );
});
