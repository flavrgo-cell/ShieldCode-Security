import fs from 'fs';
import path from 'path';
import { detectAlgerianTelecom, detectAlgerianBank, AlgerianBank, AlgerianTelecomOperator } from '../algerian-registry';

export interface CitizenShieldRecord {
  id: string; // phone number or national account id
  phone: string;
  telecom: 'mobilis' | 'djezzy' | 'ooredoo' | 'unknown';
  bankId: string;
  accountNumber?: string; // CCP, RIP, or CIB Card
  antiphishingCode: string;
  enabled: boolean;
  registeredAt: number;
  lastUsedAt?: number;
  totalProtectedMessages: number;
}

export interface ProtectedMessageLog {
  id: string;
  timestamp: number;
  phone: string;
  telecom: string;
  bankId: string;
  bankName: string;
  channel: string;
  codeInjected: string;
  rawText: string;
  protectedText: string;
  status: 'delivered' | 'verified' | 'phishing_blocked';
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'shieldcode_live.json');

// Initial Seed with Clean Live Schema
const INITIAL_DATABASE = {
  citizens: {} as Record<string, CitizenShieldRecord>,
  auditLogs: [] as ProtectedMessageLog[],
  systemStats: {
    totalBanksIntegrated: 18,
    totalTelecomsActive: 3,
    totalProtectedAlerts: 0,
    phishingAttemptsBlocked: 0,
    lastHeartbeat: Date.now(),
  },
};

function ensureDbFile(): typeof INITIAL_DATABASE {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
    // Write initial
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATABASE, null, 2), 'utf8');
    return INITIAL_DATABASE;
  } catch (e) {
    console.error('ShieldCode Live Store read error, using in-memory:', e);
    return INITIAL_DATABASE;
  }
}

function persistDb(data: typeof INITIAL_DATABASE) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('ShieldCode Live Store write error:', e);
  }
}

export class AlgerianLiveStore {
  /**
   * Register or update a citizen account with Algerian Bank & Telecom link
   */
  public static linkCitizen(params: {
    phone: string;
    bankId: string;
    code: string;
    accountNumber?: string;
    enabled?: boolean;
  }): CitizenShieldRecord {
    const db = ensureDbFile();
    const cleanPhone = params.phone.replace(/[\s\-\+]/g, '');
    const telecomOp = detectAlgerianTelecom(cleanPhone);
    const bank = detectAlgerianBank(params.bankId);

    const record: CitizenShieldRecord = {
      id: cleanPhone,
      phone: cleanPhone,
      telecom: telecomOp ? telecomOp.id : 'unknown',
      bankId: bank ? bank.id : params.bankId,
      accountNumber: params.accountNumber || '',
      antiphishingCode: params.code.trim().toUpperCase(),
      enabled: params.enabled !== undefined ? params.enabled : true,
      registeredAt: Date.now(),
      lastUsedAt: Date.now(),
      totalProtectedMessages: 0,
    };

    db.citizens[cleanPhone] = record;
    persistDb(db);
    return record;
  }

  /**
   * Retrieve a citizen record by Algerian Phone number
   */
  public static getCitizenByPhone(phone: string): CitizenShieldRecord | null {
    const db = ensureDbFile();
    const clean = phone.replace(/[\s\-\+]/g, '');
    if (db.citizens[clean]) return db.citizens[clean];

    // Try suffix match (e.g. 0555123456 vs 213555123456)
    for (const key of Object.keys(db.citizens)) {
      if (key.endsWith(clean) || clean.endsWith(key)) {
        return db.citizens[key];
      }
    }
    return null;
  }

  /**
   * Get all registered accounts
   */
  public static getAllCitizens(): CitizenShieldRecord[] {
    const db = ensureDbFile();
    return Object.values(db.citizens);
  }

  /**
   * Record a protected notification event
   */
  public static logNotification(log: Omit<ProtectedMessageLog, 'id' | 'timestamp'>): ProtectedMessageLog {
    const db = ensureDbFile();
    const newLog: ProtectedMessageLog = {
      ...log,
      id: `sc_audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };

    db.auditLogs.unshift(newLog);
    // keep latest 100 logs
    if (db.auditLogs.length > 100) {
      db.auditLogs = db.auditLogs.slice(0, 100);
    }

    db.systemStats.totalProtectedAlerts += 1;
    if (log.status === 'phishing_blocked') {
      db.systemStats.phishingAttemptsBlocked += 1;
    }
    db.systemStats.lastHeartbeat = Date.now();

    // Increment user count
    if (db.citizens[log.phone]) {
      db.citizens[log.phone].totalProtectedMessages += 1;
      db.citizens[log.phone].lastUsedAt = Date.now();
    }

    persistDb(db);
    return newLog;
  }

  /**
   * Get audit logs
   */
  public static getLogs(limit: number = 20): ProtectedMessageLog[] {
    const db = ensureDbFile();
    return db.auditLogs.slice(0, limit);
  }

  /**
   * Get system live statistics
   */
  public static getStats() {
    const db = ensureDbFile();
    return {
      ...db.systemStats,
      totalRegisteredCitizens: Object.keys(db.citizens).length,
      lastHeartbeat: Date.now(),
    };
  }
}
