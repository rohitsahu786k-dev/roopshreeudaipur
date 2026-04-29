"use client";

import Image from "next/image";
import { Camera, CheckCircle2, Star, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import { getProductReviews, getRatingBreakdown, type ProductReview } from "@/lib/reviews";

function stars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => (
    <Star key={index} size={15} fill={index < rating ? "currentColor" : "none"} className={index < rating ? "text-[#f6a400]" : "text-black/20"} />
  ));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

export function ProductReviews({ product }: { product: Product }) {
  const seedReviews = useMemo(() => getProductReviews(product), [product]);
  const [reviews, setReviews] = useState<ProductReview[]>(seedReviews);
  const [filter, setFilter] = useState<"all" | "images" | number>("all");
  const [form, setForm] = useState({ name: "", rating: 5, title: "", comment: "", image: "" });

  const visibleReviews = reviews.filter((review) => {
    if (filter === "all") return true;
    if (filter === "images") return review.images.length > 0;
    return review.rating === filter;
  });
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const breakdown = getRatingBreakdown(reviews);
  const imageReviews = reviews.flatMap((review) => review.images.map((image) => ({ image, review }))).slice(0, 8);

  function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name || !form.title || !form.comment) return;
    const newReview: ProductReview = {
      id: `local-${Date.now()}`,
      productSlug: product.slug,
      name: form.name,
      rating: form.rating,
      title: form.title,
      comment: form.comment,
      date: new Date().toISOString(),
      location: "India",
      verified: false,
      helpful: 0,
      images: form.image ? [form.image] : []
    };
    setReviews((current) => [newReview, ...current]);
    setForm({ name: "", rating: 5, title: "", comment: "", image: "" });
  }

  return (
    <section className="mt-12 bg-white p-5 md:p-7">
      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        <aside>
          <h2 className="text-lg font-semibold uppercase tracking-wide">Ratings & Reviews</h2>
          <div className="mt-5 flex items-center gap-4">
            <div className="grid h-24 w-24 place-items-center bg-primary text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">{average.toFixed(1)}</div>
                <div className="mt-1 flex justify-center">{stars(Math.round(average))}</div>
              </div>
            </div>
            <div>
              <p className="font-bold">{reviews.length} customer reviews</p>
              <p className="mt-1 text-sm text-ink/55">Verified boutique buyers and recent shoppers.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-2">
            {breakdown.map((item) => (
              <button key={item.rating} type="button" onClick={() => setFilter(item.rating)} className="grid grid-cols-[34px_1fr_34px] items-center gap-2 text-sm">
                <span className="font-semibold">{item.rating} star</span>
                <span className="h-2 overflow-hidden bg-neutral">
                  <span className="block h-full bg-[#f6a400]" style={{ width: `${(item.count / reviews.length) * 100}%` }} />
                </span>
                <span className="text-right text-ink/50">{item.count}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              ["all", "All"],
              ["images", "With Photos"],
              [5, "5 Star"],
              [4, "4 Star"]
            ].map(([value, label]) => (
              <button key={String(value)} type="button" onClick={() => setFilter(value as typeof filter)} className={`border px-3 py-2 text-xs font-bold uppercase tracking-wide ${filter === value ? "border-primary bg-primary text-white" : "border-black/15"}`}>
                {label}
              </button>
            ))}
          </div>

          {imageReviews.length ? (
            <div className="mt-6">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold"><Camera size={16} /> Customer Photos</p>
              <div className="grid grid-cols-4 gap-2">
                {imageReviews.map(({ image, review }, index) => (
                  <div key={`${review.id}-${index}`} className="relative aspect-square overflow-hidden bg-neutral">
                    <Image src={image} alt={review.title} fill className="object-cover" sizes="80px" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        <div>
          <form onSubmit={submitReview} className="mb-6 border border-black/10 bg-neutral p-4">
            <h3 className="text-sm font-bold uppercase tracking-wide">Write a review</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Your name" className="border border-black/15 px-3 py-3 text-sm" />
              <select value={form.rating} onChange={(event) => setForm((current) => ({ ...current, rating: Number(event.target.value) }))} className="border border-black/15 px-3 py-3 text-sm">
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} Star</option>)}
              </select>
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Review title" className="border border-black/15 px-3 py-3 text-sm md:col-span-2" />
              <textarea value={form.comment} onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))} placeholder="Share fit, fabric, delivery and styling feedback" rows={3} className="border border-black/15 px-3 py-3 text-sm md:col-span-2" />
              <input value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} placeholder="Optional image URL" className="border border-black/15 px-3 py-3 text-sm md:col-span-2" />
            </div>
            <button type="submit" className="mt-3 bg-ink px-5 py-3 text-sm font-bold uppercase tracking-wide text-white">Submit Review</button>
          </form>

          <div className="grid gap-4">
            {visibleReviews.map((review) => (
              <article key={review.id} className="border border-black/10 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1">{stars(review.rating)}</div>
                    <h3 className="mt-2 font-bold">{review.title}</h3>
                  </div>
                  <span className="text-xs text-ink/45">{formatDate(review.date)}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-ink/65">{review.comment}</p>
                {review.images.length ? (
                  <div className="mt-3 flex gap-2">
                    {review.images.map((image) => (
                      <div key={image} className="relative h-20 w-20 overflow-hidden bg-neutral">
                        <Image src={image} alt={review.title} fill className="object-cover" sizes="80px" />
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-ink/50">
                  <span className="font-semibold text-ink">{review.name}</span>
                  <span>{review.location}</span>
                  {review.size ? <span>Size: {review.size}</span> : null}
                  {review.verified ? <span className="inline-flex items-center gap-1 text-primary"><CheckCircle2 size={14} /> Verified Purchase</span> : null}
                  <span className="inline-flex items-center gap-1"><ThumbsUp size={14} /> {review.helpful} helpful</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
