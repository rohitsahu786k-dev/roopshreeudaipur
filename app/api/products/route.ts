import { NextResponse, type NextRequest } from "next/server";
import slugify from "slugify";
import { getCurrentUser } from "@/lib/auth";
import { products } from "@/lib/catalog";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ products });
    }

    await connectToDatabase();
    const databaseProducts = await Product.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ products: databaseProducts.length ? databaseProducts : products });
  } catch {
    return NextResponse.json({ products });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access is required" }, { status: 403 });
    }

    const payload = await request.json();
    const requiredFields = ["name", "description", "shortDescription", "category", "images", "variants"];
    const missingField = requiredFields.find((field) => !payload[field]);

    if (missingField) {
      return NextResponse.json({ error: `${missingField} is required` }, { status: 400 });
    }

    await connectToDatabase();
    const product = await Product.create({
      ...payload,
      slug: payload.slug ?? slugify(payload.name, { lower: true, strict: true })
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
