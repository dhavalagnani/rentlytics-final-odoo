import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    damagePenaltyRate: {
      type: Number,
      required: true,
      default: 10, // 10% of deposit
      min: 0,
      max: 100,
    },
    latePenaltyRate: {
      type: Number,
      required: true,
      default: 5, // 5% per day
      min: 0,
      max: 100,
    },
    latePenaltyType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    damagePenaltyType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    maxLatePenaltyDays: {
      type: Number,
      default: 7, // Maximum 7 days of late penalty
      min: 1,
    },
    notificationSettings: {
      pickupReminderHours: {
        type: Number,
        default: 2, // Send reminder 2 hours before pickup
      },
      returnReminderHours: {
        type: Number,
        default: 24, // Send reminder 24 hours before return
      },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this();
    await settings.save();
  }
  return settings;
};

export default mongoose.model("Settings", settingsSchema);
