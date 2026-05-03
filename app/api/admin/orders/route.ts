import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const search = searchParams.get("search") ?? "";
    const orderStatus = searchParams.get("orderStatus") ?? "";
    const paymentStatus = searchParams.get("paymentStatus") ?? "";
    const sort = searchParams.get("sort") ?? "-createdAt";

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "billing.name": { $regex: search, $options: "i" } },
        { "billing.email": { $regex: search, $options: "i" } },
        { "billing.phone": { $regex: search, $options: "i" } }
      ];
    }
    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0] } },
          totalOrders: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$orderStatus", "pending"] }, 1, 0] } },
          processing: {
            $sum: {
              $cond: [
                { $in: ["$orderStatus", ["confirmed", "processing", "packed"]] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: stats[0] ?? { totalRevenue: 0, totalOrders: 0, pending: 0, processing: 0 }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
