import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Banner } from "@/models/Banner";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get("placement");
    const banners = await Banner.find(placement ? { placement } : {})
      .sort({ placement: 1, position: 1, updatedAt: -1 })
      .lean();

    return NextResponse.json({ banners });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load banners";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await request.json();
    const banner = await Banner.create(body);

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create banner";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
