import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { createWishlistForUser, getOrCreateDefaultWishlist } from "@/lib/wishlist";
import { Wishlist } from "@/models/Wishlist";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication is required" }, { status: 401 });

    await connectToDatabase();
    await getOrCreateDefaultWishlist(user.id);
    const lists = await Wishlist.find({ user: user.id }).sort({ isDefault: -1, createdAt: 1 }).lean();

    return NextResponse.json({
      lists: lists.map((list) => ({
        id: String(list._id),
        name: list.name,
        slug: list.slug,
        isDefault: list.isDefault,
        isPublic: list.isPublic,
        shareToken: list.shareToken,
        createdAt: list.createdAt
      }))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load wishlists";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication is required" }, { status: 401 });

    const { name } = await request.json();
    if (!name || String(name).trim().length < 2) {
      return NextResponse.json({ error: "Wishlist name is required" }, { status: 400 });
    }

    await connectToDatabase();
    const wishlist = await createWishlistForUser(user.id, String(name).trim());
    return NextResponse.json({ wishlist }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create wishlist";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
