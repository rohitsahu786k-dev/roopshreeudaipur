import { AdminWorkingPage } from "@/components/admin/AdminWorkingPage";
import { requireRole } from "@/lib/auth";

export default async function Page() {
  await requireRole(["admin"]);
  return <AdminWorkingPage title="Shipping Zones & Rates" description="Configure domestic and international shipping rules from store settings." actions={[{ label: "Store Settings", href: "/admin/settings" }, { label: "Shiprocket", href: "/admin/shipping/shiprocket" }]} />;
}
