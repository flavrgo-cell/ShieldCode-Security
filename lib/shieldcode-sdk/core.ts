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
 * Can be imported into any Node.js, Next.js, Express, React, or mobile application.
 */
export class ShieldCodeCore {
  private config: ShieldCodeConfig;
  private memoryStore: Map<string, AntiPhishingRecord> = new Map();

  constructor(config: ShieldCodeConfig = {}) {
    this.config = {
      institutionName: config.institutionName || 'ShieldCode Bank Network',
      defaultChannel: config.defaultChannel || 'sms',
      storageAdapter: config.storageAdapter || 'local',
      ...config,
    };
  }

  /**
   * Validate if a proposed Anti-Phishing code meets financial security standards
   * - Must be between 4 and 20 characters
   * - Must contain both letters and digits
   * - No spaces allowed
   */
  public validateCode(code: string): CodeValidationResult {
    const errors: string[] = [];
    if (!code || typeof code !== 'string') {
      return { valid: false, errors: ['الرمز مطلوب ويجب أن يكون نصاً'] };
    }

    const trimmed = code.trim();
    if (trimmed.length < 4) {
      errors.push('الرمز يجب أن يحتوي على 4 أحرف/أرقام على الأقل');
    }
    if (trimmed.length > 20) {
      errors.push('الرمز لا يمكن أن يتجاوز 20 حرفاً/رقماً');
    }
    if (/\s/.test(code)) {
      errors.push('الرمز لا يجب أن يحتوي على مسافات');
    }
    const hasLetters = /[A-Za-z\u0621-\u064A]/.test(code);
    if (!hasLetters) {
      errors.push('الرمز يجب أن يحتوي على حرف واحد على الأقل (عربي أو لاتيني)');
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
   * Save or update a user's Anti-Phishing Code in storage
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
   * THE CORE TOOL FUNCTION:
   * Protects any outgoing Bank SMS / Email / Push notification by injecting the user's secret code.
   */
  public injectNotification(options: InjectNotificationOptions): InjectNotificationResult {
    const { userId, rawMessage, channel = this.config.defaultChannel || 'sms' } = options;
    const record = this.getCode(userId);
    const auditId = `sc_audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    if (!record || !record.enabled || !record.code) {
      // User has no code or disabled protection
      return {
        success: false,
        protectedMessage: rawMessage,
        hasCode: false,
        channel,
        timestamp: Date.now(),
        auditId,
      };
    }

    // Format based on channel
    let protectedMessage = '';
    const cleanCode = record.code;

    if (channel === 'sms') {
      // Standard SMS Injection: Binance / Algerian Banking Standard
      protectedMessage = `[رمزك: ${cleanCode}]\n${rawMessage}`;
    } else if (channel === 'email') {
      protectedMessage = `[Anti-Phishing Code: ${cleanCode}]\n\n${rawMessage}\n\n---\n🛡️ هذا البريد موثق برمزك السري لدى ${this.config.institutionName}. إذا لم يطابق الرمز، فهو تصيد احتيالي!`;
    } else {
      protectedMessage = `[${cleanCode}] ${rawMessage}`;
    }

    // Update last used timestamp
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
   * Verification Tool:
   * Checks whether a given message text is authentic or a phishing attempt.
   */
  public verifyMessage(options: VerifyMessageOptions): VerifyMessageResult {
    const { userId, fullMessageText, providedCode } = options;
    const record = this.getCode(userId);

    if (!record || !record.enabled) {
      return {
        isAuthentic: false,
        status: 'USER_NOT_PROTECTED',
        confidence: 0.5,
        reason: 'المستخدم لم يقم بتفعيل رمز مكافحة التصيد في حسابه المصرفي',
      };
    }

    const expectedCode = record.code;

    // Check if expected code is in message
    const hasCodeInText = fullMessageText.includes(expectedCode);
    const hasProvidedCodeMatch = providedCode ? providedCode.trim() === expectedCode : false;

    if (hasCodeInText || hasProvidedCodeMatch) {
      return {
        isAuthentic: true,
        detectedCode: expectedCode,
        status: 'VERIFIED_GENUINE',
        confidence: 1.0,
        reason: `تم التحقق بنجاح! الرسالة تحتوي على رمز الأمان السري الخاص بك [${expectedCode}]`,
      };
    }

    return {
      isAuthentic: false,
      status: 'MISSING_CODE',
      confidence: 0.99,
      reason: `تحذير أمني: الرسالة لا تحتوي على رمزك الشخصي [${expectedCode}]. هذه محاولة تصيد احتيالي بنسبة 99%!`,
    };
  }
}

// Global Singleton instance for quick zero-config usage
export const defaultShieldCode = new ShieldCodeCore({
  institutionName: 'BaridiPay & SATIM Central ShieldCode Network',
});
