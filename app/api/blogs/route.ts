import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Blog } from "@/models/Blog";
import { blogs as staticBlogs } from "@/lib/blogs";

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ blogs: staticBlogs });
    }
    await connectToDatabase();
    const dbBlogs = await Blog.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .populate("author", "name")
      .lean();

    if (!dbBlogs.length) {
      return NextResponse.json({ blogs: staticBlogs });
    }

    return NextResponse.json({
      blogs: dbBlogs.map((b) => ({
        id: b.slug,
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        content: b.content,
        image: b.featuredImage ?? staticBlogs[0]?.image ?? "https://images.unsplash.com/photo-1583487305850-ac28d2a4c3be?auto=format&fit=crop&w=800&q=80",
        category: (b.categories as string[])?.[0] ?? "Style",
        author: (b.author as { name?: string } | null)?.name ?? "Roop Shree",
        publishedAt: (b as { createdAt?: Date }).createdAt?.toISOString() ?? new Date().toISOString(),
        readTime: Math.max(1, Math.ceil(b.content.split(" ").length / 200))
      }))
    });
  } catch {
    return NextResponse.json({ blogs: staticBlogs });
  }
}
