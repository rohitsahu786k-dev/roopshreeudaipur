import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { ProductVideoPopup } from "@/components/product/ProductVideoPopup";
import { getProduct, products, type Product as CatalogProduct } from "@/lib/catalog";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

function mapDatabaseProduct(item: any): CatalogProduct {
  const colorValues = item.options?.find((option: any) => option.name?.toLowerCase() === "color")?.values ?? [];
  const sizeValues = item.options?.find((option: any) => option.name?.toLowerCase() === "size")?.values ?? [];
  const image = item.image ?? item.media?.find((media: any) => media.type === "image")?.url ?? item.images?.[0] ?? "/logo.jpg";
  const gallery = item.gallery ?? item.images ?? item.media?.filter((media: any) => media.type === "image").map((media: any) => media.url) ?? [image];

  return {
    name: item.name,
    slug: item.slug,
    category: item.category?.slug ?? "lehenga",
    shortDescription: item.shortDescription ?? "",
    description: item.description ?? item.shortDescription ?? "",
    image,
    gallery: gallery.length ? gallery : [image],
    price: item.basePrice ?? item.price ?? 0,
    comparePrice: item.comparePrice ?? item.basePrice ?? item.price ?? 0,
    rating: item.ratings?.average ?? 0,
    reviewCount: item.ratings?.count ?? 0,
    fabric: item.fabric ?? item.attributes?.find((attribute: any) => attribute.name === "Fabric")?.value ?? "",
    occasion: item.occasion?.length ? item.occasion : item.attributes?.filter((attribute: any) => attribute.name === "Occasion").map((attribute: any) => attribute.value) ?? [],
    workType: item.workType ?? item.attributes?.find((attribute: any) => attribute.name === "Pattern")?.value ?? "",
    washCare: item.washCare ?? "",
    colors: colorValues.length ? colorValues.map((name: string) => ({ name, hex: name.toLowerCase() === "wine" ? "#6E1238" : "#D36C86" })) : [{ name: "Default", hex: "#d8d0c8" }],
    sizes: sizeValues.length ? sizeValues : ["Free Size"],
    videoUrl: item.productVideoUrl ?? item.media?.find((media: any) => media.type === "video" || media.type === "reel")?.url,
    seller: item.vendor || "ROOP SHREE UDAIPUR",
    sku: item.sku,
    dispatchTime: item.dispatchTime,
    returnPolicy: item.returnPolicy,
    includedItems: item.includedItems,
    careInstructions: item.careInstructions,
    moreInformation: item.specifications
      ? Object.entries(item.specifications instanceof Map ? Object.fromEntries(item.specifications) : item.specifications).map(([label, value]) => ({ label, value: String(value) }))
      : undefined,
    featured: item.isFeatured
  };
}

async function getProductForSlug(slug: string) {
  if (process.env.MONGODB_URI) {
    await connectToDatabase();
    const databaseProduct = await Product.findOne({ slug, isActive: true, status: "active" }).populate("category", "name slug").lean();
    if (databaseProduct) return mapDatabaseProduct(databaseProduct);
  }

  return getProduct(slug);
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductForSlug(params.slug);
  return {
    title: product?.name ?? "Product",
    description: product?.shortDescription
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductForSlug(params.slug);

  if (!product) notFound();

  const related = products.filter((item) => item.slug !== product.slug);

  return (
    <>
      <ProductDetailClient product={product} related={related} />
      {product.videoUrl ? <ProductVideoPopup url={product.videoUrl} /> : null}
    </>
  );
}
