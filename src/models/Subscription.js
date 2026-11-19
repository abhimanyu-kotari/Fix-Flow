const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, unique: true },
  planId: { type: String, required: true, default: 'free', lowercase: true },
  status: { type: String, enum: ['ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELLED'], default: 'ACTIVE' },
  isDevOverride: { type: Boolean, default: false },
  currentPeriodEnd: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
