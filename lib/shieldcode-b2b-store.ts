import crypto from "crypto";
import {
  createDefaultAlgerianAccounts,
  type AlgerianPaymentAccountDto,
} from "@/lib/algerian-banks";

export interface PartnerCompany {
  id: string;
  company_name: string;
  institution_type: string;
  webhook_url: string;
  integration_active: boolean;
  created_at: string;
}

export interface PartnerApiKey {
  id: string;
  company_id: string;
  api_key: string;
  key_prefix: string;
  environment: string;
  is_active: boolean;
  requests_count: number;
  last_used_at: string | null;
  created_at: string;
}

export interface EndUserRecord {
  id: string;
  company_id: string;
  external_user_id: string;
  username: string;
  phone_number: string;
  created_at: string;
}

export interface AntiPhishingCodeRecord {
  id: string;
  company_id: string;
  end_user_id: string;
  external_user_id: string;
  security_code: string;
  is_enabled: boolean;
  updated_at: string;
}

export interface ProtectedEdahabiaCard {
  id: string;
  institution_name: "Algérie Poste • بريد الجزائر";
  card_label: string;
  holder_name: string;
  bin_prefix: "6280";
  last4: string;
  masked_pan: string;
  card_blind_index: string;
  phone_masked: string;
  operator: "Ooredoo Algeria" | "ATM Mobilis" | "Djezzy";
  secret_word: string;
  protect_sms_links: boolean;
  is_active: boolean;
  created_at: string;
}

export interface DeveloperApiKeyRecord {
  id: string;
  institution_name: string;
  label: string;
  key_prefix: string;
  masked_key: string;
  last4: string;
  environment: "live" | "test";
  sha256_hash: string;
  is_active: boolean;
  requests_today: number;
  created_at: string;
  revoked_at: string | null;
}

interface ShieldCodeMultiTenantDb {
  companies: Map<string, PartnerCompany>;
  apiKeys: Map<string, PartnerApiKey>;
  endUsers: Map<string, EndUserRecord>;
  antiPhishingCodes: Map<string, AntiPhishingCodeRecord>;
  edahabiaCards: Map<string, ProtectedEdahabiaCard>;
  developerApiKeys: Map<string, DeveloperApiKeyRecord>;
  paymentAccounts: Map<string, AlgerianPaymentAccountDto>;
}

const globalStore = globalThis as unknown as {
  __shieldCodeB2bDb?: ShieldCodeMultiTenantDb;
};

function createDefaultEdahabiaCards(now: string): Map<string, ProtectedEdahabiaCard> {
  return new Map<string, ProtectedEdahabiaCard>([
    [
      "edhb_demo_4821",
      {
        id: "edhb_demo_4821",
        institution_name: "Algérie Poste • بريد الجزائر",
        card_label: "البطاقة الذهبية الرئيسية",
        holder_name: "البشير الإبراهيمي",
        bin_prefix: "6280",
        last4: "4821",
        masked_pan: "6280 •••• •••• 4821",
        card_blind_index: crypto
          .createHmac("sha256", "shieldcode_edahabia_dz_salt_2026")
          .update("6280:4821:+213550123456")
          .digest("hex"),
        phone_masked: "+213 550 •• •• 56",
        operator: "Ooredoo Algeria",
        secret_word: "Bachir34",
        protect_sms_links: true,
        is_active: true,
        created_at: now,
      },
    ],
  ]);
}

function createDefaultDeveloperKeys(now: string): Map<string, DeveloperApiKeyRecord> {
  const sampleLiveHash = crypto
    .createHash("sha256")
    .update("sc_live_cpa_initial_seed_placeholder_01")
    .digest("hex");
  const sampleTestHash = crypto
    .createHash("sha256")
    .update("sc_test_cpa_initial_seed_placeholder_02")
    .digest("hex");

  return new Map<string, DeveloperApiKeyRecord>([
    [
      "devkey_live_01",
      {
        id: "devkey_live_01",
        institution_name: "CPA (Crédit Populaire d'Algérie)",
        label: "Production Core Banking SMS Gateway",
        key_prefix: "sc_live_",
        masked_key: "sc_live_••••••••••••9f8e",
        last4: "9f8e",
        environment: "live",
        sha256_hash: sampleLiveHash,
        is_active: true,
        requests_today: 18420,
        created_at: now,
        revoked_at: null,
      },
    ],
    [
      "devkey_test_02",
      {
        id: "devkey_test_02",
        institution_name: "CPA (Crédit Populaire d'Algérie)",
        label: "Staging & QA Sandbox Key",
        key_prefix: "sc_test_",
        masked_key: "sc_test_••••••••••••4a1c",
        last4: "4a1c",
        environment: "test",
        sha256_hash: sampleTestHash,
        is_active: true,
        requests_today: 1290,
        created_at: now,
        revoked_at: null,
      },
    ],
  ]);
}

export function getShieldCodeDb(): ShieldCodeMultiTenantDb {
  if (!globalStore.__shieldCodeB2bDb) {
    const now = new Date().toISOString();
    const companies = new Map<string, PartnerCompany>([
      [
        "comp_finanza_01",
        {
          id: "comp_finanza_01",
          company_name: "FinanzaBank",
          institution_type: "Digital Bank",
          webhook_url: "https://api.finanzabank.com/webhooks/shieldcode",
          integration_active: true,
          created_at: now,
        },
      ],
    ]);

    const apiKeys = new Map<string, PartnerApiKey>([
      [
        "sc_live_finanza_9f8e7d6c5b4a3210",
        {
          id: "key_finanza_01",
          company_id: "comp_finanza_01",
          api_key: "sc_live_finanza_9f8e7d6c5b4a3210",
          key_prefix: "sc_live_finanza",
          environment: "production",
          is_active: true,
          requests_count: 18,
          last_used_at: now,
          created_at: now,
        },
      ],
    ]);

    const endUsers = new Map<string, EndUserRecord>([
      [
        "comp_finanza_01:CUST-1001",
        {
          id: "usr_bachir_01",
          company_id: "comp_finanza_01",
          external_user_id: "CUST-1001",
          username: "البشير الإبراهيمي",
          phone_number: "+213550123456",
          created_at: now,
        },
      ],
    ]);

    const antiPhishingCodes = new Map<string, AntiPhishingCodeRecord>([
      [
        "comp_finanza_01:CUST-1001",
        {
          id: "code_bachir_01",
          company_id: "comp_finanza_01",
          end_user_id: "usr_bachir_01",
          external_user_id: "CUST-1001",
          security_code: "Bachir34",
          is_enabled: true,
          updated_at: now,
        },
      ],
    ]);

    const edahabiaCards = createDefaultEdahabiaCards(now);
    const developerApiKeys = createDefaultDeveloperKeys(now);
    const paymentAccounts = new Map<string, AlgerianPaymentAccountDto>(
      createDefaultAlgerianAccounts(now).map((acc) => [acc.id, acc])
    );

    globalStore.__shieldCodeB2bDb = {
      companies,
      apiKeys,
      endUsers,
      antiPhishingCodes,
      edahabiaCards,
      developerApiKeys,
      paymentAccounts,
    };
  } else {
    if (!globalStore.__shieldCodeB2bDb.edahabiaCards) {
      globalStore.__shieldCodeB2bDb.edahabiaCards = createDefaultEdahabiaCards(
        new Date().toISOString()
      );
    }
    if (!globalStore.__shieldCodeB2bDb.developerApiKeys) {
      globalStore.__shieldCodeB2bDb.developerApiKeys = createDefaultDeveloperKeys(
        new Date().toISOString()
      );
    }
    if (!globalStore.__shieldCodeB2bDb.paymentAccounts) {
      globalStore.__shieldCodeB2bDb.paymentAccounts = new Map<string, AlgerianPaymentAccountDto>(
        createDefaultAlgerianAccounts(new Date().toISOString()).map((acc) => [acc.id, acc])
      );
    }
  }
  return globalStore.__shieldCodeB2bDb;
}

export function registerCompanyInStore(
  companyName: string,
  institutionType?: string,
  webhookUrl?: string
) {
  const db = getShieldCodeDb();
  const cleanName = companyName.trim();
  const slug =
    cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 10) || "bank";

  const companyId = `comp_${slug}_${crypto.randomBytes(3).toString("hex")}`;
  const randomSecret = crypto.randomBytes(8).toString("hex");
  const apiKey = `sc_live_${slug}_${randomSecret}`;
  const now = new Date().toISOString();

  const company: PartnerCompany = {
    id: companyId,
    company_name: cleanName,
    institution_type: institutionType || "Financial Institution",
    webhook_url: webhookUrl || `https://api.${slug}.com/webhooks/shieldcode`,
    integration_active: true,
    created_at: now,
  };

  const apiKeyRecord: PartnerApiKey = {
    id: `key_${crypto.randomBytes(4).toString("hex")}`,
    company_id: companyId,
    api_key: apiKey,
    key_prefix: `sc_live_${slug}`,
    environment: "production",
    is_active: true,
    requests_count: 1,
    last_used_at: now,
    created_at: now,
  };

  db.companies.set(companyId, company);
  db.apiKeys.set(apiKey, apiKeyRecord);

  const compositeKey = `${companyId}:CUST-1001`;
  const userId = `usr_${crypto.randomBytes(4).toString("hex")}`;
  db.endUsers.set(compositeKey, {
    id: userId,
    company_id: companyId,
    external_user_id: "CUST-1001",
    username: "البشير الإبراهيمي",
    phone_number: "+213550123456",
    created_at: now,
  });

  db.antiPhishingCodes.set(compositeKey, {
    id: `code_${crypto.randomBytes(4).toString("hex")}`,
    company_id: companyId,
    end_user_id: userId,
    external_user_id: "CUST-1001",
    security_code: "Bachir34",
    is_enabled: true,
    updated_at: now,
  });

  return {
    company,
    api_key: apiKey,
    api_key_record: apiKeyRecord,
    embed_script: `<script src="https://cdn.shieldcode.io/sdk/v1.js" data-api-key="${apiKey}" data-user-id="CUST-1001"></script>`,
  };
}
