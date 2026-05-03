import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") ?? "all";

    const query: Record<string, unknown> = {};
    if (filter === "low") query.stock = { $lte: 5, $gt: 0 };
    if (filter === "out") query.stock = 0;

    const products = await Product.find(query)
      .select("name slug media stock variants lowStockThreshold status category sku")
      .populate("category", "name")
      .sort({ stock: 1 })
      .lean();

    return NextResponse.json({ products });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { productId, variantId, stock } = body;

    if (variantId) {
      await Product.updateOne(
        { _id: productId, "variants._id": variantId },
        { $set: { "variants.$.stock": stock } }
      );
    } else {
      await Product.updateOne({ _id: productId }, { $set: { stock } });
    }

    return NextResponse.json({ message: "Stock updated" });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
