import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Coupon, CouponAttempt, CouponUsage } from "@/models/Coupon";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    const usage = await CouponUsage.aggregate([
      { $group: { _id: null, totalUsage: { $sum: "$usageCount" }, revenue: { $sum: "$revenue" }, discount: { $sum: "$discountAmount" } } }
    ]);
    const attempts = await CouponAttempt.aggregate([
      { $group: { _id: "$success", count: { $sum: 1 } } }
    ]);
    const success = attempts.find((item) => item._id === true)?.count ?? 0;
    const failed = attempts.find((item) => item._id === false)?.count ?? 0;

    return NextResponse.json({
      totalCoupons,
      activeCoupons,
      totalUsage: usage[0]?.totalUsage ?? 0,
      revenueGenerated: usage[0]?.revenue ?? 0,
      discountGiven: usage[0]?.discount ?? 0,
      failedAttempts: failed,
      conversionRate: success + failed > 0 ? success / (success + failed) : 0
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
