const mongoose = require('mongoose');

const QuotationSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  message: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
  // vendorStatus tracks the vendor's response after admin approves the quotation
  // 'none' = no action / not assigned, 'assigned' = admin approved and vendor assigned,
  // 'accepted' = vendor accepted assignment, 'completed' = vendor marked event completed
  vendorStatus: { type: String, enum: ['none', 'assigned', 'accepted', 'completed', 'denied'], default: 'none' }
}, { timestamps: true });

module.exports = mongoose.model('Quotation', QuotationSchema);
