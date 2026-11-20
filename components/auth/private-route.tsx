"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";

/**
 * Strict Auth-Gated Route Guard (`PrivateRoute`).
 * Blocks rendering and redirects to `/register` unless the user holds a valid
 * in-memory JWT backed by BOTH Email and Algerian Phone (`+213`) verification.
 */
export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { accessToken, user, isLoading } = useAuth();
  const { locale, dir } = useI18n();
  const router = useRouter();

  const isAuthorized = Boolean(
    accessToken && user?.email_verified && user?.phone_verified
  );

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      router.replace("/register");
    }
  }, [isLoading, isAuthorized, router]);

  if (isLoading || !isAuthorized) {
    return (
      <div
        dir={dir}
        className="anti-banding-canvas flex min-h-screen flex-col items-center justify-center px-4 text-slate-900 dark:text-white"
      >
        <div className="flex flex-col items-center space-y-5 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 border-t-cyan-400 animate-spin" />
            <ShieldCheck className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              {locale === "ar"
                ? isLoading
                  ? "جارٍ التحقق من الجلسة الآمنة..."
                  : "يتطلب الوصول توثيق البريد والهاتف..."
                : isLoading
                ? "Verifying encrypted session..."
                : "Redirecting to verification gate..."}
            </p>
            <p className="text-xs font-medium text-teal-700 dark:text-teal-300/80">
              {locale === "ar"
                ? "بوابة ShieldCode الجزائرية المحمية"
                : "ShieldCode Strict Auth-Gated SaaS"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
