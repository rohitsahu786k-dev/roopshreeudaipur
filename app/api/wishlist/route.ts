import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { formatWishlistItems, getWishlistForUser, logWishlistEvent, resolveProductSnapshot } from "@/lib/wishlist";
import { WishlistItem } from "@/models/Wishlist";

function numericParam(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication is required" }, { status: 401 });

    await connectToDatabase();
    const params = request.nextUrl.searchParams;
    const { wishlist, items } = await formatWishlistItems(user.id, params.get("wishlistId") ?? undefined, {
      sort: (params.get("sort") as never) ?? "date_desc",
      inStock: params.get("inStock") === "true",
      minPrice: numericParam(params.get("minPrice")),
      maxPrice: numericParam(params.get("maxPrice"))
    });

    return NextResponse.json({
      wishlist: {
        id: String(wishlist._id),
        name: wishlist.name,
        isDefault: wishlist.isDefault,
        isPublic: wishlist.isPublic,
        shareToken: wishlist.shareToken
      },
      items
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load wishlist";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication is required" }, { status: 401 });

    const payload = await request.json();
    const productId = String(payload.productId ?? payload.product_id ?? "").trim();
    if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });

    await connectToDatabase();
    const wishlist = await getWishlistForUser(user.id, payload.wishlistId);
    const snapshot = await resolveProductSnapshot(productId);

    const item = await WishlistItem.findOneAndUpdate(
      { user: user.id, wishlist: wishlist._id, productId },
      {
        $setOnInsert: {
          user: user.id,
          wishlist: wishlist._id,
          productId,
          priceAtAdd: snapshot?.price,
          stockStatusAtAdd: snapshot?.stock_status
        },
        $set: {
          notes: typeof payload.notes === "string" ? payload.notes : undefined,
          priority: payload.priority ?? "medium",
          notificationPrefs: payload.notificationPrefs
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await logWishlistEvent({ userId: user.id, wishlistId: String(wishlist._id), productId, type: "added" });

    return NextResponse.json({ item, duplicatePrevented: !item.isNew }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to add to wishlist";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication is required" }, { status: 401 });

    const params = request.nextUrl.searchParams;
    const productId = params.get("productId") ?? params.get("product_id");
    if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });

    await connectToDatabase();
    const wishlist = await getWishlistForUser(user.id, params.get("wishlistId") ?? undefined);
    await WishlistItem.deleteOne({ user: user.id, wishlist: wishlist._id, productId });
    await logWishlistEvent({ userId: user.id, wishlistId: String(wishlist._id), productId, type: "removed" });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to remove from wishlist";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
