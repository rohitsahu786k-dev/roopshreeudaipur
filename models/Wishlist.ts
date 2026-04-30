import mongoose, { type InferSchemaType, type Model } from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true, default: "Default" },
    slug: { type: String, required: true, trim: true },
    description: String,
    isDefault: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    shareToken: { type: String, unique: true, sparse: true },
    manualOrder: [{ type: String }]
  },
  { timestamps: true }
);

wishlistSchema.index({ user: 1, slug: 1 }, { unique: true });
wishlistSchema.index({ user: 1, isDefault: 1 });
wishlistSchema.index({ shareToken: 1 });

const wishlistItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    wishlist: { type: mongoose.Schema.Types.ObjectId, ref: "Wishlist", required: true },
    productId: { type: String, required: true },
    notes: { type: String, default: "" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    priceAtAdd: Number,
    stockStatusAtAdd: String,
    notificationPrefs: {
      priceDrop: { type: Boolean, default: true },
      backInStock: { type: Boolean, default: true },
      lowStock: { type: Boolean, default: false },
      reminder: { type: Boolean, default: true }
    },
    lastReminderAt: Date,
    purchasedAt: Date
  },
  { timestamps: true }
);

wishlistItemSchema.index({ user: 1, wishlist: 1, productId: 1 }, { unique: true });
wishlistItemSchema.index({ user: 1, createdAt: -1 });
wishlistItemSchema.index({ productId: 1, createdAt: -1 });
wishlistItemSchema.index({ wishlist: 1, createdAt: -1 });

const wishlistEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    wishlist: { type: mongoose.Schema.Types.ObjectId, ref: "Wishlist" },
    productId: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "added",
        "removed",
        "moved_to_cart",
        "price_drop",
        "back_in_stock",
        "low_stock",
        "reminder_sent",
        "shared",
        "purchased"
      ],
      required: true
    },
    channel: { type: String, enum: ["site", "email", "sms", "whatsapp"], default: "site" },
    metadata: { type: Map, of: String }
  },
  { timestamps: true }
);

wishlistEventSchema.index({ user: 1, type: 1, createdAt: -1 });
wishlistEventSchema.index({ productId: 1, type: 1, createdAt: -1 });

export type WishlistDocument = InferSchemaType<typeof wishlistSchema>;
export type WishlistItemDocument = InferSchemaType<typeof wishlistItemSchema>;
export type WishlistEventDocument = InferSchemaType<typeof wishlistEventSchema>;

export const Wishlist: Model<WishlistDocument> =
  mongoose.models.Wishlist || mongoose.model<WishlistDocument>("Wishlist", wishlistSchema);

export const WishlistItem: Model<WishlistItemDocument> =
  mongoose.models.WishlistItem || mongoose.model<WishlistItemDocument>("WishlistItem", wishlistItemSchema);

export const WishlistEvent: Model<WishlistEventDocument> =
  mongoose.models.WishlistEvent || mongoose.model<WishlistEventDocument>("WishlistEvent", wishlistEventSchema);
