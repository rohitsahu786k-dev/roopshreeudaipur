import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Review } from "@/models/Review";

type Context = { params: { id: string } };

export async function PATCH(request: NextRequest, { params }: Context) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const payload = await request.json();
  await connectToDatabase();
  const updates: Record<string, unknown> = {};
  if (payload.status) {
    updates.status = payload.status;
    updates.isApproved = payload.status === "approved";
  }
  if (typeof payload.isFeatured === "boolean") updates.isFeatured = payload.isFeatured;
  const review = await Review.findByIdAndUpdate(params.id, updates, { new: true });
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
  return NextResponse.json({ review });
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  await connectToDatabase();
  await Review.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
