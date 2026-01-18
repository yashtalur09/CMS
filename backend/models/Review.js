const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  trackId: { // NEW: track-scoped reference
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
    required: false
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [1, 'Score must be at least 1'],
    max: [10, 'Score cannot exceed 10']
  },
  recommendation: {
    type: String,
    required: [true, 'Recommendation is required'],
    enum: ['ACCEPT', 'REJECT', 'MINOR_REVISION', 'MAJOR_REVISION'],
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'pending_revision'],
    default: 'draft'
  },
  comments: {
    type: String,
    required: [true, 'Comments are required'],
    maxlength: [5000, 'Comments cannot exceed 5000 characters']
  },
  confidentialComments: {
    type: String,
    maxlength: [5000, 'Confidential comments cannot exceed 5000 characters']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// indexes
reviewSchema.index({ submissionId: 1 });
reviewSchema.index({ reviewerId: 1 });
reviewSchema.index({ trackId: 1 });

// Compound index to prevent duplicate reviews
reviewSchema.index({ submissionId: 1, reviewerId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
