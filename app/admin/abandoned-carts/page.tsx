import { AdminWorkingPage } from "@/components/admin/AdminWorkingPage";
import { requireRole } from "@/lib/auth";

export default async function Page() {
  await requireRole(["admin"]);
  return <AdminWorkingPage title="Abandoned Carts" description="Monitor active carts, recovery status, and remarketing opportunities." actions={[{ label: "Cart Analytics", href: "/admin/analytics" }]} />;
}
