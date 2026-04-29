import { requireRole } from "@/lib/auth";
import PagesClient from "@/components/admin/content/PagesClient";

export const metadata = { title: "Pages - Admin" };

export default async function PagesAdminPage() {
  await requireRole(["admin"]);
  return <PagesClient />;
}
