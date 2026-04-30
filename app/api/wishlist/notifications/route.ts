import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { logWishlistEvent, resolveProductSnapshot } from "@/lib/wishlist";
import { WishlistItem } from "@/models/Wishlist";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access is required" }, { status: 403 });
    }

    const { productId, eventType, channel = "email" } = await request.json();
    if (!productId || !["price_drop", "back_in_stock", "low_stock", "reminder_sent"].includes(eventType)) {
      return NextResponse.json({ error: "productId and a valid eventType are required" }, { status: 400 });
    }

    await connectToDatabase();
    const product = await resolveProductSnapshot(String(productId));
    const interested = await WishlistItem.find({ productId: String(productId) }).lean();

    for (const item of interested) {
      await logWishlistEvent({
        userId: String(item.user),
        wishlistId: String(item.wishlist),
        productId: String(productId),
        type: eventType,
        channel,
        metadata: product ? { productName: product.name } : undefined
      });
    }

    return NextResponse.json({ ok: true, queued: interested.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to queue wishlist notifications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
