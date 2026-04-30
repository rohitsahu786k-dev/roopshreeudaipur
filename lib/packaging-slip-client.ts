import { format } from "date-fns";

export async function generatePackagingSlipPDF(order: any, storeSettings: any) {
  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF();
  const margin = 20;
  let currentY = margin;

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PACKAGING SLIP", margin, currentY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  currentY += 10;
  doc.text(`Order: #${order.orderNumber}`, margin, currentY);
  doc.text(`Date: ${format(new Date(order.createdAt), "dd-MM-yyyy")}`, 110, currentY);

  currentY += 15;
  doc.line(margin, currentY, 190, currentY);

  // Customer Details
  currentY += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Ship To:", margin, currentY);
  
  doc.setFont("helvetica", "normal");
  currentY += 5;
  doc.text(order.billing.name, margin, currentY);
  currentY += 5;
  doc.text(order.billing.address, margin, currentY, { maxWidth: 80 });
  currentY += 10;
  doc.text(`${order.billing.city}, ${order.billing.state} - ${order.billing.pincode || ""}`, margin, currentY);
  currentY += 5;
  doc.text(`Phone: ${order.billing.phone}`, margin, currentY);

  currentY += 15;

  // Items Table
  const tableData = order.items.map((item: any) => [
    item.productName,
    item.variantSize + " / " + item.variantColor,
    item.qty
  ]);

  (doc as any).autoTable({
    startY: currentY,
    head: [["Product", "Variant", "Quantity"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [50, 50, 50] },
    margin: { left: margin, right: margin }
  });

  currentY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Thank you for your order!", margin, currentY);
  
  doc.save(`PackagingSlip-${order.orderNumber}.pdf`);
}
