import { requireRole } from "@/lib/auth";
import DiscountsClient from "@/components/admin/discounts/DiscountsClient";

export const metadata = { title: "Discounts — Admin" };

export default async function DiscountsPage() {
  await requireRole(["admin"]);
  return <DiscountsClient />;
}
