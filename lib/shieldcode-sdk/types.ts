/**
 * ShieldCode SDK - Core Types & Interfaces
 * Standalone security tool for Anti-Phishing protection in financial & banking systems.
 */

export interface ShieldCodeConfig {
  apiKey?: string;
  institutionName?: string; // e.g. "BaridiMob", "SATIM", "BNA", "BEA"
  defaultChannel?: 'sms' | 'email' | 'push';
  encryptionKey?: string;
  storageAdapter?: 'local' | 'memory' | 'custom';
}

export interface AntiPhishingRecord {
  userId: string;
  code: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
  lastUsedAt?: number;
  maskedCard?: string;
}

export interface InjectNotificationOptions {
  userId: string;
  rawMessage: string;
  channel?: 'sms' | 'email' | 'push';
  customSender?: string;
  metadata?: Record<string, any>;
}

export interface InjectNotificationResult {
  success: boolean;
  protectedMessage: string;
  hasCode: boolean;
  codeAttached?: string;
  channel: 'sms' | 'email' | 'push';
  timestamp: number;
  auditId: string;
}

export interface VerifyMessageOptions {
  userId: string;
  fullMessageText: string;
  providedCode?: string;
}

export interface VerifyMessageResult {
  isAuthentic: boolean;
  detectedCode?: string;
  status: 'VERIFIED_GENUINE' | 'MISSING_CODE' | 'CODE_MISMATCH' | 'USER_NOT_PROTECTED';
  confidence: number;
  reason: string;
}

export interface CodeValidationResult {
  valid: boolean;
  errors: string[];
}
