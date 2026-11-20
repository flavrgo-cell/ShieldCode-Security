import { SecureInterstitialPage } from "@/components/secure-interstitial-page";

export const dynamic = "force-dynamic";

export default async function GoPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params;
  return <SecureInterstitialPage hash={hash} />;
}
