import mongoose, { type InferSchemaType, type Model } from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true },
    description: String,

    type: {
      type: String,
      enum: ["percentage", "fixed_amount", "free_shipping", "buy_x_get_y"],
      required: true
    },
    value: { type: Number, required: true },

    // Usage
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    usageLimitPerCustomer: { type: Number, default: 1 },

    // Order eligibility
    minimumOrderAmount: Number,
    maximumOrderAmount: Number,
    minimumQuantity: Number,

    // Product/category scope
    appliesToAllProducts: { type: Boolean, default: true },
    appliesToProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    appliesToCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    excludedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    // Customer eligibility
    customerEligibility: {
      type: String,
      enum: ["all", "specific_customers"],
      default: "all"
    },
    eligibleCustomers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Buy X Get Y
    buyQuantity: Number,
    getQuantity: Number,
    getProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    getDiscount: Number,

    // Stacking
    allowsCombining: { type: Boolean, default: false },
    combinableWith: [String],

    // Date range
    startsAt: Date,
    endsAt: Date,

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, startsAt: 1, endsAt: 1 });

export type CouponDocument = InferSchemaType<typeof couponSchema>;

export const Coupon: Model<CouponDocument> =
  mongoose.models.Coupon || mongoose.model<CouponDocument>("Coupon", couponSchema);
