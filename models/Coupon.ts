import mongoose, { type InferSchemaType, type Model } from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true },
    description: String,

    type: {
      type: String,
      enum: ["percentage", "fixed_amount", "free_shipping", "product_specific", "buy_x_get_y"],
      required: true
    },
    value: { type: Number, required: true },
    maxDiscountAmount: Number,

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
    appliesToProducts: [{ type: String }],
    appliesToCategories: [{ type: String }],
    excludedProducts: [{ type: String }],

    // Customer eligibility
    customerEligibility: {
      type: String,
      enum: ["all", "specific_customers", "first_time"],
      default: "all"
    },
    eligibleCustomers: [{ type: String }],
    firstTimeUserOnly: { type: Boolean, default: false },
    campaign: String,
    conditionsJson: { type: mongoose.Schema.Types.Mixed },

    // Buy X Get Y
    buyQuantity: Number,
    getQuantity: Number,
    getProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    getDiscount: Number,

    // Stacking
    allowsCombining: { type: Boolean, default: false },
    combinableWith: [String],
    stackable: { type: Boolean, default: false },
    autoApply: { type: Boolean, default: false },
    marketingTrigger: {
      type: String,
      enum: ["none", "abandoned_cart", "festive_offer", "limited_time", "referral", "campaign"],
      default: "none"
    },

    // Date range
    startsAt: Date,
    endsAt: Date,

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

couponSchema.index({ isActive: 1, startsAt: 1, endsAt: 1 });
couponSchema.index({ autoApply: 1, isActive: 1 });

const couponUsageSchema = new mongoose.Schema(
  {
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", required: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    usageCount: { type: Number, default: 1 },
    discountAmount: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    usedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

couponUsageSchema.index({ coupon: 1, user: 1 });
couponUsageSchema.index({ user: 1, usedAt: -1 });
couponUsageSchema.index({ code: 1, usedAt: -1 });

const couponAttemptSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, uppercase: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sessionId: String,
    success: { type: Boolean, default: false },
    reason: String,
    discountAmount: { type: Number, default: 0 },
    cartValue: { type: Number, default: 0 },
    ip: String
  },
  { timestamps: true }
);

couponAttemptSchema.index({ code: 1, createdAt: -1 });
couponAttemptSchema.index({ user: 1, createdAt: -1 });
couponAttemptSchema.index({ sessionId: 1, createdAt: -1 });

export type CouponDocument = InferSchemaType<typeof couponSchema>;
export type CouponUsageDocument = InferSchemaType<typeof couponUsageSchema>;
export type CouponAttemptDocument = InferSchemaType<typeof couponAttemptSchema>;

export const Coupon: Model<CouponDocument> =
  mongoose.models.Coupon || mongoose.model<CouponDocument>("Coupon", couponSchema);

export const CouponUsage: Model<CouponUsageDocument> =
  mongoose.models.CouponUsage || mongoose.model<CouponUsageDocument>("CouponUsage", couponUsageSchema);

export const CouponAttempt: Model<CouponAttemptDocument> =
  mongoose.models.CouponAttempt || mongoose.model<CouponAttemptDocument>("CouponAttempt", couponAttemptSchema);
