import { AdminWorkingPage } from "@/components/admin/AdminWorkingPage";
import { requireRole } from "@/lib/auth";

export default async function Page() {
  await requireRole(["admin"]);
  return <AdminWorkingPage title="Staff & Roles" description="Review admin, manager, and staff access for operational users." actions={[{ label: "Customers", href: "/admin/customers" }]} />;
}
