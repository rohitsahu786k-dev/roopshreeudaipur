import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ratingSummary, resolveProductId, serializeReview } from "@/lib/reviewService";
import { Review } from "@/models/Review";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const params = request.nextUrl.searchParams;
    const productInput = params.get("product_id") ?? params.get("productId") ?? "";
    const product = await resolveProductId(productInput);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const query: Record<string, unknown> = { productId: product.productId, status: "approved" };
    const rating = Number(params.get("rating"));
    if (rating >= 1 && rating <= 5) query.rating = rating;
    if (params.get("withImages") === "true") query.images = { $exists: true, $ne: [] };
    if (params.get("verified") === "true") query.verifiedPurchase = true;

    const sort = params.get("sort") ?? "latest";
    const sortQuery =
      sort === "highest" ? { rating: -1, createdAt: -1 } :
      sort === "lowest" ? { rating: 1, createdAt: -1 } :
      sort === "helpful" ? { helpfulCount: -1, createdAt: -1 } :
      { createdAt: -1 };

    const reviews = await Review.find(query).populate("user", "name avatar").sort(sortQuery as any).limit(50).lean();
    const allApproved = await Review.find({ productId: product.productId, status: "approved" }).select("rating").lean();

    return NextResponse.json({
      product,
      summary: ratingSummary(allApproved),
      reviews: await Promise.all(reviews.map(serializeReview))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load reviews";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
