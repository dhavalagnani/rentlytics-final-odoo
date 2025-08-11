import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  otpHash: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // Auto-delete expired documents
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for quick lookups
otpSchema.index({ userId: 1, isUsed: 1 });

// Virtual for OTP (not stored in DB)
otpSchema.virtual('otp')
  .set(function(otp) {
    this.otpHash = bcrypt.hashSync(otp, 10);
  })
  .get(function() {
    return this.otpHash;
  });

// Method to verify OTP
otpSchema.methods.verifyOtp = function(candidateOtp) {
  return bcrypt.compareSync(candidateOtp, this.otpHash);
};

// Method to increment attempts
otpSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

// Method to mark as used
otpSchema.methods.markAsUsed = function() {
  this.isUsed = true;
  return this.save();
};

// Static method to generate OTP
otpSchema.statics.generateOtp = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to create OTP with expiry
otpSchema.statics.createOtp = function(userId, otp) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return new this({
    userId,
    otp,
    expiresAt
  });
};

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
