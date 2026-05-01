import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { ProductVideoPopup } from "@/components/product/ProductVideoPopup";
import { getProduct, products as staticProducts } from "@/lib/catalog";
import { normalizeDbProduct } from "@/lib/normalize";
import { connectToDatabase } from "@/lib/mongodb";
import { Product as ProductModel } from "@/models/Product";
import type { Product } from "@/lib/catalog";

export const revalidate = 60;

async function getProductBySlug(slug: string): Promise<Product | null> {
  // First try DB
  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const dbProduct = await ProductModel.findOne({ slug, isActive: true }).lean();
      if (dbProduct) {
        return normalizeDbProduct(dbProduct as Record<string, any>);
      }
    } catch {
      // fall through to static
    }
  }
  // Fallback to static catalog
  return getProduct(slug) ?? null;
}

async function getRelatedProducts(slug: string, category: string): Promise<Product[]> {
  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const dbRelated = await ProductModel
        .find({ isActive: true, slug: { $ne: slug } })
        .limit(8)
        .lean();
      if (dbRelated.length) {
        return dbRelated.map((p) => normalizeDbProduct(p as Record<string, any>));
      }
    } catch {
      // fall through
    }
  }
  return staticProducts.filter((p) => p.slug !== slug);
}

export async function generateStaticParams() {
  // Only pre-render static products at build time; DB products are SSR
  return staticProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  return {
    title: product ? `${product.name} | Roop Shree` : "Product | Roop Shree",
    description: product?.shortDescription ?? "Ethnic wear from Roop Shree Udaipur"
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(params.slug, product.category);

  return (
    <>
      <ProductDetailClient product={product} related={related} />
      {product.videoUrl ? <ProductVideoPopup url={product.videoUrl} /> : null}
    </>
  );
}
