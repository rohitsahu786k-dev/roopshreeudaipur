import { NextResponse, type NextRequest } from "next/server";
import slugify from "slugify";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Blog } from "@/models/Blog";

type Params = { params: { id: string } };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    await connectToDatabase();
    const body = await request.json();
    if (body.title && !body.slug) body.slug = slugify(body.title, { lower: true, strict: true });
    const blog = await Blog.findByIdAndUpdate(params.id, body, { new: true, runValidators: true }).lean();
    if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ blog });
  } catch (error: any) {
    if (error.code === 11000) return NextResponse.json({ error: "Blog slug already exists" }, { status: 409 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save blog" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    await connectToDatabase();
    const blog = await Blog.findByIdAndDelete(params.id).lean();
    if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete blog" }, { status: 500 });
  }
}
