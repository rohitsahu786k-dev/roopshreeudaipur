import mongoose, { type InferSchemaType, type Model } from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    href: String,
    icon: String,
    sortOrder: { type: Number, default: 0 },
    children: [
      {
        label: { type: String, required: true },
        href: { type: String, required: true },
        icon: String,
        sortOrder: { type: Number, default: 0 }
      }
    ],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const menuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, // e.g., "header", "footer", "mobile"
    placement: {
      type: String,
      enum: ["header", "footer", "mobile", "admin"],
      default: "header"
    },
    items: [menuItemSchema],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

menuSchema.index({ name: 1, placement: 1, isActive: 1 });

export type MenuItemDocument = InferSchemaType<typeof menuItemSchema>;
export type MenuDocument = InferSchemaType<typeof menuSchema>;

export const Menu: Model<MenuDocument> =
  mongoose.models.Menu || mongoose.model<MenuDocument>("Menu", menuSchema);
