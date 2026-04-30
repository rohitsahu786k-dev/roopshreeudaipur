import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Review } from "@/models/Review";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication is required" }, { status: 401 });

  const { review_id, reason } = await request.json();
  await connectToDatabase();
  const review = await Review.findById(review_id);
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
  review.reports.push({ user: user.id as any, reason: String(reason ?? "Reported by customer") });
  await review.save();
  return NextResponse.json({ ok: true });
}
