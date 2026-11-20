"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Shield,
  ShieldCheck,
  Camera,
  Mail,
  CheckCircle,
  Lock,
  Star,
  Zap,
  UserCheck,
  KeyRound,
  Layers,
  Building2,
  ExternalLink,
  CreditCard,
  Code2,
  LogOut,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { EcommerceDeliveryPhraseSetup } from "@/components/ecommerce-delivery-phrase-setup";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShieldCodeBrandLogo } from "@/components/vector-graphics";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { formatDzd } from "@/lib/currency";

const CheckoutModal = dynamic(
  () => import("@/components/checkout-modal").then((m) => m.CheckoutModal),
  { ssr: false }
);

const EdahabiaCardShield = dynamic(
  () =>
    import("@/components/edahabia-card-shield").then(
      (m) => m.EdahabiaCardShield
    ),
  {
    loading: () => (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="h-96 rounded-3xl bg-slate-200/50 dark:bg-slate-800/40" />
      </div>
    ),
  }
);

const AntiPhishingSetup = dynamic(
  () =>
    import("@/components/anti-phishing-setup").then((m) => m.AntiPhishingSetup),
  {
    loading: () => <div className="h-80 w-full bg-slate-950/90" />,
  }
);

const AlgerianAccountsDirectory = dynamic(
  () =>
    import("@/components/algerian-accounts-directory").then(
      (m) => m.AlgerianAccountsDirectory
    ),
  {
    loading: () => (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="h-96 rounded-3xl bg-slate-200/50 dark:bg-slate-800/40" />
      </div>
    ),
  }
);

const products = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    description: "High-quality sound with active noise cancellation",
    price: 42000,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 124,
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Smart Watch Pro",
    description: "Track your fitness and stay connected",
    price: 63000,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 89,
    badge: "New",
  },
  {
    id: 3,
    name: "Portable Power Bank",
    description: "20000mAh fast charging for all devices",
    price: 11500,
    image:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 256,
  },
  {
    id: 4,
    name: "Wireless Earbuds",
    description: "Crystal clear audio with 24h battery life",
    price: 21000,
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop",
    rating: 4.6,
    reviews: 198,
  },
];

const securityFeatures = [
  {
    icon: Camera,
    title: "Selfie Verification",
    description: "Every payment requires a real-time photo to verify identity",
  },
  {
    icon: Mail,
    title: "Email Confirmation",
    description:
      "Account owner receives instant notification with your anti-phishing code",
  },
  {
    icon: Shield,
    title: "Anti-Phishing Code",
    description: "Your personal secret code confirms the email is legitimate",
  },
  {
    icon: CheckCircle,
    title: "Owner Approval",
    description: "Transactions only complete after account owner approval",
  },
];

export type InitialSection = "all" | "b2b" | "store" | "onboarding" | "vault";

export function UnifiedPlatform({
  initialSection = "all",
}: {
  initialSection?: InitialSection;
}) {
  const { locale, dir, t } = useI18n();
  const { accessToken, user, signOut } = useAuth();
  const router = useRouter();
  const [checkoutProduct, setCheckoutProduct] = useState<
    (typeof products)[0] | null
  >(null);
  const [cart, setCart] = useState<typeof products>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (initialSection === "b2b") {
        document
          .getElementById("shieldcode-b2b2c-section")
          ?.scrollIntoView({ behavior: "smooth" });
      } else if (initialSection === "onboarding") {
        document
          .getElementById("saas-onboarding-section")
          ?.scrollIntoView({ behavior: "smooth" });
      } else if (initialSection === "vault") {
        document
          .getElementById("anti-phishing-vault-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [initialSection]);

  const addToCart = useCallback(
    (product: (typeof products)[0]) => {
      setCart((prev) => [...prev, product]);
      toast.success(
        locale === "ar"
          ? `تمت إضافة "${product.name}" إلى السلة`
          : `Added "${product.name}" to cart`
      );
    },
    [locale]
  );

  const buyNow = useCallback((product: (typeof products)[0]) => {
    setCheckoutProduct(product);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace("/register");
  }, [signOut, router]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div dir={dir} className="min-h-screen grid-wrapper"><div className="grid-background" aria-hidden="true" />
      <Toaster position="top-right" richColors />

      {/* ====================================================================
          Unified Sticky Header (Lightweight Frosted Glassmorphism)
      ==================================================================== */}
      <header className="sticky top-0 z-50 border-b border-teal-500/15 dark:border-white/10 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-sm ring-1 ring-white/20 dark:ring-white/10">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Vector Brand Mark */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 anti-banding-teal rounded-xl flex items-center justify-center shadow-retina-glow ring-1 ring-white/25">
              <ShieldCodeBrandLogo className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">
                ShieldCode &amp; TechStore
              </h1>
              <p className="text-xs text-muted-foreground">
                {t("brandSubtitle")}
              </p>
            </div>
          </div>

          {/* Quick Jump Navigation Pills on the Same Page */}
          <nav className="flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => scrollToSection("ecommerce-delivery-phrase-section")}
              className="gap-1.5 text-xs bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {t("navDeliveryPhrase")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => scrollToSection("edahabia-shield-section")}
              className="gap-1.5 text-xs border-amber-400/70 bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-950/60"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              {t("navEdahabia")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => scrollToSection("algerian-accounts-section")}
              className="gap-1.5 text-xs border-emerald-400/70 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 font-bold dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-950/60"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {locale === "ar" ? "البنوك والحسابات (DZ)" : "DZ Banks & Accounts"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => scrollToSection("techstore-section")}
              className="gap-1.5 text-xs"
            >
              <Layers className="w-3.5 h-3.5 text-primary" />
              {t("navStore")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => scrollToSection("anti-phishing-vault-section")}
              className="gap-1.5 text-xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              {t("navVault")}
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-cyan-500/50 text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20"
            >
              <Link href="/go/demoAppleSecureLink001">
                <ExternalLink className="w-3.5 h-3.5 text-cyan-600" />
                <span>{locale === "ar" ? "رابط التحقق الآمن (/go/:hash)" : "Secure Interstitial (/go/:hash)"}</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-teal-500/50 text-teal-800 dark:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 font-bold"
            >
              <Link href="/developer">
                <Code2 className="w-3.5 h-3.5 text-teal-600" />
                <span>{t("navDeveloper")}</span>
              </Link>
            </Button>
          </nav>

          {/* Right Badges, Theme Toggle, AR/EN Language Switcher & Shopping Cart */}
          <div className="flex flex-wrap items-center gap-2.5">
            <ThemeToggle />
            <LanguageSwitcher />
            {accessToken && user && (
              <>
                <Badge className="bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30 gap-1.5 font-mono tabular-nums">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{user.email_masked}</span>
                  <span>•</span>
                  <span dir="ltr">{user.phone_masked}</span>
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-1.5 text-xs border-teal-300 text-teal-800 hover:bg-teal-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{locale === "ar" ? "تسجيل الخروج" : "Sign Out"}</span>
                </Button>
              </>
            )}
            <Badge variant="outline" className="gap-1">
              <Shield className="w-3 h-3" />
              {t("secureCheckout")}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent cursor-pointer"
              onClick={() => {
                if (cart.length > 0) {
                  setCheckoutProduct(cart[0]);
                } else {
                  scrollToSection("techstore-section");
                }
              }}
              title={locale === "ar" ? "سلة المشتريات" : "Shopping Cart"}
            >
              <ShoppingCart className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* All page content above the platform-gradient-grid layer */}
      <div className="relative z-10">
      {/* ====================================================================
          PART 0: FRIENDLY UNIVERSAL SECURITY PHRASE HUB
      ==================================================================== */}
      <div id="ecommerce-delivery-phrase-section" className="scroll-mt-16">
        <EcommerceDeliveryPhraseSetup />
      </div>

      {/* ====================================================================
          PART 0.5: EDAHABIA POSTAL CARD ANTI-PHISHING SHIELD (البطاقة الذهبية)
      ==================================================================== */}
      <div id="edahabia-shield-section" className="scroll-mt-16 cv-auto">
        <EdahabiaCardShield />
      </div>

      {/* ====================================================================
          PART 0.75: LIVE ALGERIAN BANKING & POSTAL ACCOUNTS DIRECTORY (SUPABASE)
      ==================================================================== */}
      <div id="algerian-accounts-section" className="scroll-mt-16 cv-auto">
        <AlgerianAccountsDirectory />
      </div>

      {/* ====================================================================
          PART 1: ORIGINAL PLATFORM (TechStore Protected by SecurePay)
      ==================================================================== */}
      <div id="techstore-section" className="scroll-mt-16 cv-auto">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background py-16">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4" variant="secondary">
              <Lock className="w-3 h-3 me-1" />
              {t("heroBadge")}
            </Badge>
            <h2 className="text-4xl font-bold mb-4 text-balance">
              {t("heroTitle")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty mb-6">
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => scrollToSection("anti-phishing-vault-section")}
                className="gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
              >
                <Shield className="w-4 h-4" />
                {t("ctaVault")}
              </Button>
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {securityFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-4"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">{t("featuredProducts")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden group border-teal-500/15 dark:border-white/10 bg-white/95 dark:bg-slate-900/85 ring-1 ring-teal-500/10 dark:ring-white/10 shadow-retina-card hover-lift-gpu"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      width={400}
                      height={400}
                      loading="lazy"
                      decoding="async"
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                    />
                    {product.badge && (
                      <Badge className="absolute top-3 start-3 ring-1 ring-white/20 shadow-sm">
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-1">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">
                          {product.rating}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviews} {t("reviewsLabel")})
                      </span>
                    </div>
                    <p className="text-2xl font-bold tabular-nums text-teal-700 dark:text-teal-400">
                      {formatDzd(product.price, locale)}
                    </p>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => addToCart(product)}
                    >
                      {t("addToCart")}
                    </Button>
                    <Button
                      className="flex-1 gap-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
                      onClick={() => buyNow(product)}
                    >
                      <Lock className="w-3 h-3" />
                      {t("buyNow")}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-12">
              How SecurePay Protects You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: 1,
                  title: "Select Payment",
                  desc: "Choose your payment provider and enter account ID",
                },
                {
                  step: 2,
                  title: "Take Selfie",
                  desc: "Capture a real-time photo for verification",
                },
                {
                  step: 3,
                  title: "Owner Notified",
                  desc: "Account owner receives email with your photo and anti-phishing code",
                },
                {
                  step: 4,
                  title: "Approval",
                  desc: "Transaction completes only after owner approval",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Test Accounts Info */}
        <section className="py-8 border-t">
          <div className="container mx-auto px-4">
            <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-semibold mb-3 text-center">Test Accounts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-card rounded-lg border border-amber-300/60">
                  <p className="font-mono font-bold">6280••••4821</p>
                  <p className="text-muted-foreground text-xs">Edahabia (الذهبية)</p>
                </div>
                <div className="text-center p-3 bg-card rounded-lg">
                  <p className="font-mono font-bold">BARI-12345</p>
                  <p className="text-muted-foreground text-xs">BaridiMob</p>
                </div>
                <div className="text-center p-3 bg-card rounded-lg">
                  <p className="font-mono font-bold">RDPAY-67890</p>
                  <p className="text-muted-foreground text-xs">RedotPay</p>
                </div>
                <div className="text-center p-3 bg-card rounded-lg">
                  <p className="font-mono font-bold">ECCP-11111</p>
                  <p className="text-muted-foreground text-xs">ECCP</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ====================================================================
          PART 2: LIVE MOBILE PHONE SCREEN & CODE INPUT SIMULATOR ONLY
      ==================================================================== */}
      <section
        id="anti-phishing-vault-section"
        className="scroll-mt-16 border-t-4 border-teal-500/30 cv-auto"
      >
        <AntiPhishingSetup />
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>
              Protected by SecurePay Gateway &amp; ShieldCode Anti-Phishing API
              Vault
            </span>
          </div>
          <p>All transactions require account owner verification</p>
        </div>
      </footer>
      </div>{/* end relative z-10 content wrapper */}

      {/* Checkout Modal */}
      {checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
        />
      )}
    </div>
  );
}
