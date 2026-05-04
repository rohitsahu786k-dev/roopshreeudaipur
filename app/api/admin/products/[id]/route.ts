import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getCurrentUser } from "@/lib/auth";
import slugify from "slugify";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

function sanitizeBody(body: Record<string, unknown>) {
  const cleaned = { ...body };
  // Convert numeric strings to numbers
  if (cleaned.basePrice !== undefined) cleaned.basePrice = Number(cleaned.basePrice) || 0;
  if (cleaned.comparePrice !== undefined) cleaned.comparePrice = cleaned.comparePrice ? Number(cleaned.comparePrice) : undefined;
  if (cleaned.costPerItem !== undefined) cleaned.costPerItem = cleaned.costPerItem ? Number(cleaned.costPerItem) : undefined;
  if (cleaned.stock !== undefined) cleaned.stock = Number(cleaned.stock) || 0;
  if (cleaned.taxRate !== undefined) cleaned.taxRate = cleaned.taxRate ? Number(cleaned.taxRate) : undefined;
  // Remove flat shipping fields that belong nested
  delete (cleaned as any).requiresShipping;
  delete (cleaned as any).weight;
  delete (cleaned as any).weightUnit;
  delete (cleaned as any).length;
  delete (cleaned as any).width;
  delete (cleaned as any).height;
  return cleaned;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const product = await Product.findById(params.id)
      .populate("category", "name slug")
      .populate("upsells", "name slug media basePrice")
      .populate("crossSells", "name slug media basePrice")
      .lean();

    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (err: any) {
    console.error("[GET product]", err);
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const raw = await req.json();
    const body = sanitizeBody(raw);

    if (body.name && !body.slug) {
      (body as any).slug = slugify(String(body.name), { lower: true, strict: true });
    }
    (body as any).isActive = body.status === "active";
    if (body.status === "active" && !(body as any).publishedAt) {
      (body as any).publishedAt = new Date();
    }

    const product = await Product.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: false }
    ).populate("category", "name slug");

    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (err: any) {
    console.error("[PUT product]", err);
    if (err.code === 11000) {
      return NextResponse.json({ error: "Slug already exists — change the URL slug and try again." }, { status: 409 });
    }
    const message = err.errors
      ? Object.values(err.errors).map((e: any) => e.message).join(", ")
      : (err.message ?? "Server error");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const product = await Product.findByIdAndDelete(params.id);
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted" });
  } catch (err: any) {
    console.error("[DELETE product]", err);
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}
