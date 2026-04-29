import mongoose, { type InferSchemaType, type Model } from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: String,
    image: String,
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const seededCategories = [
  "Lehenga",
  "Ladies Suit",
  "Kurta Set",
  "Sharara Set",
  "Saree",
  "Dupatta",
  "Palazzo Set",
  "Anarkali",
  "Gown",
  "Co-ord Set"
];

export type CategoryDocument = InferSchemaType<typeof categorySchema>;

export const Category: Model<CategoryDocument> =
  mongoose.models.Category || mongoose.model<CategoryDocument>("Category", categorySchema);
