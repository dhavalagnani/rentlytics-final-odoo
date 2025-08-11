import mongoose from "mongoose";

const appliedRuleSchema = new mongoose.Schema(
  {
    ruleId: { type: String, required: true },
    summary: { type: String, required: true },
  },
  { _id: false }
);

const pricingSnapshotSchema = new mongoose.Schema(
  {
    baseRates: {
      hourly: { type: Number, required: true },
      daily: { type: Number, required: true },
      weekly: { type: Number, required: true },
    },
    appliedPricelistId: { type: String },
    appliedRules: [appliedRuleSchema],
    discountAmount: { type: Number, default: 0 },
    lateFee: { type: Number, default: 0 },
    deposit: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    unitCount: { type: Number, required: true, default: 1 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    durationHours: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "pickedup",
        "returned",
        "late",
        "cancelled",
      ],
      default: "pending",
    },
    pricingSnapshot: pricingSnapshotSchema,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Booking", bookingSchema);
