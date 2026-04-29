import { requireRole } from "@/lib/auth";
import CategoriesClient from "@/components/admin/categories/CategoriesClient";

export const metadata = { title: "Categories — Admin" };

export default async function CategoriesPage() {
  await requireRole(["admin"]);
  return <CategoriesClient />;
}
