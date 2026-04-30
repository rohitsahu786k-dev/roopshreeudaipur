"use client";

import Image from "next/image";
import { Camera, CheckCircle2, Flag, Star, ThumbsUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import { getProductReviews, getRatingBreakdown, type ProductReview } from "@/lib/reviews";

type ApiReview = {
  review_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title: string;
  description: string;
  images: string[];
  videos: string[];
  created_at: string;
  verified_purchase: boolean;
  helpful_count: number;
};

type Summary = {
  average: number;
  total: number;
  breakdown: { rating: number; count: number }[];
};

function stars(rating: number, interactive = false, onSelect?: (rating: number) => void) {
  return Array.from({ length: 5 }, (_, index) => (
    <button
      key={index}
      type="button"
      disabled={!interactive}
      onClick={() => onSelect?.(index + 1)}
      className={interactive ? "focus-ring rounded" : "pointer-events-none"}
      aria-label={`${index + 1} star`}
    >
      <Star size={16} fill={index < rating ? "currentColor" : "none"} className={index < rating ? "text-[#f6a400]" : "text-black/20"} />
    </button>
  ));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

function fallbackToApi(review: ProductReview): ApiReview {
  return {
    review_id: review.id,
    user_name: review.name,
    rating: review.rating,
    title: review.title,
    description: review.comment,
    images: review.images,
    videos: [],
    created_at: review.date,
    verified_purchase: review.verified,
    helpful_count: review.helpful
  };
}

export function ProductReviews({ product }: { product: Product }) {
  const seedReviews = useMemo(() => getProductReviews(product).map(fallbackToApi), [product]);
  const [reviews, setReviews] = useState<ApiReview[]>(seedReviews);
  const [summary, setSummary] = useState<Summary>(() => ({
    average: seedReviews.reduce((sum, review) => sum + review.rating, 0) / seedReviews.length,
    total: seedReviews.length,
    breakdown: getRatingBreakdown(getProductReviews(product))
  }));
  const [ratingFilter, setRatingFilter] = useState("");
  const [withImages, setWithImages] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState("latest");
  const [form, setForm] = useState({ rating: 5, title: "", description: "", images: "", videos: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadReviews() {
    setLoading(true);
    const params = new URLSearchParams({ product_id: product.slug, sort });
    if (ratingFilter) params.set("rating", ratingFilter);
    if (withImages) params.set("withImages", "true");
    if (verifiedOnly) params.set("verified", "true");
    const response = await fetch(`/api/reviews?${params.toString()}`, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setReviews(data.reviews?.length ? data.reviews : seedReviews);
      setSummary(data.summary ?? summary);
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadReviews();
  }, [product.slug, ratingFilter, sort, verifiedOnly, withImages]);

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (form.description.trim().length < 10) {
      setMessage("Review text must be at least 10 characters.");
      return;
    }

    const images = form.images.split(",").map((item) => item.trim()).filter(Boolean);
    const videos = form.videos.split(",").map((item) => item.trim()).filter(Boolean);
    const response = await fetch("/api/review/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: product.slug, ...form, images, videos })
    });
    const data = await response.json();
    setMessage(response.ok ? data.message : data.error);
    if (response.ok) {
      setForm({ rating: 5, title: "", description: "", images: "", videos: "" });
      await loadReviews();
    }
  }

  async function helpful(reviewId: string) {
    const response = await fetch("/api/review/helpful", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review_id: reviewId })
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      setReviews((current) => current.map((review) => review.review_id === reviewId ? { ...review, helpful_count: data.helpful_count } : review));
    } else {
      setMessage(data.error ?? "Sign in to mark reviews helpful.");
    }
  }

  async function report(reviewId: string) {
    const response = await fetch("/api/review/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review_id: reviewId, reason: "Reported from PDP" })
    });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? "Review reported for moderation." : data.error ?? "Unable to report review.");
  }

  const imageReviews = reviews.flatMap((review) => review.images.map((image) => ({ image, review }))).slice(0, 8);

  return (
    <section className="mt-12 bg-white p-5 md:p-7">
      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        <aside>
          <h2 className="text-lg font-semibold uppercase tracking-wide">Ratings & Reviews</h2>
          <div className="mt-5 flex items-center gap-4">
            <div className="grid h-24 w-24 place-items-center bg-primary text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">{summary.average.toFixed(1)}</div>
                <div className="mt-1 flex justify-center">{stars(Math.round(summary.average))}</div>
              </div>
            </div>
            <div>
              <p className="font-bold">{summary.total} customer reviews</p>
              <p className="mt-1 text-sm text-ink/55">Verified buyers and moderated shopper feedback.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-2">
            {summary.breakdown.map((item) => (
              <button key={item.rating} type="button" onClick={() => setRatingFilter(String(item.rating))} className="grid grid-cols-[34px_1fr_34px] items-center gap-2 text-sm">
                <span className="font-semibold">{item.rating} star</span>
                <span className="h-2 overflow-hidden bg-neutral">
                  <span className="block h-full bg-[#f6a400]" style={{ width: `${summary.total ? (item.count / summary.total) * 100 : 0}%` }} />
                </span>
                <span className="text-right text-ink/50">{item.count}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-2">
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="focus-ring border border-black/15 px-3 py-2 text-sm">
              <option value="latest">Latest</option>
              <option value="highest">Highest rating</option>
              <option value="lowest">Lowest rating</option>
              <option value="helpful">Most helpful</option>
            </select>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setRatingFilter("")} className="border border-black/15 px-3 py-2 text-xs font-bold uppercase">All</button>
              <button type="button" onClick={() => setWithImages((value) => !value)} className={`border px-3 py-2 text-xs font-bold uppercase ${withImages ? "border-primary bg-primary text-white" : "border-black/15"}`}>With media</button>
              <button type="button" onClick={() => setVerifiedOnly((value) => !value)} className={`border px-3 py-2 text-xs font-bold uppercase ${verifiedOnly ? "border-primary bg-primary text-white" : "border-black/15"}`}>Verified</button>
            </div>
          </div>

          {imageReviews.length ? (
            <div className="mt-6">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold"><Camera size={16} /> Review Gallery</p>
              <div className="grid grid-cols-4 gap-2">
                {imageReviews.map(({ image, review }, index) => (
                  <div key={`${review.review_id}-${index}`} className="relative aspect-square overflow-hidden bg-neutral">
                    <Image src={image} alt={review.title || "Review media"} fill className="object-cover" sizes="80px" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        <div>
          <form onSubmit={submitReview} className="mb-6 border border-black/10 bg-neutral p-4">
            <h3 className="text-sm font-bold uppercase tracking-wide">Write a review</h3>
            <div className="mt-3 flex gap-1">{stars(form.rating, true, (rating) => setForm((current) => ({ ...current, rating })))}</div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Review title" className="focus-ring border border-black/15 px-3 py-3 text-sm md:col-span-2" />
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Share fit, fabric, delivery and styling feedback" rows={3} className="focus-ring border border-black/15 px-3 py-3 text-sm md:col-span-2" />
              <input value={form.images} onChange={(event) => setForm((current) => ({ ...current, images: event.target.value }))} placeholder="Image URLs, comma separated" className="focus-ring border border-black/15 px-3 py-3 text-sm" />
              <input value={form.videos} onChange={(event) => setForm((current) => ({ ...current, videos: event.target.value }))} placeholder="Video URLs, comma separated" className="focus-ring border border-black/15 px-3 py-3 text-sm" />
            </div>
            <button type="submit" className="mt-3 bg-ink px-5 py-3 text-sm font-bold uppercase tracking-wide text-white">Submit Review</button>
            {message ? <p className="mt-3 text-sm font-semibold text-primary">{message}</p> : null}
          </form>

          {loading ? <div className="border border-black/10 p-6 text-center text-sm text-ink/60">Loading reviews...</div> : null}
          <div className="grid gap-4">
            {reviews.map((review) => (
              <article key={review.review_id} className="border border-black/10 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1">{stars(review.rating)}</div>
                    <h3 className="mt-2 font-bold">{review.title || "Customer review"}</h3>
                  </div>
                  <span className="text-xs text-ink/45">{formatDate(review.created_at)}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-ink/65">{review.description}</p>
                {review.images.length || review.videos.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.images.map((image) => (
                      <div key={image} className="relative h-20 w-20 overflow-hidden bg-neutral">
                        <Image src={image} alt={review.title || "Review image"} fill className="object-cover" sizes="80px" />
                      </div>
                    ))}
                    {review.videos.map((video) => <a key={video} href={video} target="_blank" className="grid h-20 w-20 place-items-center bg-black text-xs font-bold uppercase text-white">Video</a>)}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-ink/50">
                  <span className="font-semibold text-ink">{review.user_name}</span>
                  {review.verified_purchase ? <span className="inline-flex items-center gap-1 text-primary"><CheckCircle2 size={14} /> Verified Purchase</span> : null}
                  <button type="button" onClick={() => helpful(review.review_id)} className="inline-flex items-center gap-1 hover:text-primary"><ThumbsUp size={14} /> Helpful ({review.helpful_count})</button>
                  <button type="button" onClick={() => report(review.review_id)} className="inline-flex items-center gap-1 hover:text-red-700"><Flag size={14} /> Report</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
