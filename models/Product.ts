import mongoose, { type InferSchemaType, type Model } from "mongoose";

const variantOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    values: [{ type: String }]
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    title: String,
    option1: String,
    option2: String,
    option3: String,
    price: { type: Number, required: true },
    comparePrice: Number,
    costPerItem: Number,
    sku: { type: String },
    barcode: String,
    stock: { type: Number, default: 0, min: 0 },
    weight: Number,
    image: String,
    isActive: { type: Boolean, default: true }
  },
  { _id: true }
);

const countryPricingSchema = new mongoose.Schema(
  {
    countryCode: { type: String, required: true },
    countryName: { type: String, required: true },
    currency: { type: String, required: true },
    currencySymbol: String,
    price: { type: Number, required: true },
    comparePrice: Number,
    isActive: { type: Boolean, default: true }
  },
  { _id: false }
);

const mediaItemSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ["image", "video", "reel"], default: "image" },
    alt: String,
    position: { type: Number, default: 0 },
    thumbnailUrl: String
  },
  { _id: false }
);

const seoSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    keywords: [String],
    ogImage: String,
    canonicalUrl: String,
    schemaType: { type: String, default: "Product" },
    schemaJson: String,
    focusKeyword: String,
    metaRobots: { type: String, default: "index,follow" },
    altTextTemplate: String
  },
  { _id: false }
);

const shippingSchema = new mongoose.Schema(
  {
    requiresShipping: { type: Boolean, default: true },
    weight: Number,
    weightUnit: { type: String, enum: ["kg", "g", "lb", "oz"], default: "kg" },
    length: Number,
    width: Number,
    height: Number,
    dimensionUnit: { type: String, enum: ["cm", "in"], default: "cm" }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    status: { type: String, enum: ["draft", "active", "archived"], default: "draft" },

    description: { type: String, required: true },
    shortDescription: { type: String, required: true },

    // Media
    media: [mediaItemSchema],
    images: [{ type: String }], // kept for backward compat

    // Organization
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: String,
    collections: [String],
    tags: [String],
    vendor: String,

    // Pricing
    basePrice: { type: Number, required: true },
    comparePrice: Number,
    costPerItem: Number,

    // Variants
    hasVariants: { type: Boolean, default: false },
    options: [variantOptionSchema],
    variants: [variantSchema],

    // Country-wise pricing
    countryPricing: [countryPricingSchema],

    // Inventory (for single-variant products)
    trackInventory: { type: Boolean, default: true },
    sku: String,
    barcode: String,
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },

    // Shipping
    shipping: shippingSchema,

    // Product details
    fabric: String,
    occasion: [String],
    workType: String,
    washCare: String,
    features: [String],
    specifications: { type: Map, of: String },
    attributes: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true }
      }
    ],
    sizeChart: String,
    blouseDetails: String,
    liningDetails: String,
    customizationNotes: String,
    returnPolicy: String,
    dispatchTime: { type: String, default: "Ready to ship in 3-7 business days" },
    careInstructions: [String],
    includedItems: [String],
    countryOfOrigin: { type: String, default: "India" },
    hsnCode: String,
    taxRate: Number,

    // Related products
    upsells: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    crossSells: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    // SEO
    seo: seoSchema,

    // Legacy SEO fields
    seoTitle: String,
    seoDescription: String,
    productVideoUrl: String,

    // Ratings
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 }
    },

    // Flags
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },

    publishedAt: Date,
    metafields: { type: Map, of: String }
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 }, { unique: true, sparse: true });
productSchema.index({ "variants.sku": 1 }, { unique: true, sparse: true });
productSchema.index({ status: 1, isActive: 1 });
productSchema.index({ category: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: "text", description: "text", tags: "text" });

export type ProductDocument = InferSchemaType<typeof productSchema>;

export const Product: Model<ProductDocument> =
  mongoose.models.Product || mongoose.model<ProductDocument>("Product", productSchema);
