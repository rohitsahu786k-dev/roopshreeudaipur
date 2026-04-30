import { NextResponse } from "next/server";
import { requireAccountUser } from "@/lib/account";
import { connectToDatabase } from "@/lib/mongodb";
import { getOrCreateCart, recalculateAndSaveCart } from "@/lib/serverCart";
import { Order } from "@/models/Order";

type Context = { params: { id: string } };

export async function POST(_request: Request, { params }: Context) {
  const result = await requireAccountUser();
  if (result.error) return result.error;

  await connectToDatabase();
  const order = await Order.findOne({ _id: params.id, user: result.session.id }).lean();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const cart = await getOrCreateCart({ userId: result.session.id });
  for (const item of order.items) {
    const variantId = `${String(item.product)}:${item.variantSize}:${item.variantColor}`;
    const existing = cart.items.find((entry) => entry.variantId === variantId);
    if (existing) {
      existing.quantity += item.qty;
      existing.subtotal = existing.quantity * existing.discountPrice;
    } else {
      cart.items.push({
        productId: String(item.product),
        variantId,
        name: item.productName,
        image: item.productImage,
        price: item.price,
        discountPrice: item.price,
        quantity: item.qty,
        subtotal: item.price * item.qty,
        stockStatus: "in_stock",
        availableStock: 99,
        size: item.variantSize,
        color: item.variantColor
      });
    }
  }

  await recalculateAndSaveCart(cart);
  return NextResponse.json({ ok: true });
}
