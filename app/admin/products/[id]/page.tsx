import { requireRole } from "@/lib/auth";
import ProductFormClient from "@/components/admin/products/ProductFormClient";
import { connectToDatabase } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit Product — Admin" };

export default async function EditProductPage({ params }: { params: { id: string } }) {
  await requireRole(["admin"]);
  await connectToDatabase();

  const [product, categories] = await Promise.all([
    Product.findById(params.id)
      .populate("category", "_id name slug")
      .populate("upsells", "_id name media basePrice")
      .populate("crossSells", "_id name media basePrice")
      .lean(),
    Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean()
  ]);

  if (!product) notFound();

  return (
    <ProductFormClient
      product={JSON.parse(JSON.stringify(product))}
      categories={JSON.parse(JSON.stringify(categories))}
    />
  );
}
