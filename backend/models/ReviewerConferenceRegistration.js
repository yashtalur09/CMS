const mongoose = require('mongoose');

/**
 * ReviewerConferenceRegistration
 * 
 * Tracks reviewer eligibility for specific conferences.
 * A reviewer must have an active registration to:
 *   - Place bids on conference submissions
 *   - Be included in auto-assignment pools
 *   - Be manually assigned to submissions
 * 
 * This is separate from the participant Registration model
 * to avoid breaking existing participant workflows.
 */
const reviewerConferenceRegistrationSchema = new mongoose.Schema({
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer ID is required']
  },
  conferenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conference',
    required: [true, 'Conference ID is required']
  },
  status: {
    type: String,
    enum: [
      'REGISTERED_ACTIVE',
      'REGISTERED_PENDING_PAYMENT',
      'REGISTERED_CANCELLED',
      'REGISTERED_REJECTED',
      'BLOCKED'
    ],
    default: 'REGISTERED_ACTIVE'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'not_required'],
    default: 'not_required'
  },
  active: {
    type: Boolean,
    default: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Self-registration or organizer-initiated
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Unique constraint: one registration per reviewer per conference
reviewerConferenceRegistrationSchema.index(
  { reviewerId: 1, conferenceId: 1 },
  { unique: true }
);

// Efficient lookups for building eligible reviewer pools
reviewerConferenceRegistrationSchema.index({ conferenceId: 1, status: 1, active: 1 });
reviewerConferenceRegistrationSchema.index({ reviewerId: 1, status: 1 });

/**
 * Check if this registration grants assignment eligibility.
 * 
 * Rules:
 *   - REGISTERED_ACTIVE → always eligible
 *   - REGISTERED_PENDING_PAYMENT → configurable (eligible for free conferences)
 *   - All other states → NOT eligible
 */
reviewerConferenceRegistrationSchema.methods.isEligible = function (conferenceHasFee = false) {
  if (!this.active) return false;

  switch (this.status) {
    case 'REGISTERED_ACTIVE':
      return true;
    case 'REGISTERED_PENDING_PAYMENT':
      // For free conferences, pending payment is acceptable
      // For paid conferences, payment must be completed
      return !conferenceHasFee || this.paymentStatus === 'completed';
    default:
      return false;
  }
};

/**
 * Static: find all eligible reviewer IDs for a conference.
 * Returns a Set<string> of reviewer IDs.
 */
reviewerConferenceRegistrationSchema.statics.getEligibleReviewerIds = async function (conferenceId, conferenceHasFee = false) {
  const eligibleStatuses = ['REGISTERED_ACTIVE'];
  if (!conferenceHasFee) {
    eligibleStatuses.push('REGISTERED_PENDING_PAYMENT');
  }

  const registrations = await this.find({
    conferenceId,
    status: { $in: eligibleStatuses },
    active: true
  }).select('reviewerId').lean();

  return new Set(registrations.map(r => r.reviewerId.toString()));
};

module.exports = mongoose.model('ReviewerConferenceRegistration', reviewerConferenceRegistrationSchema);
