import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Calendar, User, Clock } from "lucide-react";
import { blogs } from "@/lib/blogs";
import { connectToDatabase } from "@/lib/mongodb";
import { Blog as BlogModel } from "@/models/Blog";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return blogs.map((blog) => ({ slug: blog.id }));
}

async function getBlog(slug: string) {
  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const dbBlog = await BlogModel.findOne({ slug, isPublished: true }).populate("author", "name").lean();
      if (dbBlog) {
        const wordCount = dbBlog.content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
        return {
          id: dbBlog.slug,
          title: dbBlog.title,
          image: dbBlog.featuredImage ?? blogs[0]?.image ?? "",
          category: (dbBlog.categories as string[])?.[0] ?? "Style",
          author: (dbBlog.author as { name?: string } | null)?.name ?? "Roop Shree",
          publishedAt: (dbBlog as { createdAt?: Date }).createdAt?.toISOString() ?? new Date().toISOString(),
          readTime: Math.max(1, Math.ceil(wordCount / 200)),
          content: dbBlog.content,
          isHtml: /<\/?[a-z][\s\S]*>/i.test(dbBlog.content)
        };
      }
    } catch {
      // fallback to static content
    }
  }

  const staticBlog = blogs.find((blog) => blog.id === slug);
  return staticBlog ? { ...staticBlog, isHtml: false } : null;
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = await getBlog(params.slug);
  if (!blog) notFound();

  return (
    <article className="bg-white pb-20">
      <div className="relative h-[400px] w-full md:h-[500px]">
        <img src={blog.image} alt={blog.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="max-w-4xl text-center text-white">
            <Link href="/blogs" className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide hover:underline">
              <ChevronLeft size={16} /> Back to Blogs
            </Link>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em]">{blog.category}</p>
            <h1 className="text-3xl font-bold uppercase tracking-wide md:text-5xl lg:text-6xl">{blog.title}</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-3xl px-4">
        <div className="mb-10 flex flex-wrap items-center justify-center gap-6 border-b border-gray-100 pb-8 text-xs font-bold uppercase tracking-widest text-gray-500">
          <div className="flex items-center gap-2"><User size={14} className="text-primary" /><span>By {blog.author}</span></div>
          <div className="flex items-center gap-2"><Calendar size={14} className="text-primary" /><span>{new Date(blog.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span></div>
          <div className="flex items-center gap-2"><Clock size={14} className="text-primary" /><span>{blog.readTime} min read</span></div>
        </div>

        <div className="max-w-none">
          {blog.isHtml ? (
            <div className="space-y-5 leading-8 text-gray-700 [&_a]:font-semibold [&_a]:text-primary [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-bold [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc" dangerouslySetInnerHTML={{ __html: blog.content }} />
          ) : (
            blog.content.split("\n\n").map((para, i) => (
              <p key={i} className="mb-6 text-lg leading-relaxed text-gray-700">
                {para.startsWith("**") ? (
                  <strong className="mt-8 mb-4 block text-xl font-bold text-gray-900">{para.replace(/\*\*/g, "")}</strong>
                ) : para.startsWith("-") ? (
                  <span className="mb-2 ml-4 block">• {para.substring(1).trim()}</span>
                ) : para}
              </p>
            ))
          )}
        </div>
      </div>
    </article>
  );
}
