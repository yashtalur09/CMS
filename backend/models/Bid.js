const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer ID is required']
  },
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: [true, 'Submission ID is required']
  },
  trackId: { // NEW: track-scoped reference (optional)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
    required: false
  },
  confidence: {
    type: Number,
    default: 0,
    min: [0, 'Confidence must be at least 0'],
    max: [10, 'Confidence cannot exceed 10']
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'],
    default: 'PENDING'
  },
  decision: {
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    decidedAt: { type: Date },
    reason: { type: String, maxlength: [1000, 'Reason cannot exceed 1000 characters'] }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// indexes for common queries
bidSchema.index({ reviewerId: 1 });
bidSchema.index({ submissionId: 1 });
bidSchema.index({ trackId: 1 });
bidSchema.index({ status: 1 });

// Compound index to prevent duplicate bids
bidSchema.index({ reviewerId: 1, submissionId: 1 }, { unique: true });

module.exports = mongoose.model('Bid', bidSchema);
