import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
    },
    aadharNumber: {
      type: String,
      required: [true, "Aadhar number is required"],
      trim: true,
      match: [/^[0-9]{12}$/, "Please enter a valid 12-digit Aadhar number"],
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for email queries
userSchema.index({ email: 1 });

// Virtual for password (not stored in DB)
userSchema
  .virtual("password")
  .set(function (password) {
    this.passwordHash = bcrypt.hashSync(password, 12);
  })
  .get(function () {
    return this.passwordHash;
  });

// Method to compare password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.passwordHash);
};

// Method to get public profile (without sensitive data)
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    phone: this.phone,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);

export default User;
