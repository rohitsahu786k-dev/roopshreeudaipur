import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { getCurrentUser } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { generateInvoiceBuffer } from "@/lib/order-documents";
import { StoreSetting } from "@/models/StoreSetting";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const order = await Order.findById(params.id).lean();
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (!order.billing) return NextResponse.json({ error: "Order billing info missing" }, { status: 400 });

    const settings = await StoreSetting.findOne({ key: "default" }).lean();
    const invoice = generateInvoiceBuffer(order, (settings ?? undefined) as any);

    await sendEmail({
      to: order.billing.email,
      subject: `Invoice for Order #${order.orderNumber}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
          <h1 style="margin:0 0 12px">Invoice for Order #${order.orderNumber}</h1>
          <p>Dear ${order.billing.name},</p>
          <p>Your GST tax invoice is attached as a PDF.</p>
          <p><strong>GSTIN:</strong> 08ABKFR6839B1ZY</p>
          <p><strong>Total:</strong> INR ${Number(order.total).toLocaleString("en-IN")}</p>
          <p><strong>Status:</strong> ${String(order.orderStatus).replace(/_/g, " ")}</p>
          <p>Thank you for shopping with Roop Shree Udaipur.</p>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice-${order.orderNumber}.pdf`,
          content: invoice,
          contentType: "application/pdf"
        }
      ]
    });

    return NextResponse.json({ message: "Invoice email sent" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
