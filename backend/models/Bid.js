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
  conferenceId: { // Conference-scoped reference for eligibility enforcement
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conference',
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
  bidTimestamp: {
    type: Date,
    default: Date.now
  },
  matchScore: {
    type: Number,
    default: 0,
    min: [0, 'Match score cannot be negative'],
    max: [100, 'Match score cannot exceed 100']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bidStrength: {
    type: String,
    enum: ['STRONG_ACCEPT', 'INTERESTED', 'NEUTRAL', 'WEAK_INTEREST', null],
    default: null
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

// Compound index for efficient bid lookups during auto-assign
bidSchema.index({ status: 1, submissionId: 1, reviewerId: 1 });

// Conference-scoped bid queries
bidSchema.index({ conferenceId: 1, status: 1 });

module.exports = mongoose.model('Bid', bidSchema);
