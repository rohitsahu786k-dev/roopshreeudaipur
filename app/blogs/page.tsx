import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, User } from "lucide-react";
import { blogs as staticBlogs, type BlogPost } from "@/lib/blogs";
import { connectToDatabase } from "@/lib/mongodb";
import { Blog as BlogModel } from "@/models/Blog";

export const metadata = {
  title: "Stories & Style Guides — Roop Shree",
  description: "Styling tips, bridal guides, fabric care, and fashion inspiration from Roop Shree Udaipur."
};

async function getAllBlogs(): Promise<BlogPost[]> {
  try {
    if (!process.env.MONGODB_URI) return staticBlogs;
    await connectToDatabase();
    const dbBlogs = await BlogModel
      .find({ isPublished: true })
      .sort({ createdAt: -1 })
      .populate("author", "name")
      .lean();
    if (!dbBlogs.length) return staticBlogs;
    return dbBlogs.map((b) => ({
      id: b.slug,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: b.content,
      image: b.featuredImage ?? staticBlogs[0]?.image ?? "",
      category: (b.categories as string[])?.[0] ?? "Style",
      author: (b.author as { name?: string } | null)?.name ?? "Roop Shree",
      publishedAt: (b as { createdAt?: Date }).createdAt?.toISOString() ?? new Date().toISOString(),
      readTime: Math.max(1, Math.ceil(b.content.split(" ").length / 200))
    }));
  } catch {
    return staticBlogs;
  }
}

function CategoryBadge({ label }: { label: string }) {
  return (
    <span className="inline-block bg-ink px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white sm:text-[10px]">
      {label}
    </span>
  );
}

function BlogMeta({ author, date, readTime }: { author: string; date: string; readTime: number }) {
  const d = new Date(date);
  const formatted = d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-wide text-ink/45 sm:text-[11px]">
      <span className="flex items-center gap-1"><User size={11} /> {author}</span>
      <span>{formatted}</span>
      <span className="flex items-center gap-1"><Clock size={11} /> {readTime} min read</span>
    </div>
  );
}

export default async function BlogsPage() {
  const allBlogs = await getAllBlogs();
  const featured = allBlogs[0];
  const recent = allBlogs.slice(1, 4);
  const rest = allBlogs.slice(4);

  return (
    <div className="bg-white text-ink">

      {/* Page header */}
      <div className="border-b border-black/8 px-4 py-8 text-center sm:py-12">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink/45 sm:text-[11px]">Our Stories</p>
        <h1 className="mt-2 text-2xl font-bold uppercase tracking-wide sm:text-3xl md:text-4xl">First Look Stories</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-ink/55">Styling tips, bridal guides, fabric care, and fashion inspiration from Roop Shree&apos;s Udaipur studio.</p>
      </div>

      <div className="mx-auto max-w-6xl px-3 py-8 sm:px-4 md:py-12">

        {/* Featured article — magazine hero style */}
        {featured && (
          <Link href={`/blogs/${featured.id}`} className="group mb-10 block md:mb-14">
            <div className="grid md:grid-cols-[1.1fr_0.9fr]">
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-black/5 md:aspect-auto md:min-h-[420px]">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(min-width: 768px) 55vw, 100vw"
                />
                <div className="absolute left-0 top-4 z-10">
                  <CategoryBadge label="Featured" />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center border border-t-0 border-black/10 bg-white p-6 md:border-l-0 md:border-t md:p-10">
                <CategoryBadge label={featured.category} />
                <h2 className="mt-4 text-xl font-bold leading-snug tracking-wide transition group-hover:text-primary sm:text-2xl md:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-ink/60">{featured.excerpt}</p>
                <div className="mt-4">
                  <BlogMeta author={featured.author} date={featured.publishedAt} readTime={featured.readTime} />
                </div>
                <div className="mt-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-ink transition group-hover:gap-3">
                  Read Article <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Recent articles — horizontal on mobile (list), 3-col on desktop (cards) */}
        {recent.length > 0 && (
          <section className="mb-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[12px] font-bold uppercase tracking-[0.18em] sm:text-[13px]">Recent Stories</h2>
            </div>

            {/* Mobile: list view */}
            <div className="divide-y divide-black/8 md:hidden">
              {recent.map((blog) => (
                <Link key={blog.id} href={`/blogs/${blog.id}`} className="group flex gap-3 py-4">
                  <div className="relative h-[80px] w-[80px] shrink-0 overflow-hidden bg-neutral">
                    <Image src={blog.image} alt={blog.title} fill className="object-cover transition group-hover:scale-105" sizes="80px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CategoryBadge label={blog.category} />
                    <h3 className="mt-1.5 line-clamp-2 text-[12px] font-bold uppercase leading-snug tracking-wide text-ink transition group-hover:text-primary">{blog.title}</h3>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-ink/50">{blog.excerpt}</p>
                    <div className="mt-1.5 text-[10px] font-semibold text-ink/35">
                      {new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {blog.readTime} min
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop: 3-col cards */}
            <div className="hidden gap-6 md:grid md:grid-cols-3">
              {recent.map((blog) => (
                <Link key={blog.id} href={`/blogs/${blog.id}`} className="group flex flex-col overflow-hidden border border-black/8 transition hover:border-black/25">
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/5">
                    <Image src={blog.image} alt={blog.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="33vw" />
                    <div className="absolute left-0 top-3">
                      <CategoryBadge label={blog.category} />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="line-clamp-2 text-sm font-bold uppercase leading-snug tracking-wide transition group-hover:text-primary">{blog.title}</h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-ink/55">{blog.excerpt}</p>
                    <div className="mt-4">
                      <BlogMeta author={blog.author} date={blog.publishedAt} readTime={blog.readTime} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All stories — list style (like Pernia's "First Look Stories") */}
        {rest.length > 0 && (
          <section>
            <div className="mb-5 border-b border-black/8 pb-3">
              <h2 className="text-[12px] font-bold uppercase tracking-[0.18em] sm:text-[13px]">More Stories</h2>
            </div>
            <div className="divide-y divide-black/8">
              {rest.map((blog) => (
                <Link key={blog.id} href={`/blogs/${blog.id}`} className="group flex gap-4 py-4 sm:gap-5 sm:py-5">
                  <div className="relative h-[80px] w-[80px] shrink-0 overflow-hidden bg-neutral sm:h-[100px] sm:w-[100px] md:h-24 md:w-24">
                    <Image src={blog.image} alt={blog.title} fill className="object-cover transition group-hover:scale-105" sizes="100px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CategoryBadge label={blog.category} />
                    </div>
                    <h3 className="mt-1.5 line-clamp-2 text-[13px] font-bold uppercase leading-snug tracking-wide text-ink transition group-hover:text-primary sm:text-sm">{blog.title}</h3>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-ink/55 sm:text-xs">{blog.excerpt}</p>
                    <div className="mt-2">
                      <BlogMeta author={blog.author} date={blog.publishedAt} readTime={blog.readTime} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {allBlogs.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-ink/50">No stories available yet. Check back soon.</p>
          </div>
        )}

      </div>
    </div>
  );
}
