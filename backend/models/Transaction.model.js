import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ["Stripe", "Razorpay", "Cash"],
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed", "refunded"],
      default: "success",
    },
    transactionRef: { type: String, required: true },
    stage: {
      type: String,
      enum: ["beforeShipping", "afterShipping", "finalSettlement"],
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model("Transaction", transactionSchema);
