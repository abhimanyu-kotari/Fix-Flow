const mongoose = require('mongoose');

const OtpVerificationSchema = new mongoose.Schema({
  phoneE164: { type: String, required: true, index: true },
  otpHash: { type: String, required: true },
  salt: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  expiresAt: { type: Date, required: true },
  lastSentAt: { type: Date, default: Date.now },
  consumed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('OtpVerification', OtpVerificationSchema);
