import { requireRole } from "@/lib/auth";
import ProductFormClient from "@/components/admin/products/ProductFormClient";
import { connectToDatabase } from "@/lib/mongodb";
import { Category } from "@/models/Category";

export const dynamic = "force-dynamic";

export const metadata = { title: "New Product — Admin" };

export default async function NewProductPage() {
  await requireRole(["admin"]);
  await connectToDatabase();
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean();

  return (
    <ProductFormClient
      categories={JSON.parse(JSON.stringify(categories))}
    />
  );
}
