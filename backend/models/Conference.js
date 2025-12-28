const mongoose = require('mongoose');

const conferenceSchema = new mongoose.Schema({
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer ID is required']
  },
  name: {
    type: String,
    required: [true, 'Conference name is required'],
    trim: true,
    maxlength: [200, 'Conference name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  submissionDeadline: {
    type: Date,
    required: [true, 'Submission deadline is required'],
    validate: {
      validator: function(value) {
        return !this.startDate || value <= this.startDate;
      },
      message: 'Submission deadline must be on or before conference start date'
    }
  },
  domains: [{
    type: String,
    trim: true
  }],
  fee: {
    type: Number,
    default: 0,
    min: [0, 'Fee cannot be negative']
  },
  status: {
    type: String,
    enum: ['active', 'expired'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for submission count
conferenceSchema.virtual('submissionCount', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'conferenceId',
  count: true
});

// Index for efficient queries
conferenceSchema.index({ organizerId: 1, status: 1 });
conferenceSchema.index({ domains: 1 });
conferenceSchema.index({ submissionDeadline: 1 });

module.exports = mongoose.model('Conference', conferenceSchema);
