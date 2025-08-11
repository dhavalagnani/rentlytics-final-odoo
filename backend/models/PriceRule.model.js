import mongoose from "mongoose";

const conditionSchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    operator: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const effectSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "percentDiscount",
        "flatDiscount",
        "setPrice",
        "tieredPrice",
        "surcharge",
      ],
      required: true,
    },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    applyTo: {
      type: String,
      enum: ["unit", "total"],
      required: true,
    },
  },
  { _id: false }
);

const priceRuleSchema = new mongoose.Schema(
  {
    ruleId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    priority: { type: Number, required: true },
    validity: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    conditions: [conditionSchema],
    effect: effectSchema,
    enabled: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PriceRule", priceRuleSchema);
