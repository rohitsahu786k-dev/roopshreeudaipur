import mongoose, { type InferSchemaType, type Model } from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "Custom"],
      required: true
    },
    color: { type: String, required: true },
    colorHex: { type: String, required: true },
    price: { type: Number, required: true },
    comparePrice: Number,
    stock: { type: Number, required: true, min: 0 },
    sku: { type: String, required: true, unique: true }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    images: [{ type: String, required: true }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    variants: [variantSchema],
    fabric: String,
    occasion: [String],
    workType: String,
    washCare: String,
    features: [String],
    specifications: { type: Map, of: String },
    tags: [String],
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 }
    },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    seoTitle: String,
    seoDescription: String,
    productVideoUrl: String
  },
  { timestamps: true }
);

export type ProductDocument = InferSchemaType<typeof productSchema>;

export const Product: Model<ProductDocument> =
  mongoose.models.Product || mongoose.model<ProductDocument>("Product", productSchema);
