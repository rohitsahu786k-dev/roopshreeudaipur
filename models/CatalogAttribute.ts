import mongoose, { type InferSchemaType, type Model } from "mongoose";

const attributeValueSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    colorHex: String,
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { _id: true }
);

const catalogAttributeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    type: { type: String, enum: ["select", "multi-select", "range"], default: "multi-select" },
    inputType: { type: String, enum: ["checkbox", "radio", "range", "color", "size"], default: "checkbox" },
    values: [attributeValueSchema],
    isFilterable: { type: Boolean, default: true },
    isSearchable: { type: Boolean, default: true },
    visibleOnPdp: { type: Boolean, default: true },
    isVariantOption: { type: Boolean, default: false },
    filterLogic: { type: String, enum: ["or", "and"], default: "or" },
    priority: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

catalogAttributeSchema.index({ slug: 1 }, { unique: true });
catalogAttributeSchema.index({ isFilterable: 1, priority: 1 });

export type CatalogAttributeDocument = InferSchemaType<typeof catalogAttributeSchema>;

export const CatalogAttribute: Model<CatalogAttributeDocument> =
  mongoose.models.CatalogAttribute || mongoose.model<CatalogAttributeDocument>("CatalogAttribute", catalogAttributeSchema);
