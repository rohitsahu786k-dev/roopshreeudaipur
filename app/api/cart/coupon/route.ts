import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validateCouponForCart } from "@/lib/couponEngine";
import { connectToDatabase } from "@/lib/mongodb";
import { assertRateLimit, getOrCreateCart, getSessionId, logCartEvent, recalculateAndSaveCart, serializeCart, serializeCartItem } from "@/lib/serverCart";

export async function POST(request: NextRequest) {
  try {
    assertRateLimit(request, "cart:coupon");
    const user = await getCurrentUser();
    const payload = await request.json();
    const code = String(payload.code ?? payload.couponCode ?? "").trim().toUpperCase();

    if (!code) return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });

    await connectToDatabase();
    const owner = { userId: user?.id, sessionId: user ? undefined : getSessionId(request, payload.sessionId) };
    const cart = await getOrCreateCart(owner);
    const result = await validateCouponForCart({
      code,
      items: cart.items.map((item) => serializeCartItem(item)),
      owner: {
        ...owner,
        ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined
      },
      currentCouponCode: cart.couponCode ?? undefined,
      recordAttempt: true
    });

    if (!result.valid) return NextResponse.json({ error: result.message }, { status: 400 });

    cart.couponCode = result.code;
    await recalculateAndSaveCart(cart);
    await logCartEvent(owner, String(cart._id), "coupon_applied", cart.totals?.grandTotal ?? 0, { code });

    return NextResponse.json({
      ...serializeCart(cart),
      message: result.message,
      coupon: {
        code: result.code,
        discount: result.discount,
        freeShipping: result.freeShipping
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to apply coupon";
    return NextResponse.json({ error: message }, { status: message.includes("Too many") ? 429 : 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    await connectToDatabase();
    const owner = { userId: user?.id, sessionId: user ? undefined : getSessionId(request) };
    const cart = await getOrCreateCart(owner);
    cart.couponCode = undefined;
    await recalculateAndSaveCart(cart);
    return NextResponse.json(serializeCart(cart));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to clear coupon";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
