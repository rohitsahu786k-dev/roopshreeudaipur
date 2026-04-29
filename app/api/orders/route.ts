import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
    }

    await connectToDatabase();
    const query = user.role === "user" ? { user: user.id } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(50).lean();

    return NextResponse.json({ orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load orders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    if (!payload.items?.length || !payload.billing || !payload.total || !payload.paymentMethod) {
      return NextResponse.json({ error: "Items, billing, total, and payment method are required" }, { status: 400 });
    }

    await connectToDatabase();

    const order = await Order.create({
      ...payload,
      orderNumber: payload.orderNumber ?? `RC-${Date.now()}`
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
