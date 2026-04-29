import mongoose, { type InferSchemaType, type Model } from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: String,
    url: { type: String, required: true },
    thumbnailUrl: String,
    type: { type: String, enum: ["image", "video", "reel", "document"], required: true },
    mimeType: String,
    size: Number,
    width: Number,
    height: Number,
    duration: Number,
    alt: String,
    tags: [String],
    folder: { type: String, default: "general" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

mediaSchema.index({ type: 1 });
mediaSchema.index({ folder: 1 });
mediaSchema.index({ tags: 1 });

export type MediaDocument = InferSchemaType<typeof mediaSchema>;

export const Media: Model<MediaDocument> =
  mongoose.models.Media || mongoose.model<MediaDocument>("Media", mediaSchema);
