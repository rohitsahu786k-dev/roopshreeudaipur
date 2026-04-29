import { requireRole } from "@/lib/auth";
import OrderDetailClient from "@/components/admin/orders/OrderDetailClient";

export const metadata = { title: "Order Detail — Admin" };

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  await requireRole(["admin"]);
  return <OrderDetailClient orderId={params.id} />;
}
