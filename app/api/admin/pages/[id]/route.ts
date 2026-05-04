import { NextResponse, type NextRequest } from "next/server";
import slugify from "slugify";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { StorefrontPage } from "@/models/StorefrontPage";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await request.json();
    if (body.title && !body.slug) body.slug = slugify(body.title, { lower: true, strict: true });
    if (body.status === "published" && !body.publishedAt) body.publishedAt = new Date();

    const page = await StorefrontPage.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true
    }).lean();

    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ page });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Page slug already exists" }, { status: 409 });
    }
    const message = error instanceof Error ? error.message : "Unable to save page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const page = await StorefrontPage.findByIdAndDelete(params.id).lean();
    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
