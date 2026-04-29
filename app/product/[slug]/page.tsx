import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { ProductVideoPopup } from "@/components/product/ProductVideoPopup";
import { getProduct, products } from "@/lib/catalog";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  return {
    title: product?.name ?? "Product",
    description: product?.shortDescription
  };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);

  if (!product) notFound();

  const related = products.filter((item) => item.slug !== product.slug);

  return (
    <>
      <ProductDetailClient product={product} related={related} />
      <ProductVideoPopup url={product.videoUrl} />
    </>
  );
}
