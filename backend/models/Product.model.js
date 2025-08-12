import mongoose from "mongoose";

const baseRatesSchema = new mongoose.Schema(
  {
    hourly: { type: Number, required: true },
    daily: { type: Number, required: true },
    weekly: { type: Number, required: true },
  },
  { _id: false }
);

const availabilityBlockSchema = new mongoose.Schema(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
  },
  { _id: false }
);

const rulesSchema = new mongoose.Schema(
  {
    minRentalHours: { type: Number, required: true },
    maxRentalDays: { type: Number, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    images: [
      {
        public_id: { type: String },
        url: { type: String },
      },
    ],
    unitsAvailable: { type: Number, required: true, default: 1 },
    unitsWithCustomer: { type: Number, required: true, default: 0 },
    totalUnits: { type: Number, required: true, default: 1 },
    depositAmount: { type: Number, required: true },
    baseRates: baseRatesSchema,
    availabilityBlocks: [availabilityBlockSchema],
    rules: rulesSchema,
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);
