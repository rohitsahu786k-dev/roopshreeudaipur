import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Review } from "@/models/Review";

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  const payload = await request.json();
  await connectToDatabase();
  const review = await Review.findOne({ _id: payload.review_id, user: user.id });
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
  if (Date.now() - +new Date(review.createdAt) > 1000 * 60 * 60 * 24) {
    return NextResponse.json({ error: "Review edit window has expired" }, { status: 400 });
  }
  review.title = String(payload.title ?? review.title ?? "");
  review.comment = String(payload.description ?? review.comment);
  review.status = "pending";
  review.isApproved = false;
  await review.save();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  const reviewId = request.nextUrl.searchParams.get("review_id");
  await connectToDatabase();
  const review = await Review.findOne({ _id: reviewId, user: user.id });
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
  await review.deleteOne();
  return NextResponse.json({ ok: true });
}
