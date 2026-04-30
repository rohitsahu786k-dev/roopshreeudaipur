import mongoose, { type InferSchemaType, type Model } from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    variantId: { type: String, required: true },
    name: { type: String, required: true },
    image: String,
    price: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
    stockStatus: {
      type: String,
      enum: ["in_stock", "low_stock", "out_of_stock", "unavailable"],
      default: "in_stock"
    },
    availableStock: { type: Number, default: 0 },
    size: String,
    color: String
  },
  { _id: false }
);

const cartTotalsSchema = new mongoose.Schema(
  {
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: String, trim: true },
    items: [cartItemSchema],
    couponCode: String,
    totals: { type: cartTotalsSchema, default: () => ({}) },
    currency: { type: String, default: "INR" },
    abandonedAt: Date,
    recoveredAt: Date,
    convertedAt: Date,
    lastNotifiedAt: Date,
    metadata: { type: Map, of: String }
  },
  { timestamps: true }
);

cartSchema.index({ user: 1 }, { sparse: true });
cartSchema.index({ sessionId: 1 }, { sparse: true });
cartSchema.index({ updatedAt: -1 });
cartSchema.index({ "items.productId": 1 });

const cartEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sessionId: String,
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
    type: {
      type: String,
      enum: ["created", "item_added", "item_updated", "item_removed", "coupon_applied", "cleared", "abandoned", "recovered", "converted"],
      required: true
    },
    value: { type: Number, default: 0 },
    metadata: { type: Map, of: String }
  },
  { timestamps: true }
);

cartEventSchema.index({ user: 1, type: 1, createdAt: -1 });
cartEventSchema.index({ sessionId: 1, createdAt: -1 });
cartEventSchema.index({ type: 1, createdAt: -1 });

export type CartDocument = InferSchemaType<typeof cartSchema>;
export type CartEventDocument = InferSchemaType<typeof cartEventSchema>;

export const Cart: Model<CartDocument> = mongoose.models.Cart || mongoose.model<CartDocument>("Cart", cartSchema);
export const CartEvent: Model<CartEventDocument> =
  mongoose.models.CartEvent || mongoose.model<CartEventDocument>("CartEvent", cartEventSchema);
