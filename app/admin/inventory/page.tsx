import { requireRole } from "@/lib/auth";
import InventoryClient from "@/components/admin/inventory/InventoryClient";

export const metadata = { title: "Inventory — Admin" };

export default async function InventoryPage() {
  await requireRole(["admin"]);
  return <InventoryClient />;
}
