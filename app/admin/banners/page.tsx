import { requireRole } from "@/lib/auth";
import BannersClient from "@/components/admin/content/BannersClient";

export const metadata = { title: "Banners - Admin" };

export default async function BannersAdminPage() {
  await requireRole(["admin"]);
  return <BannersClient />;
}
