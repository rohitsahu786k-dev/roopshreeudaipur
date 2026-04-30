import { NextResponse } from "next/server";
import { requireAccountUser } from "@/lib/account";
import { Order } from "@/models/Order";

type Context = { params: { id: string } };

export async function GET(_request: Request, { params }: Context) {
  const result = await requireAccountUser();
  if (result.error) return result.error;

  const order = await Order.findOne({ _id: params.id, user: result.session.id }).lean();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return NextResponse.json({
    order: {
      id: String(order._id),
      order_id: order.orderNumber,
      date: order.createdAt,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount,
      tax: order.tax,
      shipping: order.shipping,
      total_amount: order.total,
      coupon_code: order.couponCode ?? "",
      payment_status: order.paymentStatus,
      order_status: order.orderStatus,
      billing: order.billing,
      invoice_url: order.invoiceUrl ?? order.shiprocketInvoiceUrl ?? "",
      tracking_url: order.shiprocketTrackingUrl ?? ""
    }
  });
}
