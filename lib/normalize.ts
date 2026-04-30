import type { Product } from "@/lib/catalog";

const placeholderImage = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=84";

export function normalizeDbProduct(db: Record<string, any>): Product {
  // Images
  const mediaImages: string[] = (db.media ?? [])
    .filter((m: { type: string }) => m.type === "image")
    .map((m: { url: string }) => m.url);
  const rawImages: string[] = Array.isArray(db.images) ? db.images : [];
  const gallery = Array.from(new Set([...rawImages, ...mediaImages])).filter(Boolean);
  const image = gallery[0] ?? placeholderImage;

  // Sizes — from options or variants
  const sizeOption = (db.options ?? []).find(
    (o: { name: string }) => o.name.toLowerCase() === "size"
  );
  const sizes: string[] = sizeOption?.values?.length
    ? sizeOption.values
    : Array.from(new Set((db.variants ?? []).map((v: { option1?: string }) => v.option1).filter(Boolean))) as string[];

  // Colors — from options or variants
  const colorOption = (db.options ?? []).find(
    (o: { name: string }) => o.name.toLowerCase() === "color"
  );
  const colorNames: string[] = colorOption?.values?.length
    ? colorOption.values
    : Array.from(new Set((db.variants ?? []).map((v: { option2?: string }) => v.option2).filter(Boolean))) as string[];
  const colors = colorNames.map((name) => ({ name, hex: "#000000" }));

  // Category
  const category =
    typeof db.category === "string"
      ? db.category
      : (db.category?.slug ?? db.category?.name ?? "lehenga");

  // Price
  const price = db.basePrice ?? db.price ?? 0;
  const comparePrice = db.comparePrice ?? price;

  // Video
  const videoUrl =
    db.productVideoUrl ??
    db.media?.find((m: { type: string; url: string }) => m.type === "video")?.url;

  return {
    name: db.name ?? "Untitled",
    slug: db.slug ?? db._id?.toString() ?? "product",
    category: category as Product["category"],
    shortDescription: db.shortDescription ?? "",
    description: db.description ?? "",
    image,
    gallery: gallery.length ? gallery : [placeholderImage],
    price,
    comparePrice,
    rating: db.ratings?.average ?? db.rating ?? 4.5,
    reviewCount: db.ratings?.count ?? db.reviewCount ?? 0,
    fabric: db.fabric ?? "Premium fabric",
    occasion: Array.isArray(db.occasion) ? db.occasion : [db.occasion ?? "Festive"],
    workType: db.workType ?? "Hand work",
    washCare: db.washCare ?? "Dry clean recommended",
    colors: colors.length ? colors : [{ name: "Default", hex: "#1a1a1a" }],
    sizes: sizes.length ? sizes : ["XS", "S", "M", "L", "XL"],
    videoUrl,
    seller: db.vendor ?? "Roop Shree Udaipur",
    sku: db.sku,
    dispatchTime: db.dispatchTime ?? "Ships in 3–7 business days",
    returnPolicy: db.returnPolicy ?? "Returns accepted as per eligibility.",
    sizeGuideNotes: db.sizeChart ?? undefined,
    includedItems: db.includedItems,
    careInstructions: db.careInstructions,
    moreInformation: db.specifications?.map((s: { name: string; value: string }) => ({ label: s.name, value: s.value })),
    featured: db.isFeatured ?? false
  };
}
