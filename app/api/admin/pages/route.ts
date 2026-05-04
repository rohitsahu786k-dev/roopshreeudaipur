import { NextResponse, type NextRequest } from "next/server";
import slugify from "slugify";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { StorefrontPage } from "@/models/StorefrontPage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const filter = status ? { status } : {};
    const pages = await StorefrontPage.find(filter).sort({ updatedAt: -1 }).lean();

    return NextResponse.json({ pages });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load pages";
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
    const slug = body.slug || slugify(body.title, { lower: true, strict: true });
    const page = await StorefrontPage.create({
      ...body,
      slug,
      publishedAt: body.status === "published" ? new Date() : undefined
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Page slug already exists" }, { status: 409 });
    }
    const message = error instanceof Error ? error.message : "Unable to create page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
