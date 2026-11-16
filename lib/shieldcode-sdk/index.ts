/**
 * ShieldCode SDK
 * Universal Anti-Phishing Security Tool for Financial & Banking Applications.
 *
 * Usage:
 * ```typescript
 * import { ShieldCodeCore, defaultShieldCode } from '@/lib/shieldcode-sdk';
 *
 * // 1. Set user code
 * defaultShieldCode.setCode('user_123', 'AYOUB2026', true);
 *
 * // 2. Protect outgoing SMS before sending
 * const result = defaultShieldCode.injectNotification({
 *   userId: 'user_123',
 *   rawMessage: 'كود التحقق OTP هو 889102'
 * });
 * console.log(result.protectedMessage);
 * // Output: "[رمزك: AYOUB2026]\nكود التحقق OTP هو 889102"
 * ```
 */

export * from './types';
export * from './core';
