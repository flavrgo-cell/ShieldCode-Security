/**
 * Algerian National Financial & Telecommunications Registry
 * Comprehensive Live Database of Algerian Banks, Algérie Poste, SATIM, and Mobile Telecom Carriers.
 */

export interface AlgerianBank {
  id: string;
  nameAr: string;
  nameFr: string;
  shortName: string;
  code: string; // 3-digit official Bank code used in Algerian RIB
  type: 'central_switch' | 'postal' | 'public_bank' | 'private_bank' | 'islamic_bank';
  categoryLabel: string;
  color: string;
  website: string;
  supportPhone: string;
  cardNetwork: 'CIB' | 'Edahabia' | 'CIB & Edahabia' | 'Visa/Mastercard';
  smsSenderId: string;
  status: 'active' | 'integrated' | 'pilot';
  latencyMs: number;
}

export interface AlgerianTelecomOperator {
  id: 'mobilis' | 'djezzy' | 'ooredoo';
  nameAr: string;
  nameFr: string;
  companyName: string;
  carrierCode: string; // MCC-MNC (e.g. 603-01)
  prefixes: string[];  // e.g. ["065", "066", "067", "069"]
  color: string;
  bgLight: string;
  smscCenter: string;
  ussdBalance: string;
  status: 'active' | 'integrated';
  latencyMs: number;
}

// 1. Database of Algerian Banks & Financial Institutions
export const ALGERIAN_BANKS_DATABASE: AlgerianBank[] = [
  {
    id: 'satim',
    nameAr: 'شركة النقد الآلي والعلاقات التلقائية بين البنوك (ساتيم)',
    nameFr: "Société d'Automatisation des Télétransactions Interbancaires (SATIM)",
    shortName: 'SATIM',
    code: '000',
    type: 'central_switch',
    categoryLabel: 'المحوّل النقدي المركزي الوطني',
    color: '#0284c7',
    website: 'https://satim.dz',
    supportPhone: '3330',
    cardNetwork: 'CIB & Edahabia',
    smsSenderId: 'SATIM_CIB',
    status: 'active',
    latencyMs: 12,
  },
  {
    id: 'algerie-poste',
    nameAr: 'بريد الجزائر (الحسابات البريدية الجارية والبطاقة الذهبية)',
    nameFr: 'Algérie Poste (ECCP / BaridiMob / Edahabia)',
    shortName: 'Algérie Poste',
    code: '007',
    type: 'postal',
    categoryLabel: 'المؤسسة البريدية ونظام الدفع الوطني',
    color: '#00b4a0',
    website: 'https://poste.dz',
    supportPhone: '1530',
    cardNetwork: 'Edahabia',
    smsSenderId: 'ALGERIE_POSTE',
    status: 'active',
    latencyMs: 14,
  },
  {
    id: 'bna',
    nameAr: 'البنك الوطني الجزائري',
    nameFr: "Banque Nationale d'Algérie (BNA)",
    shortName: 'BNA',
    code: '001',
    type: 'public_bank',
    categoryLabel: 'بنك عمومي وتجاري',
    color: '#1d4ed8',
    website: 'https://www.bna.dz',
    supportPhone: '021 73 99 99',
    cardNetwork: 'CIB',
    smsSenderId: 'BNA_BANQUE',
    status: 'active',
    latencyMs: 18,
  },
  {
    id: 'bea',
    nameAr: 'بنك الجزائر الخارجي',
    nameFr: "Banque Extérieure d'Algérie (BEA)",
    shortName: 'BEA',
    code: '002',
    type: 'public_bank',
    categoryLabel: 'بنك عمومي وتجاري',
    color: '#0891b2',
    website: 'https://www.bea.dz',
    supportPhone: '021 60 41 80',
    cardNetwork: 'CIB',
    smsSenderId: 'BEA_ALGERIE',
    status: 'active',
    latencyMs: 22,
  },
  {
    id: 'cpa',
    nameAr: 'القرض الشعبي الجزائري',
    nameFr: 'Crédit Populaire d\'Algérie (CPA)',
    shortName: 'CPA',
    code: '004',
    type: 'public_bank',
    categoryLabel: 'بنك عمومي وتجاري',
    color: '#b91c1c',
    website: 'https://www.cpa-bank.dz',
    supportPhone: '021 43 43 43',
    cardNetwork: 'CIB',
    smsSenderId: 'CPA_BANQUE',
    status: 'active',
    latencyMs: 19,
  },
  {
    id: 'bdl',
    nameAr: 'بنك التنمية المحلية',
    nameFr: 'Banque de Développement Local (BDL)',
    shortName: 'BDL',
    code: '005',
    type: 'public_bank',
    categoryLabel: 'بنك عمومي وتجاري',
    color: '#15803d',
    website: 'https://www.bdl.dz',
    supportPhone: '021 99 90 90',
    cardNetwork: 'CIB',
    smsSenderId: 'BDL_BANK',
    status: 'active',
    latencyMs: 25,
  },
  {
    id: 'badr',
    nameAr: 'بنك الفلاحة والتنمية الريفية',
    nameFr: 'Banque de l\'Agriculture et du Développement Rural (BADR)',
    shortName: 'BADR',
    code: '003',
    type: 'public_bank',
    categoryLabel: 'بنك عمومي وتجاري',
    color: '#166534',
    website: 'https://www.badr-bank.dz',
    supportPhone: '021 63 94 40',
    cardNetwork: 'CIB',
    smsSenderId: 'BADR_BANK',
    status: 'active',
    latencyMs: 20,
  },
  {
    id: 'cnep',
    nameAr: 'بنك الصندوق الوطني للتوفير والاحتياط',
    nameFr: 'CNEP Banque',
    shortName: 'CNEP',
    code: '006',
    type: 'public_bank',
    categoryLabel: 'بنك عمومي للإسكان والادخار',
    color: '#c2410c',
    website: 'https://www.cnepbanque.dz',
    supportPhone: '021 74 33 33',
    cardNetwork: 'CIB',
    smsSenderId: 'CNEP_BANQUE',
    status: 'active',
    latencyMs: 16,
  },
  {
    id: 'albaraka',
    nameAr: 'بنك البركة الجزائري',
    nameFr: 'Al Baraka Bank Algeria',
    shortName: 'Al Baraka',
    code: '012',
    type: 'islamic_bank',
    categoryLabel: 'صيرفة إسلامية',
    color: '#059669',
    website: 'https://albaraka-bank.dz',
    supportPhone: '021 98 00 00',
    cardNetwork: 'CIB',
    smsSenderId: 'ALBARAKA',
    status: 'active',
    latencyMs: 15,
  },
  {
    id: 'alsalam',
    nameAr: 'مصرف السلام الجزائر',
    nameFr: 'Banque Al Salam Algeria',
    shortName: 'Al Salam',
    code: '022',
    type: 'islamic_bank',
    categoryLabel: 'صيرفة إسلامية',
    color: '#0d9488',
    website: 'https://www.alsalamalgeria.com',
    supportPhone: '021 38 88 88',
    cardNetwork: 'CIB',
    smsSenderId: 'ALSALAM_BANK',
    status: 'active',
    latencyMs: 17,
  },
  {
    id: 'agb',
    nameAr: 'بنك الخليج الجزائر',
    nameFr: 'Gulf Bank Algeria (AGB)',
    shortName: 'AGB',
    code: '020',
    type: 'private_bank',
    categoryLabel: 'بنك تجاري خاص',
    color: '#854d0e',
    website: 'https://www.agb.dz',
    supportPhone: '021 98 88 00',
    cardNetwork: 'CIB',
    smsSenderId: 'AGB_BANK',
    status: 'active',
    latencyMs: 19,
  },
  {
    id: 'societe-generale',
    nameAr: 'سوسيتيه جنرال الجزائر',
    nameFr: 'Société Générale Algérie (SGA)',
    shortName: 'Société Générale',
    code: '011',
    type: 'private_bank',
    categoryLabel: 'بنك تجاري خاص',
    color: '#dc2626',
    website: 'https://www.societegenerale.dz',
    supportPhone: '021 45 11 55',
    cardNetwork: 'CIB',
    smsSenderId: 'SG_ALGERIE',
    status: 'active',
    latencyMs: 23,
  },
  {
    id: 'bnp-paribas',
    nameAr: 'بي إن بي باريبا الجزائر',
    nameFr: 'BNP Paribas El Djazaïr',
    shortName: 'BNP Paribas',
    code: '013',
    type: 'private_bank',
    categoryLabel: 'بنك تجاري خاص',
    color: '#047857',
    website: 'https://algerie.bnpparibas',
    supportPhone: '021 98 11 11',
    cardNetwork: 'CIB',
    smsSenderId: 'BNP_PARIBAS',
    status: 'active',
    latencyMs: 21,
  },
  {
    id: 'natixis',
    nameAr: 'ناتيكسيس الجزائر',
    nameFr: 'Natixis Algérie (Banque Populaire)',
    shortName: 'Natixis',
    code: '010',
    type: 'private_bank',
    categoryLabel: 'بنك تجاري خاص',
    color: '#6366f1',
    website: 'https://www.natixis.dz',
    supportPhone: '021 98 80 00',
    cardNetwork: 'CIB',
    smsSenderId: 'NATIXIS',
    status: 'active',
    latencyMs: 26,
  },
  {
    id: 'housing-bank',
    nameAr: 'بنك الإسكان للتجارة والتمويل',
    nameFr: 'Housing Bank Algeria',
    shortName: 'Housing Bank',
    code: '015',
    type: 'private_bank',
    categoryLabel: 'بنك تجاري خاص',
    color: '#4338ca',
    website: 'https://www.hbtf.com.dz',
    supportPhone: '021 98 22 22',
    cardNetwork: 'CIB',
    smsSenderId: 'HOUSING_BANK',
    status: 'active',
    latencyMs: 28,
  },
  {
    id: 'arab-bank',
    nameAr: 'البنك العربي الجزائر',
    nameFr: 'Arab Bank PLC Algeria',
    shortName: 'Arab Bank',
    code: '014',
    type: 'private_bank',
    categoryLabel: 'بنك تجاري خاص',
    color: '#1e40af',
    website: 'https://www.arabbank.dz',
    supportPhone: '021 68 77 77',
    cardNetwork: 'CIB',
    smsSenderId: 'ARAB_BANK',
    status: 'active',
    latencyMs: 24,
  },
  {
    id: 'fransabank',
    nameAr: 'فرنسبنك الجزائر',
    nameFr: 'Fransabank El Djazaïr',
    shortName: 'Fransabank',
    code: '018',
    type: 'private_bank',
    categoryLabel: 'بنك تجاري خاص',
    color: '#be185d',
    website: 'https://www.fransabank.dz',
    supportPhone: '021 98 33 33',
    cardNetwork: 'CIB',
    smsSenderId: 'FRANSABANK',
    status: 'active',
    latencyMs: 27,
  },
  {
    id: 'trust-bank',
    nameAr: 'ترست بنك الجزائر',
    nameFr: 'Trust Bank Algeria',
    shortName: 'Trust Bank',
    code: '016',
    type: 'private_bank',
    categoryLabel: 'بنك تجاري خاص',
    color: '#0369a1',
    website: 'https://www.trustbank.dz',
    supportPhone: '021 98 44 44',
    cardNetwork: 'CIB',
    smsSenderId: 'TRUST_BANK',
    status: 'active',
    latencyMs: 25,
  },
];

// 2. Database of Algerian Mobile Telecom Operators
export const ALGERIAN_TELECOM_OPERATORS: AlgerianTelecomOperator[] = [
  {
    id: 'mobilis',
    nameAr: 'اتصالات الجزائر للهاتف النقال - موبيليس',
    nameFr: 'ATM Mobilis (Algérie Télécom Mobile)',
    companyName: 'Mobilis',
    carrierCode: '603-01',
    prefixes: ['065', '066', '067', '069'],
    color: '#008234',
    bgLight: 'rgba(0, 130, 52, 0.15)',
    smscCenter: '+213661000100',
    ussdBalance: '*111#',
    status: 'active',
    latencyMs: 8,
  },
  {
    id: 'djezzy',
    nameAr: 'جيزي - أوبتيموم تيليكوم الجزائر',
    nameFr: 'Djezzy (Optimum Telecom Algérie)',
    companyName: 'Djezzy',
    carrierCode: '603-02',
    prefixes: ['077', '078', '079'],
    color: '#e30613',
    bgLight: 'rgba(227, 6, 19, 0.15)',
    smscCenter: '+213770000000',
    ussdBalance: '*710#',
    status: 'active',
    latencyMs: 9,
  },
  {
    id: 'ooredoo',
    nameAr: 'أوريدو الجزائر',
    nameFr: 'Ooredoo Algérie (Wataniya Telecom)',
    companyName: 'Ooredoo',
    carrierCode: '603-03',
    prefixes: ['054', '055', '056'],
    color: '#ed1c24',
    bgLight: 'rgba(237, 28, 36, 0.15)',
    smscCenter: '+213550000000',
    ussdBalance: '*200#',
    status: 'active',
    latencyMs: 11,
  },
];

/**
 * Auto-detect Algerian Mobile Telecom Operator by phone number prefix
 */
export function detectAlgerianTelecom(phone: string): AlgerianTelecomOperator | null {
  if (!phone) return null;
  // Normalize: remove spaces, dashes, +213 or 00213
  let clean = phone.replace(/[\s\-\(\)]/g, '');
  if (clean.startsWith('+213')) {
    clean = '0' + clean.slice(4);
  } else if (clean.startsWith('00213')) {
    clean = '0' + clean.slice(5);
  } else if (clean.startsWith('213')) {
    clean = '0' + clean.slice(3);
  }

  if (clean.length < 3) return null;
  const prefix3 = clean.slice(0, 3);

  for (const op of ALGERIAN_TELECOM_OPERATORS) {
    if (op.prefixes.includes(prefix3)) {
      return op;
    }
  }

  // Fallback by 2 digits: 06 -> Mobilis, 07 -> Djezzy, 05 -> Ooredoo
  if (clean.startsWith('06')) return ALGERIAN_TELECOM_OPERATORS[0];
  if (clean.startsWith('07')) return ALGERIAN_TELECOM_OPERATORS[1];
  if (clean.startsWith('05')) return ALGERIAN_TELECOM_OPERATORS[2];

  return null;
}

/**
 * Auto-detect Algerian Bank by RIB (20 digits, first 3 digits are the bank code)
 * Or search by bank id
 */
export function detectAlgerianBank(identifier: string): AlgerianBank | null {
  if (!identifier) return null;
  const clean = identifier.replace(/[\s\-]/g, '');

  // 1. Direct ID match
  const byId = ALGERIAN_BANKS_DATABASE.find(b => b.id.toLowerCase() === identifier.toLowerCase());
  if (byId) return byId;

  // 2. RIB code match (if starts with 3-digit code like 007 for Algerie Poste, 001 for BNA)
  if (clean.length >= 3) {
    const code3 = clean.slice(0, 3);
    const byCode = ALGERIAN_BANKS_DATABASE.find(b => b.code === code3);
    if (byCode) return byCode;
  }

  // 3. Keyword match (e.g. "poste", "baridi", "cpa", "bna")
  const lower = identifier.toLowerCase();
  const byKeyword = ALGERIAN_BANKS_DATABASE.find(b => 
    b.shortName.toLowerCase().includes(lower) || 
    b.nameFr.toLowerCase().includes(lower) || 
    b.nameAr.includes(identifier)
  );

  return byKeyword || null;
}
