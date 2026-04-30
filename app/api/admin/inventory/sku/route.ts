import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";

function generateSku(productName: string, options: string[] = []) {
  const base = productName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();
  const suffix = options.join("-").replace(/[^a-z0-9-]/gi, "").toUpperCase().slice(0, 16);
  return `RS-${base || "SKU"}-${suffix || Date.now().toString().slice(-6)}`;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    await connectToDatabase();
    const payload = await request.json();

    if (payload.mode === "generate") {
      const product = await Product.findById(payload.productId);
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

      if (payload.variantId) {
        const variant = product.variants.id(payload.variantId);
        if (!variant) return NextResponse.json({ error: "Variant not found" }, { status: 404 });
        variant.sku = generateSku(product.name, [variant.option1, variant.option2, variant.option3].filter(Boolean) as string[]);
      } else {
        product.sku = generateSku(product.name);
      }
      await product.save();
      return NextResponse.json({ product });
    }

    return NextResponse.json({ error: "Unsupported SKU operation" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update SKU";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { rows } = await request.json();
    if (!Array.isArray(rows)) return NextResponse.json({ error: "rows array is required" }, { status: 400 });

    await connectToDatabase();
    let updated = 0;
    for (const row of rows) {
      const productId = row.productId ?? row.product_id;
      const variantId = row.variantId ?? row.variant_id;
      const sku = String(row.sku ?? "").trim();
      const stock = Number(row.stock ?? row.quantity ?? NaN);
      if (!productId || !sku) continue;

      if (variantId) {
        const result = await Product.updateOne(
          { _id: productId, "variants._id": variantId },
          { $set: { "variants.$.sku": sku, ...(Number.isFinite(stock) ? { "variants.$.stock": stock } : {}) } }
        );
        updated += result.modifiedCount;
      } else {
        const result = await Product.updateOne(
          { _id: productId },
          { $set: { sku, ...(Number.isFinite(stock) ? { stock } : {}) } }
        );
        updated += result.modifiedCount;
      }
    }

    return NextResponse.json({ updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to bulk update SKUs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
