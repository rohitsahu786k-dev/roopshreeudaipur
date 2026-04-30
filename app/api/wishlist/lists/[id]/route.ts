import { NextResponse, type NextRequest } from "next/server";
import slugify from "slugify";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureShareToken } from "@/lib/wishlist";
import { Wishlist, WishlistItem } from "@/models/Wishlist";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication is required" }, { status: 401 });

    const payload = await request.json();
    await connectToDatabase();

    if (payload.share === true) {
      const shared = await ensureShareToken(user.id, params.id);
      if (!shared) return NextResponse.json({ error: "Wishlist not found" }, { status: 404 });
      return NextResponse.json({ wishlist: shared });
    }

    const updates: Record<string, unknown> = {};
    if (typeof payload.name === "string" && payload.name.trim()) {
      updates.name = payload.name.trim();
      updates.slug = slugify(payload.name, { lower: true, strict: true });
    }
    if (typeof payload.description === "string") updates.description = payload.description;
    if (typeof payload.isPublic === "boolean") updates.isPublic = payload.isPublic;
    if (Array.isArray(payload.manualOrder)) updates.manualOrder = payload.manualOrder.map(String);

    const wishlist = await Wishlist.findOneAndUpdate({ _id: params.id, user: user.id }, { $set: updates }, { new: true });
    if (!wishlist) return NextResponse.json({ error: "Wishlist not found" }, { status: 404 });

    return NextResponse.json({ wishlist });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update wishlist";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication is required" }, { status: 401 });

    await connectToDatabase();
    const wishlist = await Wishlist.findOne({ _id: params.id, user: user.id });
    if (!wishlist) return NextResponse.json({ error: "Wishlist not found" }, { status: 404 });
    if (wishlist.isDefault) return NextResponse.json({ error: "Default wishlist cannot be deleted" }, { status: 400 });

    await WishlistItem.deleteMany({ user: user.id, wishlist: wishlist._id });
    await wishlist.deleteOne();

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete wishlist";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
