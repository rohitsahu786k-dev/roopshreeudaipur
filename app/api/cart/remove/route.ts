import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { assertRateLimit, getOrCreateCart, getSessionId, logCartEvent, recalculateAndSaveCart, serializeCart } from "@/lib/serverCart";

export async function DELETE(request: NextRequest) {
  try {
    assertRateLimit(request, "cart:remove");
    const user = await getCurrentUser();
    const variantId = request.nextUrl.searchParams.get("variantId") ?? request.nextUrl.searchParams.get("variant_id");
    if (!variantId) return NextResponse.json({ error: "variantId is required" }, { status: 400 });

    await connectToDatabase();
    const owner = { userId: user?.id, sessionId: user ? undefined : getSessionId(request) };
    const cart = await getOrCreateCart(owner);
    cart.set(
      "items",
      cart.items.filter((item) => item.variantId !== variantId)
    );

    await recalculateAndSaveCart(cart);
    await logCartEvent(owner, String(cart._id), "item_removed", cart.totals?.grandTotal ?? 0, { variantId });

    return NextResponse.json(serializeCart(cart));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to remove cart item";
    return NextResponse.json({ error: message }, { status: message.includes("Too many") ? 429 : 500 });
  }
}
