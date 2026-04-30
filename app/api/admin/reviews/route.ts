import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeReview } from "@/lib/reviewService";
import { Review } from "@/models/Review";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  await connectToDatabase();
  const status = request.nextUrl.searchParams.get("status");
  const reported = request.nextUrl.searchParams.get("reported") === "true";
  const query: Record<string, unknown> = {};
  if (status) query.status = status;
  if (reported) query["reports.0"] = { $exists: true };

  const reviews = await Review.find(query).populate("user", "name avatar").sort({ createdAt: -1 }).limit(100).lean();
  return NextResponse.json({ reviews: await Promise.all(reviews.map(serializeReview)) });
}
