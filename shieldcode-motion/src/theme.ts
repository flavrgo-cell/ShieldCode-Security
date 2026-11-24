import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { Easing } from "remotion";

const cairo = loadCairo("normal", {
  weights: ["500", "600", "700", "800", "900"],
  subsets: ["arabic", "latin"],
});

const mono = loadJetBrainsMono("normal", {
  weights: ["600", "700"],
  subsets: ["latin"],
});

export const FONTS = {
  arabic: cairo.fontFamily,
  mono: mono.fontFamily,
};

export const EASE = {
  out: Easing.bezier(0.22, 1, 0.36, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  snappy: Easing.bezier(0.16, 1, 0.3, 1),
};

export const LIGHT = {
  canvas: "#F8FAFC",
  canvasWarm: "#FFFFFF",
  card: "#FFFFFF",
  cardSubtle: "#F1F5F9",
  ink: "#0F172A",
  inkSecondary: "#334155",
  inkMuted: "#64748B",
  border: "rgba(15, 23, 42, 0.08)",
  shadowHero:
    "0 30px 70px -15px rgba(15, 23, 42, 0.12), 0 10px 24px -8px rgba(15, 23, 42, 0.06)",
  shadowSoft:
    "0 16px 38px -10px rgba(15, 23, 42, 0.09), 0 4px 12px rgba(15, 23, 42, 0.04)",
  teal: "#0D9488",
  tealBright: "#14B8A6",
  tealBg: "#CCFBF1",
  tealSoft: "#F0FDFA",
  emerald: "#059669",
  emeraldBg: "#D1FAE5",
  blue: "#2563EB",
  blueBg: "#DBEAFE",
  gold: "#D97706",
  goldBright: "#F59E0B",
  goldBg: "#FEF3C7",
  rose: "#E11D48",
  roseBg: "#FFE4E6",
  roseSoft: "#FFF1F2",
};
