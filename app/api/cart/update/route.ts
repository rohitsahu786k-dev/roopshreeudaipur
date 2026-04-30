import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { assertRateLimit, getOrCreateCart, getSessionId, logCartEvent, recalculateAndSaveCart, serializeCart } from "@/lib/serverCart";

export async function PATCH(request: NextRequest) {
  try {
    assertRateLimit(request, "cart:update");
    const user = await getCurrentUser();
    const payload = await request.json();
    const variantId = String(payload.variantId ?? payload.variant_id ?? payload.key ?? "").trim();
    const quantity = Math.max(1, Number(payload.quantity ?? 1));

    if (!variantId) return NextResponse.json({ error: "variantId is required" }, { status: 400 });

    await connectToDatabase();
    const owner = { userId: user?.id, sessionId: user ? undefined : getSessionId(request, payload.sessionId) };
    const cart = await getOrCreateCart(owner);
    const item = cart.items.find((entry) => entry.variantId === variantId);
    if (!item) return NextResponse.json({ error: "Cart item not found" }, { status: 404 });

    item.quantity = Math.min(quantity, item.availableStock);
    item.subtotal = item.discountPrice * item.quantity;
    item.stockStatus = item.availableStock <= 0 ? "out_of_stock" : item.availableStock <= 5 ? "low_stock" : "in_stock";

    await recalculateAndSaveCart(cart);
    await logCartEvent(owner, String(cart._id), "item_updated", cart.totals?.grandTotal ?? 0, { variantId });

    return NextResponse.json({
      ...serializeCart(cart),
      message: quantity > item.availableStock ? `Only ${item.availableStock} available. Quantity was adjusted.` : undefined
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update cart";
    return NextResponse.json({ error: message }, { status: message.includes("Too many") ? 429 : 500 });
  }
}
