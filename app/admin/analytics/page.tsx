import { requireRole } from "@/lib/auth";
import AnalyticsClient from "@/components/admin/analytics/AnalyticsClient";

export const metadata = { title: "Analytics — Admin" };

export default async function AnalyticsPage() {
  await requireRole(["admin"]);
  return <AnalyticsClient />;
}
