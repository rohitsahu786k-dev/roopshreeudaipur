import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Cart, CartEvent } from "@/models/Cart";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access is required" }, { status: 403 });
    }

    await connectToDatabase();
    const activeCarts = await Cart.countDocuments({ "items.0": { $exists: true }, convertedAt: { $exists: false } });
    const abandonedCarts = await Cart.countDocuments({
      "items.0": { $exists: true },
      convertedAt: { $exists: false },
      updatedAt: { $lte: new Date(Date.now() - 1000 * 60 * 60 * 4) }
    });
    const averageCart = await Cart.aggregate([
      { $match: { "items.0": { $exists: true } } },
      { $group: { _id: null, value: { $avg: "$totals.grandTotal" } } }
    ]);
    const converted = await CartEvent.countDocuments({ type: "converted" });

    return NextResponse.json({
      activeCarts,
      abandonedCarts,
      averageCartValue: Math.round(averageCart[0]?.value ?? 0),
      conversionRate: activeCarts + converted > 0 ? converted / (activeCarts + converted) : 0
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load cart analytics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
