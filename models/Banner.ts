import mongoose, { type InferSchemaType, type Model } from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: String,
    image: { type: String, required: true },
    mobileImage: String,
    placement: {
      type: String,
      enum: ["home_hero", "home_strip", "shop_top", "cart", "checkout", "announcement"],
      default: "home_hero"
    },
    ctaLabel: String,
    ctaHref: String,
    couponCode: String,
    startsAt: Date,
    endsAt: Date,
    position: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

bannerSchema.index({ placement: 1, isActive: 1, position: 1 });

export type BannerDocument = InferSchemaType<typeof bannerSchema>;

export const Banner: Model<BannerDocument> =
  mongoose.models.Banner || mongoose.model<BannerDocument>("Banner", bannerSchema);
