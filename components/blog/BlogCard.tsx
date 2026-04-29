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
    <article className="group overflow-hidden bg-white border border-black/10">
      {/* Image Container */}
      <div className="relative aspect-[16/9] overflow-hidden bg-black/5">
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        {/* Category Badge */}
        <span className="absolute left-4 top-4 inline-block bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          {blog.category}
        </span>
      </div>

      {/* Content Container */}
      <div className="p-5 md:p-6">
        {/* Meta Information */}
        <div className="flex flex-wrap gap-4 text-xs font-semibold text-ink/60 uppercase tracking-wide">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{publishDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{blog.readTime} min read</span>
          </div>
          <div className="flex items-center gap-1">
            <User size={14} />
            <span>{blog.author}</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="mt-4">
          <Link
            href={`/blogs/${blog.id}`}
            className="block text-lg font-bold leading-tight tracking-wide text-ink transition-colors hover:text-primary md:text-xl"
          >
            {blog.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink/65">
          {blog.excerpt}
        </p>

        {/* Read More Link */}
        <Link
          href={`/blogs/${blog.id}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ink transition-colors hover:text-primary"
        >
          Read Article
          <span>→</span>
        </Link>
      </div>
    </article>
  );
}
