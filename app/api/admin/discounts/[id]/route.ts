import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Coupon } from "@/models/Coupon";
import { getCurrentUser } from "@/lib/auth";

type Params = { params: { id: string } };

function normalizeCouponPayload(body: Record<string, unknown>) {
  return {
    ...body,
    code: body.code ? String(body.code).toUpperCase().trim() : undefined,
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
    isActive: body.isActive ?? (body.status ? body.status === "active" : undefined),
    conditionsJson: body.conditionsJson ?? body.conditions_json
  };
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const coupon = await Coupon.findByIdAndUpdate(params.id, normalizeCouponPayload(body), { new: true });
    if (!coupon) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ coupon });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    await Coupon.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
