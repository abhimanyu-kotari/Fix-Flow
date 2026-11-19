const env = require('../../config/env');

/**
 * In-memory Mock SMS Provider for automated unit/integration testing
 */
class MockSmsProvider {
  constructor() {
    this.sentMessages = [];
  }

  async sendOtp({ phoneE164, otp, expiryMinutes }) {
    this.sentMessages.push({
      phoneE164,
      otp,
      expiryMinutes,
      timestamp: new Date().toISOString()
    });
    return { success: true, messageId: `mock_${Date.now()}` };
  }

  getLastMessageForPhone(phoneE164) {
    const matches = this.sentMessages.filter(m => m.phoneE164 === phoneE164);
    return matches.length > 0 ? matches[matches.length - 1] : null;
  }

  clear() {
    this.sentMessages = [];
  }
}

/**
 * Console SMS Provider for local manual development
 */
class ConsoleSmsProvider {
  async sendOtp({ phoneE164, otp, expiryMinutes }) {
    console.log('\n=========================================');
    console.log(`[FixFlow SMS Gateway] Dev Console Mode`);
    console.log(`To: ${phoneE164}`);
    console.log(`Message: Your FixFlow Track verification code is: ${otp}. It expires in ${expiryMinutes} minutes.`);
    console.log('=========================================\n');
    return { success: true, messageId: `console_${Date.now()}` };
  }
}

/**
 * Twilio SMS Provider for live production delivery
 */
class TwilioSmsProvider {
  constructor() {
    if (env.isProd && (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER)) {
      throw new Error('Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER) are required in production.');
    }
  }

  async sendOtp({ phoneE164, otp, expiryMinutes }) {
    const sid = env.TWILIO_ACCOUNT_SID;
    const token = env.TWILIO_AUTH_TOKEN;
    const from = env.TWILIO_FROM_NUMBER;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
    const bodyParams = new URLSearchParams({
      To: phoneE164,
      From: from,
      Body: `Your FixFlow Track verification code is: ${otp}. It will expire in ${expiryMinutes} minutes.`
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyParams.toString()
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(`Twilio delivery failed: ${errData.message || response.statusText}`);
    }

    const data = await response.json();
    return { success: true, messageId: data.sid };
  }
}

const mockProviderInstance = new MockSmsProvider();
const consoleProviderInstance = new ConsoleSmsProvider();

/**
 * Factory to retrieve the configured SMS provider
 * @param {string} [overrideType] 
 * @returns {MockSmsProvider | ConsoleSmsProvider | TwilioSmsProvider}
 */
function getSmsProvider(overrideType) {
  const type = (overrideType || env.SMS_PROVIDER || 'mock').toLowerCase();

  switch (type) {
    case 'console':
      return consoleProviderInstance;
    case 'twilio':
      return new TwilioSmsProvider();
    case 'mock':
    default:
      return mockProviderInstance;
  }
}

module.exports = {
  getSmsProvider,
  MockSmsProvider,
  ConsoleSmsProvider,
  TwilioSmsProvider,
  mockProviderInstance
};
