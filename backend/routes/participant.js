const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Conference = require('../models/Conference');
const Registration = require('../models/Registration');
const Certificate = require('../models/Certificate');
const Submission = require('../models/Submission');

// All participant routes require authentication and participant role
router.use(auth, authorize('participant'));

/**
 * @route   GET /api/participant/dashboard
 * @desc    Get participant dashboard data
 * @access  Private (Participant)
 */
router.get('/dashboard', async (req, res) => {
  try {
    // Get registered conferences
    const registrations = await Registration.find({
      participantId: req.user.userId
    })
      .populate('conferenceId')
      .sort({ registeredAt: -1 });

    // Separate upcoming and past conferences
    const now = new Date();
    const upcomingConferences = registrations.filter(
      reg => reg.conferenceId && new Date(reg.conferenceId.startDate) > now
    );
    const pastConferences = registrations.filter(
      reg => reg.conferenceId && new Date(reg.conferenceId.endDate) < now
    );

    // Get available conferences (from all organizers)
    const availableConferences = await Conference.find({
      status: 'active',
      startDate: { $gte: now }
    })
      .populate('organizerId', 'name email')
      .sort({ startDate: 1 })
      .limit(6);

    res.json({
      success: true,
      data: {
        upcomingConferences,
        pastConferences,
        availableConferences
      }
    });

  } catch (error) {
    console.error('Get participant dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/participant/conferences
 * @desc    Get all available conferences
 * @access  Private (Participant)
 */
router.get('/conferences', async (req, res) => {
  try {
    const { location, domain, sortBy } = req.query;

    const query = { status: 'active' };

    if (location) {
      query.venue = { $regex: location, $options: 'i' };
    }

    if (domain) {
      query.domains = { $in: [domain] };
    }

    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'startDate':
        sort = { startDate: 1 };
        break;
      default:
        sort = { startDate: 1 };
    }

    const conferences = await Conference.find(query)
      .populate('organizerId', 'name email')
      .sort(sort);

    // Check which conferences user is registered for
    const registrations = await Registration.find({
      participantId: req.user.userId,
      conferenceId: { $in: conferences.map(c => c._id) }
    });

    const registrationMap = {};
    registrations.forEach(reg => {
      registrationMap[reg.conferenceId.toString()] = true;
    });

    const conferencesWithStatus = conferences.map(conf => ({
      ...conf.toObject(),
      isRegistered: !!registrationMap[conf._id.toString()]
    }));

    res.json({
      success: true,
      data: { conferences: conferencesWithStatus }
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
 * @route   GET /api/participant/conferences/:id
 * @desc    Get conference details
 * @access  Private (Participant)
 */
router.get('/conferences/:id', async (req, res) => {
  try {
    const conference = await Conference.findById(req.params.id)
      .populate('organizerId', 'name email');

    if (!conference) {
      return res.status(404).json({
        success: false,
        message: 'Conference not found'
      });
    }

    // Check if user is registered
    const registration = await Registration.findOne({
      conferenceId: req.params.id,
      participantId: req.user.userId
    });

    // If registered, get schedule
    let schedule = [];
    if (registration) {
      schedule = await Submission.find({
        conferenceId: req.params.id,
        status: 'accepted',
        'presentationSlot.date': { $exists: true }
      })
        .populate('authorId', 'name')
        .select('title presentationSlot')
        .sort({ 'presentationSlot.date': 1 });
    }

    res.json({
      success: true,
      data: {
        conference,
        isRegistered: !!registration,
        registration,
        schedule
      }
    });

  } catch (error) {
    console.error('Get conference error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conference',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/participant/registrations
 * @desc    Register for a conference
 * @access  Private (Participant)
 */
router.post('/registrations', [
  body('conferenceId').notEmpty().withMessage('Conference ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { conferenceId } = req.body;

    // Check if conference exists
    const conference = await Conference.findById(conferenceId);
    if (!conference) {
      return res.status(404).json({
        success: false,
        message: 'Conference not found'
      });
    }

    if (conference.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Conference is not active'
      });
    }

    // Check for duplicate registration
    const existingRegistration = await Registration.findOne({
      conferenceId,
      participantId: req.user.userId
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this conference'
      });
    }

    // Create registration
    const registration = new Registration({
      conferenceId,
      participantId: req.user.userId,
      registrationType: 'attendee',
      paymentStatus: conference.fee > 0 ? 'pending' : 'not_required'
    });

    await registration.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { registration }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering for conference',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/participant/registrations
 * @desc    Get all registrations
 * @access  Private (Participant)
 */
router.get('/registrations', async (req, res) => {
  try {
    const registrations = await Registration.find({
      participantId: req.user.userId
    })
      .populate('conferenceId')
      .sort({ registeredAt: -1 });

    res.json({
      success: true,
      data: { registrations }
    });

  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registrations',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/participant/registrations/:id/payment
 * @desc    Update payment status
 * @access  Private (Participant)
 */
router.put('/registrations/:id/payment', async (req, res) => {
  try {
    const registration = await Registration.findOne({
      _id: req.params.id,
      participantId: req.user.userId
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    registration.paymentStatus = 'completed';
    await registration.save();

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: { registration }
    });

  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/participant/certificates
 * @desc    Get all certificates for the participant
 * @access  Private (Participant)
 */
router.get('/certificates', async (req, res) => {
  try {
    const certificates = await Certificate.find({
      userId: req.user.userId,
      role: 'participant'
    })
      .populate('conferenceId', 'name venue startDate endDate')
      .select('-certificateBuffer') // Don't send buffer in list
      .sort({ issuedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: { certificates }
    });

  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching certificates',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/participant/certificates/:id/download
 * @desc    Download certificate PDF
 * @access  Private (Participant)
 */
router.get('/certificates/:id/download', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      role: 'participant'
    }).populate('conferenceId', 'name');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    if (!certificate.certificateBuffer) {
      return res.status(404).json({
        success: false,
        message: 'Certificate file not available'
      });
    }

    // Set headers for PDF download
    const fileName = `Certificate_${certificate.uniqueCertificateId}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', certificate.certificateBuffer.length);

    res.send(certificate.certificateBuffer);

  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading certificate',
      error: error.message
    });
  }
});

module.exports = router;

