import mongoose, { type InferSchemaType, type Model } from "mongoose";

const customerActivitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["login", "order_created", "order_status", "coupon_used", "invoice_generated", "profile_updated", "wishlist"],
      required: true
    },
    title: { type: String, required: true },
    description: String,
    metadata: { type: Map, of: String }
  },
  { timestamps: true }
);

customerActivitySchema.index({ user: 1, createdAt: -1 });

export type CustomerActivityDocument = InferSchemaType<typeof customerActivitySchema>;

export const CustomerActivity: Model<CustomerActivityDocument> =
  mongoose.models.CustomerActivity || mongoose.model<CustomerActivityDocument>("CustomerActivity", customerActivitySchema);
