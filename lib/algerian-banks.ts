import type { Provider } from "@/lib/types";

export interface AlgerianInstitutionDto {
  id: string;
  code: string;
  bic: string;
  name: string;
  name_ar: string;
  type: "Postal" | "Bank";
  ownership: "Postal" | "Public" | "Private" | "Islamic";
  rails: string[];
  bin_prefixes: string[];
  rib_prefix: string;
  supports_edahabia: boolean;
  supports_cib: boolean;
  supports_baridimob: boolean;
  is_active: boolean;
}

export interface AlgerianPaymentAccountDto {
  id: string;
  account_id: string;
  provider: Provider;
  owner_email: string;
  owner_name: string;
  anti_phishing_code: string;
  institution_code: string | null;
  institution_name: string;
  account_type: "edahabia" | "baridimob" | "cib_eccp" | "bank_rib" | "ccp_rip" | "redotpay";
  rib_or_rip: string | null;
  masked_rib_or_rip: string | null;
  ccp_number: string | null;
  phone_number: string | null;
  currency: string;
  is_verified: boolean;
  created_at: string;
}

export const ALGERIAN_INSTITUTIONS: AlgerianInstitutionDto[] = [
  {
    id: "01933f00-0000-7000-8000-000000000001",
    code: "007",
    bic: "BAPODZAL",
    name: "Algérie Poste (CCP / BaridiMob)",
    name_ar: "بريد الجزائر (الحساب البريدي / بريدي موب)",
    type: "Postal",
    ownership: "Postal",
    rails: ["Edahabia", "BaridiMob", "CCP / RIP"],
    bin_prefixes: ["6280"],
    rib_prefix: "00799999",
    supports_edahabia: true,
    supports_cib: false,
    supports_baridimob: true,
    is_active: true,
  },
  {
    id: "01933f00-0000-7000-8000-000000000003",
    code: "001",
    bic: "BNALDZAL",
    name: "BNA (Banque Nationale d'Algérie)",
    name_ar: "البنك الوطني الجزائري (BNA)",
    type: "Bank",
    ownership: "Public",
    rails: ["CIB / SATIM", "RIB", "Wimpay"],
    bin_prefixes: ["6281", "5057"],
    rib_prefix: "001",
    supports_edahabia: false,
    supports_cib: true,
    supports_baridimob: false,
    is_active: true,
  },
  {
    id: "01933f00-0000-7000-8000-000000000004",
    code: "002",
    bic: "BEXADZAL",
    name: "BEA (Banque Extérieure d'Algérie)",
    name_ar: "بنك الجزائر الخارجي (BEA)",
    type: "Bank",
    ownership: "Public",
    rails: ["CIB / SATIM", "RIB"],
    bin_prefixes: ["6282"],
    rib_prefix: "002",
    supports_edahabia: false,
    supports_cib: true,
    supports_baridimob: false,
    is_active: true,
  },
  {
    id: "01933f00-0000-7000-8000-000000000006",
    code: "003",
    bic: "BADRDZAL",
    name: "BADR Bank",
    name_ar: "بنك الفلاحة والتنمية الريفية (BADR)",
    type: "Bank",
    ownership: "Public",
    rails: ["CIB / SATIM", "RIB"],
    bin_prefixes: ["6283"],
    rib_prefix: "003",
    supports_edahabia: false,
    supports_cib: true,
    supports_baridimob: false,
    is_active: true,
  },
  {
    id: "01933f00-0000-7000-8000-000000000002",
    code: "004",
    bic: "CPALDZAL",
    name: "CPA (Crédit Populaire d'Algérie)",
    name_ar: "القرض الشعبي الجزائري (CPA)",
    type: "Bank",
    ownership: "Public",
    rails: ["CIB / SATIM", "RIB", "Wimpay"],
    bin_prefixes: ["6284"],
    rib_prefix: "004",
    supports_edahabia: false,
    supports_cib: true,
    supports_baridimob: false,
    is_active: true,
  },
  {
    id: "01933f00-0000-7000-8000-000000000005",
    code: "005",
    bic: "CNEPDZAL",
    name: "CNEP-Banque",
    name_ar: "الصندوق الوطني للتوفير والاحتياط (CNEP)",
    type: "Bank",
    ownership: "Public",
    rails: ["CIB / SATIM", "RIB"],
    bin_prefixes: ["6285"],
    rib_prefix: "005",
    supports_edahabia: false,
    supports_cib: true,
    supports_baridimob: false,
    is_active: true,
  },
  {
    id: "01933f00-0000-7000-8000-000000000007",
    code: "006",
    bic: "BDLODZAL",
    name: "BDL (Banque de Développement Local)",
    name_ar: "بنك التنمية المحلية (BDL)",
    type: "Bank",
    ownership: "Public",
    rails: ["CIB / SATIM", "RIB", "DigitBDL"],
    bin_prefixes: ["6286"],
    rib_prefix: "006",
    supports_edahabia: false,
    supports_cib: true,
    supports_baridimob: false,
    is_active: true,
  },
  {
    id: "01933f00-0000-7000-8000-000000000008",
    code: "021",
    bic: "SOGEDZAL",
    name: "Société Générale Algérie (SGA)",
    name_ar: "سوسيتي جنرال الجزائر (SGA)",
    type: "Bank",
    ownership: "Private",
    rails: ["CIB / SATIM", "RIB"],
    bin_prefixes: ["6289"],
    rib_prefix: "021",
    supports_edahabia: false,
    supports_cib: true,
    supports_baridimob: false,
    is_active: true,
  },
  {
    id: "01933f00-0000-7000-8000-000000000009",
    code: "020",
    bic: "BNPADZAL",
    name: "BNP Paribas El Djazaïr",
    name_ar: "بي إن بي باريبا الجزائر",
    type: "Bank",
    ownership: "Private",
    rails: ["CIB / SATIM", "RIB"],
    bin_prefixes: ["6288"],
    rib_prefix: "020",
    supports_edahabia: false,
    supports_cib: true,
    supports_baridimob: false,
    is_active: true,
  },
  {
    id: "01933f00-0000-7000-8000-000000000010",
    code: "027",
    bic: "AGBODZAL",
    name: "AGB (Gulf Bank Algeria)",
    name_ar: "بنك الخليج الجزائر (AGB)",
    type: "Bank",
    ownership: "Private",
    rails: ["CIB / SATIM", "RIB", "Visa"],
    bin_prefixes: ["6290"],
    rib_prefix: "027",
    supports_edahabia: false,
    supports_cib: true,
    supports_baridimob: false,
    is_active: true,
  },
  {
    id: "01933f00-0000-7000-8000-000000000011",
    code: "029",
    bic: "BRKADZAL",
    name: "Al Baraka Bank Algeria",
    name_ar: "بنك البركة الجزائري",
    type: "Bank",
    ownership: "Islamic",
    rails: ["CIB / SATIM", "RIB"],
    bin_prefixes: ["6291"],
    rib_prefix: "029",
    supports_edahabia: false,
    supports_cib: true,
    supports_baridimob: false,
    is_active: true,
  },
  {
    id: "01933f00-0000-7000-8000-000000000012",
    code: "034",
    bic: "ASALDZAL",
    name: "Al Salam Bank Algeria",
    name_ar: "مصرف السلام الجزائر",
    type: "Bank",
    ownership: "Islamic",
    rails: ["CIB / SATIM", "RIB"],
    bin_prefixes: ["6292"],
    rib_prefix: "034",
    supports_edahabia: false,
    supports_cib: true,
    supports_baridimob: false,
    is_active: true,
  },
  {
    id: "01933f00-0000-7000-8000-000000000013",
    code: "031",
    bic: "HBKADZAL",
    name: "The Housing Bank Algeria (HBTF)",
    name_ar: "بنك الإسكان للتجارة والتمويل الجزائر",
    type: "Bank",
    ownership: "Private",
    rails: ["CIB / SATIM", "RIB"],
    bin_prefixes: ["6293"],
    rib_prefix: "031",
    supports_edahabia: false,
    supports_cib: true,
    supports_baridimob: false,
    is_active: true,
  },
  {
    id: "01933f00-0000-7000-8000-000000000014",
    code: "032",
    bic: "FRANDZAL",
    name: "Fransabank El Djazaïr",
    name_ar: "فرنسابنك الجزائر",
    type: "Bank",
    ownership: "Private",
    rails: ["CIB / SATIM", "RIB"],
    bin_prefixes: ["6294"],
    rib_prefix: "032",
    supports_edahabia: false,
    supports_cib: true,
    supports_baridimob: false,
    is_active: true,
  },
  {
    id: "01933f00-0000-7000-8000-000000000015",
    code: "026",
    bic: "NATXDZAL",
    name: "Natixis Algérie",
    name_ar: "ناتيكسيس الجزائر",
    type: "Bank",
    ownership: "Private",
    rails: ["CIB / SATIM", "RIB"],
    bin_prefixes: ["6295"],
    rib_prefix: "026",
    supports_edahabia: false,
    supports_cib: true,
    supports_baridimob: false,
    is_active: true,
  },
  {
    id: "01933f00-0000-7000-8000-000000000016",
    code: "014",
    bic: "ARABDZAL",
    name: "Arab Bank PLC Algeria",
    name_ar: "البنك العربي الجزائر",
    type: "Bank",
    ownership: "Private",
    rails: ["CIB / SATIM", "RIB"],
    bin_prefixes: ["6296"],
    rib_prefix: "014",
    supports_edahabia: false,
    supports_cib: true,
    supports_baridimob: false,
    is_active: true,
  },
];

export function normalizeRibDigits(raw: string): string {
  return String(raw || "").replace(/\D/g, "");
}

export function maskRibOrRip(ribOrRip: string | null | undefined): string | null {
  if (!ribOrRip) return null;
  const digits = normalizeRibDigits(ribOrRip);
  if (digits.length < 8) return ribOrRip;
  const head = digits.slice(0, 4);
  const tail = digits.slice(-4);
  return `${head} •••• •••• •••• ${tail}`;
}

export function detectAlgerianInstitutionByRib(
  ribOrRip: string
): AlgerianInstitutionDto | null {
  const digits = normalizeRibDigits(ribOrRip);
  if (digits.length < 3) return null;
  const code = digits.slice(0, 3);
  return (
    ALGERIAN_INSTITUTIONS.find((inst) => inst.code === code) ?? null
  );
}

export function validateAlgerianRibOrRip(ribOrRip: string): {
  valid: boolean;
  digits: string;
  institution: AlgerianInstitutionDto | null;
  errorAr?: string;
  errorEn?: string;
} {
  const digits = normalizeRibDigits(ribOrRip);
  if (digits.length !== 20) {
    return {
      valid: false,
      digits,
      institution: detectAlgerianInstitutionByRib(digits),
      errorAr: "رقم الحساب البنكي/البريدي الجزائري (RIB/RIP) يجب أن يتكون من 20 رقماً بالضبط.",
      errorEn: "Algerian RIB/RIP must be exactly 20 digits.",
    };
  }

  const inst = detectAlgerianInstitutionByRib(digits);
  if (!inst) {
    return {
      valid: false,
      digits,
      institution: null,
      errorAr: `رمز البنك (${digits.slice(0, 3)}) غير مطابق لأي بنك جزائري أو بريد الجزائر (007).`,
      errorEn: `Bank prefix (${digits.slice(0, 3)}) does not match a known Algerian bank or Algérie Poste (007).`,
    };
  }

  if (inst.code === "007" && !digits.startsWith("00799999")) {
    return {
      valid: false,
      digits,
      institution: inst,
      errorAr: "رقم RIP لبريد الجزائر (Algérie Poste) يجب أن يبدأ بـ 00799999.",
      errorEn: "Algérie Poste RIP must start with 00799999.",
    };
  }

  return {
    valid: true,
    digits,
    institution: inst,
  };
}

export function createDefaultAlgerianAccounts(now: string): AlgerianPaymentAccountDto[] {
  const rawSeeds: Array<Omit<AlgerianPaymentAccountDto, "masked_rib_or_rip" | "created_at">> = [
    {
      id: "acc_dz_007_edahabia",
      account_id: "6280••••4821",
      provider: "edahabia",
      owner_email: "bachir.ibrahimi@shieldcode.dz",
      owner_name: "البشير الإبراهيمي",
      anti_phishing_code: "Bachir34",
      institution_code: "007",
      institution_name: "Algérie Poste (CCP / BaridiMob)",
      account_type: "edahabia",
      rib_or_rip: "00799999004123456789",
      ccp_number: "0041234567",
      phone_number: "+213550123456",
      currency: "DZD",
      is_verified: true,
    },
    {
      id: "acc_dz_007_baridimob",
      account_id: "BARI-12345",
      provider: "baridimob",
      owner_email: "amine.benali@shieldcode.dz",
      owner_name: "أمين بن علي",
      anti_phishing_code: "SECURE-DOLPHIN-42",
      institution_code: "007",
      institution_name: "Algérie Poste (CCP / BaridiMob)",
      account_type: "baridimob",
      rib_or_rip: "00799999004881122334",
      ccp_number: "0048811223",
      phone_number: "+213661234567",
      currency: "DZD",
      is_verified: true,
    },
    {
      id: "acc_dz_004_cpa",
      account_id: "ECCP-11111",
      provider: "eccp",
      owner_email: "sara.mansouri@shieldcode.dz",
      owner_name: "سارة منصوري",
      anti_phishing_code: "VERIFIED-TIGER-77",
      institution_code: "004",
      institution_name: "CPA (Crédit Populaire d'Algérie)",
      account_type: "cib_eccp",
      rib_or_rip: "00400112000987654321",
      ccp_number: null,
      phone_number: "+213770987654",
      currency: "DZD",
      is_verified: true,
    },
    {
      id: "acc_dz_001_bna",
      account_id: "BNA-001-7788",
      provider: "eccp",
      owner_email: "karim.bouzid@shieldcode.dz",
      owner_name: "كريم بوزيد",
      anti_phishing_code: "BNA-SAFE-2026",
      institution_code: "001",
      institution_name: "BNA (Banque Nationale d'Algérie)",
      account_type: "bank_rib",
      rib_or_rip: "00100605030011223344",
      ccp_number: null,
      phone_number: "+213551445566",
      currency: "DZD",
      is_verified: true,
    },
    {
      id: "acc_dz_002_bea",
      account_id: "BEA-002-3310",
      provider: "eccp",
      owner_email: "yasmine.khelifi@shieldcode.dz",
      owner_name: "ياسمين خليفي",
      anti_phishing_code: "BEA-SHIELD-99",
      institution_code: "002",
      institution_name: "BEA (Banque Extérieure d'Algérie)",
      account_type: "bank_rib",
      rib_or_rip: "00200012000044556677",
      ccp_number: null,
      phone_number: "+213662334455",
      currency: "DZD",
      is_verified: true,
    },
    {
      id: "acc_dz_003_badr",
      account_id: "BADR-003-5521",
      provider: "eccp",
      owner_email: "mourad.ziani@shieldcode.dz",
      owner_name: "مراد زياني",
      anti_phishing_code: "BADR-TRUST-11",
      institution_code: "003",
      institution_name: "BADR Bank",
      account_type: "bank_rib",
      rib_or_rip: "00300415000099887766",
      ccp_number: null,
      phone_number: "+213771556677",
      currency: "DZD",
      is_verified: true,
    },
    {
      id: "acc_dz_005_cnep",
      account_id: "CNEP-005-8840",
      provider: "eccp",
      owner_email: "nadia.belkacem@shieldcode.dz",
      owner_name: "نادية بلقاسم",
      anti_phishing_code: "CNEP-DZ-55",
      institution_code: "005",
      institution_name: "CNEP-Banque",
      account_type: "bank_rib",
      rib_or_rip: "00500190000022334455",
      ccp_number: null,
      phone_number: "+213554778899",
      currency: "DZD",
      is_verified: true,
    },
    {
      id: "acc_dz_006_bdl",
      account_id: "BDL-006-4419",
      provider: "eccp",
      owner_email: "sofiane.hadj@shieldcode.dz",
      owner_name: "سفيان حاج",
      anti_phishing_code: "BDL-PROTECT-24",
      institution_code: "006",
      institution_name: "BDL (Banque de Développement Local)",
      account_type: "bank_rib",
      rib_or_rip: "00600204000066778899",
      ccp_number: null,
      phone_number: "+213665889900",
      currency: "DZD",
      is_verified: true,
    },
    {
      id: "acc_dz_021_sga",
      account_id: "SGA-021-9012",
      provider: "eccp",
      owner_email: "ines.djelloul@shieldcode.dz",
      owner_name: "إيناس جلول",
      anti_phishing_code: "SGA-GUARD-71",
      institution_code: "021",
      institution_name: "Société Générale Algérie (SGA)",
      account_type: "bank_rib",
      rib_or_rip: "02100005113001122334",
      ccp_number: null,
      phone_number: "+213772112233",
      currency: "DZD",
      is_verified: true,
    },
    {
      id: "acc_dz_redotpay",
      account_id: "RDPAY-67890",
      provider: "redotpay",
      owner_email: "walid.cherif@shieldcode.dz",
      owner_name: "وليد شريف",
      anti_phishing_code: "TRUSTED-EAGLE-99",
      institution_code: null,
      institution_name: "RedotPay Global Visa",
      account_type: "redotpay",
      rib_or_rip: null,
      ccp_number: null,
      phone_number: "+213558990011",
      currency: "USD",
      is_verified: true,
    },
  ];

  return rawSeeds.map((item) => ({
    ...item,
    masked_rib_or_rip: maskRibOrRip(item.rib_or_rip),
    created_at: now,
  }));
}
