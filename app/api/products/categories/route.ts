import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Category } from "@/models/Category";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    return NextResponse.json({ categories });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load categories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
