import mongoose, { type InferSchemaType, type Model } from "mongoose";

const socialLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    url: { type: String, required: true }
  },
  { _id: false }
);

const shippingZoneSchema = new mongoose.Schema(
  {
    countryCode: { type: String, required: true, uppercase: true, trim: true },
    countryName: { type: String, required: true },
    currency: { type: String, default: "INR" },
    baseRate: { type: Number, default: 0 },
    freeShippingThreshold: { type: Number, default: 0 },
    estimatedDelivery: { type: String, default: "4-7 business days" },
    isActive: { type: Boolean, default: true }
  },
  { _id: true }
);

const storeSettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    storeName: { type: String, default: "Roop Shree Udaipur" },
    legalName: { type: String, default: "Roop Shree Udaipur" },
    tagline: { type: String, default: "Bridal lehengas, sarees, suits and handcrafted occasion wear from Udaipur." },
    logoUrl: { type: String, default: "/logo.jpg" },
    gstNumber: { type: String, default: "08ABKFR6839B1ZY" },
    email: { type: String, default: "info@roopshreeudaipur.com" },
    phone: { type: String, default: "+91 98765 43210" },
    whatsapp: { type: String, default: "+91 98765 43210" },
    address: {
      line1: { type: String, default: "Udaipur, Rajasthan" },
      line2: String,
      city: { type: String, default: "Udaipur" },
      state: { type: String, default: "Rajasthan" },
      country: { type: String, default: "India" },
      pincode: String
    },
    instagramUrl: { type: String, default: "https://www.instagram.com/roopshreeudaipur/" },
    socialLinks: [socialLinkSchema],
    heroTitle: { type: String, default: "Roop Shree Udaipur" },
    heroSubtitle: {
      type: String,
      default: "Designer ethnic wear for bridal, festive and destination wedding celebrations."
    },
    announcement: { type: String, default: "Free shipping in India on eligible orders. New bridal edits now available." },
    saleEndsAt: { type: Date },
    saleLabel: { type: String, default: "Sale Ends In" },
    announcementMessages: [{ type: String }],
    defaultSeo: {
      title: { type: String, default: "Roop Shree Udaipur | Bridal Lehengas, Sarees & Ethnic Wear" },
      description: {
        type: String,
        default:
          "Shop Roop Shree Udaipur for bridal lehengas, sarees, suits, gowns, Indo-western outfits and hand work ethnic wear."
      },
      keywords: [{ type: String }],
      schemaType: { type: String, default: "ClothingStore" },
      ogImage: String
    },
    cart: {
      freeShippingThreshold: { type: Number, default: 2999 },
      suggestedCoupons: [{ type: String }],
      giftWrapThreshold: { type: Number, default: 12000 }
    },
    featureToggles: {
      homepageReels: { type: Boolean, default: true },
      instagramGrid: { type: Boolean, default: true },
      pdpFloatingReel: { type: Boolean, default: true },
      mobileBottomNav: { type: Boolean, default: true },
      backendFilters: { type: Boolean, default: true }
    },
    reels: [
      {
        title: String,
        url: String,
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        isActive: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 }
      }
    ],
    instagramPosts: [
      {
        url: String,
        image: String,
        caption: String,
        sortOrder: { type: Number, default: 0 }
      }
    ],
    shippingZones: [shippingZoneSchema]
  },
  { timestamps: true }
);

export type StoreSettingDocument = InferSchemaType<typeof storeSettingSchema>;

export const StoreSetting: Model<StoreSettingDocument> =
  mongoose.models.StoreSetting || mongoose.model<StoreSettingDocument>("StoreSetting", storeSettingSchema);
