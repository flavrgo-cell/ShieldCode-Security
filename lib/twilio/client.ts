import twilio from 'twilio';

// Load credentials from process.env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
export const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+12025550199';

// Check if credentials are real Twilio credentials (starts with AC and not placeholder)
export const isTwilioConfigured = Boolean(
  accountSid &&
  authToken &&
  accountSid.startsWith('AC') &&
  !accountSid.includes('PLACEHOLDER') &&
  authToken.length >= 20 &&
  !authToken.includes('PLACEHOLDER') &&
  process.env.TWILIO_MOCK_MODE !== 'true'
);

let twilioClientInstance: twilio.Twilio | null = null;

if (isTwilioConfigured && accountSid && authToken) {
  try {
    twilioClientInstance = twilio(accountSid, authToken);
  } catch (err) {
    console.warn('⚠️ Twilio SDK initialization warning:', err);
  }
}

export function getTwilioClient(): twilio.Twilio | null {
  return twilioClientInstance;
}
