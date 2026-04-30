import { AdminWorkingPage } from "@/components/admin/AdminWorkingPage";
import { requireRole } from "@/lib/auth";

export default async function Page() {
  await requireRole(["admin"]);
  return <AdminWorkingPage title="Upsell Rules" description="Configure cross-sell and recommendation placements using catalog attributes, cart data, and wishlist signals." actions={[{ label: "Products", href: "/admin/products" }, { label: "Analytics", href: "/admin/analytics" }]} />;
}
