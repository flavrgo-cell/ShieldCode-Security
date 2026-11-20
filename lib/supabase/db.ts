import crypto from "crypto";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabase/api";
import {
  ALGERIAN_INSTITUTIONS,
  maskRibOrRip,
  type AlgerianInstitutionDto,
  type AlgerianPaymentAccountDto,
} from "@/lib/algerian-banks";
import {
  getShieldCodeDb,
  type DeveloperApiKeyRecord,
  type ProtectedEdahabiaCard,
} from "@/lib/shieldcode-b2b-store";
import type { Provider } from "@/lib/types";

export type DataSourceMode = "supabase" | "sandbox";

export async function listActiveInstitutions(): Promise<{
  source: DataSourceMode;
  institutions: AlgerianInstitutionDto[];
}> {
  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("algerian_institutions")
        .select(
          "id, code, bic, name, name_ar, type, ownership, rails, bin_prefixes, rib_prefix, supports_edahabia, supports_cib, supports_baridimob, is_active"
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        return {
          source: "supabase",
          institutions: data as AlgerianInstitutionDto[],
        };
      }
    } catch {
      // Fallback to official local catalog if migration has not run yet
    }
  }

  return {
    source: "sandbox",
    institutions: ALGERIAN_INSTITUTIONS,
  };
}

function normalizePaymentAccountRow(row: Record<string, unknown>): AlgerianPaymentAccountDto {
  const rib = row.rib_or_rip ? String(row.rib_or_rip) : null;
  const provider = (String(row.provider || "eccp") as Provider);
  return {
    id: String(row.id),
    account_id: String(row.account_id),
    provider,
    owner_email: String(row.owner_email || ""),
    owner_name: String(row.owner_name || ""),
    anti_phishing_code: String(row.anti_phishing_code || ""),
    institution_code: row.institution_code ? String(row.institution_code) : null,
    institution_name: String(row.institution_name || provider.toUpperCase()),
    account_type: (String(row.account_type || "bank_rib") as AlgerianPaymentAccountDto["account_type"]),
    rib_or_rip: rib,
    masked_rib_or_rip: maskRibOrRip(rib),
    ccp_number: row.ccp_number ? String(row.ccp_number) : null,
    phone_number: row.phone_number ? String(row.phone_number) : null,
    currency: String(row.currency || "DZD"),
    is_verified: row.is_verified !== false,
    created_at: String(row.created_at || new Date().toISOString()),
  };
}

export async function listPaymentAccounts(filters?: {
  institution_code?: string;
  provider?: string;
  q?: string;
}): Promise<{
  source: DataSourceMode;
  accounts: AlgerianPaymentAccountDto[];
}> {
  const supabase = getServerSupabase();
  if (supabase) {
    try {
      let query = supabase
        .from("payment_accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.institution_code) {
        query = query.eq("institution_code", filters.institution_code);
      }
      if (filters?.provider) {
        query = query.eq("provider", filters.provider);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        let accounts = data.map((r) =>
          normalizePaymentAccountRow(r as Record<string, unknown>)
        );
        if (filters?.q) {
          const needle = filters.q.toLowerCase();
          accounts = accounts.filter(
            (a) =>
              a.account_id.toLowerCase().includes(needle) ||
              a.owner_name.toLowerCase().includes(needle) ||
              a.institution_name.toLowerCase().includes(needle) ||
              (a.rib_or_rip || "").includes(needle)
          );
        }
        return { source: "supabase", accounts };
      }
    } catch {
      // Fall through to sandbox store
    }
  }

  const db = getShieldCodeDb();
  let accounts = Array.from(db.paymentAccounts.values()).sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
  if (filters?.institution_code) {
    accounts = accounts.filter(
      (a) => a.institution_code === filters.institution_code
    );
  }
  if (filters?.provider) {
    accounts = accounts.filter((a) => a.provider === filters.provider);
  }
  if (filters?.q) {
    const needle = filters.q.toLowerCase();
    accounts = accounts.filter(
      (a) =>
        a.account_id.toLowerCase().includes(needle) ||
        a.owner_name.toLowerCase().includes(needle) ||
        a.institution_name.toLowerCase().includes(needle) ||
        (a.rib_or_rip || "").includes(needle)
    );
  }

  return { source: "sandbox", accounts };
}

export async function upsertPaymentAccount(input: {
  account_id: string;
  provider: Provider;
  owner_email: string;
  owner_name: string;
  anti_phishing_code: string;
  institution_code: string | null;
  institution_name: string;
  account_type: AlgerianPaymentAccountDto["account_type"];
  rib_or_rip: string | null;
  ccp_number: string | null;
  phone_number: string | null;
  currency: string;
}): Promise<{
  source: DataSourceMode;
  account: AlgerianPaymentAccountDto;
  created: boolean;
}> {
  const now = new Date().toISOString();
  const supabase = getServerSupabase();

  if (supabase) {
    try {
      const { data: existing } = await supabase
        .from("payment_accounts")
        .select("id")
        .eq("account_id", input.account_id)
        .maybeSingle();

      const { data, error } = await supabase
        .from("payment_accounts")
        .upsert(
          {
            account_id: input.account_id,
            provider: input.provider,
            owner_email: input.owner_email,
            owner_name: input.owner_name,
            anti_phishing_code: input.anti_phishing_code,
            institution_code: input.institution_code,
            institution_name: input.institution_name,
            account_type: input.account_type,
            rib_or_rip: input.rib_or_rip,
            ccp_number: input.ccp_number,
            phone_number: input.phone_number,
            currency: input.currency,
            is_verified: true,
            updated_at: now,
          },
          { onConflict: "account_id" }
        )
        .select("*")
        .single();

      if (!error && data) {
        return {
          source: "supabase",
          account: normalizePaymentAccountRow(data as Record<string, unknown>),
          created: !existing,
        };
      }
    } catch {
      // Fallback to sandbox store
    }
  }

  const db = getShieldCodeDb();
  const existing = Array.from(db.paymentAccounts.values()).find(
    (a) => a.account_id === input.account_id
  );
  const id = existing
    ? existing.id
    : `acc_dz_${crypto.randomBytes(4).toString("hex")}`;

  const record: AlgerianPaymentAccountDto = {
    id,
    ...input,
    masked_rib_or_rip: maskRibOrRip(input.rib_or_rip),
    is_verified: true,
    created_at: existing?.created_at || now,
  };
  db.paymentAccounts.set(id, record);

  return {
    source: "sandbox",
    account: record,
    created: !existing,
  };
}

export async function deletePaymentAccount(id: string): Promise<{
  source: DataSourceMode;
  deleted: boolean;
}> {
  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { error, count } = await supabase
        .from("payment_accounts")
        .delete({ count: "exact" })
        .eq("id", id);

      if (!error) {
        return { source: "supabase", deleted: (count ?? 0) > 0 };
      }
    } catch {
      // Fallback to sandbox store
    }
  }

  const db = getShieldCodeDb();
  return { source: "sandbox", deleted: db.paymentAccounts.delete(id) };
}

export async function findAccountForCheckout(
  accountId: string,
  provider: string
): Promise<{
  source: DataSourceMode;
  account: AlgerianPaymentAccountDto | null;
}> {
  const cleanId = accountId.trim();
  const digitsOnly = cleanId.replace(/\D/g, "");
  const supabase = getServerSupabase();

  if (supabase) {
    try {
      const { data: exact } = await supabase
        .from("payment_accounts")
        .select("*")
        .eq("account_id", cleanId)
        .maybeSingle();

      if (exact) {
        return {
          source: "supabase",
          account: normalizePaymentAccountRow(exact as Record<string, unknown>),
        };
      }

      if (digitsOnly.length >= 10) {
        const { data: byRib } = await supabase
          .from("payment_accounts")
          .select("*")
          .eq("rib_or_rip", digitsOnly)
          .maybeSingle();

        if (byRib) {
          return {
            source: "supabase",
            account: normalizePaymentAccountRow(byRib as Record<string, unknown>),
          };
        }
      }
    } catch {
      // Fallback below
    }
  }

  const db = getShieldCodeDb();
  const found = Array.from(db.paymentAccounts.values()).find(
    (a) =>
      a.account_id === cleanId ||
      (digitsOnly.length >= 10 && a.rib_or_rip === digitsOnly) ||
      (a.provider === provider &&
        digitsOnly.length >= 4 &&
        a.account_id.replace(/\D/g, "").endsWith(digitsOnly.slice(-4)))
  );

  return {
    source: supabase ? "supabase" : "sandbox",
    account: found || null,
  };
}

export async function listProtectedEdahabiaCards(): Promise<{
  source: DataSourceMode;
  cards: ProtectedEdahabiaCard[];
}> {
  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("protected_edahabia_cards")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        return {
          source: "supabase",
          cards: data as ProtectedEdahabiaCard[],
        };
      }
    } catch {
      // Fallback
    }
  }

  const db = getShieldCodeDb();
  const cards = Array.from(db.edahabiaCards.values()).sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
  return { source: "sandbox", cards };
}

export async function upsertProtectedEdahabiaCard(
  record: ProtectedEdahabiaCard
): Promise<{
  source: DataSourceMode;
  card: ProtectedEdahabiaCard;
  existed: boolean;
}> {
  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { data: existing } = await supabase
        .from("protected_edahabia_cards")
        .select("id")
        .eq("last4", record.last4)
        .eq("phone_masked", record.phone_masked)
        .maybeSingle();

      const targetId = existing?.id ? String(existing.id) : record.id;
      const toSave: ProtectedEdahabiaCard = { ...record, id: targetId };

      const { data, error } = await supabase
        .from("protected_edahabia_cards")
        .upsert(toSave, { onConflict: "id" })
        .select("*")
        .single();

      if (!error && data) {
        return {
          source: "supabase",
          card: data as ProtectedEdahabiaCard,
          existed: Boolean(existing),
        };
      }
    } catch {
      // Fallback
    }
  }

  const db = getShieldCodeDb();
  const existing = Array.from(db.edahabiaCards.values()).find(
    (c) => c.last4 === record.last4 && c.phone_masked === record.phone_masked
  );
  const targetId = existing ? existing.id : record.id;
  if (!existing && db.edahabiaCards.size >= 20) {
    const oldestKey = db.edahabiaCards.keys().next().value;
    if (oldestKey) db.edahabiaCards.delete(oldestKey);
  }
  const saved: ProtectedEdahabiaCard = { ...record, id: targetId };
  db.edahabiaCards.set(targetId, saved);

  return { source: "sandbox", card: saved, existed: Boolean(existing) };
}

export async function deleteProtectedEdahabiaCard(id: string): Promise<{
  source: DataSourceMode;
  deleted: boolean;
}> {
  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { error, count } = await supabase
        .from("protected_edahabia_cards")
        .delete({ count: "exact" })
        .eq("id", id);

      if (!error) {
        return { source: "supabase", deleted: (count ?? 0) > 0 };
      }
    } catch {
      // Fallback
    }
  }

  const db = getShieldCodeDb();
  return { source: "sandbox", deleted: db.edahabiaCards.delete(id) };
}

export async function listPartnerApiKeys(): Promise<{
  source: DataSourceMode;
  keys: DeveloperApiKeyRecord[];
}> {
  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("partner_api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        return { source: "supabase", keys: data as DeveloperApiKeyRecord[] };
      }
    } catch {
      // Fallback
    }
  }

  const db = getShieldCodeDb();
  const keys = Array.from(db.developerApiKeys.values()).sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
  return { source: "sandbox", keys };
}

export async function insertPartnerApiKey(
  record: DeveloperApiKeyRecord
): Promise<{
  source: DataSourceMode;
  key: DeveloperApiKeyRecord;
}> {
  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("partner_api_keys")
        .insert(record)
        .select("*")
        .single();

      if (!error && data) {
        return { source: "supabase", key: data as DeveloperApiKeyRecord };
      }
    } catch {
      // Fallback
    }
  }

  const db = getShieldCodeDb();
  if (db.developerApiKeys.size >= 20) {
    const oldest = db.developerApiKeys.keys().next().value;
    if (oldest) db.developerApiKeys.delete(oldest);
  }
  db.developerApiKeys.set(record.id, record);
  return { source: "sandbox", key: record };
}

export async function revokePartnerApiKey(id: string): Promise<{
  source: DataSourceMode;
  key: DeveloperApiKeyRecord | null;
}> {
  const now = new Date().toISOString();
  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("partner_api_keys")
        .update({ is_active: false, revoked_at: now })
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (!error && data) {
        return { source: "supabase", key: data as DeveloperApiKeyRecord };
      }
    } catch {
      // Fallback
    }
  }

  const db = getShieldCodeDb();
  const existing = db.developerApiKeys.get(id);
  if (!existing) return { source: "sandbox", key: null };

  const updated: DeveloperApiKeyRecord = {
    ...existing,
    is_active: false,
    revoked_at: now,
  };
  db.developerApiKeys.set(id, updated);
  return { source: "sandbox", key: updated };
}

export async function getDbHealthStatus() {
  const configured = isSupabaseConfigured();
  if (!configured) {
    const db = getShieldCodeDb();
    return {
      configured: false,
      connected: false,
      mode: "sandbox" as DataSourceMode,
      tables: {
        algerian_institutions: ALGERIAN_INSTITUTIONS.length,
        payment_accounts: db.paymentAccounts.size,
        protected_edahabia_cards: db.edahabiaCards.size,
        partner_api_keys: db.developerApiKeys.size,
        transactions: 0,
      },
      migration_file: "scripts/002_algerian_institutions_and_accounts.sql",
      message_ar:
        "المنصة جاهزة للاتصال الحي بـ Supabase. أضف NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY في .env.local ونفّذ ملف الترحيل SQL.",
      message_en:
        "Supabase integration ready. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and run the SQL migration.",
    };
  }

  const supabase = getServerSupabase()!;
  try {
    const [inst, accs, cards, keys, txns] = await Promise.all([
      supabase.from("algerian_institutions").select("*", { count: "exact", head: true }),
      supabase.from("payment_accounts").select("*", { count: "exact", head: true }),
      supabase.from("protected_edahabia_cards").select("*", { count: "exact", head: true }),
      supabase.from("partner_api_keys").select("*", { count: "exact", head: true }),
      supabase.from("transactions").select("*", { count: "exact", head: true }),
    ]);

    const anyError = inst.error || accs.error || cards.error;
    if (anyError) {
      return {
        configured: true,
        connected: false,
        mode: "sandbox" as DataSourceMode,
        error: anyError.message,
        migration_file: "scripts/002_algerian_institutions_and_accounts.sql",
        message_ar:
          "تم اكتشاف مفاتيح Supabase لكن الجداول غير منشأة بعد — يرجى تنفيذ scripts/002_algerian_institutions_and_accounts.sql في Supabase SQL Editor.",
        message_en:
          "Supabase keys detected, but tables are not migrated yet — run scripts/002_algerian_institutions_and_accounts.sql in Supabase SQL Editor.",
      };
    }

    return {
      configured: true,
      connected: true,
      mode: "supabase" as DataSourceMode,
      tables: {
        algerian_institutions: inst.count ?? 0,
        payment_accounts: accs.count ?? 0,
        protected_edahabia_cards: cards.count ?? 0,
        partner_api_keys: keys.count ?? 0,
        transactions: txns.count ?? 0,
      },
      migration_file: "scripts/002_algerian_institutions_and_accounts.sql",
      message_ar: "متصل بنجاح بقاعدة بيانات Supabase (PostgreSQL) الحية ✓",
      message_en: "Connected live to Supabase (PostgreSQL) database ✓",
    };
  } catch (err) {
    return {
      configured: true,
      connected: false,
      mode: "sandbox" as DataSourceMode,
      error: err instanceof Error ? err.message : "Connection failed",
      migration_file: "scripts/002_algerian_institutions_and_accounts.sql",
      message_ar: "تعذر الاتصال بـ Supabase — يتم العمل حالياً على الوضع التجريبي الاحتياطي.",
      message_en: "Could not reach Supabase — falling back to local sandbox store.",
    };
  }
}
