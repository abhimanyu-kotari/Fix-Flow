const crypto = require('node:crypto');
const { Customer, RepairTicket, OtpVerification } = require('../models');
const { normalizePhone } = require('../utils/phone');
const { signToken } = require('../utils/crypto');
const { getSmsProvider } = require('./sms/smsProvider');
const env = require('../config/env');

function generateOtpCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOtp(otp, salt) {
  return crypto.createHash('sha256').update(`${otp}:${salt}`).digest('hex');
}

async function requestOtp(rawPhone, customProvider) {
  const smsProvider = customProvider || getSmsProvider();

  const phoneRes = normalizePhone(rawPhone);
  if (!phoneRes.isValid) {
    throw new Error(`Invalid phone number: ${phoneRes.error}`);
  }

  const phoneE164 = phoneRes.e164;

  // Anti-enumeration: Check if customer exists AND has repair tickets
  const customer = await Customer.findOne({ phoneE164 });
  let hasRepairRecords = false;

  if (customer) {
    const ticketCount = await RepairTicket.countDocuments({ customer: customer._id });
    hasRepairRecords = ticketCount > 0;
  }

  const genericSuccessResponse = {
    success: true,
    message: 'If this phone number is registered with FixFlow repairs, a verification code has been sent.',
    cooldownSeconds: env.OTP_RESEND_COOLDOWN_SECONDS
  };

  if (!hasRepairRecords) {
    return genericSuccessResponse;
  }

  // 1. Rate limiting check (e.g. max 5 OTPs per hour per phone)
  const oneHourAgo = new Date(Date.now() - 3600 * 1000);
  const recentCount = await OtpVerification.countDocuments({
    phoneE164,
    createdAt: { $gt: oneHourAgo }
  });

  if (recentCount >= env.OTP_RATE_LIMIT_MAX_PER_HOUR) {
    throw new Error('Too many OTP requests. Please wait an hour before trying again.');
  }

  // 2. Resend Cooldown Check (60 seconds)
  const lastActiveOtp = await OtpVerification.findOne({
    phoneE164,
    consumed: false
  }).sort({ createdAt: -1 });

  if (lastActiveOtp) {
    const lastSentTime = new Date(lastActiveOtp.lastSentAt).getTime();
    const elapsedSeconds = Math.floor((Date.now() - lastSentTime) / 1000);

    if (elapsedSeconds < env.OTP_RESEND_COOLDOWN_SECONDS) {
      const waitRemaining = env.OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds;
      const err = new Error(`Please wait ${waitRemaining} second(s) before requesting a new code.`);
      err.retryAfterSeconds = waitRemaining;
      err.code = 'COOLDOWN_ACTIVE';
      throw err;
    }

    lastActiveOtp.consumed = true;
    await lastActiveOtp.save();
  }

  // 3. Generate secure OTP
  const otp = generateOtpCode();
  const salt = crypto.randomBytes(16).toString('hex');
  const otpHash = hashOtp(otp, salt);
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

  // 4. Save to MongoDB
  await OtpVerification.create({
    phoneE164,
    otpHash,
    salt,
    attempts: 0,
    maxAttempts: env.OTP_MAX_ATTEMPTS,
    expiresAt,
    lastSentAt: new Date(),
    consumed: false
  });

  // 5. Send via configured provider
  await smsProvider.sendOtp({
    phoneE164,
    otp,
    expiryMinutes: env.OTP_EXPIRY_MINUTES
  });

  return {
    ...genericSuccessResponse,
    ...(env.isDev ? { devOtp: otp } : {})
  };
}

async function verifyOtp(rawPhone, inputOtp) {
  const phoneRes = normalizePhone(rawPhone);
  if (!phoneRes.isValid) {
    throw new Error('Invalid phone number provided.');
  }

  if (!inputOtp || typeof inputOtp !== 'string') {
    throw new Error('Verification code is required.');
  }

  const phoneE164 = phoneRes.e164;
  const trimmedOtp = inputOtp.trim();

  const otpRecord = await OtpVerification.findOne({
    phoneE164,
    consumed: false
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new Error('No active verification code found for this phone number. Please request a new code.');
  }

  // Check expiration
  if (Date.now() > new Date(otpRecord.expiresAt).getTime()) {
    otpRecord.consumed = true;
    await otpRecord.save();
    throw new Error('Verification code has expired. Please request a new code.');
  }

  // Check attempt limit
  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    otpRecord.consumed = true;
    await otpRecord.save();
    throw new Error('Maximum verification attempts exceeded. This code has been invalidated. Please request a new code.');
  }

  // Compare hashes
  const computedHash = hashOtp(trimmedOtp, otpRecord.salt);
  const isMatch = crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(otpRecord.otpHash));

  if (!isMatch) {
    otpRecord.attempts += 1;
    const remaining = otpRecord.maxAttempts - otpRecord.attempts;

    if (remaining <= 0) {
      otpRecord.consumed = true;
      await otpRecord.save();
      throw new Error('Invalid verification code. Maximum attempts reached. Please request a new code.');
    }

    await otpRecord.save();
    const err = new Error(`Invalid verification code. ${remaining} attempt(s) remaining.`);
    err.remainingAttempts = remaining;
    throw err;
  }

  // Match: Consume OTP
  otpRecord.consumed = true;
  await otpRecord.save();

  // Mark customer verified
  const customer = await Customer.findOneAndUpdate(
    { phoneE164 },
    { $set: { isVerified: true } },
    { returnDocument: 'after' }
  );

  const token = signToken({
    customerId: customer._id.toString(),
    phone: customer.phoneE164,
    type: 'customer'
  }, '30d');

  return {
    success: true,
    token,
    customer: {
      id: customer._id.toString(),
      phone: customer.phoneE164,
      name: customer.defaultName,
      isVerified: true
    }
  };
}

module.exports = {
  requestOtp,
  verifyOtp,
  generateOtpCode,
  hashOtp
};
