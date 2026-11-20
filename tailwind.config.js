/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Twitter/X "Chirp"-style bold geometric English typeface
        en: [
          '"Plus Jakarta Sans"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
        // Wide, thick geometric Arabic typeface for RTL
        ar: [
          "Cairo",
          "Almarai",
          "ui-sans-serif",
          "system-ui",
          '"Segoe UI"',
          "Tahoma",
          "Arial",
          "sans-serif",
        ],
        // Dynamically switches between `--font-ar` (rtl) and `--font-en` (ltr)
        sans: [
          "var(--font-sans-active)",
          '"Plus Jakarta Sans"',
          "Cairo",
          "Almarai",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          "monospace",
        ],
      },
      fontWeight: {
        // Default punchy Twitter-style medium weight for body copy
        normal: "500",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      },
      letterSpacing: {
        tight: "-0.02em",
        tighter: "-0.03em",
      },
      fontVariantNumeric: {
        tabular: "tabular-nums",
      },
      fontSize: {
        "fintech-kpi": [
          "1.875rem",
          {
            lineHeight: "2.25rem",
            letterSpacing: "-0.025em",
            fontWeight: "800",
          },
        ],
        "fintech-code": [
          "1.125rem",
          {
            lineHeight: "1.5rem",
            letterSpacing: "0.02em",
            fontWeight: "700",
          },
        ],
      },
      // 120fps GPU-only transition properties (transform + opacity only, zero layout reflow)
      transitionProperty: {
        gpu: "transform, opacity",
      },
      // Lightweight crisp 2-layer shadows (replacing heavy 4-layer large-spread shadows)
      boxShadow: {
        "retina-card":
          "0 1px 2px rgba(2, 12, 18, 0.06), 0 8px 20px -6px rgba(13, 148, 136, 0.14)",
        "retina-glass":
          "0 2px 6px rgba(2, 12, 18, 0.07), 0 14px 30px -10px rgba(13, 148, 136, 0.16)",
        "retina-glow":
          "0 2px 6px rgba(2, 12, 18, 0.14), 0 10px 22px -6px rgba(20, 184, 166, 0.34)",
      },
      // Multi-stop anti-banding 4K gradients (smooth interpolated Teal/Cyan chroma stops)
      backgroundImage: {
        "teal-4k":
          "linear-gradient(135deg, #0f766e 0%, #0d9488 24%, #0e9f9c 48%, #0891b2 74%, #06b6d4 100%)",
        "teal-obsidian-4k":
          "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(20, 184, 166, 0.16) 0%, rgba(13, 148, 136, 0.08) 38%, rgba(6, 182, 212, 0.03) 70%, transparent 100%), linear-gradient(160deg, #020c12 0%, #04151e 38%, #031118 72%, #020a0f 100%)",
        "teal-alabaster-4k":
          "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(20, 184, 166, 0.12) 0%, rgba(34, 211, 238, 0.06) 42%, rgba(240, 253, 250, 0.35) 76%, transparent 100%), linear-gradient(160deg, #f4fbfa 0%, #ffffff 44%, #f0fdfa 76%, #ecfeff 100%)",
      },
    },
  },
  plugins: [],
};
