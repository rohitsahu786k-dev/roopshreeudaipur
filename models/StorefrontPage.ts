import mongoose, { type InferSchemaType, type Model } from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["hero", "rich_text", "collection_grid", "image_text", "faq", "lookbook"],
      default: "rich_text"
    },
    title: String,
    subtitle: String,
    body: String,
    image: String,
    ctaLabel: String,
    ctaHref: String,
    position: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { _id: true }
);

const storefrontPageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    pageType: {
      type: String,
      enum: ["standard", "about", "contact", "policy", "landing", "collection"],
      default: "standard"
    },
    excerpt: String,
    sections: [sectionSchema],
    seo: {
      title: String,
      description: String,
      keywords: [{ type: String }],
      schemaType: { type: String, default: "WebPage" },
      schemaJson: String,
      ogImage: String,
      canonicalUrl: String
    },
    publishedAt: Date
  },
  { timestamps: true }
);

storefrontPageSchema.index({ status: 1 });

export type StorefrontPageDocument = InferSchemaType<typeof storefrontPageSchema>;

export const StorefrontPage: Model<StorefrontPageDocument> =
  mongoose.models.StorefrontPage || mongoose.model<StorefrontPageDocument>("StorefrontPage", storefrontPageSchema);
