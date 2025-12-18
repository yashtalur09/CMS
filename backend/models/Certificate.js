const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  conferenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conference',
    required: [true, 'Conference ID is required']
  },
  type: {
    type: String,
    required: [true, 'Certificate type is required'],
    enum: {
      values: ['participation', 'presentation'],
      message: '{VALUE} is not a valid certificate type'
    }
  },
  fileUrl: {
    type: String,
    default: ''
  },
  issuedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate certificates
certificateSchema.index({ userId: 1, conferenceId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
