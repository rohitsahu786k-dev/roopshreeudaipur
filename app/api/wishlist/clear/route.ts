import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { getWishlistForUser } from "@/lib/wishlist";
import { WishlistItem } from "@/models/Wishlist";

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication is required" }, { status: 401 });

    await connectToDatabase();
    const wishlist = await getWishlistForUser(user.id, request.nextUrl.searchParams.get("wishlistId") ?? undefined);
    const result = await WishlistItem.deleteMany({ user: user.id, wishlist: wishlist._id });

    return NextResponse.json({ ok: true, cleared: result.deletedCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to clear wishlist";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
