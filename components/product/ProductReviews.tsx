"use client";

import Image from "next/image";
import { Camera, CheckCircle2, ChevronDown, Flag, Star, ThumbsUp } from "lucide-react";
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

const REVIEWS_PER_PAGE = 5;

function StarRow({ rating, interactive = false, size = 16, onSelect }: {
  rating: number;
  interactive?: boolean;
  size?: number;
  onSelect?: (r: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onSelect?.(i + 1)}
          className={`flex-shrink-0 ${interactive ? "cursor-pointer focus:outline-none" : "pointer-events-none"}`}
          aria-label={`${i + 1} star`}
        >
          <Star
            size={size}
            fill={i < rating ? "currentColor" : "none"}
            className={i < rating ? "text-[#f6a400]" : "text-black/20"}
          />
        </button>
      ))}
    </div>
  );
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
    average: seedReviews.length ? seedReviews.reduce((s, r) => s + r.rating, 0) / seedReviews.length : 0,
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
  const [showAll, setShowAll] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const visibleReviews = showAll ? reviews : reviews.slice(0, REVIEWS_PER_PAGE);

  async function loadReviews() {
    setLoading(true);
    const params = new URLSearchParams({ product_id: product.slug, sort });
    if (ratingFilter) params.set("rating", ratingFilter);
    if (withImages) params.set("withImages", "true");
    if (verifiedOnly) params.set("verified", "true");
    try {
      const response = await fetch(`/api/reviews?${params.toString()}`, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews?.length ? data.reviews : seedReviews);
        if (data.summary) setSummary(data.summary);
      }
    } catch {
      // use seed reviews
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug, ratingFilter, sort, verifiedOnly, withImages]);

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (form.description.trim().length < 10) {
      setMessage("Review text must be at least 10 characters.");
      return;
    }
    const images = form.images.split(",").map((s) => s.trim()).filter(Boolean);
    const videos = form.videos.split(",").map((s) => s.trim()).filter(Boolean);
    const response = await fetch("/api/review/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: product.slug, ...form, images, videos })
    });
    const data = await response.json();
    setMessage(response.ok ? data.message : data.error);
    if (response.ok) {
      setForm({ rating: 5, title: "", description: "", images: "", videos: "" });
      setFormOpen(false);
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
      setReviews((curr) => curr.map((r) => r.review_id === reviewId ? { ...r, helpful_count: data.helpful_count } : r));
    } else {
      setMessage(data.error ?? "Sign in to mark reviews helpful.");
    }
  }

  async function report(reviewId: string) {
    const response = await fetch("/api/review/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review_id: reviewId, reason: "Reported from product page" })
    });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? "Review reported." : data.error ?? "Unable to report.");
  }

  const imageReviews = reviews.flatMap((r) => r.images.map((img) => ({ img, review: r }))).slice(0, 8);

  return (
    <section className="mt-8 bg-white">
      <div className="border-b border-black/8 px-4 py-5 sm:px-6">
        <h2 className="text-base font-bold uppercase tracking-wide sm:text-lg">Ratings &amp; Reviews</h2>
      </div>

      {/* Summary + Filters — stacked on mobile, side by side on lg */}
      <div className="px-4 py-5 sm:px-6 lg:grid lg:grid-cols-[300px_1fr] lg:gap-10">

        {/* LEFT: Summary */}
        <aside className="mb-6 lg:mb-0">
          {/* Big score */}
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 flex-col items-center justify-center bg-ink text-white sm:h-24 sm:w-24">
              <span className="text-3xl font-bold leading-none sm:text-4xl">{summary.average.toFixed(1)}</span>
              <div className="mt-1.5">
                <StarRow rating={Math.round(summary.average)} size={12} />
              </div>
            </div>
            <div>
              <p className="font-bold">{summary.total} reviews</p>
              <p className="mt-1 text-xs text-ink/50">Verified buyers &amp; moderated feedback</p>
            </div>
          </div>

          {/* Rating bars */}
          <div className="mt-5 grid gap-2">
            {summary.breakdown.map((item) => (
              <button
                key={item.rating}
                type="button"
                onClick={() => setRatingFilter(ratingFilter === String(item.rating) ? "" : String(item.rating))}
                className={`flex items-center gap-2 text-xs transition ${ratingFilter === String(item.rating) ? "text-primary" : "hover:text-primary"}`}
              >
                <span className="w-10 text-right font-semibold">{item.rating} ★</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-black/8">
                  <span
                    className="block h-full rounded-full bg-[#f6a400] transition-all duration-500"
                    style={{ width: `${summary.total ? (item.count / summary.total) * 100 : 0}%` }}
                  />
                </span>
                <span className="w-6 text-left text-ink/40">{item.count}</span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="mt-5 flex flex-wrap gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded border border-black/15 px-3 py-1.5 text-xs focus:outline-none"
            >
              <option value="latest">Latest</option>
              <option value="highest">Highest</option>
              <option value="lowest">Lowest</option>
              <option value="helpful">Most Helpful</option>
            </select>
            <button
              type="button"
              onClick={() => setRatingFilter("")}
              className={`rounded border px-3 py-1.5 text-xs font-semibold uppercase ${!ratingFilter ? "border-ink bg-ink text-white" : "border-black/15"}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setWithImages((v) => !v)}
              className={`rounded border px-3 py-1.5 text-xs font-semibold uppercase ${withImages ? "border-primary bg-primary text-white" : "border-black/15"}`}
            >
              With Photos
            </button>
            <button
              type="button"
              onClick={() => setVerifiedOnly((v) => !v)}
              className={`rounded border px-3 py-1.5 text-xs font-semibold uppercase ${verifiedOnly ? "border-primary bg-primary text-white" : "border-black/15"}`}
            >
              Verified
            </button>
          </div>

          {/* Review gallery */}
          {imageReviews.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                <Camera size={14} /> Review Photos
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {imageReviews.map(({ img, review }, i) => (
                  <div key={`${review.review_id}-${i}`} className="relative aspect-square overflow-hidden bg-neutral">
                    <Image src={img} alt="Review photo" fill className="object-cover" sizes="64px" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* RIGHT: Reviews list + form */}
        <div>
          {/* Write review toggle */}
          <button
            type="button"
            onClick={() => setFormOpen((v) => !v)}
            className="mb-4 flex w-full items-center justify-between border border-black/15 px-4 py-3 text-sm font-bold uppercase tracking-wide hover:bg-neutral"
          >
            Write a Review
            <ChevronDown size={16} className={`transition-transform ${formOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Review form */}
          {formOpen && (
            <form onSubmit={submitReview} className="mb-6 border border-black/10 bg-neutral p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink/60">Your Rating</p>
              <StarRow rating={form.rating} interactive size={22} onSelect={(r) => setForm((curr) => ({ ...curr, rating: r }))} />
              <div className="mt-4 grid gap-3">
                <input
                  value={form.title}
                  onChange={(e) => setForm((curr) => ({ ...curr, title: e.target.value }))}
                  placeholder="Review title"
                  className="border border-black/15 bg-white px-3 py-2.5 text-sm focus:outline-none"
                />
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((curr) => ({ ...curr, description: e.target.value }))}
                  placeholder="Share your experience — fit, fabric, delivery and styling"
                  rows={3}
                  className="border border-black/15 bg-white px-3 py-2.5 text-sm focus:outline-none"
                />
              </div>
              {message && <p className="mt-3 text-sm font-semibold text-primary">{message}</p>}
              <button type="submit" className="mt-3 bg-ink px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-ink/85">
                Submit Review
              </button>
            </form>
          )}

          {/* Loading */}
          {loading && (
            <div className="py-8 text-center text-sm text-ink/50">Loading reviews…</div>
          )}

          {/* Review cards */}
          <div className="grid gap-3">
            {visibleReviews.map((review) => (
              <article key={review.review_id} className="border border-black/10 p-4">
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <StarRow rating={review.rating} size={14} />
                    <h3 className="mt-1.5 text-sm font-bold leading-snug">{review.title || "Customer Review"}</h3>
                  </div>
                  <span className="shrink-0 text-[11px] text-ink/40">{formatDate(review.created_at)}</span>
                </div>

                {/* Body */}
                <p className="mt-2.5 text-sm leading-6 text-ink/65">{review.description}</p>

                {/* Media */}
                {(review.images.length > 0 || review.videos.length > 0) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.images.map((img) => (
                      <div key={img} className="relative h-16 w-16 overflow-hidden bg-neutral sm:h-20 sm:w-20">
                        <Image src={img} alt="Review" fill className="object-cover" sizes="80px" />
                      </div>
                    ))}
                    {review.videos.map((vid) => (
                      <a key={vid} href={vid} target="_blank" rel="noreferrer" className="flex h-16 w-16 items-center justify-center bg-black text-[10px] font-bold uppercase text-white sm:h-20 sm:w-20">
                        Video
                      </a>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px]">
                  <span className="font-semibold text-ink">{review.user_name}</span>
                  {review.verified_purchase && (
                    <span className="flex items-center gap-1 text-green-700">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  )}
                  <button type="button" onClick={() => helpful(review.review_id)} className="flex items-center gap-1 text-ink/50 hover:text-primary">
                    <ThumbsUp size={12} /> Helpful ({review.helpful_count})
                  </button>
                  <button type="button" onClick={() => report(review.review_id)} className="flex items-center gap-1 text-ink/40 hover:text-red-600">
                    <Flag size={12} /> Report
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* No reviews state */}
          {!loading && reviews.length === 0 && (
            <div className="border border-black/10 p-8 text-center">
              <p className="text-sm font-semibold text-ink/50">No reviews yet. Be the first to review!</p>
            </div>
          )}

          {/* View All / Show Less */}
          {reviews.length > REVIEWS_PER_PAGE && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-4 flex w-full items-center justify-center gap-2 border border-black/15 px-5 py-3 text-sm font-bold uppercase tracking-wide hover:bg-neutral"
            >
              {showAll ? (
                <>Show Less</>
              ) : (
                <>View All {reviews.length} Reviews <ChevronDown size={16} /></>
              )}
            </button>
          )}

          {message && !formOpen && (
            <p className="mt-3 text-sm font-semibold text-primary">{message}</p>
          )}
        </div>
      </div>
    </section>
  );
}
