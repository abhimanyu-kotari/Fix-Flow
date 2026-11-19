require('dotenv').config();

const env = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEFAULT_COUNTRY_CODE: (process.env.DEFAULT_COUNTRY_CODE || 'IN').toUpperCase(),
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-fixflow-super-secure-key-2026',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fixflow',
  DB_PATH: process.env.DB_PATH || './data/fixflow.db',
  SMS_PROVIDER: process.env.SMS_PROVIDER || 'mock',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER || '',
  OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10),
  OTP_MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS || '3', 10),
  OTP_RESEND_COOLDOWN_SECONDS: parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10),
  OTP_RATE_LIMIT_MAX_PER_HOUR: parseInt(process.env.OTP_RATE_LIMIT_MAX_PER_HOUR || '5', 10),
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production'
};

module.exports = env;
