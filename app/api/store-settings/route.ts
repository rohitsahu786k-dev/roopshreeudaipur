import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { StoreSetting } from "@/models/StoreSetting";

export const revalidate = 300;

const fallbackSettings = {
  instagramUrl: "https://www.instagram.com/roopshreeudaipur/",
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
      .select("instagramUrl featureToggles reels instagramPosts")
      .lean();

    return NextResponse.json({
      settings: {
        ...fallbackSettings,
        ...(settings ?? {}),
        reels: (settings?.reels ?? []).filter((reel) => reel.isActive !== false).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
        instagramPosts: (settings?.instagramPosts ?? []).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      }
    });
  } catch {
    return NextResponse.json({ settings: fallbackSettings });
  }
}
