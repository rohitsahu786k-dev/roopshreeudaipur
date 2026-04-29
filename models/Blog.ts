import mongoose, { type InferSchemaType, type Model } from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    featuredImage: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    categories: [String],
    tags: [String],
    isPublished: { type: Boolean, default: false },
    seoTitle: String,
    seoDescription: String
  },
  { timestamps: true }
);

export type BlogDocument = InferSchemaType<typeof blogSchema>;

export const Blog: Model<BlogDocument> =
  mongoose.models.Blog || mongoose.model<BlogDocument>("Blog", blogSchema);
