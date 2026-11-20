import type { Metadata } from "next";
import type { ReactNode } from "react";

// The /go/<token> URL is a bearer capability: never leak it via Referer, never index it.
export const metadata: Metadata = {
  title: "ShieldCode • Secure Link",
  referrer: "no-referrer",
  robots: { index: false, follow: false, nocache: true },
};

export default function SecureLinkLayout({ children }: { children: ReactNode }) {
  return children;
}
