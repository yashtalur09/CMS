const Submission = require('../models/Submission');
const Review = require('../models/Review');

/**
 * Check if all required reviews are submitted and update submission status
 * @param {ObjectId} submissionId - The submission ID
 * @returns {Promise<Object>} Updated submission
 */
async function checkAndUpdateReviewStatus(submissionId) {
  try {
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    // Count submitted reviews
    const submittedReviews = await Review.countDocuments({
      submissionId: submissionId,
      status: 'submitted'
    });

    // Update review count
    submission.reviewCount = submittedReviews;

    // If all required reviews are completed, update status
    if (submittedReviews >= submission.requiredReviews && submission.status === 'under_review') {
      submission.status = 'review_completed';
      submission.lastUpdatedAt = Date.now();
    }

    await submission.save();
    return submission;
  } catch (error) {
    console.error('Error updating review status:', error);
    throw error;
  }
}

/**
 * Assign reviewers to a submission and update status
 * @param {ObjectId} submissionId - The submission ID
 * @param {Array<ObjectId>} reviewerIds - Array of reviewer IDs
 * @returns {Promise<Object>} Updated submission
 */
async function assignReviewers(submissionId, reviewerIds) {
  try {
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    // Add reviewers (avoid duplicates)
    const uniqueReviewers = [...new Set([...submission.assignedReviewers, ...reviewerIds])];
    submission.assignedReviewers = uniqueReviewers;

    // Update status if this is first assignment
    if (submission.status === 'submitted') {
      submission.status = 'under_review';
    }

    submission.lastUpdatedAt = Date.now();
    await submission.save();
    
    return submission;
  } catch (error) {
    console.error('Error assigning reviewers:', error);
    throw error;
  }
}

/**
 * Update submission decision
 * @param {ObjectId} submissionId - The submission ID
 * @param {String} decision - 'accepted' or 'rejected'
 * @param {ObjectId} decidedBy - User ID who made the decision
 * @param {String} feedback - Optional feedback
 * @returns {Promise<Object>} Updated submission
 */
async function updateDecision(submissionId, decision, decidedBy, feedback = '') {
  try {
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    submission.status = decision;
    submission.decision = {
      decidedBy: decidedBy,
      decidedAt: Date.now(),
      feedback: feedback
    };
    submission.lastUpdatedAt = Date.now();

    await submission.save();
    return submission;
  } catch (error) {
    console.error('Error updating decision:', error);
    throw error;
  }
}

/**
 * Get submission with full details including reviews and progress
 * @param {ObjectId} submissionId - The submission ID
 * @returns {Promise<Object>} Submission with reviews
 */
async function getSubmissionWithDetails(submissionId) {
  try {
    const submission = await Submission.findById(submissionId)
      .populate('conferenceId', 'name venue startDate endDate')
      .populate('authorId', 'name email')
      .populate('assignedReviewers', 'name email')
      .populate('decision.decidedBy', 'name');

    if (!submission) {
      throw new Error('Submission not found');
    }

    // Get all reviews for this submission
    const reviews = await Review.find({ submissionId: submissionId })
      .populate('reviewerId', 'name email')
      .sort({ submittedAt: -1 });

    return {
      ...submission.toObject(),
      reviews: reviews,
      progress: `${submission.reviewCount || 0} / ${submission.requiredReviews || 3} reviews completed`
    };
  } catch (error) {
    console.error('Error fetching submission details:', error);
    throw error;
  }
}

module.exports = {
  checkAndUpdateReviewStatus,
  assignReviewers,
  updateDecision,
  getSubmissionWithDetails
};
