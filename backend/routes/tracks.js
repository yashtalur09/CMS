const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Track = require('../models/Track');
const Conference = require('../models/Conference');

// All track routes require authenticated organizer
router.use(auth, authorize('organizer'));

/**
 * @route   POST /api/tracks
 * @desc    Create a new track for a conference
 * @access  Private (Organizer)
 */
router.post('/', [
  body('conferenceId').notEmpty().withMessage('conferenceId is required'),
  body('name').trim().notEmpty().withMessage('Track name is required'),
  body('description').optional().trim(),
  body('submissionDeadline').optional().isISO8601().withMessage('Valid submissionDeadline required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { conferenceId, name, description, submissionDeadline } = req.body;

    const conference = await Conference.findById(conferenceId).lean();
    if (!conference || conference.organizerId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage tracks for this conference' });
    }

    const track = new Track({
      conferenceId,
      name,
      description: description || '',
      submissionDeadline: submissionDeadline || conference.submissionDeadline
    });

    await track.save();

    res.status(201).json({ success: true, message: 'Track created', data: track });
  } catch (error) {
    console.error('Create track error:', error);
    res.status(500).json({ success: false, message: 'Error creating track', error: error.message });
  }
});

/**
 * @route   PUT /api/tracks/:id
 * @desc    Update a track (only organizer of parent conference)
 * @access  Private (Organizer)
 */
router.put('/:id', [
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('submissionDeadline').optional().isISO8601().withMessage('Valid submissionDeadline required'),
  body('status').optional().isIn(['active', 'closed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ success: false, message: 'Track not found' });

    const conference = await Conference.findById(track.conferenceId).lean();
    if (!conference || conference.organizerId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this track' });
    }

    ['name', 'description', 'submissionDeadline', 'status'].forEach(f => {
      if (typeof req.body[f] !== 'undefined') track[f] = req.body[f];
    });

    await track.save();
    res.json({ success: true, message: 'Track updated', data: track });
  } catch (error) {
    console.error('Update track error:', error);
    res.status(500).json({ success: false, message: 'Error updating track', error: error.message });
  }
});

/**
 * @route   DELETE /api/tracks/:id
 * @desc    Delete a track (only organizer of parent conference)
 * @access  Private (Organizer)
 */
router.delete('/:id', async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ success: false, message: 'Track not found' });

    const conference = await Conference.findById(track.conferenceId).lean();
    if (!conference || conference.organizerId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this track' });
    }

    await Track.deleteOne({ _id: track._id });
    res.json({ success: true, message: 'Track deleted' });
  } catch (error) {
    console.error('Delete track error:', error);
    res.status(500).json({ success: false, message: 'Error deleting track', error: error.message });
  }
});

/**
 * @route   GET /api/tracks/conference/:conferenceId
 * @desc    List tracks for a conference (organizer must own conference)
 * @access  Private (Organizer)
 */
router.get('/conference/:conferenceId', async (req, res) => {
  try {
    const conference = await Conference.findById(req.params.conferenceId).lean();
    if (!conference || conference.organizerId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to view tracks for this conference' });
    }

    const tracks = await Track.find({ conferenceId: req.params.conferenceId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: tracks });
  } catch (error) {
    console.error('List tracks error:', error);
    res.status(500).json({ success: false, message: 'Error listing tracks', error: error.message });
  }
});

module.exports = router;