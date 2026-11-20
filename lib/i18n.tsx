"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { SupportedLocale } from "@/lib/currency";

/**
 * Strict Algerian Market Localization:
 * ONLY Arabic ('ar') and English ('en') are permitted.
 */
export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ["ar", "en"] as const;
export const DEFAULT_LOCALE: SupportedLocale = "ar";
const STORAGE_KEY = "shieldcode_locale";

export type TextDirection = "rtl" | "ltr";

interface TranslationDictionary {
  brandSubtitle: string;
  navDeliveryPhrase: string;
  navEdahabia: string;
  navStore: string;
  navOnboarding: string;
  navVault: string;
  navDeveloper: string;
  verifiedBadge: string;
  secureCheckout: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaOnboarding: string;
  ctaVault: string;
  featuredProducts: string;
  addToCart: string;
  buyNow: string;
  reviewsLabel: string;
  howItWorksTitle: string;
  testAccountsTitle: string;
  activeInstitutionsTitle: string;
  footerTitle: string;
  footerSubtitle: string;
}

const TRANSLATIONS: Record<SupportedLocale, TranslationDictionary> = {
  ar: {
    brandSubtitle: "محمي بواسطة SecurePay • المنصة الجزائرية الموحدة لكافة المعاملات",
    navDeliveryPhrase: "1. رمز الأمان الشامل",
    navEdahabia: "2. البطاقة الذهبية",
    navStore: "3. المتجر والمعاملات",
    navOnboarding: "التوثيق (5 خطوات)",
    navVault: "4. محاكي الهاتف الفوري",
    navDeveloper: "بوابة المطورين API",
    verifiedBadge: "البريد والهاتف موثقان",
    secureCheckout: "معاملات آمنة",
    heroBadge: "حماية شاملة ضد التصيد والاحتيال",
    heroTitle: "أمان شامل لمعاملاتك البنكية والمالية والتوصيل وكل معاملاتك",
    heroSubtitle:
      "جميع معاملاتك البنكية، التحويلات المالية، التوصيل، تسديد الفواتير، وكافة المعاملات الرقمية محمية بنظام التحقق الفوري بالصورة ورمز الأمان الشخصي الشامل.",
    ctaOnboarding: "توثيق البريد والهاتف (5 خطوات)",
    ctaVault: "إعداد رمز الأمان (Vault)",
    featuredProducts: "المنتجات المميزة",
    addToCart: "أضف إلى السلة",
    buyNow: "اشترِ الآن",
    reviewsLabel: "تقييم",
    howItWorksTitle: "كيف يحميك نظام SecurePay؟",
    testAccountsTitle: "حسابات تجريبية (الجزائر)",
    activeInstitutionsTitle:
      "المؤسسات المالية والبريدية الجزائرية المعتمدة",
    footerTitle:
      "محمي بواسطة SecurePay Gateway وخزنة ShieldCode الجزائرية",
    footerSubtitle:
      "جميع المعاملات تتطلب موافقة صاحب الحساب وتخضع للقانون 18-07",
  },
  en: {
    brandSubtitle: "Protected by SecurePay • Unified Platform for All Transactions",
    navDeliveryPhrase: "1. Universal Phrase",
    navEdahabia: "2. Edahabia Card",
    navStore: "3. Store & Transactions",
    navOnboarding: "Onboarding (5 Steps)",
    navVault: "4. Live Phone Simulator",
    navDeveloper: "Developer Settings",
    verifiedBadge: "Email & Phone Verified",
    secureCheckout: "Secure Transactions",
    heroBadge: "Universal Anti-Phishing Protection Active",
    heroTitle: "Universal Security for Banking, Finance, Delivery & Every Transaction",
    heroSubtitle:
      "Every banking transfer, financial operation, delivery, bill payment, and digital transaction is protected by real-time selfie verification and your Universal Security Phrase.",
    ctaOnboarding: "Email & Phone Verification (5-Step Onboarding)",
    ctaVault: "Configure Security Code (Vault)",
    featuredProducts: "Featured Products",
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    reviewsLabel: "reviews",
    howItWorksTitle: "How SecurePay Protects You",
    testAccountsTitle: "Test Accounts (Algeria)",
    activeInstitutionsTitle:
      "Active Algerian Financial & Postal Institutions",
    footerTitle:
      "Protected by SecurePay Gateway & ShieldCode Security Vault",
    footerSubtitle:
      "All transactions require account owner approval under Law 18-07",
  },
};

interface I18nContextValue {
  locale: SupportedLocale;
  dir: TextDirection;
  isRtl: boolean;
  setLocale: (next: SupportedLocale) => void;
  toggleLocale: () => void;
  t: (key: keyof TranslationDictionary) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "ar" || saved === "en") {
      setLocaleState(saved);
    }
  }, []);

  const dir: TextDirection = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dir;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, locale);
    }
  }, [locale, dir]);

  const setLocale = useCallback((next: SupportedLocale) => {
    if (next === "ar" || next === "en") {
      setLocaleState(next);
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === "ar" ? "en" : "ar"));
  }, []);

  const t = useCallback(
    (key: keyof TranslationDictionary) => TRANSLATIONS[locale][key],
    [locale]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir,
      isRtl: dir === "rtl",
      setLocale,
      toggleLocale,
      t,
    }),
    [locale, dir, setLocale, toggleLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE,
      dir: "rtl",
      isRtl: true,
      setLocale: () => {},
      toggleLocale: () => {},
      t: (key) => TRANSLATIONS[DEFAULT_LOCALE][key],
    };
  }
  return ctx;
}
