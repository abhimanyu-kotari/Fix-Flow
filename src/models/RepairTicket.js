const mongoose = require('mongoose');

const TimelineEventSchema = new mongoose.Schema({
  fromStatus: { type: String },
  toStatus: { type: String, required: true },
  notes: { type: String },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const RepairTicketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true, index: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  deviceCategory: { type: String, trim: true, default: 'Smartphone' },
  brand: { type: String, trim: true, default: 'Generic' },
  model: { type: String, trim: true, default: 'Device' },
  issueDescription: { type: String, trim: true, default: 'General Inspection & Diagnostics' },
  estimatedCost: { type: Number, default: 0 },
  estimatedCompletionDate: { type: Date, default: null },
  status: {
    type: String,
    enum: ['RECEIVED', 'DIAGNOSING', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'DELIVERED', 'CANCELLED'],
    default: 'RECEIVED',
    index: true
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedStaffName: { type: String, trim: true, default: '' },
  assignedStaffPhone: { type: String, trim: true, default: '' },
  timeline: [TimelineEventSchema]
}, { timestamps: true });

module.exports = mongoose.model('RepairTicket', RepairTicketSchema);
