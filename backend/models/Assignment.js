const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
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
    trackId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track',
        required: [true, 'Track ID is required']
    },
    conferenceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conference',
        required: [true, 'Conference ID is required']
    },
    bidId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid',
        required: false // Optional - manual assignments may not have originating bid
    },
    source: {
        type: String,
        enum: ['MANUAL', 'BID', 'BID_PRIORITY', 'AUTO_GENERAL', 'DOMAIN_MATCH', 'DOMAIN_TOP_K', 'FALLBACK', 'AUTO'],
        default: 'MANUAL'
    },
    matchScore: {
        type: Number,
        default: 0,
        min: [0, 'Match score must be at least 0'],
        max: [100, 'Match score cannot exceed 100']
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
        default: 'ACTIVE'
    },
    locked: {
        type: Boolean,
        default: false
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // System assigns for AUTO, user for MANUAL
    },
    assignedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    matchReason: {
        type: String,
        maxlength: [500, 'Match reason cannot exceed 500 characters']
    },
    reviewerAcceptance: {
        status: {
            type: String,
            enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
            default: 'PENDING'
        },
        respondedAt: {
            type: Date
        }
    },
    notificationStatus: {
        type: String,
        enum: ['NOT_SENT', 'SENT', 'DELIVERED', 'FAILED'],
        default: 'NOT_SENT'
    },
    round: {
        type: Number,
        default: 1,
        min: [1, 'Round must be at least 1']
    },
    expiry: {
        type: Date
    },
    notes: {
        type: String,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for efficient queries
assignmentSchema.index({ reviewerId: 1 });
assignmentSchema.index({ submissionId: 1 });
assignmentSchema.index({ conferenceId: 1 });
assignmentSchema.index({ trackId: 1 });
assignmentSchema.index({ status: 1 });

// Compound index to prevent duplicate assignments
assignmentSchema.index({ reviewerId: 1, submissionId: 1 }, { unique: true });

// Compound index for efficient assignment queries (auto-assign engine)
assignmentSchema.index({ conferenceId: 1, submissionId: 1, reviewerId: 1, status: 1 });

// Virtual to check if assignment has been reviewed
assignmentSchema.virtual('hasReview', {
    ref: 'Review',
    localField: 'submissionId',
    foreignField: 'submissionId',
    justOne: true,
    match: function () {
        return { reviewerId: this.reviewerId };
    }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
