import fs from "fs";
import path from "path";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { roopShreeBusiness } from "@/lib/business";

type StoreSettings = {
  storeName?: string;
  legalName?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  logoUrl?: string;
  gstNumber?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
};

const currency = (value: unknown) =>
  `INR ${Number(value ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

function getSettings(settings?: StoreSettings) {
  return {
    storeName: settings?.storeName || roopShreeBusiness.name,
    legalName: settings?.legalName || settings?.storeName || roopShreeBusiness.name,
    tagline: settings?.tagline || "Designer ethnic wear for bridal, festive and wedding celebrations.",
    email: settings?.email || roopShreeBusiness.supportEmail,
    phone: settings?.phone || roopShreeBusiness.supportPhone,
    whatsapp: settings?.whatsapp || settings?.phone || roopShreeBusiness.supportPhone,
    logoUrl: settings?.logoUrl || roopShreeBusiness.logoUrl,
    gstNumber: settings?.gstNumber || roopShreeBusiness.gstNumber,
    address: {
      line1: settings?.address?.line1 || "Udaipur, Rajasthan",
      line2: settings?.address?.line2 || "",
      city: settings?.address?.city || "Udaipur",
      state: settings?.address?.state || "Rajasthan",
      country: settings?.address?.country || "India",
      pincode: settings?.address?.pincode || ""
    }
  };
}

function logoDataUrl(logoUrl: string) {
  if (!logoUrl.startsWith("/")) return "";
  const filePath = path.join(process.cwd(), "public", logoUrl.replace(/^\/+/, ""));
  if (!fs.existsSync(filePath)) return "";

  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${fs.readFileSync(filePath).toString("base64")}`;
}

function addHeader(doc: jsPDF, title: string, order: any, storeSettings?: StoreSettings) {
  const settings = getSettings(storeSettings);
  const logo = logoDataUrl(settings.logoUrl);

  doc.setFillColor(17, 17, 17);
  doc.rect(0, 0, 210, 34, "F");

  if (logo) {
    doc.addImage(logo, logo.startsWith("data:image/png") ? "PNG" : "JPEG", 14, 7, 20, 20);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(settings.storeName, logo ? 39 : 14, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(settings.tagline, logo ? 39 : 14, 19, { maxWidth: 92 });
  doc.text(`GSTIN: ${settings.gstNumber}`, logo ? 39 : 14, 26);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, 196, 13, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`#${order.orderNumber}`, 196, 20, { align: "right" });
  doc.text(format(new Date(order.createdAt ?? Date.now()), "dd MMM yyyy"), 196, 26, { align: "right" });

  doc.setTextColor(20, 20, 20);
  return settings;
}

function addStoreAndCustomerBlocks(doc: jsPDF, order: any, settings: ReturnType<typeof getSettings>, startY: number) {
  doc.setDrawColor(215, 215, 215);
  doc.roundedRect(14, startY, 86, 42, 2, 2);
  doc.roundedRect(110, startY, 86, 42, 2, 2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("SOLD BY", 18, startY + 7);
  doc.text("BILL TO / SHIP TO", 114, startY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.4);
  doc.text(settings.legalName, 18, startY + 14, { maxWidth: 76 });
  doc.text([settings.address.line1, settings.address.line2].filter(Boolean).join(", "), 18, startY + 19, { maxWidth: 76 });
  doc.text(`${settings.address.city}, ${settings.address.state} ${settings.address.pincode}`, 18, startY + 28, { maxWidth: 76 });
  doc.text(`${settings.email} | ${settings.phone}`, 18, startY + 35, { maxWidth: 78 });

  doc.setFont("helvetica", "bold");
  doc.text(order.billing?.name ?? "Customer", 114, startY + 14, { maxWidth: 76 });
  doc.setFont("helvetica", "normal");
  doc.text(order.billing?.address ?? "", 114, startY + 19, { maxWidth: 76 });
  doc.text(`${order.billing?.city ?? ""}, ${order.billing?.state ?? ""} ${order.billing?.pincode ?? ""}`, 114, startY + 29, { maxWidth: 76 });
  doc.text(`Phone: ${order.billing?.phone ?? ""}`, 114, startY + 36, { maxWidth: 76 });
}

function addFooter(doc: jsPDF, settings: ReturnType<typeof getSettings>) {
  doc.setDrawColor(215, 215, 215);
  doc.line(14, 280, 196, 280);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(95, 95, 95);
  doc.text("Thank you for shopping with Roop Shree Udaipur. Every order is quality checked before dispatch.", 14, 286);
  doc.text(`Support: ${settings.email} | WhatsApp: ${settings.whatsapp}`, 14, 291);
  doc.text("Computer generated document. Signature is not required.", 196, 291, { align: "right" });
  doc.setTextColor(20, 20, 20);
}

function output(doc: jsPDF) {
  return Buffer.from(doc.output("arraybuffer"));
}

export function generateInvoiceBuffer(order: any, storeSettings?: StoreSettings) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const settings = addHeader(doc, "TAX INVOICE", order, storeSettings);

  addStoreAndCustomerBlocks(doc, order, settings, 42);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`Invoice No: ${order.invoiceNumber || `INV-${order.orderNumber}`}`, 14, 94);
  doc.text(`Payment: ${String(order.paymentStatus ?? "pending").replace(/_/g, " ")}`, 78, 94);
  doc.text(`Order Status: ${String(order.orderStatus ?? "pending").replace(/_/g, " ")}`, 132, 94);

  autoTable(doc, {
    startY: 101,
    head: [["Item", "SKU / Variant", "Qty", "Rate", "Amount"]],
    body: (order.items ?? []).map((item: any) => [
      item.productName,
      [item.sku, item.variantSize, item.variantColor].filter(Boolean).join(" / ") || "-",
      item.qty,
      currency(item.price),
      currency(Number(item.qty ?? 0) * Number(item.price ?? 0))
    ]),
    theme: "grid",
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: [30, 30, 30], lineColor: [225, 225, 225] },
    headStyles: { fillColor: [17, 17, 17], textColor: [255, 255, 255], fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 68 },
      1: { cellWidth: 42 },
      2: { halign: "center", cellWidth: 15 },
      3: { halign: "right", cellWidth: 27 },
      4: { halign: "right", cellWidth: 30 }
    },
    margin: { left: 14, right: 14 }
  });

  let y = Math.max((doc as any).lastAutoTable.finalY + 8, 166);
  const rows = [
    ["Subtotal", currency(order.subtotal)],
    ["Discount", `- ${currency(order.discount)}`],
    ["Shipping", currency(order.shipping)]
  ];
  if (order.taxBreakdown?.cgst || order.taxBreakdown?.sgst) {
    rows.push(["CGST", currency(order.taxBreakdown.cgst)]);
    rows.push(["SGST", currency(order.taxBreakdown.sgst)]);
  } else if (order.taxBreakdown?.igst) {
    rows.push(["IGST", currency(order.taxBreakdown.igst)]);
  } else if (order.tax) {
    rows.push(["Tax", currency(order.tax)]);
  }

  doc.setFontSize(9);
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.text(label, 136, y);
    doc.text(value, 196, y, { align: "right" });
    y += 7;
  });
  doc.setDrawColor(17, 17, 17);
  doc.line(136, y - 3, 196, y - 3);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Grand Total", 136, y + 3);
  doc.text(currency(order.total), 196, y + 3, { align: "right" });

  const noteY = y + 18;
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(14, noteY, 182, 30, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Important Notes", 18, noteY + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.3);
  doc.text(
    "Prices are inclusive of applicable taxes unless stated otherwise. Please retain this invoice for warranty, exchange, accounting and GST records.",
    18,
    noteY + 15,
    { maxWidth: 170 }
  );
  doc.text("Return and exchange eligibility depends on product condition, customization status and order policy.", 18, noteY + 24, { maxWidth: 170 });

  addFooter(doc, settings);
  return output(doc);
}

export function generatePackingSlipBuffer(order: any, storeSettings?: StoreSettings) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const settings = addHeader(doc, "PACKING SLIP", order, storeSettings);

  addStoreAndCustomerBlocks(doc, order, settings, 42);

  doc.setFillColor(248, 248, 248);
  doc.roundedRect(14, 91, 182, 24, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("FULFILMENT CHECKLIST", 18, 99);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Quality check", 18, 108);
  doc.text("Steam/press", 58, 108);
  doc.text("Tag check", 98, 108);
  doc.text("Secure packing", 138, 108);
  [48, 88, 128, 185].forEach((x) => doc.rect(x, 103, 5, 5));

  autoTable(doc, {
    startY: 124,
    head: [["Product", "Variant", "Qty", "Picker Check"]],
    body: (order.items ?? []).map((item: any) => [
      item.productName,
      [item.variantSize, item.variantColor].filter(Boolean).join(" / ") || "-",
      item.qty,
      "[  ]"
    ]),
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3, lineColor: [225, 225, 225] },
    headStyles: { fillColor: [17, 17, 17], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 84 },
      1: { cellWidth: 46 },
      2: { halign: "center", cellWidth: 18 },
      3: { halign: "center", cellWidth: 34 }
    },
    margin: { left: 14, right: 14 }
  });

  const y = Math.max((doc as any).lastAutoTable.finalY + 10, 190);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("PACKING INSTRUCTIONS", 14, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("1. Verify product, size, colour and quantity against this slip.", 14, y + 8);
  doc.text("2. Use clean inner garment bag, outer courier bag/box and invoice pouch.", 14, y + 15);
  doc.text("3. For bridal/heavy work outfits, add tissue layer and avoid tight folding.", 14, y + 22);
  doc.text("4. Mark shipped only after final QC and dispatch scan.", 14, y + 29);

  doc.setFont("helvetica", "bold");
  doc.text("Internal Notes", 118, y);
  doc.setFont("helvetica", "normal");
  doc.rect(118, y + 4, 78, 28);

  addFooter(doc, settings);
  return output(doc);
}
