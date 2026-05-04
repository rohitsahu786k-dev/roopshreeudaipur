import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { getCurrentUser } from "@/lib/auth";
import slugify from "slugify";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const category = searchParams.get("category") ?? "";
    const sort = searchParams.get("sort") ?? "-createdAt";

    const filter: Record<string, unknown> = {};
    if (search) filter.$text = { $search: search };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }
    if (!body.category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }
    if (!body.basePrice && body.basePrice !== 0) {
      return NextResponse.json({ error: "Base price is required" }, { status: 400 });
    }

    const slug = slugify(body.name, { lower: true, strict: true });
    const uniqueSlug = await ensureUniqueSlug(slug);

    const product = await Product.create({
      ...body,
      description: body.description ?? "",
      shortDescription: body.shortDescription ?? "",
      slug: body.slug?.trim() || uniqueSlug,
      basePrice: Number(body.basePrice) || 0,
      comparePrice: body.comparePrice ? Number(body.comparePrice) : undefined,
      stock: Number(body.stock) || 0,
      isActive: body.status === "active"
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err: any) {
    console.error("[POST product]", err);
    if (err.code === 11000) {
      return NextResponse.json({ error: "Slug already exists — change the URL slug." }, { status: 409 });
    }
    const message = err.errors
      ? Object.values(err.errors).map((e: any) => e.message).join(", ")
      : (err.message ?? "Server error");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 1;
  while (await Product.exists({ slug })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}
