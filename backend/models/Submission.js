const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  conferenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conference',
    required: [true, 'Conference ID is required']
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author ID is required']
  },
  title: {
    type: String,
    required: [true, 'Paper title is required'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters']
  },
  abstract: {
    type: String,
    required: [true, 'Abstract is required'],
    maxlength: [5000, 'Abstract cannot exceed 5000 characters']
  },
  theme: {
    type: String,
    trim: true,
    maxlength: [100, 'Theme cannot exceed 100 characters']
  },
  fileUrl: {
    type: String,
    required: [true, 'Paper file is required']
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'review_completed', 'accepted', 'rejected', 'camera_ready_pending', 'final_submitted'],
    default: 'submitted'
  },
  organizerApproved: {
    type: Boolean,
    default: false
  },
  approvedAt: {
    type: Date
  },
  assignedReviewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reviewCount: {
    type: Number,
    default: 0
  },
  requiredReviews: {
    type: Number,
    default: 3
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  },
  decision: {
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    decidedAt: Date,
    feedback: String
  },
  precheck: {
    format: {
      type: Boolean,
      default: true
    },
    plagiarismScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  presentationSlot: {
    date: Date,
    startTime: String,
    endTime: String,
    venue: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'not_required'],
    default: 'not_required'
  },
  submissionDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for review progress
submissionSchema.virtual('reviewProgress').get(function() {
  return `${this.reviewCount || 0} / ${this.requiredReviews || 3}`;
});

// Ensure virtuals are included in JSON
submissionSchema.set('toJSON', { virtuals: true });
submissionSchema.set('toObject', { virtuals: true });

// Middleware to update lastUpdatedAt
submissionSchema.pre('save', function(next) {
  this.lastUpdatedAt = Date.now();
  next();
});

// Index for efficient queries
submissionSchema.index({ conferenceId: 1, authorId: 1 });
submissionSchema.index({ conferenceId: 1, status: 1 });
submissionSchema.index({ authorId: 1 });
submissionSchema.index({ assignedReviewers: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
