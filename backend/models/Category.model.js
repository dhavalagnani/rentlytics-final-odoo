import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    categoryId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Category", categorySchema);
