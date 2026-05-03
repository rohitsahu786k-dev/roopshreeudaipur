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

    const slug = slugify(body.name, { lower: true, strict: true });
    const uniqueSlug = await ensureUniqueSlug(slug);

    const product = await Product.create({
      ...body,
      slug: body.slug || uniqueSlug,
      isActive: body.status === "active"
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    if (err.code === 11000) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
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
