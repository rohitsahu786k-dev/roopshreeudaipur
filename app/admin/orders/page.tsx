import { requireRole } from "@/lib/auth";
import OrdersClient from "@/components/admin/orders/OrdersClient";

export const metadata = { title: "Orders — Admin" };

export default async function OrdersPage() {
  await requireRole(["admin"]);
  return <OrdersClient />;
}
