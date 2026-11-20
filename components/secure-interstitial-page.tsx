"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ------------------------------------------------------------------------------------------
 * Secure Interstitial Verification Page  —  /go/:hash
 * 1. Resolves the shortlink through GET /api/v1/verify-link/:hash (Rust / axum).
 * 2. Shows the user's personal Secret Word as a trust indicator.
 * 3. Redirects to the original destination after 3 seconds (HTTPS targets only).
 * ---------------------------------------------------------------------------------------- */

const API_BASE = (process.env.NEXT_PUBLIC_SHIELD_API_BASE ?? "").replace(/\/+$/, "");
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{22}$/;
const REDIRECT_SECONDS = 3;
const MIN_VERIFY_MS = 1200; // keep the "verifying" state visible long enough to be readable

interface VerifyLinkResponse {
  target_url: string;
  institution_name: string;
  secret_word: string | null;
  secret_word_configured: boolean;
  remaining_resolutions: number;
  expires_at: string;
}

type Phase =
  | { kind: "verifying" }
  | { kind: "verified"; data: VerifyLinkResponse; target: URL }
  | { kind: "no-word"; data: VerifyLinkResponse; target: URL }
  | { kind: "invalid"; reason: "not-found" | "blocked" | "rate-limited" | "network" | "unsafe" };

/**
 * Each resolution consumes one unit of the link's server-side budget, so the request must run
 * exactly once per page load — even under React StrictMode's double-invoked effects.
 */
const inflight = new Map<string, Promise<Response>>();
function resolveOnce(hash: string): Promise<Response> {
  const qs =
    typeof window !== "undefined" && process.env.NODE_ENV !== "production"
      ? window.location.search
      : "";
  const cacheKey = `${hash}${qs}`;
  let p = inflight.get(cacheKey);
  if (!p) {
    p = fetch(`${API_BASE}/api/v1/verify-link/${encodeURIComponent(hash)}${qs}`, {
      method: "GET",
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      headers: { Accept: "application/json" },
    });
    inflight.set(cacheKey, p);
  }
  return p.then((r) => r.clone());
}

/** Defence in depth: the backend already validated the target, but never trust a redirect blindly. */
function parseSafeTarget(raw: unknown): URL | null {
  if (typeof raw !== "string" || raw.length > 2048) return null;
  try {
    const url = new URL(raw);
    const isLocalDev =
      process.env.NODE_ENV !== "production" &&
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    if (url.protocol !== "https:" && !isLocalDev) return null;
    if (url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ----------------------------------- Local inline icons ----------------------------------- */

function ShieldCheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path vectorEffect="non-scaling-stroke" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path vectorEffect="non-scaling-stroke" d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ShieldAlertIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path vectorEffect="non-scaling-stroke" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path vectorEffect="non-scaling-stroke" d="M12 8v4" />
      <path vectorEffect="non-scaling-stroke" d="M12 16h.01" />
    </svg>
  );
}

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect vectorEffect="non-scaling-stroke" x="3" y="11" width="18" height="11" rx="2" />
      <path vectorEffect="non-scaling-stroke" d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* ---------------------------------- Circular indicator ------------------------------------ */

const RING_R = 54;
const RING_C = 2 * Math.PI * RING_R;

function CircularIndicator({ phase, paused }: { phase: Phase["kind"]; paused: boolean }) {
  const isVerifying = phase === "verifying";
  const isVerified = phase === "verified";
  const isWarning = phase === "no-word" || phase === "invalid";

  return (
    <div className="relative mx-auto h-36 w-36">
      {/* Soft cyan halo */}
      <motion.div
        className={`absolute inset-0 rounded-full blur-2xl will-change-transform transform-gpu ${isWarning ? "bg-amber-400/30" : "bg-cyan-400/40"}`}
        animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg viewBox="0 0 128 128" className="relative h-full w-full -rotate-90 transform-gpu">
        <defs>
          <linearGradient id="sc-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="50%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle vectorEffect="non-scaling-stroke" cx="64" cy="64" r={RING_R} className="stroke-teal-100 dark:stroke-teal-950" strokeWidth="8" fill="none" />

        {isVerifying && (
          <motion.circle
            vectorEffect="non-scaling-stroke"
            cx="64" cy="64" r={RING_R} fill="none" stroke="url(#sc-ring)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${RING_C * 0.28} ${RING_C}`}
            style={{ originX: "64px", originY: "64px" }}
            className="will-change-transform transform-gpu"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          />
        )}

        {isVerified && paused && (
          <circle vectorEffect="non-scaling-stroke" cx="64" cy="64" r={RING_R} fill="none" stroke="url(#sc-ring)" strokeWidth="8" />
        )}

        {isVerified && !paused && (
          <motion.circle
            vectorEffect="non-scaling-stroke"
            cx="64" cy="64" r={RING_R} fill="none" stroke="url(#sc-ring)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={RING_C}
            initial={{ strokeDashoffset: RING_C }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: REDIRECT_SECONDS, ease: "linear" }}
          />
        )}

        {isWarning && (
          <circle cx="64" cy="64" r={RING_R} fill="none" className="stroke-amber-400" strokeWidth="8" />
        )}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
            className={isWarning ? "text-amber-500" : "text-teal-600"}
          >
            {isVerifying && <LockIcon className="h-11 w-11" />}
            {isVerified && <ShieldCheckIcon className="h-12 w-12" />}
            {isWarning && <ShieldAlertIcon className="h-12 w-12" />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------ Bilingual text -------------------------------------- */

function Bilingual({ ar, en, className = "" }: { ar: ReactNode; en: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p dir="rtl" lang="ar" className="text-lg font-semibold leading-relaxed text-slate-800">{ar}</p>
      <p dir="ltr" lang="en" className="mt-1 text-sm leading-relaxed text-slate-500">{en}</p>
    </div>
  );
}

/* --------------------------------------- Page ---------------------------------------------- */

export function SecureInterstitialPage({ hash }: { hash: string }) {
  const [phase, setPhase] = useState<Phase>({ kind: "verifying" });
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const [cancelled, setCancelled] = useState(false);
  const redirectedRef = useRef(false);

  // 1) Resolve the link exactly once.
  useEffect(() => {
    let active = true;

    (async () => {
      if (!TOKEN_PATTERN.test(hash)) {
        await sleep(MIN_VERIFY_MS);
        if (active) setPhase({ kind: "invalid", reason: "not-found" });
        return;
      }

      const started = Date.now();
      let next: Phase;
      try {
        const res = await resolveOnce(hash);
        if (res.ok) {
          const data = (await res.json()) as VerifyLinkResponse;
          const target = parseSafeTarget(data.target_url);
          if (!target) next = { kind: "invalid", reason: "unsafe" };
          else if (data.secret_word_configured && data.secret_word) next = { kind: "verified", data, target };
          else next = { kind: "no-word", data, target };
        } else if (res.status === 403) next = { kind: "invalid", reason: "blocked" };
        else if (res.status === 429) next = { kind: "invalid", reason: "rate-limited" };
        else next = { kind: "invalid", reason: "not-found" };
      } catch {
        next = { kind: "invalid", reason: "network" };
      }

      const elapsed = Date.now() - started;
      if (elapsed < MIN_VERIFY_MS) await sleep(MIN_VERIFY_MS - elapsed);
      if (active) setPhase(next);
    })();

    return () => {
      active = false;
    };
  }, [hash]);

  const go = useCallback((target: URL) => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    // `replace` keeps the interstitial (and its token) out of the browser back-stack.
    window.location.replace(target.toString());
  }, []);

  // 2) 3-second countdown, then redirect (only for fully verified links).
  useEffect(() => {
    if (phase.kind !== "verified" || cancelled) return;
    setSecondsLeft(REDIRECT_SECONDS);
    const startedAt = Date.now();
    const id = window.setInterval(() => {
      const left = REDIRECT_SECONDS - Math.floor((Date.now() - startedAt) / 1000);
      if (left <= 0) {
        window.clearInterval(id);
        setSecondsLeft(0);
        go(phase.target);
      } else {
        setSecondsLeft(left);
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [phase, cancelled, go]);

  const institution = phase.kind === "verified" || phase.kind === "no-word" ? phase.data.institution_name : "";
  const targetHost = phase.kind === "verified" || phase.kind === "no-word" ? phase.target.hostname : "";

  const invalidCopy = useMemo(() => {
    if (phase.kind !== "invalid") return null;
    switch (phase.reason) {
      case "blocked":
        return { ar: "هذه الخدمة متاحة فقط داخل التراب الوطني الجزائري.", en: "This service is only available within Algeria." };
      case "rate-limited":
        return { ar: "محاولات كثيرة جداً. يرجى الانتظار دقيقة ثم إعادة المحاولة.", en: "Too many attempts. Please wait a minute and try again." };
      case "network":
        return { ar: "تعذّر الاتصال بخادم التحقق. تحقق من اتصالك بالإنترنت.", en: "Could not reach the verification server. Check your connection." };
      case "unsafe":
        return { ar: "تم حظر هذا الرابط لأن وجهته غير آمنة.", en: "This link was blocked because its destination is unsafe." };
      default:
        return {
          ar: "هذا الرابط غير صالح أو منتهي الصلاحية. لا تُدخل أي معلومات، وتواصل مع مؤسستك عبر قنواتها الرسمية.",
          en: "This link is invalid or has expired. Do not enter any information; contact your institution through official channels.",
        };
    }
  }, [phase]);

  return (
    <main className="anti-banding-canvas relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 text-slate-900 dark:text-slate-100">
      {/* Decorative background radial glows (zero blur filter overhead) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(45, 212, 191, 0.22) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(34, 211, 238, 0.22) 0%, transparent 70%)",
        }}
      />

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-md rounded-3xl border border-teal-500/20 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 p-8 text-center shadow-retina-glass ring-1 ring-white/25 dark:ring-white/10"
        aria-live="polite"
      >
        {/* Brand header */}
        <div className="mb-6 flex items-center justify-center gap-2 text-teal-700 dark:text-cyan-300">
          <ShieldCheckIcon className="h-5 w-5" />
          <span className="text-sm font-bold tracking-wide">ShieldCode • Secure Link</span>
        </div>

        <CircularIndicator phase={phase.kind} paused={cancelled} />

        <AnimatePresence mode="wait">
          {phase.kind === "verifying" && (
            <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6">
              <Bilingual ar="جارٍ التحقق من أمان الرابط..." en="Verifying link security..." />
            </motion.div>
          )}

          {(phase.kind === "verified" || phase.kind === "no-word") && (
            <motion.div key="resolved" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 space-y-5">
              {phase.kind === "verified" ? (
                <SecretWordBadge word={phase.data.secret_word ?? ""} />
              ) : (
                <div className="rounded-2xl border border-amber-200 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 p-4">
                  <Bilingual
                    ar="لم تقم بإعداد كلمتك السرية بعد، لذلك لا يمكننا إثبات أن هذه الرسالة موجّهة إليك."
                    en="You have not set up your Secret Word yet, so we cannot prove this message was meant for you."
                  />
                </div>
              )}

              <Bilingual
                ar={<>هذا رابط رسمي من <span className="text-teal-700 dark:text-cyan-300">{institution}</span>.</>}
                en={<>This is an official link from <span className="font-semibold text-teal-700 dark:text-cyan-300">{institution}</span>.</>}
              />

              <p dir="ltr" className="mx-auto w-fit max-w-full truncate rounded-full bg-slate-100 dark:bg-[#09202b] px-3 py-1 font-mono text-xs text-slate-600 dark:text-cyan-200">
                🔒 {targetHost}
              </p>

              {phase.kind === "verified" && !cancelled && (
                <Bilingual
                  ar={<>سيتم تحويلك بأمان خلال <span className="tabular-nums text-teal-700 dark:text-cyan-300">{secondsLeft}</span> ثوانٍ...</>}
                  en={<>Redirecting you securely in <span className="tabular-nums font-semibold text-teal-700 dark:text-cyan-300">{secondsLeft}</span> seconds...</>}
                />
              )}

              <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-center">
                {(cancelled || phase.kind === "no-word") && (
                  <button
                    type="button"
                    onClick={() => go(phase.target)}
                    className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition hover:from-teal-700 hover:to-cyan-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                  >
                    متابعة • Continue
                  </button>
                )}
                {phase.kind === "verified" && !cancelled && (
                  <button
                    type="button"
                    onClick={() => setCancelled(true)}
                    className="rounded-xl border border-slate-200 dark:border-teal-800 px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-teal-950/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                  >
                    إيقاف • Stop
                  </button>
                )}
              </div>

              <p dir="rtl" className="text-xs leading-relaxed text-slate-400">
                إذا لم تتعرّف على كلمتك السرية أعلاه، أغلق هذه الصفحة فوراً.
                <span dir="ltr" className="block">If you don&apos;t recognise the Secret Word above, close this page immediately.</span>
              </p>
            </motion.div>
          )}

          {phase.kind === "invalid" && invalidCopy && (
            <motion.div key="invalid" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 rounded-2xl border border-amber-200 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 p-4">
              <Bilingual ar={invalidCopy.ar} en={invalidCopy.en} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </main>
  );
}

function SecretWordBadge({ word }: { word: string }) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 360, damping: 16, delay: 0.1 }}
      className="relative mx-auto rounded-2xl border-2 border-teal-400 dark:border-cyan-500/60 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/80 dark:to-[#09202b] px-6 py-4 shadow-[0_0_28px_rgba(34,211,238,0.35)]"
    >
      <p className="text-xs font-medium text-teal-700 dark:text-cyan-300">
        <span dir="rtl">كلمتك السرية</span> • <span dir="ltr">Your Secret Word</span>
      </p>
      {/* Rendered as plain text by React (auto-escaped); never placed in the URL or document title. */}
      <p dir="ltr" className="mt-1 break-all font-mono text-3xl font-extrabold tracking-wider text-teal-800">
        {word}
      </p>
    </motion.div>
  );
}
