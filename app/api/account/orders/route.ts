import { NextResponse, type NextRequest } from "next/server";
import { requireAccountUser } from "@/lib/account";
import { Order } from "@/models/Order";

export async function GET(request: NextRequest) {
  const result = await requireAccountUser();
  if (result.error) return result.error;

  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(params.get("limit") ?? 10)));
  const status = params.get("status");
  const dateFrom = params.get("dateFrom");
  const dateTo = params.get("dateTo");
  const query: Record<string, unknown> = { user: result.session.id };

  if (status) query.orderStatus = status;
  if (dateFrom || dateTo) {
    query.createdAt = {
      ...(dateFrom ? { $gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { $lte: new Date(dateTo) } : {})
    };
  }

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json({
    orders: orders.map((order) => ({
      id: String(order._id),
      order_id: order.orderNumber,
      date: order.createdAt,
      items: order.items,
      total_amount: order.total,
      payment_status: order.paymentStatus,
      order_status: order.orderStatus,
      invoice_url: order.invoiceUrl ?? order.shiprocketInvoiceUrl ?? "",
      tracking_url: order.shiprocketTrackingUrl ?? "",
      can_cancel: ["pending", "confirmed", "processing"].includes(String(order.orderStatus))
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
}
