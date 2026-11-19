const mongoose = require('mongoose');

const WorkspaceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Workspace', WorkspaceSchema);
