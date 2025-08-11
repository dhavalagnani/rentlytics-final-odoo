import mongoose from "mongoose";

const baseRatesSchema = new mongoose.Schema(
  {
    hourly: { type: Number, required: true },
    daily: { type: Number, required: true },
    weekly: { type: Number, required: true },
  },
  { _id: false }
);

const pricelistSchema = new mongoose.Schema(
  {
    pricelistId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    targetCustomerTypes: [
      {
        type: String,
        enum: ["regular", "vip", "corporate", "partner"],
      },
    ],
    region: { type: String, required: true },
    baseRates: baseRatesSchema,
    currency: { type: String, required: true, default: "INR" },
    validity: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Pricelist", pricelistSchema);
