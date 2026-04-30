import { products } from "@/lib/catalog";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Review } from "@/models/Review";
import { User } from "@/models/User";

export async function resolveProductId(input: string) {
  const dbProduct = await Product.findOne({ $or: [{ slug: input }, ...(input.match(/^[a-f\d]{24}$/i) ? [{ _id: input }] : [])] }).lean();
  if (dbProduct) return { productId: String(dbProduct._id), slug: dbProduct.slug, name: dbProduct.name };
  const staticProduct = products.find((product) => product.slug === input);
  return staticProduct ? { productId: staticProduct.slug, slug: staticProduct.slug, name: staticProduct.name } : null;
}

export async function hasVerifiedPurchase(userId: string, productId: string) {
  return Boolean(
    await Order.exists({
      user: userId,
      orderStatus: { $in: ["confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"] },
      $or: [{ "items.product": productId }, { "items.productName": new RegExp(productId.replace(/-/g, " "), "i") }]
    })
  );
}

export function spamScore(text: string) {
  const lower = text.toLowerCase();
  let score = 0;
  if ((lower.match(/https?:\/\//g) ?? []).length > 1) score += 50;
  if (/(viagra|casino|loan|crypto giveaway)/i.test(lower)) score += 50;
  if (text.length < 10) score += 25;
  return score;
}

export async function serializeReview(review: any) {
  const user = review.user?.name ? review.user : await User.findById(review.user).select("name avatar").lean();
  return {
    review_id: String(review._id),
    user_id: String(review.user?._id ?? review.user),
    user_name: user?.name ?? "Customer",
    user_avatar: user?.avatar ?? "",
    product_id: review.productId,
    rating: review.rating,
    title: review.title ?? "",
    description: review.comment,
    images: review.images ?? [],
    videos: review.videos ?? [],
    created_at: review.createdAt,
    verified_purchase: Boolean(review.verifiedPurchase),
    status: review.status,
    featured: Boolean(review.isFeatured),
    helpful_count: review.helpfulCount ?? 0,
    report_count: review.reports?.length ?? 0
  };
}

export function ratingSummary(reviews: Array<{ rating: number }>) {
  const total = reviews.length;
  const average = total ? reviews.reduce((sum, review) => sum + review.rating, 0) / total : 0;
  const breakdown = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length
  }));
  return { average, total, breakdown };
}
