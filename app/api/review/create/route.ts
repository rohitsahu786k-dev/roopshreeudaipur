import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { hasVerifiedPurchase, resolveProductId, serializeReview, spamScore } from "@/lib/reviewService";
import { Review } from "@/models/Review";

const requireVerifiedPurchase = process.env.REVIEWS_REQUIRE_VERIFIED_PURCHASE !== "false";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication is required" }, { status: 401 });

    const payload = await request.json();
    const product = await resolveProductId(String(payload.product_id ?? payload.productId ?? ""));
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const rating = Number(payload.rating);
    const description = String(payload.description ?? payload.comment ?? "").trim();
    if (rating < 1 || rating > 5) return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    if (description.length < 10) return NextResponse.json({ error: "Review text must be at least 10 characters" }, { status: 400 });

    await connectToDatabase();
    const verifiedPurchase = await hasVerifiedPurchase(user.id, product.productId);
    if (requireVerifiedPurchase && !verifiedPurchase) {
      return NextResponse.json({ error: "Only verified buyers can review this product" }, { status: 403 });
    }

    const score = spamScore(`${payload.title ?? ""} ${description}`);
    const review = await Review.create({
      productId: product.productId,
      user: user.id,
      rating,
      title: String(payload.title ?? "").trim(),
      comment: description,
      images: Array.isArray(payload.images) ? payload.images.slice(0, 6) : [],
      videos: Array.isArray(payload.videos) ? payload.videos.slice(0, 2) : [],
      verifiedPurchase,
      spamScore: score,
      status: score >= 50 ? "rejected" : "pending",
      isApproved: false
    });

    return NextResponse.json({ review: await serializeReview(review), message: "Review submitted for moderation." }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create review";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
