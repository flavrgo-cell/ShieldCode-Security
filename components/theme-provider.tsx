"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "shieldcode_theme";
const OS_DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  mounted: boolean;
  setTheme: (next: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Global React Context ThemeProvider (`'light' | 'dark'`).
 * - Hydrates from `localStorage` or falls back dynamically to `window.matchMedia('(prefers-color-scheme: dark)')`.
 * - Programmatically injects/removes the `dark` class on the root `<html>` element.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // 1. Read saved preference from localStorage (or OS prefers-color-scheme) on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    let hasExplicitPreference = false;
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        setThemeState(stored);
        hasExplicitPreference = true;
      } else {
        const prefersDark = window.matchMedia(OS_DARK_MEDIA_QUERY).matches;
        setThemeState(prefersDark ? "dark" : "light");
      }
    } catch {
      // Ignore storage access errors in restricted environments
    } finally {
      setMounted(true);
    }

    // Track OS theme changes dynamically when the user has not saved an explicit override
    const media = window.matchMedia(OS_DARK_MEDIA_QUERY);
    const handleOsChange = (event: MediaQueryListEvent) => {
      try {
        if (!window.localStorage.getItem(THEME_STORAGE_KEY) && !hasExplicitPreference) {
          setThemeState(event.matches ? "dark" : "light");
        }
      } catch {
        // Ignore storage read errors
      }
    };

    media.addEventListener("change", handleOsChange);
    return () => media.removeEventListener("change", handleOsChange);
  }, []);

  // 2. Synchronously inject/remove `dark` class on root `<html>` so View Transitions snapshot the new DOM immediately
  useLayoutEffect(() => {
    if (!mounted || typeof document === "undefined") return;

    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.style.colorScheme = theme;
  }, [theme, mounted]);

  // 3. Persist theme preference asynchronously to localStorage
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore quota / privacy mode storage errors
    }
  }, [theme, mounted]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isDark: theme === "dark",
      mounted,
      setTheme,
      toggleTheme,
    }),
    [theme, mounted, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/** Custom hook exposing reactive Light/Dark theme state and toggle controls. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return ctx;
}
