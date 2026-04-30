import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validateCouponForCart } from "@/lib/couponEngine";
import { connectToDatabase } from "@/lib/mongodb";
import { assertRateLimit, getOrCreateCart, getSessionId, serializeCartItem } from "@/lib/serverCart";

export async function POST(request: NextRequest) {
  try {
    assertRateLimit(request, "coupon:validate", 30);
    const user = await getCurrentUser();
    const payload = await request.json();
    const code = String(payload.code ?? "").trim().toUpperCase();

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

    return NextResponse.json(result, { status: result.valid ? 200 : 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to validate coupon";
    return NextResponse.json({ error: message }, { status: message.includes("Too many") ? 429 : 500 });
  }
}
