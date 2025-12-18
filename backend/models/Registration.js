const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  conferenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conference',
    required: [true, 'Conference ID is required']
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Participant ID is required']
  },
  registrationType: {
    type: String,
    enum: ['attendee', 'presenter'],
    default: 'attendee'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'not_required'],
    default: 'not_required'
  },
  attendanceMarked: {
    type: Boolean,
    default: false
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ conferenceId: 1, participantId: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
