import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Coupon, CouponAttempt, CouponUsage } from "@/models/Coupon";
import { getCurrentUser } from "@/lib/auth";

function normalizeCouponPayload(body: Record<string, unknown>) {
  return {
    ...body,
    code: String(body.code ?? "").toUpperCase().trim(),
    type: body.type ?? "percentage",
    maxDiscountAmount: body.maxDiscountAmount ?? body.max_discount,
    minimumOrderAmount: body.minimumOrderAmount ?? body.min_order_value,
    usageLimit: body.usageLimit ?? body.usage_limit,
    usageLimitPerCustomer: body.usageLimitPerCustomer ?? body.per_user_limit ?? body.usage_limit_per_user,
    startsAt: body.startsAt ?? body.start_date,
    endsAt: body.endsAt ?? body.expiry_date,
    appliesToProducts: body.appliesToProducts ?? body.applicable_products,
    excludedProducts: body.excludedProducts ?? body.excluded_products,
    appliesToCategories: body.appliesToCategories ?? body.applicable_categories,
    eligibleCustomers: body.eligibleCustomers ?? body.user_specific,
    firstTimeUserOnly: body.firstTimeUserOnly ?? body.first_time_user_only,
    stackable: body.stackable ?? body.allowsCombining,
    allowsCombining: body.allowsCombining ?? body.stackable,
    isActive: body.isActive ?? (body.status ? body.status === "active" : true),
    conditionsJson: body.conditionsJson ?? body.conditions_json
  };
}

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

    const total = await Coupon.countDocuments();
    const coupons = await Coupon.find()
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const usage = await CouponUsage.aggregate([
      { $group: { _id: "$code", totalUsage: { $sum: "$usageCount" }, revenue: { $sum: "$revenue" }, discount: { $sum: "$discountAmount" } } }
    ]);
    const failedAttempts = await CouponAttempt.aggregate([
      { $match: { success: false } },
      { $group: { _id: "$code", failedAttempts: { $sum: 1 } } }
    ]);
    const usageByCode = new Map(usage.map((item) => [item._id, item]));
    const failuresByCode = new Map(failedAttempts.map((item) => [item._id, item.failedAttempts]));

    return NextResponse.json({
      coupons: coupons.map((coupon) => {
        const stats = usageByCode.get(coupon.code);
        return {
          ...coupon,
          analytics: {
            totalUsage: stats?.totalUsage ?? 0,
            revenueGenerated: stats?.revenue ?? 0,
            discountGiven: stats?.discount ?? 0,
            failedAttempts: failuresByCode.get(coupon.code) ?? 0
          }
        };
      }),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const coupon = await Coupon.create(normalizeCouponPayload(body));
    return NextResponse.json({ coupon }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
