import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { StoreSetting } from "@/models/StoreSetting";

export const revalidate = 60;

const DEFAULT_SALE_ENDS = "2026-05-15T23:59:59";

const fallbackSettings = {
  instagramUrl: "https://www.instagram.com/roopshreeudaipur/",
  saleEndsAt: DEFAULT_SALE_ENDS,
  saleLabel: "Sale Ends In",
  announcementMessages: [
    "Grand Festive Sale — Up to 40% Off Sitewide",
    "Free shipping in India on orders above ₹2,999",
    "New bridal lehengas just dropped — Shop Now",
    "Handcrafted ethnic wear from Udaipur Studio"
  ],
  featureToggles: {
    homepageReels: true,
    instagramGrid: true,
    pdpFloatingReel: true,
    mobileBottomNav: true,
    backendFilters: true
  },
  reels: [],
  instagramPosts: []
};

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) return NextResponse.json({ settings: fallbackSettings });
    await connectToDatabase();
    const settings = await StoreSetting.findOne({ key: "default" })
      .select("instagramUrl featureToggles reels instagramPosts saleEndsAt saleLabel announcementMessages")
      .lean();

    return NextResponse.json({
      settings: {
        ...fallbackSettings,
        ...(settings ?? {}),
        saleEndsAt: settings?.saleEndsAt
          ? new Date(settings.saleEndsAt as unknown as Date).toISOString()
          : DEFAULT_SALE_ENDS,
        saleLabel: (settings as any)?.saleLabel || fallbackSettings.saleLabel,
        announcementMessages: (settings as any)?.announcementMessages?.length
          ? (settings as any).announcementMessages
          : fallbackSettings.announcementMessages,
        reels: (settings?.reels ?? []).filter((r) => r.isActive !== false).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
        instagramPosts: (settings?.instagramPosts ?? []).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      }
    });
  } catch {
    return NextResponse.json({ settings: fallbackSettings });
  }
}
