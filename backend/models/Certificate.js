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
      values: ['participation', 'presentation', 'reviewer'],
      message: '{VALUE} is not a valid certificate type'
    }
  },
  role: {
    type: String,
    enum: ['author', 'participant', 'reviewer'],
    required: [true, 'Role is required']
  },
  uniqueCertificateId: {
    type: String,
    unique: true,
    required: [true, 'Unique certificate ID is required']
  },
  paperTitle: {
    type: String,
    default: null  // Only for authors
  },
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    default: null  // Only for authors
  },
  certificateBuffer: {
    type: Buffer,  // Store PDF directly in MongoDB
    default: null
  },
  fileUrl: {
    type: String,
    default: ''  // Keep for backwards compatibility
  },
  generatedAt: {
    type: Date,
    default: null
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

// Index for unique certificate ID lookups
certificateSchema.index({ uniqueCertificateId: 1 });

// Helper to generate unique certificate ID
certificateSchema.statics.generateUniqueCertificateId = function () {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-${year}-${random}`;
};

module.exports = mongoose.model('Certificate', certificateSchema);
