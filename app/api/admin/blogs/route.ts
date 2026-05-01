import { NextResponse, type NextRequest } from "next/server";
import slugify from "slugify";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Blog } from "@/models/Blog";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    await connectToDatabase();
    const blogs = await Blog.find({}).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ blogs });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load blogs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    await connectToDatabase();
    const body = await request.json();
    const blog = await Blog.create({
      ...body,
      slug: body.slug || slugify(body.title, { lower: true, strict: true }),
      author: user.id
    });
    return NextResponse.json({ blog }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) return NextResponse.json({ error: "Blog slug already exists" }, { status: 409 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create blog" }, { status: 500 });
  }
}
