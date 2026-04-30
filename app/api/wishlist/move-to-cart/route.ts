import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { getWishlistForUser, logWishlistEvent } from "@/lib/wishlist";
import { WishlistItem } from "@/models/Wishlist";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication is required" }, { status: 401 });

    const payload = await request.json();
    const productIds = Array.isArray(payload.productIds)
      ? payload.productIds.map(String)
      : payload.productId
        ? [String(payload.productId)]
        : [];

    if (!productIds.length) return NextResponse.json({ error: "At least one productId is required" }, { status: 400 });

    await connectToDatabase();
    const wishlist = await getWishlistForUser(user.id, payload.wishlistId);

    for (const productId of productIds) {
      await logWishlistEvent({
        userId: user.id,
        wishlistId: String(wishlist._id),
        productId,
        type: "moved_to_cart",
        metadata: { removeAfterAdd: String(Boolean(payload.removeAfterAdd)) }
      });
    }

    if (payload.removeAfterAdd) {
      await WishlistItem.deleteMany({ user: user.id, wishlist: wishlist._id, productId: { $in: productIds } });
    }

    return NextResponse.json({ ok: true, moved: productIds.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to move wishlist items to cart";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
