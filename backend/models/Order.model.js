import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    invoiceNumber: { type: String, required: true, unique: true },
    paymentType: {
      type: String,
      enum: ["fullUpfront", "partialUpfront"],
      required: true,
    },
    totalAmount: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    amountDue: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    currency: { type: String, required: true, default: "INR" },
    status: {
      type: String,
      enum: ["unpaid", "partiallyPaid", "paid", "overdue"],
      default: "unpaid",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
