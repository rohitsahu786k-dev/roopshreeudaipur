import { AdminWorkingPage } from "@/components/admin/AdminWorkingPage";
import { requireRole } from "@/lib/auth";

export default async function Page() {
  await requireRole(["admin"]);
  return <AdminWorkingPage title="Collections" description="Group products into storefront collections and campaign edits." actions={[{ label: "Products", href: "/admin/products" }, { label: "Attributes", href: "/admin/attributes" }]} />;
}
