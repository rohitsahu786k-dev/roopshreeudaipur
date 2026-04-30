import mongoose, { type InferSchemaType, type Model } from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Address" },
    type: { type: String, enum: ["shipping", "billing"], default: "shipping" },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    pincode: String,
    country: { type: String, required: true },
    landmark: String,
    isDefault: { type: Boolean, default: false },
    isDefaultShipping: { type: Boolean, default: false },
    isDefaultBilling: { type: Boolean, default: false }
  },
  { _id: true }
);

const userSettingsSchema = new mongoose.Schema(
  {
    notifications: {
      orderEmail: { type: Boolean, default: true },
      orderWhatsapp: { type: Boolean, default: true },
      offerEmail: { type: Boolean, default: true },
      offerWhatsapp: { type: Boolean, default: false }
    },
    savedPaymentsEnabled: { type: Boolean, default: false },
    loyaltyPoints: { type: Number, default: 0 },
    storeCredit: { type: Number, default: 0 },
    accountDeletionRequestedAt: Date
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "manager", "admin"], default: "user" },
    phone: { type: String, trim: true },
    avatar: String,
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    pendingEmail: String,
    pendingPhone: String,
    verificationOtp: String,
    verificationOtpExpires: Date,
    addresses: [addressSchema],
    settings: { type: userSettingsSchema, default: () => ({}) },
    deletedAt: Date,
    logoutAllAt: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });

export type UserDocument = InferSchemaType<typeof userSchema>;

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);
