/**
 * ShieldCode - Type Definitions
 * Universal Anti-Phishing Security Framework
 */

export interface AntiPhishingRecord {
  userId: string;
  code: string;
  enabled: boolean;
  institutionId?: string;
  createdAt: number;
  updatedAt: number;
  lastUsedAt?: number;
}

export interface CodeValidationResult {
  valid: boolean;
  errors: string[];
}

export interface InjectNotificationOptions {
  userId: string;
  rawMessage: string;
  channel?: 'sms' | 'email' | 'push' | 'receipt';
  institutionName?: string;
}

export interface InjectNotificationResult {
  success: boolean;
  protectedMessage: string;
  hasCode: boolean;
  codeAttached?: string;
  channel: string;
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
  status: 'VERIFIED_GENUINE' | 'MISSING_CODE' | 'USER_NOT_PROTECTED';
  confidence: number;
  reason: string;
}

export interface InstitutionalContract {
  institutionId: string;
  institutionName: string;
  apiKey: string;
  status: 'active' | 'pending' | 'suspended';
  supportedChannels: ('sms' | 'email' | 'push' | 'receipt')[];
  contractDate: string;
  slaTier: 'standard' | 'enterprise' | 'national_critical';
}
