import { NextResponse, type NextRequest } from "next/server";
import { requireAccountUser } from "@/lib/account";
import { Order } from "@/models/Order";

type Context = { params: { id: string } };

export async function POST(request: NextRequest, { params }: Context) {
  const result = await requireAccountUser();
  if (result.error) return result.error;

  const { reason } = await request.json().catch(() => ({ reason: "" }));
  const order = await Order.findOne({ _id: params.id, user: result.session.id });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (!["pending", "confirmed", "processing"].includes(String(order.orderStatus))) {
    return NextResponse.json({ error: "This order can no longer be cancelled" }, { status: 400 });
  }

  order.orderStatus = "cancelled";
  order.notes = [order.notes, reason ? `Cancellation reason: ${reason}` : "Cancelled by customer"].filter(Boolean).join("\n");
  await order.save();
  return NextResponse.json({ ok: true });
}
