import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { resolveProductSnapshot } from "@/lib/wishlist";
import { Wishlist, WishlistEvent, WishlistItem } from "@/models/Wishlist";

type RouteContext = {
  params: {
    token: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const wishlist = await Wishlist.findOne({ shareToken: params.token, isPublic: true }).lean();
    if (!wishlist) return NextResponse.json({ error: "Wishlist not found" }, { status: 404 });

    const records = await WishlistItem.find({ wishlist: wishlist._id }).sort({ createdAt: -1 }).lean();
    const items = (
      await Promise.all(
        records.map(async (record) => {
          const snapshot = await resolveProductSnapshot(record.productId);
          return snapshot ? { ...snapshot, added_at: record.createdAt, notes: record.notes, priority: record.priority } : null;
        })
      )
    ).filter(Boolean);

    await WishlistEvent.create({
      user: wishlist.user,
      wishlist: wishlist._id,
      productId: "shared-wishlist",
      type: "shared",
      metadata: new Map([["token", params.token]])
    });

    return NextResponse.json({
      wishlist: {
        id: String(wishlist._id),
        name: wishlist.name
      },
      items
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load shared wishlist";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
