import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Banner } from "@/models/Banner";

export async function GET(request: NextRequest) {
  const placement = request.nextUrl.searchParams.get("placement") ?? "home_hero";
  const now = new Date();

  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ banners: [] });
    }
    await connectToDatabase();
    const banners = await Banner.find({
      placement,
      isActive: true,
      $and: [
        { $or: [{ startsAt: null }, { startsAt: { $exists: false } }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: null }, { endsAt: { $exists: false } }, { endsAt: { $gte: now } }] }
      ]
    })
      .sort({ position: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ banners });
  } catch {
    return NextResponse.json({ banners: [] });
  }
}
