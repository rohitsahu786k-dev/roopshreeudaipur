import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { assertRateLimit, getOrCreateCart, getSessionId, logCartEvent, recalculateAndSaveCart, resolveCartProduct, serializeCart } from "@/lib/serverCart";

export async function POST(request: NextRequest) {
  try {
    assertRateLimit(request, "cart:sync", 30);
    const user = await getCurrentUser();
    const payload = await request.json();
    const sessionId = getSessionId(request, payload.sessionId);

    await connectToDatabase();
    const owner = { userId: user?.id, sessionId: user ? undefined : sessionId };
    const cart = await getOrCreateCart(owner);
    const items = Array.isArray(payload.items) ? payload.items : [];

    for (const rawItem of items) {
      const productId = String(rawItem.product_id ?? rawItem.productId ?? rawItem.product?.slug ?? "").trim();
      if (!productId) continue;

      const snapshot = await resolveCartProduct({
        productId,
        variantId: rawItem.variant_id ?? rawItem.variantId,
        size: rawItem.size,
        color: rawItem.color
      });
      if (!snapshot || snapshot.available_stock <= 0) continue;

      const quantity = Math.min(Math.max(1, Number(rawItem.quantity ?? rawItem.qty ?? 1)), snapshot.available_stock);
      const existing = cart.items.find((item) => item.variantId === snapshot.variant_id);

      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, snapshot.available_stock);
        existing.subtotal = existing.discountPrice * existing.quantity;
      } else {
        cart.items.push({
          productId: snapshot.product_id,
          variantId: snapshot.variant_id,
          name: snapshot.name,
          image: snapshot.image,
          price: snapshot.price,
          discountPrice: snapshot.discount_price,
          quantity,
          subtotal: snapshot.discount_price * quantity,
          stockStatus: snapshot.stock_status,
          availableStock: snapshot.available_stock,
          size: snapshot.size,
          color: snapshot.color
        });
      }
    }

    await recalculateAndSaveCart(cart);
    await logCartEvent(owner, String(cart._id), user ? "recovered" : "item_updated", cart.totals?.grandTotal ?? 0);
    return NextResponse.json(serializeCart(cart));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sync cart";
    return NextResponse.json({ error: message }, { status: message.includes("Too many") ? 429 : 500 });
  }
}
