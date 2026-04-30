"use client";

import { useEffect, useState } from "react";
import { Check, Star, Trash2, X } from "lucide-react";

type Review = {
  review_id: string;
  user_name: string;
  product_id: string;
  rating: number;
  title: string;
  description: string;
  status: string;
  verified_purchase: boolean;
  helpful_count: number;
  report_count: number;
  featured: boolean;
};

export default function ReviewsModerationClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState("pending");
  const [reported, setReported] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (reported) params.set("reported", "true");
    const response = await fetch(`/api/admin/reviews?${params.toString()}`);
    const data = await response.json();
    setReviews(data.reviews ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [status, reported]);

  async function update(id: string, payload: Record<string, unknown>) {
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Review Moderation</h1>
          <p className="mt-1 text-sm text-gray-500">Approve, reject, feature, delete, and inspect reported reviews.</p>
        </div>
        <div className="flex gap-2">
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
            <input type="checkbox" checked={reported} onChange={(event) => setReported(event.target.checked)} />
            Reported
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? <div className="p-10 text-center text-sm text-gray-500">Loading reviews...</div> : null}
        {!loading && reviews.length === 0 ? <div className="p-10 text-center text-sm text-gray-500">No reviews found.</div> : null}
        {reviews.map((review) => (
          <article key={review.review_id} className="border-b border-gray-100 p-4 last:border-b-0">
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <div>
                <div className="flex items-center gap-1 text-yellow-500">
                  {Array.from({ length: 5 }, (_, index) => <Star key={index} className="h-4 w-4" fill={index < review.rating ? "currentColor" : "none"} />)}
                </div>
                <h2 className="mt-2 font-bold text-gray-900">{review.title || "Customer review"}</h2>
                <p className="mt-1 text-sm text-gray-600">{review.description}</p>
                <p className="mt-2 text-xs text-gray-500">{review.user_name} · {review.product_id} · {review.status} · {review.report_count} reports · {review.helpful_count} helpful</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-start gap-2">
                <button onClick={() => update(review.review_id, { status: "approved" })} className="rounded bg-green-600 px-3 py-2 text-xs font-bold uppercase text-white"><Check className="inline h-3 w-3" /> Approve</button>
                <button onClick={() => update(review.review_id, { status: "rejected" })} className="rounded bg-gray-800 px-3 py-2 text-xs font-bold uppercase text-white"><X className="inline h-3 w-3" /> Reject</button>
                <button onClick={() => update(review.review_id, { isFeatured: !review.featured })} className="rounded border border-gray-200 px-3 py-2 text-xs font-bold uppercase">{review.featured ? "Unfeature" : "Feature"}</button>
                <button onClick={() => remove(review.review_id)} className="rounded border border-red-200 p-2 text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
