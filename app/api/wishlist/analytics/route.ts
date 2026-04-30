import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { WishlistEvent, WishlistItem } from "@/models/Wishlist";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access is required" }, { status: 403 });
    }

    await connectToDatabase();
    const mostWishlisted = await WishlistItem.aggregate([
      { $group: { _id: "$productId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    const movedToCart = await WishlistEvent.countDocuments({ type: "moved_to_cart" });
    const purchased = await WishlistEvent.countDocuments({ type: "purchased" });

    return NextResponse.json({
      mostWishlisted: mostWishlisted.map((item) => ({ product_id: item._id, count: item.count })),
      wishlistToPurchaseConversion: movedToCart > 0 ? purchased / movedToCart : 0,
      movedToCart,
      purchased
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load wishlist analytics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
