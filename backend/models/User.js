import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    unique: true,
    default: function() {
      // Generate a unique user ID with prefix and timestamp
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substr(2, 5);
      return `USER_${timestamp}_${random}`.toUpperCase();
    }
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  aadharNumber: {
    type: String,
    required: [true, 'Aadhar number is required'],
    trim: true,
    match: [/^[0-9]{12}$/, 'Please enter a valid 12-digit Aadhar number']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ userId: 1 });

// Pre-save middleware to ensure userId is set
userSchema.pre('save', function(next) {
  if (!this.userId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.userId = `USER_${timestamp}_${random}`.toUpperCase();
  }
  next();
});

// Virtual for password (not stored in DB)
userSchema.virtual('password')
  .set(function(password) {
    this.passwordHash = bcrypt.hashSync(password, 12);
  })
  .get(function() {
    return this.passwordHash;
  });

// Method to compare password
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.passwordHash);
};

// Method to get public profile (without sensitive data)
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    userId: this.userId,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    phone: this.phone,
    isActive: this.isActive,
    createdAt: this.createdAt
  };
};

const User = mongoose.model('User', userSchema);

export default User;
