import { notFound } from "next/navigation";
import { blogs } from "@/lib/blogs";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Calendar, User, Clock } from "lucide-react";

export async function generateStaticParams() {
  return blogs.map((blog) => ({
    slug: blog.id,
  }));
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = blogs.find((b) => b.id === params.slug);

  if (!blog) {
    notFound();
  }

  return (
    <article className="bg-white pb-20">
      <div className="relative h-[400px] w-full md:h-[500px]">
        <img
          src={blog.image}
          alt={blog.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="max-w-4xl text-center text-white">
            <Link href="/blogs" className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide hover:underline">
              <ChevronLeft size={16} /> Back to Blogs
            </Link>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em]">{blog.category}</p>
            <h1 className="text-3xl font-bold uppercase tracking-wide md:text-5xl lg:text-6xl">
              {blog.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-3xl px-4">
        <div className="mb-10 flex flex-wrap items-center justify-center gap-6 border-b border-gray-100 pb-8 text-xs font-bold uppercase tracking-widest text-gray-500">
          <div className="flex items-center gap-2">
            <User size={14} className="text-primary" />
            <span>By {blog.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-primary" />
            <span>{new Date(blog.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            <span>{blog.readTime} min read</span>
          </div>
        </div>

        <div className="prose prose-lg prose-gray max-w-none prose-headings:uppercase prose-headings:tracking-wide prose-img:rounded-xl">
          {blog.content.split('\n\n').map((para, i) => (
            <p key={i} className="mb-6 text-lg leading-relaxed text-gray-700">
              {para.startsWith('**') ? (
                <strong className="block text-xl font-bold text-gray-900 mt-8 mb-4">{para.replace(/\*\*/g, '')}</strong>
              ) : (
                para.startsWith('-') ? (
                  <span className="block ml-4 mb-2">• {para.substring(1).trim()}</span>
                ) : para
              )}
            </p>
          ))}
        </div>

        <div className="mt-20 border-t border-gray-100 pt-10 text-center">
          <h3 className="mb-6 text-xl font-bold uppercase tracking-wide">Share this article</h3>
          <div className="flex justify-center gap-4">
            {['Twitter', 'Facebook', 'WhatsApp', 'Pinterest'].map((platform) => (
              <button key={platform} className="rounded-full border border-gray-200 px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-50">
                {platform}
              </button>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
