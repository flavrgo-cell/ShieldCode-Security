"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Database,
  Landmark,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import {
  detectAlgerianInstitutionByRib,
  normalizeRibDigits,
  type AlgerianInstitutionDto,
  type AlgerianPaymentAccountDto,
} from "@/lib/algerian-banks";
import type { Provider } from "@/lib/types";

interface DbHealthDto {
  configured: boolean;
  connected: boolean;
  mode: "supabase" | "sandbox";
  tables?: Record<string, number>;
  migration_file?: string;
  message_ar: string;
  message_en: string;
}

type OwnershipFilter = "all" | "Postal" | "Public" | "Private" | "Islamic";

export const AlgerianAccountsDirectory = React.memo(
  function AlgerianAccountsDirectory() {
    const { locale, dir } = useI18n();
    const isAr = locale === "ar";

    const [health, setHealth] = useState<DbHealthDto | null>(null);
    const [institutions, setInstitutions] = useState<AlgerianInstitutionDto[]>([]);
    const [accounts, setAccounts] = useState<AlgerianPaymentAccountDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>("all");
    const [selectedInstCode, setSelectedInstCode] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");

    // Link new Algerian Bank / Postal account form
    const [provider, setProvider] = useState<Provider>("eccp");
    const [ribInput, setRibInput] = useState("00799999004123456790");
    const [ownerName, setOwnerName] = useState("");
    const [ownerEmail, setOwnerEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("+213550123456");
    const [antiPhishingCode, setAntiPhishingCode] = useState("DZ-SAFE-2026");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const loadAll = useCallback(async () => {
      setLoading(true);
      try {
        const [healthRes, instRes, accRes] = await Promise.all([
          fetch("/api/v1/health/db", { cache: "no-store" }),
          fetch("/api/v1/institutions/active", { cache: "no-store" }),
          fetch("/api/v1/accounts", { cache: "no-store" }),
        ]);

        if (healthRes.ok) {
          setHealth(await healthRes.json());
        }
        if (instRes.ok) {
          const data = await instRes.json();
          if (Array.isArray(data.institutions)) {
            setInstitutions(data.institutions);
          }
        }
        if (accRes.ok) {
          const data = await accRes.json();
          if (Array.isArray(data.accounts)) {
            setAccounts(data.accounts);
          }
        }
      } catch {
        // Keep graceful offline UI
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      loadAll();
    }, [loadAll]);

    const detectedBank = useMemo(
      () => detectAlgerianInstitutionByRib(ribInput),
      [ribInput]
    );

    const filteredInstitutions = useMemo(() => {
      if (ownershipFilter === "all") return institutions;
      return institutions.filter((inst) => inst.ownership === ownershipFilter);
    }, [institutions, ownershipFilter]);

    const filteredAccounts = useMemo(() => {
      return accounts.filter((acc) => {
        if (selectedInstCode && acc.institution_code !== selectedInstCode) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          return (
            acc.account_id.toLowerCase().includes(q) ||
            acc.owner_name.toLowerCase().includes(q) ||
            acc.institution_name.toLowerCase().includes(q) ||
            (acc.rib_or_rip || "").includes(q)
          );
        }
        return true;
      });
    }, [accounts, selectedInstCode, searchQuery]);

    const handleSelectInstitution = (inst: AlgerianInstitutionDto) => {
      setSelectedInstCode((prev) => (prev === inst.code ? "" : inst.code));
      if (inst.code === "007") {
        setProvider("edahabia");
        setRibInput("00799999004123456790");
      } else {
        setProvider("eccp");
        setRibInput(`${inst.code}00105000012345678`);
      }
      setFormError(null);
    };

    const handleLinkAccount = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      setSubmitting(true);

      try {
        const res = await fetch("/api/v1/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            rib_or_rip: normalizeRibDigits(ribInput),
            institution_code: detectedBank?.code || selectedInstCode || undefined,
            owner_name: ownerName.trim(),
            owner_email: ownerEmail.trim(),
            phone_number: phoneNumber.trim(),
            anti_phishing_code: antiPhishingCode.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setFormError(data.message || "Validation failed");
          return;
        }

        if (data.account) {
          setAccounts((prev) => [
            data.account,
            ...prev.filter((a) => a.id !== data.account.id),
          ]);
        }
        setOwnerName("");
        setOwnerEmail("");
        toast.success(
          data.message ||
            (isAr ? "تم ربط الحساب بنجاح" : "Account linked successfully")
        );
      } catch {
        setFormError(
          isAr ? "تعذر الاتصال بالخادم لحفظ الحساب." : "Failed to save account."
        );
      } finally {
        setSubmitting(false);
      }
    };

    const handleDeleteAccount = async (id: string) => {
      try {
        const res = await fetch(`/api/v1/accounts?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setAccounts((prev) => prev.filter((a) => a.id !== id));
          toast.success(isAr ? "تم حذف الحساب من القائمة." : "Account removed.");
        }
      } catch {
        toast.error(isAr ? "تعذر حذف الحساب." : "Could not remove account.");
      }
    };

    return (
      <section
        dir={dir}
        className="w-full py-12 px-4 sm:px-6 border-t border-teal-500/15 dark:border-white/10"
      >
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="rounded-3xl border border-teal-500/20 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 ring-1 ring-white/25 dark:ring-white/10 p-6 sm:p-8 shadow-retina-glass space-y-6">
            {/* Header + Live Supabase Status */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 dark:border-teal-900/60 pb-5">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 dark:bg-teal-950/80 px-3 py-1 text-xs font-extrabold text-teal-800 dark:text-cyan-300">
                  <Landmark className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
                  <span>
                    {isAr
                      ? "قاعدة بيانات البنوك والحسابات البريدية في الجزائر (Supabase PostgreSQL)"
                      : "Live Algerian Banks & Postal Accounts Database (Supabase PostgreSQL)"}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {isAr
                    ? "دليل المؤسسات البنكية وبريد الجزائر وربط الحسابات (RIB / RIP / CCP)"
                    : "Algerian Banking & Postal Directory + Live Account Linking"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl">
                  {isAr
                    ? "استعرض جميع البنوك العمومية والخاصة والإسلامية وبريد الجزائر (007)، واربط حساباتك البنكية (RIB) أو البريدية (RIP/Edahabia) مع الكشف التلقائي لرمز البنك وختم مكافحة التصيد."
                    : "Browse all public, private, and Islamic Algerian banks plus Algérie Poste (007), and link RIB/RIP/Edahabia accounts with automatic bank-code detection."}
                </p>
              </div>

              <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
                <div
                  className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-extrabold ${
                    health?.connected
                      ? "border-emerald-400/60 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300"
                      : "border-amber-400/60 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200"
                  }`}
                >
                  <Database className="w-4 h-4 shrink-0" />
                  <span>
                    {health?.connected
                      ? isAr
                        ? "متصل بـ Supabase الحية ✓"
                        : "Connected Live to Supabase ✓"
                      : isAr
                      ? "جاهز للربط بـ Supabase (.env.local)"
                      : "Ready for Supabase (.env.local)"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={loadAll}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-cyan-300 hover:underline cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>{isAr ? "تحديث البيانات الحية" : "Refresh Live Data"}</span>
                </button>
              </div>
            </div>

            {/* Supabase Setup Hint Banner when .env.local not configured yet */}
            {health && !health.connected && (
              <div className="rounded-2xl border border-teal-200/80 dark:border-teal-800/70 bg-teal-50/70 dark:bg-[#041822] p-4 text-xs text-slate-700 dark:text-slate-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-extrabold text-teal-900 dark:text-cyan-200">
                    {isAr ? health.message_ar : health.message_en}
                  </p>
                  <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    SQL Migration: <span className="font-bold text-teal-700 dark:text-cyan-300">scripts/002_algerian_institutions_and_accounts.sql</span> • Template: <span className="font-bold">.env.example</span>
                  </p>
                </div>
                <span className="rounded-xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 px-3 py-1.5 font-mono text-[11px] font-bold text-teal-800 dark:text-cyan-300 shrink-0">
                  {institutions.length} {isAr ? "مؤسسة جزائرية" : "DZ Institutions"} • {accounts.length} {isAr ? "حساب" : "Accounts"}
                </span>
              </div>
            )}

            {/* Filter Pills for Algerian Institutions */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
                  <span>
                    {isAr
                      ? `المؤسسات البنكية والبريدية المعتمدة في الجزائر (${filteredInstitutions.length})`
                      : `Official Algerian Banking & Postal Institutions (${filteredInstitutions.length})`}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { key: "all", ar: "الكل", en: "All" },
                      { key: "Postal", ar: "بريد الجزائر", en: "Postal" },
                      { key: "Public", ar: "بنوك عمومية", en: "Public Banks" },
                      { key: "Private", ar: "بنوك خاصة", en: "Private Banks" },
                      { key: "Islamic", ar: "بنوك إسلامية", en: "Islamic Banks" },
                    ] as { key: OwnershipFilter; ar: string; en: string }[]
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setOwnershipFilter(tab.key)}
                      className={`rounded-xl px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                        ownershipFilter === tab.key
                          ? "anti-banding-teal text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/60"
                      }`}
                    >
                      {isAr ? tab.ar : tab.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Institutions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {filteredInstitutions.map((inst) => {
                  const active = selectedInstCode === inst.code;
                  return (
                    <button
                      key={inst.code}
                      type="button"
                      onClick={() => handleSelectInstitution(inst)}
                      className={`text-start rounded-2xl border p-3.5 transition-colors cursor-pointer space-y-2 ${
                        active
                          ? "border-teal-500 bg-teal-50/80 dark:bg-teal-950/50 ring-2 ring-teal-500/20"
                          : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#061820] hover:border-teal-400/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          dir="ltr"
                          className={`rounded-lg px-2 py-0.5 font-mono text-[11px] font-extrabold ${
                            inst.type === "Postal"
                              ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300"
                              : "bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-cyan-300"
                          }`}
                        >
                          CODE {inst.code}
                        </span>
                        <span dir="ltr" className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {inst.bic}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">
                          {isAr ? inst.name_ar : inst.name}
                        </p>
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                          {isAr ? inst.name : inst.name_ar}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {inst.rails.map((rail) => (
                          <span
                            key={rail}
                            className="rounded-md bg-slate-100 dark:bg-slate-800/90 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300"
                          >
                            {rail}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom 2-Column Layout: Link Account Form + Live Accounts List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Left: Link New Algerian Account Form */}
              <form
                onSubmit={handleLinkAccount}
                className="lg:col-span-5 rounded-2xl border border-teal-200/80 dark:border-teal-800/60 bg-teal-50/40 dark:bg-[#04141d] p-5 space-y-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
                    <span>
                      {isAr
                        ? "ربط حساب بنكي أو بريدي جزائري جديد"
                        : "Link New Algerian Bank / CCP Account"}
                    </span>
                  </h3>
                </div>

                {/* Provider Pills */}
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "edahabia", label: isAr ? "الذهبية" : "Edahabia" },
                      { id: "baridimob", label: "BaridiMob" },
                      { id: "eccp", label: isAr ? "بنكي RIB/CIB" : "Bank RIB/CIB" },
                    ] as { id: Provider; label: string }[]
                  ).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProvider(p.id)}
                      className={`rounded-xl py-1.5 px-2 text-xs font-bold transition-colors cursor-pointer ${
                        provider === p.id
                          ? "anti-banding-teal text-white"
                          : "bg-white dark:bg-[#061820] border border-slate-200 dark:border-teal-900/60 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* 20-Digit RIB / RIP Input with Auto Bank Detection */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="dz-rib-input" className="font-bold text-slate-700 dark:text-slate-200">
                      {isAr ? "رقم RIB / RIP (20 رقماً):" : "20-Digit Algerian RIB / RIP:"}
                    </label>
                    <span className="font-mono text-[11px] font-bold text-teal-700 dark:text-cyan-300">
                      {normalizeRibDigits(ribInput).length}/20
                    </span>
                  </div>
                  <input
                    id="dz-rib-input"
                    type="text"
                    dir="ltr"
                    value={ribInput}
                    onChange={(e) => {
                      setFormError(null);
                      setRibInput(normalizeRibDigits(e.target.value).slice(0, 20));
                    }}
                    placeholder="00799999004123456789"
                    className="w-full h-11 rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-[#031017] px-3 font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                    required
                  />
                  {detectedBank && (
                    <p className="flex items-center gap-1.5 text-[11px] font-bold text-teal-700 dark:text-cyan-300">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {isAr ? "تم التعرف تلقائياً: " : "Auto-detected: "}
                        {isAr ? detectedBank.name_ar : detectedBank.name} ({detectedBank.bic})
                      </span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder={isAr ? "اسم صاحب الحساب" : "Account Holder Name"}
                    className="h-10 rounded-xl border border-slate-200 dark:border-teal-800/70 bg-white dark:bg-[#031017] px-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                    required
                  />
                  <input
                    type="email"
                    dir="ltr"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="owner@bank.dz"
                    className="h-10 rounded-xl border border-slate-200 dark:border-teal-800/70 bg-white dark:bg-[#031017] px-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="tel"
                    dir="ltr"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+213550123456"
                    className="h-10 rounded-xl border border-slate-200 dark:border-teal-800/70 bg-white dark:bg-[#031017] px-3 font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                  />
                  <input
                    type="text"
                    value={antiPhishingCode}
                    onChange={(e) => setAntiPhishingCode(e.target.value.slice(0, 20))}
                    placeholder={isAr ? "رمز مكافحة التصيد" : "Anti-Phishing Code"}
                    className="h-10 rounded-xl border border-slate-200 dark:border-teal-800/70 bg-white dark:bg-[#031017] px-3 font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                    required
                  />
                </div>

                {formError && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-950/50 p-2.5 text-xs font-bold text-red-700 dark:text-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 rounded-xl anti-banding-teal text-white font-extrabold text-xs shadow-retina-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {submitting
                      ? isAr
                        ? "جارٍ الحفظ في قاعدة البيانات..."
                        : "Saving to database..."
                      : isAr
                      ? "حفظ وربط الحساب بقاعدة البيانات الحية"
                      : "Save & Link Account to Live Database"}
                  </span>
                </button>
              </form>

              {/* Right: Live Linked Algerian Accounts List */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
                    <span>
                      {isAr
                        ? `الحسابات المسجلة والمحمية (${filteredAccounts.length})`
                        : `Registered & Protected Accounts (${filteredAccounts.length})`}
                    </span>
                  </h3>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={isAr ? "بحث بالبنك، الاسم أو RIB..." : "Search bank, name, RIB..."}
                      className="h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#061820] ps-8 pe-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pe-1">
                  {filteredAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#061820] p-3.5 flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {acc.institution_code === "007" ? (
                              <Smartphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            ) : (
                              <Landmark className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400 shrink-0" />
                            )}
                            <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                              {acc.owner_name}
                            </p>
                          </div>
                          <p className="text-[11px] font-semibold text-teal-700 dark:text-cyan-300 truncate">
                            {acc.institution_name}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteAccount(acc.id)}
                          aria-label="Delete account"
                          className="rounded-lg p-1 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center justify-between gap-2">
                          <span dir="ltr" className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {acc.account_id}
                          </span>
                          <span className="rounded-md bg-teal-100 dark:bg-teal-950/90 px-1.5 py-0.5 font-mono text-[10px] font-bold text-teal-800 dark:text-cyan-300">
                            [{acc.anti_phishing_code}]
                          </span>
                        </div>
                        {acc.masked_rib_or_rip && (
                          <p dir="ltr" className="font-mono text-[10.5px] text-slate-500 dark:text-slate-400">
                            RIB/RIP: {acc.masked_rib_or_rip}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);
