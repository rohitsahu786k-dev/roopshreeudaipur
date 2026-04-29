import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { User } from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") ?? "30d";

    const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "1y" ? 365 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [revenueData, orderStatusCounts, topProducts, newCustomers, totalProducts] =
      await Promise.all([
        Order.aggregate([
          { $match: { createdAt: { $gte: since }, paymentStatus: "paid" } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              revenue: { $sum: "$total" },
              orders: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: since } } },
          { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: since }, paymentStatus: "paid" } },
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.product",
              name: { $first: "$items.productName" },
              revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
              unitsSold: { $sum: "$items.qty" }
            }
          },
          { $sort: { revenue: -1 } },
          { $limit: 10 }
        ]),
        User.countDocuments({ createdAt: { $gte: since }, role: "user" }),
        Product.countDocuments({ isActive: true })
      ]);

    const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
    const totalOrders = revenueData.reduce((s, d) => s + d.orders, 0);

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders,
        newCustomers,
        totalProducts,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      },
      revenueChart: revenueData,
      orderStatusCounts,
      topProducts
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
