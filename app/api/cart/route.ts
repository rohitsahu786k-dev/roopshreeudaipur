import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import {
  assertRateLimit,
  getOrCreateCart,
  getSessionId,
  logCartEvent,
  recalculateAndSaveCart,
  resolveCartProduct,
  serializeCart
} from "@/lib/serverCart";

function ownerFromRequest(request: NextRequest, userId?: string, bodySessionId?: string) {
  return {
    userId,
    sessionId: userId ? undefined : getSessionId(request, bodySessionId)
  };
}

export async function GET(request: NextRequest) {
  try {
    assertRateLimit(request, "cart:get");
    const user = await getCurrentUser();
    const sessionId = getSessionId(request);

    if (!user && !sessionId) {
      return NextResponse.json({ cart: { items: [], totals: { subtotal: 0, discount: 0, tax: 0, shipping: 0, grand_total: 0 } } });
    }

    await connectToDatabase();
    const cart = await getOrCreateCart(ownerFromRequest(request, user?.id));
    await recalculateAndSaveCart(cart);
    return NextResponse.json(serializeCart(cart));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load cart";
    return NextResponse.json({ error: message }, { status: message.includes("Too many") ? 429 : 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    assertRateLimit(request, "cart:add");
    const user = await getCurrentUser();
    const payload = await request.json();
    const productId = String(payload.productId ?? payload.product_id ?? "").trim();
    const quantity = Math.max(1, Number(payload.quantity ?? payload.qty ?? 1));

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    await connectToDatabase();
    const owner = ownerFromRequest(request, user?.id, payload.sessionId);
    if (!owner.userId && !owner.sessionId) {
      return NextResponse.json({ error: "sessionId is required for guest carts" }, { status: 400 });
    }

    const snapshot = await resolveCartProduct({
      productId,
      variantId: payload.variantId ?? payload.variant_id,
      size: payload.size,
      color: payload.color
    });

    if (!snapshot) return NextResponse.json({ error: "Product is unavailable" }, { status: 404 });
    if (snapshot.available_stock <= 0) return NextResponse.json({ error: "Product is out of stock", item: snapshot }, { status: 409 });

    const cart = await getOrCreateCart(owner);
    const existing = cart.items.find((item) => item.variantId === snapshot.variant_id);
    const nextQuantity = Math.min((existing?.quantity ?? 0) + quantity, snapshot.available_stock);

    if (existing) {
      existing.quantity = nextQuantity;
      existing.price = snapshot.price;
      existing.discountPrice = snapshot.discount_price;
      existing.subtotal = snapshot.discount_price * nextQuantity;
      existing.stockStatus = snapshot.stock_status;
      existing.availableStock = snapshot.available_stock;
    } else {
      cart.items.push({
        productId: snapshot.product_id,
        variantId: snapshot.variant_id,
        name: snapshot.name,
        image: snapshot.image,
        price: snapshot.price,
        discountPrice: snapshot.discount_price,
        quantity: Math.min(quantity, snapshot.available_stock),
        subtotal: snapshot.discount_price * Math.min(quantity, snapshot.available_stock),
        stockStatus: snapshot.stock_status,
        availableStock: snapshot.available_stock,
        size: snapshot.size,
        color: snapshot.color
      });
    }

    await recalculateAndSaveCart(cart);
    await logCartEvent(owner, String(cart._id), "item_added", cart.totals?.grandTotal ?? 0, {
      productId: snapshot.product_id,
      variantId: snapshot.variant_id
    });

    return NextResponse.json({
      ...serializeCart(cart),
      message:
        (existing?.quantity ?? quantity) + quantity > snapshot.available_stock
          ? `Only ${snapshot.available_stock} available. Quantity was adjusted.`
          : undefined
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to add to cart";
    return NextResponse.json({ error: message }, { status: message.includes("Too many") ? 429 : 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    assertRateLimit(request, "cart:clear");
    const user = await getCurrentUser();
    await connectToDatabase();
    const owner = ownerFromRequest(request, user?.id);
    const cart = await getOrCreateCart(owner);

    cart.set("items", []);
    cart.couponCode = undefined;
    await recalculateAndSaveCart(cart);
    await logCartEvent(owner, String(cart._id), "cleared");

    return NextResponse.json(serializeCart(cart));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to clear cart";
    return NextResponse.json({ error: message }, { status: message.includes("Too many") ? 429 : 500 });
  }
}
