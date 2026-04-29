import { BlogCard } from "@/components/blog/BlogCard";
import { blogs } from "@/lib/blogs";

export const metadata = {
  title: "Blog - Roop Shree",
  description: "Read our latest articles on styling ethnic wear, care tips, and fashion trends."
};

export default function BlogsPage() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-ink/60">Our Stories</p>
          <h1 className="mt-3 text-3xl font-bold uppercase tracking-wide md:text-4xl">Latest from Our Blog</h1>
          <p className="mt-4 text-lg text-ink/65">Discover styling tips, care guides, and fashion inspiration for your ethnic wardrobe.</p>
        </div>

        {/* Featured Blog */}
        <div className="mb-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
            {blogs.length > 0 && (
              <>
                {(() => {
                  const featured = blogs[0];
                  return (
                    <>
                      <div className="relative h-full w-full">
                        <img
                          src={featured.image}
                          alt={featured.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="absolute left-4 top-4 inline-block bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                        Featured
                      </span>
                    </>
                  );
                })()}
              </>
            )}
          </div>
          <div className="flex flex-col justify-center bg-black/5 p-6 md:p-8">
            {blogs.length > 0 && (
              <>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/60">{blogs[0].category}</p>
                <h2 className="mt-3 text-2xl font-bold leading-tight tracking-wide md:text-3xl">
                  {blogs[0].title}
                </h2>
                <p className="mt-4 text-ink/65">{blogs[0].excerpt}</p>
                <div className="mt-6 flex flex-wrap gap-6 text-xs font-semibold text-ink/60 uppercase tracking-wide">
                  <span>
                    By {blogs[0].author}
                  </span>
                  <span>
                    {new Date(blogs[0].publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </span>
                  <span>{blogs[0].readTime} min read</span>
                </div>
                <a
                  href={`/blogs/${blogs[0].id}`}
                  className="mt-6 inline-flex w-fit items-center gap-2 bg-ink px-6 py-3 font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-80"
                >
                  Read Full Article
                  <span>→</span>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Blog Grid */}
        <div>
          <h3 className="mb-8 text-lg font-bold uppercase tracking-wide">More Stories</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.slice(1).map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
