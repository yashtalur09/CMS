const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  conferenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conference',
    required: [true, 'Conference ID is required']
  },
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: [true, 'Submission ID is required']
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer ID is required']
  },
  bidValue: {
    type: Number,
    required: [true, 'Bid value is required'],
    enum: {
      values: [1, -1],
      message: 'Bid value must be 1 (interested) or -1 (not interested)'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate bids
bidSchema.index({ submissionId: 1, reviewerId: 1 }, { unique: true });
bidSchema.index({ conferenceId: 1, reviewerId: 1 });

module.exports = mongoose.model('Bid', bidSchema);
