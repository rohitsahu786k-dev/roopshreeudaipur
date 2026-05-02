import { requireRole } from "@/lib/auth";
import MenusClient from "@/components/admin/menus/MenusClient";

export const metadata = { title: "Menu Management — Admin" };

export default async function MenusPage() {
  await requireRole(["admin"]);
  return <MenusClient />;
}
