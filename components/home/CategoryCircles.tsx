"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Category = {
  name: string;
  slug: string;
  image: string;
  description?: string;
};

const fallbackCategories: Category[] = [
  { name: "Lehengas", slug: "lehenga", image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=400&q=80" },
  { name: "Kurta Sets", slug: "kurta-set", image: "https://images.unsplash.com/photo-1610189017773-29214c0f9e40?auto=format&fit=crop&w=400&q=80" },
  { name: "Sarees", slug: "saree", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=400&q=80" },
  { name: "Sharara Sets", slug: "sharara-set", image: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=400&q=80" },
  { name: "Anarkalis", slug: "anarkali", image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=400&q=80" },
  { name: "Ladies Suits", slug: "ladies-suit", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80" },
  { name: "Gowns", slug: "gown", image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=400&q=80" },
  { name: "Rajputi Poshak", slug: "rajputi-poshak", image: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=400&q=80" }
];

export function CategoryCircles() {
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.categories?.length) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="border-b border-black/8 bg-white">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-4 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-5 sm:px-5 lg:justify-center lg:gap-8 lg:py-5"
      >
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/shop?category=${cat.slug}`}
            className="group flex flex-shrink-0 flex-col items-center gap-2"
          >
            {/* Circle image */}
            <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-transparent bg-neutral ring-1 ring-black/10 transition-all duration-300 group-hover:border-ink group-hover:ring-ink sm:h-20 sm:w-20">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="80px"
              />
            </div>
            {/* Label */}
            <span className="max-w-[72px] text-center text-[10px] font-semibold uppercase leading-tight tracking-wide text-ink/70 transition group-hover:text-ink sm:max-w-[80px] sm:text-[11px]">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
