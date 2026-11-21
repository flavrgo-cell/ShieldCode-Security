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
  Copy,
  Check,
  Sparkles,
  ArrowDown,
  ShieldAlert,
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
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const copyToClipboard = useCallback(
    (text: string, label: string) => {
      if (typeof window !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(text);
        setCopiedAccount(text);
        toast.success(
          locale === "ar"
            ? `تم نسخ ${label} (${text}) إلى الحافظة`
            : `Copied ${label} (${text}) to clipboard`
        );
        setTimeout(() => setCopiedAccount(null), 2000);
      }
    },
    [locale]
  );

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
        {/* Luxury Modern Hero Section */}
        <section className="relative overflow-hidden py-20 border-b border-teal-500/15 dark:border-white/10 bg-gradient-to-b from-teal-500/5 via-background/60 to-background">
          <div className="container mx-auto px-4 text-center relative z-10">
            {/* Live Security Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 text-xs font-semibold mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>{locale === "ar" ? "درع الأمان الرقمي الجزائري الموحد • ShieldCode v2.4" : "Unified Algerian Security Shield • ShieldCode v2.4"}</span>
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            </div>

            {/* Hero Main Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5 text-balance tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-teal-700 via-emerald-600 to-cyan-600 dark:from-teal-300 dark:via-emerald-400 dark:to-cyan-300 bg-clip-text text-transparent">
                {t("heroTitle")}
              </span>
            </h2>

            {/* Hero Subtitle */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto text-pretty mb-8 leading-relaxed">
              {t("heroSubtitle")}
            </p>

            {/* 4 Value Pillars */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-10 text-xs font-medium">
              <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-teal-500/20 bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm">
                <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>{locale === "ar" ? "كود أمان ضد التصيد" : "Anti-Phishing Code"}</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-emerald-500/20 bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm">
                <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{locale === "ar" ? "فحص بيومتري بالسيلفي" : "Biometric Selfie"}</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-amber-500/20 bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm">
                <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{locale === "ar" ? "البطاقة الذهبية (بريد الجزائر)" : "Edahabia Gold Card"}</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-cyan-500/20 bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm">
                <Lock className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>{locale === "ar" ? "قانون 18-07 لحماية البيانات" : "Law 18-07 Compliant"}</span>
              </div>
            </div>

            {/* Hero Action CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3.5">
              <Button
                size="lg"
                onClick={() => scrollToSection("techstore-products-grid")}
                className="gap-2.5 text-sm font-bold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/20 hover-lift-gpu"
              >
                <ShoppingCart className="w-4 h-4" />
                {locale === "ar" ? "استعراض المنتجات والشراء الآمن" : "Explore Products & Buy Safely"}
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("ecommerce-delivery-phrase-section")}
                className="gap-2 text-sm font-semibold border-teal-500/30 hover:bg-teal-500/10 text-teal-900 dark:text-teal-200"
              >
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                {locale === "ar" ? "إعداد رمز الأمان الشخصي" : "Setup Secret Phrase"}
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="gap-2 text-sm font-medium hover:bg-muted"
              >
                <Link href="/developer">
                  <Code2 className="w-4 h-4 text-muted-foreground" />
                  <span>{locale === "ar" ? "بوابة المطورين والـ API" : "Developer Portal & API"}</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Security Features Modern Cards */}
        <section className="py-14 border-b border-teal-500/15 dark:border-white/10 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                {locale === "ar" ? "منظومة الأمان الرباعية لحمايتك" : "Four-Layer Security Architecture"}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {locale === "ar"
                  ? "حماية فورية مضاعفة ضد القرصنة والتصيد لضمان عدم تمرير أي خصم دون موافقتك"
                  : "Multi-layered real-time protection ensuring no unauthorized charge completes"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {securityFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-6 rounded-2xl border border-teal-500/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md shadow-sm hover:border-teal-500/40 hover:shadow-md transition-all duration-300 hover-lift-gpu"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center mb-4 text-teal-600 dark:text-teal-300 shadow-sm">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-base mb-2">{feature.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Showcase Grid */}
        <section id="techstore-products-grid" className="py-16 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{locale === "ar" ? "متجر تجريبي محمي بنسبة 100%" : "100% Secure Protected Store"}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold">{t("featuredProducts")}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {locale === "ar"
                    ? "اختر أي منتج واضغط 'اشترِ الآن' لتجربة دورة الدفع المؤمنة بكود الأمان وفحص السيلفي"
                    : "Select any product and click 'Buy Now' to experience the secure checkout flow with secret phrase & selfie"}
                </p>
              </div>
              <Badge variant="outline" className="gap-1.5 py-1.5 px-3 border-teal-500/30 text-teal-700 dark:text-teal-300">
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                <span>{locale === "ar" ? "مدفوعات مؤمنة بالكامل" : "End-to-End Encrypted"}</span>
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden group border-teal-500/20 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm shadow-md hover:border-teal-500/50 hover:shadow-xl transition-all duration-300 hover-lift-gpu flex flex-col justify-between"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={product.image}
                      alt={product.name}
                      width={400}
                      height={400}
                      loading="lazy"
                      decoding="async"
                      className="object-cover w-full h-full group-hover:scale-108 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {product.badge && (
                      <Badge className="absolute top-3 start-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white border-0 shadow-md">
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="text-base sm:text-lg font-bold line-clamp-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">
                        {product.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-semibold">
                            {product.rating}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({product.reviews} {t("reviewsLabel")})
                        </span>
                      </div>
                      <p className="text-2xl font-black tabular-nums text-teal-700 dark:text-teal-300 tracking-tight">
                        {formatDzd(product.price, locale)}
                      </p>
                    </CardContent>
                  </div>
                  <CardFooter className="gap-2 pt-0 pb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => addToCart(product)}
                    >
                      <ShoppingCart className="w-3.5 h-3.5 me-1" />
                      {t("addToCart")}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs gap-1.5 font-bold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-md shadow-teal-500/20 active:scale-95 transition-transform"
                      onClick={() => buyNow(product)}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      {t("buyNow")}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Modern Stepper */}
        <section className="py-16 border-y border-teal-500/15 dark:border-white/10 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
                {locale === "ar" ? "كيف تحميك بوابة الدفع عند الشراء؟" : "How SecurePay Protects You"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {locale === "ar"
                  ? "4 مراحل ذكية تضمن مطابقة هوية حامل البطاقة وكود الأمان السري الشخصي قبل إتمام أي خصم"
                  : "4 intelligent verification steps ensuring cardholder identity and anti-phishing match"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  step: 1,
                  titleAr: "1. اختيار طريقة الدفع",
                  titleEn: "1. Select Payment Method",
                  descAr: "اختر البطاقة الذهبية (بريد الجزائر)، تطبيق بريدي موب، أو بطاقة CIB البنكية.",
                  descEn: "Choose Edahabia card, BaridiMob, or CIB bank card.",
                  icon: CreditCard,
                },
                {
                  step: 2,
                  titleAr: "2. التحقق بالسيلفي",
                  titleEn: "2. Selfie Biometric Verification",
                  descAr: "التقاط صورة ذاتية حية بالكاميرا للتأكد من وجود حامل البطاقة الفعلي أمام الشاشة.",
                  descEn: "Capture real-time live selfie ensuring cardholder presence.",
                  icon: Camera,
                },
                {
                  step: 3,
                  titleAr: "3. مطابقة كود الأمان",
                  titleEn: "3. Anti-Phishing Secret Code",
                  descAr: "ظهور كلمتك السرية الخاصة لتتأكد أن صفحة الدفع أصلية وليست صفحة تصيد مقلدة.",
                  descEn: "Your secret code appears proving the checkout page is authentic.",
                  icon: ShieldCheck,
                },
                {
                  step: 4,
                  titleAr: "4. الخصم المالي الآمن",
                  titleEn: "4. Approved Settlement",
                  descAr: "إتمام المعاملة فور مطابقة المعايير وإصدار إيصال الدفع المشفر بنجاح.",
                  descEn: "Transaction completes and encrypted receipt is issued.",
                  icon: CheckCircle,
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="relative p-5 rounded-2xl border border-teal-500/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm text-center shadow-sm hover-lift-gpu"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-3.5 shadow-md shadow-teal-500/20">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base mb-1.5">
                    {locale === "ar" ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {locale === "ar" ? item.descAr : item.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Test Accounts Quick-Copy Chip Cards */}
        <section className="py-12 border-b border-teal-500/15 dark:border-white/10 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold">
                {locale === "ar" ? "حسابات تجريبية للاختبار السريع (Sandbox)" : "Test Accounts for Instant Testing"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {locale === "ar" ? "انقر على أي بطاقة لنسخ رقم الحساب فوراً واستخدامه في نافذة الدفع" : "Click any card to copy account number instantly for checkout"}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 text-sm">
              {[
                {
                  num: "6280••••4821",
                  raw: "6280482100000000",
                  labelAr: "البطاقة الذهبية",
                  labelEn: "Edahabia",
                  subAr: "بريد الجزائر (BIN 6280)",
                  subEn: "Algérie Poste",
                  border: "border-amber-400/60 dark:border-amber-500/30",
                  badgeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
                },
                {
                  num: "BARI-12345",
                  raw: "BARI-12345",
                  labelAr: "بريدي موب",
                  labelEn: "BaridiMob",
                  subAr: "الدفع الفوري النقال",
                  subEn: "Instant Mobile",
                  border: "border-teal-400/60 dark:border-teal-500/30",
                  badgeBg: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
                },
                {
                  num: "ECCP-11111",
                  raw: "ECCP-11111",
                  labelAr: "بطاقة بنكية CIB",
                  labelEn: "CIB ECCP",
                  subAr: "البنوك الجزائرية",
                  subEn: "Algerian Banks",
                  border: "border-cyan-400/60 dark:border-cyan-500/30",
                  badgeBg: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
                },
                {
                  num: "RDPAY-67890",
                  raw: "RDPAY-67890",
                  labelAr: "RedotPay فيزا",
                  labelEn: "RedotPay Visa",
                  subAr: "بطاقة دولية",
                  subEn: "International Card",
                  border: "border-rose-400/60 dark:border-rose-500/30",
                  badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
                },
              ].map((acc) => {
                const isCopied = copiedAccount === acc.num || copiedAccount === acc.raw;
                return (
                  <button
                    key={acc.num}
                    type="button"
                    onClick={() => copyToClipboard(acc.num, locale === "ar" ? acc.labelAr : acc.labelEn)}
                    className={`p-3.5 rounded-xl border ${acc.border} bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm text-start hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer active:scale-95`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${acc.badgeBg}`}>
                        {locale === "ar" ? acc.labelAr : acc.labelEn}
                      </span>
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-teal-600 transition-colors shrink-0" />
                      )}
                    </div>
                    <p className="font-mono font-bold text-sm tracking-wide text-foreground">
                      {acc.num}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {locale === "ar" ? acc.subAr : acc.subEn}
                    </p>
                  </button>
                );
              })}
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
