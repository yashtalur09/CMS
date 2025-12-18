const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Conference = require('../models/Conference');
const Submission = require('../models/Submission');
const Review = require('../models/Review');
const Bid = require('../models/Bid');
const User = require('../models/User');

// All reviewer routes require authentication and reviewer role
router.use(auth, authorize('reviewer'));

/**
 * @route   GET /api/reviewer/dashboard
 * @desc    Get reviewer dashboard data
 * @access  Private (Reviewer)
 */
router.get('/dashboard', async (req, res) => {
  try {
    const reviewer = await User.findById(req.user.userId);

    // Get active conferences (from all organizers)
    // Show all active conferences regardless of expertise domains
    const query = {
      status: 'active',
      submissionDeadline: { $gte: new Date() }
    };
    
    const conferences = await Conference.find(query)
      .populate('organizerId', 'name email')
      .sort({ submissionDeadline: 1 })
      .limit(10);

    // Get reviewer's bids
    const bids = await Bid.find({ reviewerId: req.user.userId })
      .populate({
        path: 'submissionId',
        populate: { path: 'conferenceId', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get pending reviews
    const pendingReviews = await Bid.find({
      reviewerId: req.user.userId,
      bidValue: 1
    })
      .populate('submissionId')
      .populate('conferenceId', 'name');

    // Filter submissions without reviews
    const pendingSubmissions = [];
    for (const bid of pendingReviews) {
      const hasReview = await Review.findOne({
        submissionId: bid.submissionId._id,
        reviewerId: req.user.userId
      });
      if (!hasReview && bid.submissionId) {
        pendingSubmissions.push(bid);
      }
    }

    res.json({
      success: true,
      data: {
        conferences,
        recentBids: bids,
        pendingReviews: pendingSubmissions
      }
    });

  } catch (error) {
    console.error('Get reviewer dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/reviewer/assigned-submissions
 * @desc    Get all submissions assigned to this reviewer
 * @access  Private (Reviewer)
 */
router.get('/assigned-submissions', async (req, res) => {
  try {
    // Find all submissions where this reviewer is assigned
    const submissions = await Submission.find({
      assignedReviewers: req.user.userId
    })
      .populate('conferenceId', 'name venue startDate endDate')
      .populate('authorId', 'name email')
      .sort({ submittedAt: -1 });

    // Check which submissions already have reviews from this reviewer
    const submissionsWithReviewStatus = await Promise.all(
      submissions.map(async (sub) => {
        const existingReview = await Review.findOne({
          submissionId: sub._id,
          reviewerId: req.user.userId
        });

        return {
          ...sub.toObject(),
          hasReviewed: !!existingReview,
          myReview: existingReview || null,
          progress: `${sub.reviewCount || 0} / ${sub.requiredReviews || 3} reviews completed`
        };
      })
    );

    res.json({
      success: true,
      data: submissionsWithReviewStatus
    });

  } catch (error) {
    console.error('Get assigned submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned submissions',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/reviewer/conferences
 * @desc    Get conferences for reviewer
 * @access  Private (Reviewer)
 */
router.get('/conferences', async (req, res) => {
  try {
    const { domain } = req.query;
    const reviewer = await User.findById(req.user.userId);

    const query = { status: 'active' };

    // Optional domain filter - if provided in query
    if (domain) {
      query.domains = { $in: [domain] };
    }
    // Show ALL active conferences, not just matching expertise
    // This allows reviewers to explore all available conferences

    const conferences = await Conference.find(query)
      .populate('organizerId', 'name email')
      .sort({ submissionDeadline: 1 });

    // Add submission count for each conference
    const conferencesWithCounts = await Promise.all(
      conferences.map(async (conf) => {
        const submissionCount = await Submission.countDocuments({
          conferenceId: conf._id,
          organizerApproved: true
        });
        return {
          ...conf.toObject(),
          approvedSubmissionCount: submissionCount
        };
      })
    );

    res.json({
      success: true,
      data: { conferences: conferencesWithCounts }
    });

  } catch (error) {
    console.error('Get conferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conferences',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/reviewer/conferences/:id/submissions
 * @desc    Get submissions for a conference (for bidding)
 * @access  Private (Reviewer)
 */
router.get('/conferences/:id/submissions', async (req, res) => {
  try {
    const conference = await Conference.findById(req.params.id);

    if (!conference) {
      return res.status(404).json({
        success: false,
        message: 'Conference not found'
      });
    }

    // Only show organizer-approved submissions
    // Include all statuses except final stages (camera_ready_pending, final_submitted)
    const submissions = await Submission.find({
      conferenceId: req.params.id,
      organizerApproved: true,
      status: { $in: ['submitted', 'under_review', 'review_completed'] }
    })
      .populate('authorId', 'name email')
      .populate('assignedReviewers', 'name')
      .select('title abstract theme fileUrl createdAt submittedAt assignedReviewers reviewCount requiredReviews status organizerApproved approvedAt');

    // Get reviewer's bids for these submissions
    const submissionIds = submissions.map(s => s._id);
    const bids = await Bid.find({
      submissionId: { $in: submissionIds },
      reviewerId: req.user.userId
    });

    // Map bids to submissions
    const bidMap = {};
    bids.forEach(bid => {
      bidMap[bid.submissionId.toString()] = bid;
    });

    const submissionsWithBids = submissions.map(submission => {
      const isAssigned = submission.assignedReviewers.some(
        reviewer => reviewer._id.toString() === req.user.userId
      );
      const bid = bidMap[submission._id.toString()];
      
      return {
        ...submission.toObject(),
        hasBid: !!bid,
        bidValue: bid ? bid.bidValue : null,
        bidTime: bid ? bid.createdAt : null,
        isAssigned: isAssigned,
        spotsRemaining: submission.requiredReviews - submission.assignedReviewers.length
      };
    });

    res.json({
      success: true,
      data: submissionsWithBids
    });

  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/reviewer/bids
 * @desc    Place a bid on a submission with FCFS auto-assignment
 * @access  Private (Reviewer)
 */
router.post('/bids', [
  body('conferenceId').notEmpty().withMessage('Conference ID is required'),
  body('submissionId').notEmpty().withMessage('Submission ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { conferenceId, submissionId } = req.body;
    const reviewerId = req.user.userId;

    // Check if submission exists and is approved
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    if (!submission.organizerApproved) {
      return res.status(400).json({
        success: false,
        message: 'This submission is not yet approved for review'
      });
    }

    // Check if reviewer already bid
    const existingBid = await Bid.findOne({
      conferenceId,
      submissionId,
      reviewerId
    });

    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: 'You have already bid on this submission'
      });
    }

    // Check if already assigned
    if (submission.assignedReviewers.includes(reviewerId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already assigned to this submission'
      });
    }

    // Check if submission has reached required reviewers
    if (submission.assignedReviewers.length >= submission.requiredReviews) {
      return res.status(400).json({
        success: false,
        message: 'This submission already has the required number of reviewers'
      });
    }

    // Create bid with timestamp
    const bid = await Bid.create({
      conferenceId,
      submissionId,
      reviewerId,
      bidValue: 1,
      createdAt: new Date()
    });

    // FCFS: Auto-assign immediately
    submission.assignedReviewers.push(reviewerId);
    
    // Update status to under_review if first reviewer
    if (submission.assignedReviewers.length === 1 && submission.status === 'submitted') {
      submission.status = 'under_review';
    }
    
    await submission.save();

    res.json({
      success: true,
      message: 'Bid placed successfully! Paper has been assigned to you.',
      data: { 
        bid,
        assigned: true,
        submission: {
          _id: submission._id,
          title: submission.title
        }
      }
    });

  } catch (error) {
    console.error('Place bid error:', error);
    res.status(500).json({
      success: false,
      message: 'Error placing bid',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/reviewer/submissions/:id
 * @desc    Get submission details for review
 * @access  Private (Reviewer)
 */
router.get('/submissions/:id', async (req, res) => {
  try {
    // Check if reviewer has bid interested
    const bid = await Bid.findOne({
      submissionId: req.params.id,
      reviewerId: req.user.userId,
      bidValue: 1
    });

    if (!bid) {
      return res.status(403).json({
        success: false,
        message: 'You must bid interested on this submission to view details'
      });
    }

    const submission = await Submission.findById(req.params.id)
      .populate('authorId', 'name')
      .populate('conferenceId', 'name venue startDate');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if reviewer has already reviewed
    const existingReview = await Review.findOne({
      submissionId: req.params.id,
      reviewerId: req.user.userId
    });

    res.json({
      success: true,
      data: {
        submission,
        hasReviewed: !!existingReview,
        review: existingReview
      }
    });

  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submission',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/reviewer/reviews
 * @desc    Submit a review
 * @access  Private (Reviewer)
 */
router.post('/reviews', [
  body('submissionId').notEmpty().withMessage('Submission ID is required'),
  body('score').isInt({ min: 1, max: 10 }).withMessage('Score must be between 1 and 10'),
  body('recommendation').isIn(['ACCEPT', 'REJECT', 'MINOR_REVISION', 'MAJOR_REVISION']).withMessage('Invalid recommendation'),
  body('comments').trim().notEmpty().withMessage('Comments are required'),
  body('confidentialComments').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { submissionId, score, recommendation, comments, confidentialComments } = req.body;

    // Check if reviewer has bid interested
    const bid = await Bid.findOne({
      submissionId,
      reviewerId: req.user.userId,
      bidValue: 1
    });

    if (!bid) {
      return res.status(403).json({
        success: false,
        message: 'You must bid interested on this submission to review it'
      });
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({
      submissionId,
      reviewerId: req.user.userId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this submission'
      });
    }

    // Create review
    const review = new Review({
      submissionId,
      reviewerId: req.user.userId,
      score,
      recommendation,
      comments,
      confidentialComments,
      status: 'submitted'
    });

    await review.save();

    // Update submission review count
    const submission = await Submission.findById(submissionId);
    if (submission) {
      submission.reviewCount = (submission.reviewCount || 0) + 1;
      submission.lastUpdatedAt = Date.now();

      // If all required reviews are completed, update status
      if (submission.reviewCount >= submission.requiredReviews && submission.status === 'under_review') {
        submission.status = 'review_completed';
      }

      await submission.save();
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { 
        review,
        submissionStatus: submission?.status,
        reviewProgress: `${submission?.reviewCount || 0} / ${submission?.requiredReviews || 3}`
      }
    });

  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting review',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/reviewer/review/:submissionId
 * @desc    Submit review for an assigned submission (supports assigned reviewers)
 * @access  Private (Reviewer)
 */
router.post('/review/:submissionId', [
  body('score').isInt({ min: 1, max: 10 }).withMessage('Score must be between 1 and 10'),
  body('recommendation').isIn(['ACCEPT', 'REJECT', 'MINOR_REVISION', 'MAJOR_REVISION']).withMessage('Invalid recommendation'),
  body('comments').trim().notEmpty().withMessage('Comments are required'),
  body('confidentialComments').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { score, recommendation, comments, confidentialComments } = req.body;
    const submissionId = req.params.submissionId;

    // Check if reviewer is assigned to this submission
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const isAssigned = submission.assignedReviewers.some(
      id => id.toString() === req.user.userId.toString()
    );

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to review this submission'
      });
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({
      submissionId,
      reviewerId: req.user.userId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this submission'
      });
    }

    // Create review
    const review = new Review({
      submissionId,
      reviewerId: req.user.userId,
      score,
      recommendation,
      comments,
      confidentialComments,
      status: 'submitted'
    });

    await review.save();

    // Update submission review count
    submission.reviewCount = (submission.reviewCount || 0) + 1;
    submission.lastUpdatedAt = Date.now();

    // If all required reviews are completed, update status
    if (submission.reviewCount >= submission.requiredReviews && submission.status === 'under_review') {
      submission.status = 'review_completed';
    }

    await submission.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { 
        review,
        submissionStatus: submission.status,
        reviewProgress: `${submission.reviewCount} / ${submission.requiredReviews}`
      }
    });

  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting review',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/reviewer/reviews
 * @desc    Get all reviews by reviewer
 * @access  Private (Reviewer)
 */
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewerId: req.user.userId })
      .populate({
        path: 'submissionId',
        populate: { path: 'conferenceId', select: 'name' }
      })
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: { reviews }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
});

module.exports = router;
