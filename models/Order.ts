import mongoose, { type InferSchemaType, type Model } from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantSize: { type: String, required: true },
    variantColor: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    productName: { type: String, required: true },
    productImage: String
  },
  { _id: false }
);

const billingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [orderItemSchema],
    billing: billingSchema,
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    exchangeRate: { type: Number, default: 1 },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "paypal", "gokwik_cod", "gokwik_prepaid"],
      required: true
    },
    paymentId: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "cod_pending"],
      default: "pending"
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "refunded"
      ],
      default: "pending"
    },
    shiprocketOrderId: String,
    shiprocketShipmentId: String,
    shiprocketAwbCode: String,
    shiprocketCourierName: String,
    shiprocketTrackingUrl: String,
    shiprocketLabelUrl: String,
    shiprocketInvoiceUrl: String,
    gokwikOrderId: String,
    isGokwikOrder: { type: Boolean, default: false },
    notes: String
  },
  { timestamps: true }
);

export type OrderDocument = InferSchemaType<typeof orderSchema>;

export const Order: Model<OrderDocument> =
  mongoose.models.Order || mongoose.model<OrderDocument>("Order", orderSchema);
