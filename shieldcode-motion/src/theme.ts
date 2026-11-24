import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { Easing } from "remotion";

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

export const EASE = {
  outStrong: Easing.bezier(0.23, 1, 0.32, 1),
  inOutStrong: Easing.bezier(0.77, 0, 0.175, 1),
  emphasized: Easing.bezier(0.16, 1, 0.3, 1),
};

export const PALETTE = {
  bgVoid: "#040914",
  bgDeep: "#071122",
  panel: "rgba(12, 26, 50, 0.88)",
  panelElevated: "rgba(17, 36, 68, 0.90)",
  panelSubtle: "rgba(9, 20, 38, 0.76)",
  teal: "#00d4b6",
  tealDark: "#008573",
  tealGlow: "rgba(0, 212, 182, 0.24)",
  emerald: "#34d399",
  cyan: "#38bdf8",
  amber: "#f5a623",
  amberSoft: "#fde68a",
  crimson: "#ef4444",
  crimsonSoft: "#fca5a5",
  white: "#ffffff",
  soft: "#cbd5e1",
  muted: "#8da0b8",
  borderLight: "rgba(255, 255, 255, 0.11)",
};
