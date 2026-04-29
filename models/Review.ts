import mongoose, { type InferSchemaType, type Model } from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    isApproved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export type ReviewDocument = InferSchemaType<typeof reviewSchema>;

export const Review: Model<ReviewDocument> =
  mongoose.models.Review || mongoose.model<ReviewDocument>("Review", reviewSchema);
