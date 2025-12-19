const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  passwordHash: {
    type: String,
    required: function() {
      // Password not required if user signed up with ORCID or Google
      return !this.orcid && !this.googleId;
    },
    minlength: [6, 'Password must be at least 6 characters']
  },
  orcid: {
    type: String,
    unique: true,
    sparse: true, // Allow null values while maintaining uniqueness
    trim: true,
    match: [/^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/, 'Please provide a valid ORCID iD']
  },
  orcidAccessToken: {
    type: String,
    select: false // Don't include in queries by default
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allow null values while maintaining uniqueness
    trim: true
  },
  googleAccessToken: {
    type: String,
    select: false // Don't include in queries by default
  },
  googleRefreshToken: {
    type: String,
    select: false
  },
  profilePicture: {
    type: String,
    trim: true
  },
  affiliation: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['organizer', 'author', 'reviewer', 'participant'],
      message: '{VALUE} is not a valid role'
    }
  },
  expertiseDomains: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove sensitive data from JSON response
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
