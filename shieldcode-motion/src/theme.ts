import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

const cairo = loadCairo("normal", {
  weights: ["400", "600", "700", "800", "900"],
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

export const COLORS = {
  bgDeep: "#050b16",
  bgNavy: "#091528",
  panelDark: "rgba(12, 26, 50, 0.84)",
  panelLight: "rgba(18, 38, 72, 0.78)",
  teal: "#00d4b6",
  tealDark: "#008c7a",
  cyan: "#38bdf8",
  emerald: "#10b981",
  gold: "#f59e0b",
  goldLight: "#fde68a",
  crimson: "#ef4444",
  crimsonDark: "#7f1d1d",
  white: "#ffffff",
  textSoft: "#cbd5e1",
  textMuted: "#94a3b8",
};
