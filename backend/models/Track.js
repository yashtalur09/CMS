const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  conferenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conference',
    required: [true, 'Conference ID is required']
  },
  name: {
    type: String,
    required: [true, 'Track name is required'],
    trim: true,
    maxlength: [200, 'Track name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  submissionDeadline: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// index to quickly find tracks for a conference
trackSchema.index({ conferenceId: 1, status: 1 });
trackSchema.index({ name: 1 });

module.exports = mongoose.model('Track', trackSchema);