import { NextResponse } from "next/server";

/**
 * DEVELOPMENT-ONLY mock of the Rust endpoint `GET /api/v1/verify-link/:hash`.
 * Lets the /go/:hash interstitial be previewed without the axum server.
 * In production set NEXT_PUBLIC_SHIELD_API_BASE (or reverse-proxy /api/v1/verify-link to axum);
 * this handler returns 404 whenever NODE_ENV === "production".
 */
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
};

const DEMO_LINKS: Record<string, { institution_name: string; secret_word: string | null; target_url: string }> = {
  demoAppleSecureLink001: {
    institution_name: "بوابة المعاملات الشاملة (بنوك • مالية • توصيل • خدمات)",
    secret_word: "Bachir34",
    target_url: "https://www.poste.dz/",
  },
  demoNoWordSecureLink01: {
    institution_name: "CPA",
    secret_word: null,
    target_url: "https://www.cpa-bank.dz/",
  },
};

export async function GET(req: Request, { params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params;
  const demo = process.env.NODE_ENV !== "production" ? DEMO_LINKS[hash] : undefined;

  if (!demo) {
    return NextResponse.json(
      { error_code: "VAULT_RESOURCE_NOT_FOUND", message: "Link not found or expired" },
      { status: 404, headers: NO_STORE_HEADERS },
    );
  }

  const url = new URL(req.url);
  const customWord = url.searchParams.get("word")?.trim().slice(0, 20);
  const resolvedWord =
    demo.secret_word !== null && customWord ? customWord : demo.secret_word;

  return NextResponse.json(
    {
      target_url: demo.target_url,
      institution_name: demo.institution_name,
      secret_word: resolvedWord,
      secret_word_configured: resolvedWord !== null,
      remaining_resolutions: 4,
      expires_at: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    },
    { headers: NO_STORE_HEADERS },
  );
}
