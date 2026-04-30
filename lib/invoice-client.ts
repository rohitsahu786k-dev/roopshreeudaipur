"use client";

import { format } from "date-fns";

export async function generateInvoicePDF(order: any, storeSettings: any) {
  // Use global jspdf from CDN
  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF();
  const margin = 20;
  let currentY = margin;

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(storeSettings.storeName, margin, currentY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  currentY += 10;
  doc.text(storeSettings.address.line1, margin, currentY);
  currentY += 5;
  doc.text(`${storeSettings.address.city}, ${storeSettings.address.state} - ${storeSettings.address.pincode || ""}`, margin, currentY);
  currentY += 5;
  doc.text(`GSTIN: ${storeSettings.gstNumber || "N/A"}`, margin, currentY);
  currentY += 5;
  doc.text(`Email: ${storeSettings.email} | Phone: ${storeSettings.phone}`, margin, currentY);

  // Invoice Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", 150, margin, { align: "right" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice No: ${order.invoiceNumber || order.orderNumber}`, 150, margin + 10, { align: "right" });
  doc.text(`Date: ${format(new Date(order.createdAt), "dd-MM-yyyy")}`, 150, margin + 15, { align: "right" });
  doc.text(`Order ID: #${order.orderNumber}`, 150, margin + 20, { align: "right" });

  currentY += 20;
  doc.setDrawColor(200);
  doc.line(margin, currentY, 190, currentY);

  // Billing & Shipping
  currentY += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Billed To:", margin, currentY);
  doc.text("Shipped To:", 110, currentY);

  doc.setFont("helvetica", "normal");
  currentY += 5;
  doc.text(order.billing.name, margin, currentY);
  doc.text(order.billing.name, 110, currentY);
  currentY += 5;
  doc.text(order.billing.address, margin, currentY, { maxWidth: 80 });
  doc.text(order.billing.address, 110, currentY, { maxWidth: 80 });
  currentY += 10;
  doc.text(`${order.billing.city}, ${order.billing.state}`, margin, currentY);
  doc.text(`${order.billing.city}, ${order.billing.state}`, 110, currentY);
  currentY += 5;
  doc.text(`Phone: ${order.billing.phone}`, margin, currentY);
  doc.text(`Phone: ${order.billing.phone}`, 110, currentY);

  currentY += 15;

  // Table
  const tableData = order.items.map((item: any) => [
    item.productName,
    item.variantSize + " / " + item.variantColor,
    item.qty,
    `INR ${item.price.toLocaleString()}`,
    `INR ${(item.qty * item.price).toLocaleString()}`
  ]);

  (doc as any).autoTable({
    startY: currentY,
    head: [["Product", "Variant", "Qty", "Price", "Amount"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [0, 0, 0] },
    margin: { left: margin, right: margin }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Summary
  const summaryX = 140;
  doc.text("Subtotal:", summaryX, currentY);
  doc.text(`INR ${order.subtotal.toLocaleString()}`, 190, currentY, { align: "right" });
  
  currentY += 7;
  doc.text("Discount:", summaryX, currentY);
  doc.text(`- INR ${order.discount.toLocaleString()}`, 190, currentY, { align: "right" });
  
  currentY += 7;
  doc.text("Shipping:", summaryX, currentY);
  doc.text(`INR ${order.shipping.toLocaleString()}`, 190, currentY, { align: "right" });

  // Tax Breakdown
  if (order.taxBreakdown) {
    if (order.taxBreakdown.cgst > 0) {
      currentY += 7;
      doc.text("CGST (9%):", summaryX, currentY);
      doc.text(`INR ${order.taxBreakdown.cgst.toLocaleString()}`, 190, currentY, { align: "right" });
      currentY += 7;
      doc.text("SGST (9%):", summaryX, currentY);
      doc.text(`INR ${order.taxBreakdown.sgst.toLocaleString()}`, 190, currentY, { align: "right" });
    } else if (order.taxBreakdown.igst > 0) {
      currentY += 7;
      doc.text("IGST (18%):", summaryX, currentY);
      doc.text(`INR ${order.taxBreakdown.igst.toLocaleString()}`, 190, currentY, { align: "right" });
    }
  }

  currentY += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Grand Total:", summaryX, currentY);
  doc.text(`INR ${order.total.toLocaleString()}`, 190, currentY, { align: "right" });

  currentY += 20;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("Thank you for shopping with Roop Shree Udaipur!", margin, currentY);
  doc.text("This is a computer generated invoice and does not require a signature.", margin, currentY + 5);

  doc.save(`Invoice-${order.orderNumber}.pdf`);
}

export function generateThermalInvoice(order: any, storeSettings: any) {
  const printWindow = window.open("", "_blank", "width=300,height=600");
  if (!printWindow) return;

  const html = `
    <html>
      <head>
        <style>
          body { font-family: 'Courier New', Courier, monospace; font-size: 12px; width: 80mm; margin: 0; padding: 10px; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-bottom: 1px dashed #000; margin: 5px 0; }
          .flex { display: flex; justify-content: space-between; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; border-bottom: 1px solid #000; }
          .footer { font-size: 10px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="center bold">${storeSettings.storeName}</div>
        <div class="center">${storeSettings.address.city}, ${storeSettings.address.state}</div>
        <div class="center">Phone: ${storeSettings.phone}</div>
        <div class="center">GST: ${storeSettings.gstNumber || "N/A"}</div>
        <div class="line"></div>
        <div class="flex"><span>Order: #${order.orderNumber}</span><span>${format(new Date(order.createdAt), "dd/MM/yy")}</span></div>
        <div class="flex"><span>Cust: ${order.billing.name}</span></div>
        <div class="line"></div>
        <table>
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
          </thead>
          <tbody>
            ${order.items.map((item: any) => `
              <tr>
                <td>${item.productName.substring(0, 15)}</td>
                <td>${item.qty}</td>
                <td>${item.price}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="line"></div>
        <div class="flex"><span>Subtotal:</span><span>INR ${order.subtotal}</span></div>
        <div class="flex"><span>Discount:</span><span>INR ${order.discount}</span></div>
        <div class="flex"><span>Tax:</span><span>INR ${order.taxBreakdown?.totalTax || 0}</span></div>
        <div class="flex bold"><span>Total:</span><span>INR ${order.total}</span></div>
        <div class="line"></div>
        <div class="center footer">THANK YOU FOR VISITING!</div>
        <div class="center footer">Visit: roopshreeudaipur.com</div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}
