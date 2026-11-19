const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  phoneE164: { type: String, required: true, unique: true, index: true, trim: true },
  defaultName: { type: String, required: true, trim: true },
  passwordHash: { type: String, default: null },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
