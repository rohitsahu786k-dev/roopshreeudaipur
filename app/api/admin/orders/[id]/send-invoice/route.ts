import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { getCurrentUser } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const order = await Order.findById(params.id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (!order.billing) return NextResponse.json({ error: "Order billing info missing" }, { status: 400 });

    // In a real app, you'd generate the PDF buffer here and attach it
    // For now, we'll send a confirmation email that includes a link to the invoice
    await sendEmail({
      to: order.billing.email,
      subject: `Invoice for Order #${order.orderNumber}`,
      html: `
        <h1>Invoice for your order #${order.orderNumber}</h1>
        <p>Dear ${order.billing.name},</p>
        <p>Please find the details of your order below. You can download your invoice from your account dashboard.</p>
        <p>Total: INR ${order.total}</p>
        <p>Status: ${order.orderStatus}</p>
        <p>Thank you for shopping with us!</p>
      `
    });

    return NextResponse.json({ message: "Invoice email sent" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
