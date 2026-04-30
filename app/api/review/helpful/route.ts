import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Review } from "@/models/Review";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication is required" }, { status: 401 });

  const { review_id } = await request.json();
  await connectToDatabase();
  const review = await Review.findById(review_id);
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
  if (!review.helpfulUsers.some((id) => String(id) === user.id)) {
    review.helpfulUsers.push(user.id as any);
    review.helpfulCount += 1;
    await review.save();
  }
  return NextResponse.json({ helpful_count: review.helpfulCount });
}
