import { requireRole } from "@/lib/auth";
import ReviewsModerationClient from "@/components/admin/reviews/ReviewsModerationClient";

export default async function AdminReviewsPage() {
  await requireRole(["admin"]);
  return <ReviewsModerationClient />;
}
