const mongoose = require('mongoose');

const ShopCustomerSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  shopDisplayName: { type: String, trim: true },
  internalNotes: { type: String, trim: true },
  firstSeenAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now }
}, { timestamps: true });

ShopCustomerSchema.index({ workspace: 1, customer: 1 }, { unique: true });

module.exports = mongoose.model('ShopCustomer', ShopCustomerSchema);
