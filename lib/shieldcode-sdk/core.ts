import {
  ShieldCodeConfig,
  AntiPhishingRecord,
  InjectNotificationOptions,
  InjectNotificationResult,
  VerifyMessageOptions,
  VerifyMessageResult,
  CodeValidationResult,
} from './types';

/**
 * ShieldCodeCore Engine
 * Universal, framework-agnostic Anti-Phishing security tool.
 * Enables institutions to protect users by injecting user-defined Anti-Phishing codes into official communications.
 */
export class ShieldCodeCore {
  private config: ShieldCodeConfig;
  private memoryStore: Map<string, AntiPhishingRecord> = new Map();

  constructor(config: ShieldCodeConfig = {}) {
    this.config = {
      institutionName: config.institutionName || 'ShieldCode Enterprise Security',
      defaultChannel: config.defaultChannel || 'sms',
      storageAdapter: config.storageAdapter || 'local',
      ...config,
    };
  }

  /**
   * Validate if a proposed Anti-Phishing code meets security standards
   * - 4 to 20 characters
   * - Contains letters and digits
   * - No whitespace
   */
  public validateCode(code: string): CodeValidationResult {
    const errors: string[] = [];
    if (!code || typeof code !== 'string') {
      return { valid: false, errors: ['الرمز مطلوب ويجب أن يكون نصاً'] };
    }

    const trimmed = code.trim();
    if (trimmed.length < 4) {
      errors.push('الرمز يجب أن يحتوي على 4 خانات على الأقل');
    }
    if (trimmed.length > 20) {
      errors.push('الرمز لا يمكن أن يتجاوز 20 خانة');
    }
    if (/\s/.test(code)) {
      errors.push('الرمز لا يجب أن يحتوي على مسافات');
    }
    const hasLetters = /[A-Za-z\u0621-\u064A]/.test(code);
    if (!hasLetters) {
      errors.push('الرمز يجب أن يحتوي على حرف واحد على الأقل');
    }
    const hasDigits = /[0-9\u0660-\u0669]/.test(code);
    if (!hasDigits) {
      errors.push('الرمز يجب أن يحتوي على رقم واحد على الأقل');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Save or update a user's Anti-Phishing Code
   */
  public setCode(userId: string, code: string, enabled: boolean = true): AntiPhishingRecord {
    const validation = this.validateCode(code);
    if (enabled && !validation.valid) {
      throw new Error(`كود غير صالح: ${validation.errors.join(', ')}`);
    }

    const record: AntiPhishingRecord = {
      userId,
      code: code.trim(),
      enabled,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Store in memory
    this.memoryStore.set(userId, record);

    // If in browser environment and local storage requested, persist it
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const key = `shieldcode_rec_${userId}`;
        window.localStorage.setItem(key, JSON.stringify(record));
        // Also save as current active code for browser extension / active session
        window.localStorage.setItem('shieldcode_active_code', record.code);
        window.localStorage.setItem('shieldcode_active_user', userId);
      } catch (e) {
        console.warn('ShieldCode: Could not save to localStorage', e);
      }
    }

    return record;
  }

  /**
   * Retrieve a user's Anti-Phishing Code record
   */
  public getCode(userId: string): AntiPhishingRecord | null {
    if (this.memoryStore.has(userId)) {
      return this.memoryStore.get(userId)!;
    }

    // Try localStorage if available
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const key = `shieldcode_rec_${userId}`;
        const item = window.localStorage.getItem(key);
        if (item) {
          const rec: AntiPhishingRecord = JSON.parse(item);
          this.memoryStore.set(userId, rec);
          return rec;
        }
      } catch {
        // ignore
      }
    }

    return null;
  }

  /**
   * Get all active records stored locally
   */
  public getAllRecords(): AntiPhishingRecord[] {
    return Array.from(this.memoryStore.values());
  }

  /**
   * Institutional Injection:
   * Protects an outgoing SMS / Email / Push notification by injecting the user's secret code.
   */
  public injectNotification(options: InjectNotificationOptions): InjectNotificationResult {
    const { userId, rawMessage, channel = this.config.defaultChannel || 'sms', customSender } = options;
    const record = this.getCode(userId);
    const auditId = `sc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (!record || !record.enabled || !record.code) {
      return {
        success: false,
        protectedMessage: rawMessage,
        hasCode: false,
        channel,
        timestamp: Date.now(),
        auditId,
      };
    }

    let protectedMessage = '';
    const cleanCode = record.code;
    const sender = customSender || this.config.institutionName || 'المؤسسة المالية';

    if (channel === 'sms') {
      protectedMessage = `[رمزك الأمني: ${cleanCode}]\n${rawMessage}`;
    } else if (channel === 'email') {
      protectedMessage = `[Anti-Phishing Code: ${cleanCode}]\n\n${rawMessage}\n\n---\n🛡️ هذا البريد موثق برمزك الأمني الشخصي المعتمد لدى ${sender}. في حال عدم تطابق الرمز، يُرجى الحذر؛ فهذه محاولة تصيد!`;
    } else {
      protectedMessage = `[رمزك: ${cleanCode}] ${rawMessage}`;
    }

    record.lastUsedAt = Date.now();
    this.memoryStore.set(userId, record);

    return {
      success: true,
      protectedMessage,
      hasCode: true,
      codeAttached: cleanCode,
      channel,
      timestamp: Date.now(),
      auditId,
    };
  }

  /**
   * Message Verification:
   * Checks whether an incoming message is authentic or a phishing attempt.
   */
  public verifyMessage(options: VerifyMessageOptions): VerifyMessageResult {
    const { userId, fullMessageText, providedCode } = options;
    const record = userId ? this.getCode(userId) : null;
    const expectedCode = record?.code || providedCode;

    if (!expectedCode) {
      return {
        isAuthentic: false,
        status: 'USER_NOT_PROTECTED',
        confidence: 0.5,
        reason: 'لم يتم تحديد أو العثور على رمز مكافحة تصيد مسجل للمطابقة',
      };
    }

    const hasCodeInText = fullMessageText.includes(expectedCode);

    if (hasCodeInText) {
      return {
        isAuthentic: true,
        detectedCode: expectedCode,
        status: 'VERIFIED_GENUINE',
        confidence: 1.0,
        reason: `تم التحقق بنجاح! الرسالة تحتوي على الرمز السري المعتمد [${expectedCode}]، وهي صادرة من الجهة الحقيقية.`,
      };
    }

    return {
      isAuthentic: false,
      status: 'MISSING_CODE',
      confidence: 0.99,
      reason: `تحذير أمني عالي الخطورة: الرسالة لا تحتوي على رمزك الشخصي [${expectedCode}]. هذه محاولة تصيد احتيالي بنسبة 99%!`,
    };
  }
}

// Global default singleton instance
export const defaultShieldCode = new ShieldCodeCore({
  institutionName: 'ShieldCode Security Protocol',
});
