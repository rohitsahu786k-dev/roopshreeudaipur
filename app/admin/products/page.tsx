import { requireRole } from "@/lib/auth";
import ProductsClient from "@/components/admin/products/ProductsClient";

export const metadata = { title: "Products — Admin" };

export default async function ProductsPage() {
  await requireRole(["admin"]);
  return <ProductsClient />;
}
