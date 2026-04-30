"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, User } from "lucide-react";
import type { BlogPost } from "@/lib/blogs";

export function BlogCard({ blog }: { blog: BlogPost }) {
  const publishDate = new Date(blog.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <article className="group relative flex flex-col overflow-hidden bg-white transition-all duration-300 hover:shadow-2xl hover:shadow-black/5">
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-black/5">
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        {/* Category Badge */}
        <span className="absolute left-0 top-6 inline-block bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white">
          {blog.category}
        </span>
      </div>

      {/* Content Container */}
      <div className="flex flex-1 flex-col p-6 md:p-8">
        {/* Meta Information */}
        <div className="mb-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-ink/40">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-primary" />
            <span>{publishDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-primary" />
            <span>{blog.readTime} min</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-4">
          <Link
            href={`/blogs/${blog.id}`}
            className="block text-xl font-bold leading-[1.3] tracking-wide text-ink transition-colors group-hover:text-primary lg:text-2xl"
          >
            {blog.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="mb-8 line-clamp-3 text-sm leading-relaxed text-ink/60">
          {blog.excerpt}
        </p>

        {/* Read More Link */}
        <div className="mt-auto">
          <Link
            href={`/blogs/${blog.id}`}
            className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-ink transition-all hover:gap-5"
          >
            Read Article
            <span className="h-[1px] w-8 bg-ink group-hover:bg-primary" />
          </Link>
        </div>
      </div>
    </article>
  );
}
