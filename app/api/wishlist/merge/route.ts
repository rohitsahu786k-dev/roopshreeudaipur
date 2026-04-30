import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { getWishlistForUser, resolveProductSnapshot } from "@/lib/wishlist";
import { WishlistItem } from "@/models/Wishlist";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication is required" }, { status: 401 });

    const { items, wishlistId } = await request.json();
    const productIds = Array.isArray(items)
      ? items.map((item) => String(item.productId ?? item.product_id ?? item.slug ?? item)).filter(Boolean)
      : [];

    await connectToDatabase();
    const wishlist = await getWishlistForUser(user.id, wishlistId);

    for (const productId of Array.from(new Set(productIds))) {
      const snapshot = await resolveProductSnapshot(productId);
      await WishlistItem.updateOne(
        { user: user.id, wishlist: wishlist._id, productId },
        {
          $setOnInsert: {
            user: user.id,
            wishlist: wishlist._id,
            productId,
            priceAtAdd: snapshot?.price,
            stockStatusAtAdd: snapshot?.stock_status
          }
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }

    return NextResponse.json({ ok: true, merged: productIds.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to merge wishlist";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
