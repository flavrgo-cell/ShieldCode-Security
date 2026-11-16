import fs from 'fs';
import path from 'path';
import { detectAlgerianTelecom, detectAlgerianBank } from '../algerian-registry';

export interface CitizenShieldRecord {
  id: string; // unique user identifier
  phone_number: string | null; // E.164 formatted, e.g. +213555123456
  is_phone_verified: boolean;  // default: false
  anti_phishing_code: string;  // user-defined secret word/PIN shown in official SMS
  bankId: string;
  accountNumber?: string;
  registeredAt: number;
  updatedAt: number;
  lastUsedAt?: number;
  totalProtectedMessages: number;
}

export interface OtpVerificationRecord {
  user_id: string;
  phone_number: string; // E.164
  otp_hash: string;     // Never store plaintext OTP
  expires_at: number;   // Timestamp (5 minutes TTL)
  attempts_count: number; // Max 3 failed attempts
  created_at: number;
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
  twilioSid?: string;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'shieldcode_live.json');

const INITIAL_DATABASE = {
  citizens: {} as Record<string, CitizenShieldRecord>,
  otpStore: {} as Record<string, OtpVerificationRecord>,
  auditLogs: [] as ProtectedMessageLog[],
  systemStats: {
    totalBanksIntegrated: 18,
    totalTelecomsActive: 3,
    totalProtectedAlerts: 0,
    phishingAttemptsBlocked: 0,
    totalVerifiedPhones: 0,
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
      const parsed = JSON.parse(data);
      if (!parsed.otpStore) parsed.otpStore = {};
      if (!parsed.citizens) parsed.citizens = {};
      if (!parsed.auditLogs) parsed.auditLogs = [];
      if (!parsed.systemStats) parsed.systemStats = INITIAL_DATABASE.systemStats;
      return parsed;
    }
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
   * Save or update an OTP record (5 minutes TTL, starts with 0 attempts)
   */
  public static saveOTP(record: OtpVerificationRecord): void {
    const db = ensureDbFile();
    // Key by phone_number
    db.otpStore[record.phone_number] = record;
    persistDb(db);
  }

  /**
   * Retrieve active OTP record for a phone number
   */
  public static getOTP(phone: string): OtpVerificationRecord | null {
    const db = ensureDbFile();
    const entry = db.otpStore[phone];
    if (!entry) return null;

    // Check expiration
    if (Date.now() > entry.expires_at) {
      delete db.otpStore[phone];
      persistDb(db);
      return null;
    }

    return entry;
  }

  /**
   * Increment failed attempt count. If attempts >= 3, invalidates the OTP.
   */
  public static incrementFailedAttempts(phone: string): { attempts: number; invalidated: boolean } {
    const db = ensureDbFile();
    const entry = db.otpStore[phone];
    if (!entry) return { attempts: 0, invalidated: true };

    entry.attempts_count += 1;
    if (entry.attempts_count >= 3) {
      delete db.otpStore[phone];
      persistDb(db);
      return { attempts: entry.attempts_count, invalidated: true };
    }

    persistDb(db);
    return { attempts: entry.attempts_count, invalidated: false };
  }

  /**
   * Delete used or expired OTP record
   */
  public static deleteOTP(phone: string): void {
    const db = ensureDbFile();
    if (db.otpStore[phone]) {
      delete db.otpStore[phone];
      persistDb(db);
    }
  }

  /**
   * Verify and confirm user phone number
   */
  public static markPhoneVerified(userId: string, e164Phone: string): CitizenShieldRecord {
    const db = ensureDbFile();
    let citizen = db.citizens[userId] || db.citizens[e164Phone];

    if (!citizen) {
      citizen = {
        id: userId,
        phone_number: e164Phone,
        is_phone_verified: true,
        anti_phishing_code: 'SECURE2026',
        bankId: 'algerie-poste',
        registeredAt: Date.now(),
        updatedAt: Date.now(),
        totalProtectedMessages: 0,
      };
    } else {
      citizen.phone_number = e164Phone;
      citizen.is_phone_verified = true;
      citizen.updatedAt = Date.now();
    }

    db.citizens[userId] = citizen;
    db.citizens[e164Phone] = citizen;
    db.systemStats.totalVerifiedPhones = Object.values(db.citizens).filter(c => c.is_phone_verified).length;

    persistDb(db);
    return citizen;
  }

  /**
   * Update Anti-Phishing code for a user
   */
  public static setAntiPhishingCode(userId: string, code: string): CitizenShieldRecord {
    const db = ensureDbFile();
    let citizen = db.citizens[userId];

    if (!citizen) {
      citizen = {
        id: userId,
        phone_number: null,
        is_phone_verified: false,
        anti_phishing_code: code.trim().toUpperCase(),
        bankId: 'algerie-poste',
        registeredAt: Date.now(),
        updatedAt: Date.now(),
        totalProtectedMessages: 0,
      };
    } else {
      citizen.anti_phishing_code = code.trim().toUpperCase();
      citizen.updatedAt = Date.now();
    }

    db.citizens[userId] = citizen;
    if (citizen.phone_number) {
      db.citizens[citizen.phone_number] = citizen;
    }

    persistDb(db);
    return citizen;
  }

  /**
   * Register or update a citizen account with Algerian Bank & Telecom link
   */
  public static linkCitizen(params: {
    userId?: string;
    phone: string;
    bankId: string;
    code: string;
    accountNumber?: string;
    enabled?: boolean;
    isVerified?: boolean;
  }): CitizenShieldRecord {
    const db = ensureDbFile();
    const cleanPhone = params.phone.replace(/[\s\-\+]/g, '');
    const bank = detectAlgerianBank(params.bankId);
    const uid = params.userId || cleanPhone;

    const record: CitizenShieldRecord = {
      id: uid,
      phone_number: params.phone,
      is_phone_verified: params.isVerified ?? (db.citizens[uid]?.is_phone_verified || false),
      bankId: bank ? bank.id : params.bankId,
      accountNumber: params.accountNumber || '',
      anti_phishing_code: params.code.trim().toUpperCase(),
      registeredAt: db.citizens[uid]?.registeredAt || Date.now(),
      updatedAt: Date.now(),
      lastUsedAt: Date.now(),
      totalProtectedMessages: db.citizens[uid]?.totalProtectedMessages || 0,
    };

    db.citizens[uid] = record;
    db.citizens[params.phone] = record;
    persistDb(db);
    return record;
  }

  /**
   * Retrieve a user by ID or Phone number
   */
  public static getUser(idOrPhone: string): CitizenShieldRecord | null {
    const db = ensureDbFile();
    if (db.citizens[idOrPhone]) return db.citizens[idOrPhone];

    const clean = idOrPhone.replace(/[\s\-\+]/g, '');
    for (const key of Object.keys(db.citizens)) {
      const c = db.citizens[key];
      if (c.id === idOrPhone || c.phone_number === idOrPhone || key.endsWith(clean)) {
        return c;
      }
    }
    return null;
  }

  /**
   * Retrieve a citizen record by Algerian Phone number
   */
  public static getCitizenByPhone(phone: string): CitizenShieldRecord | null {
    return this.getUser(phone);
  }

  /**
   * Get all registered accounts
   */
  public static getAllCitizens(): CitizenShieldRecord[] {
    const db = ensureDbFile();
    const uniqueMap = new Map<string, CitizenShieldRecord>();
    Object.values(db.citizens).forEach(c => uniqueMap.set(c.id, c));
    return Array.from(uniqueMap.values());
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
    if (db.auditLogs.length > 100) {
      db.auditLogs = db.auditLogs.slice(0, 100);
    }

    db.systemStats.totalProtectedAlerts += 1;
    if (log.status === 'phishing_blocked') {
      db.systemStats.phishingAttemptsBlocked += 1;
    }
    db.systemStats.lastHeartbeat = Date.now();

    const citizen = db.citizens[log.phone];
    if (citizen) {
      citizen.totalProtectedMessages += 1;
      citizen.lastUsedAt = Date.now();
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
    const uniqueCitizens = Object.values(db.citizens).reduce((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {} as Record<string, CitizenShieldRecord>);

    return {
      ...db.systemStats,
      totalRegisteredCitizens: Object.keys(uniqueCitizens).length,
      totalVerifiedPhones: Object.values(uniqueCitizens).filter(c => c.is_phone_verified).length,
      lastHeartbeat: Date.now(),
    };
  }
}
