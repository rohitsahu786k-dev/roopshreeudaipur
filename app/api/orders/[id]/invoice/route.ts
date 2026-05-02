import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { generateInvoiceBuffer } from "@/lib/order-documents";
import { Order } from "@/models/Order";
import { StoreSetting } from "@/models/StoreSetting";

type Context = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication is required" }, { status: 401 });

    await connectToDatabase();
    const query = user.role === "admin" ? { _id: params.id } : { _id: params.id, user: user.id };
    const order = await Order.findOne(query).lean();

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const settings = await StoreSetting.findOne({ key: "default" }).lean();
    const buffer = generateInvoiceBuffer(order, (settings ?? undefined) as any);
    const filename = `Invoice-${order.orderNumber}.pdf`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate invoice";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
