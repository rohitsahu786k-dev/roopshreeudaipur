import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { getCurrentUser } from "@/lib/auth";
import { products as catalogProducts } from "@/lib/catalog";
import slugify from "slugify";

export const dynamic = "force-dynamic";

const CATEGORY_NAMES: Record<string, string> = {
  lehenga: "Lehenga",
  "ladies-suit": "Ladies Suit",
  "kurta-set": "Kurta Set",
  "sharara-set": "Sharara Set",
  saree: "Saree",
  dupatta: "Dupatta"
};

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    // Ensure all categories exist
    const categoryMap: Record<string, string> = {};
    for (const [slug, name] of Object.entries(CATEGORY_NAMES)) {
      const existing = await Category.findOne({ slug });
      if (existing) {
        categoryMap[slug] = String(existing._id);
      } else {
        const created = await Category.create({ name, slug, isActive: true, sortOrder: Object.keys(categoryMap).length });
        categoryMap[slug] = String(created._id);
      }
    }

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const p of catalogProducts) {
      try {
        const exists = await Product.exists({ slug: p.slug });
        if (exists) { skipped++; continue; }

        const categoryId = categoryMap[p.category];
        if (!categoryId) { errors.push(`No category for ${p.slug}`); continue; }

        await Product.create({
          name: p.name,
          slug: p.slug,
          status: "active",
          isActive: true,
          description: p.description,
          shortDescription: p.shortDescription,
          category: categoryId,
          basePrice: p.price,
          comparePrice: p.comparePrice,
          stock: 50,
          lowStockThreshold: 5,
          trackInventory: true,
          fabric: p.fabric,
          occasion: p.occasion,
          workType: p.workType,
          washCare: p.washCare,
          dispatchTime: p.dispatchTime ?? "Ready to ship in 3-7 business days",
          returnPolicy: p.returnPolicy ?? "Exchange accepted within 7 days if unaltered",
          includedItems: p.includedItems ?? ["Main outfit", "Matching dupatta where applicable"],
          careInstructions: p.careInstructions ?? [p.washCare].filter(Boolean),
          isFeatured: p.featured ?? false,
          isNew: false,
          isBestseller: (p.reviewCount ?? 0) > 80,
          vendor: "Roop Shree Udaipur",
          countryOfOrigin: "India",
          ratings: { average: p.rating, count: p.reviewCount },
          media: [
            { url: p.image, type: "image", alt: p.name, position: 0 },
            ...p.gallery.slice(1).map((url, i) => ({ url, type: "image" as const, alt: `${p.name} view ${i + 2}`, position: i + 1 }))
          ],
          options: [
            { name: "Size", values: p.sizes },
            ...(p.colors?.length ? [{ name: "Color", values: p.colors.map((c) => c.name) }] : [])
          ],
          seo: {
            title: `${p.name} | Roop Shree Udaipur`,
            description: p.shortDescription,
            keywords: [p.category.replace(/-/g, " "), p.workType, ...p.occasion].filter(Boolean)
          },
          publishedAt: new Date()
        });
        created++;
      } catch (e: any) {
        errors.push(`${p.slug}: ${e.message}`);
      }
    }

    return NextResponse.json({
      message: `Seeded ${created} products, skipped ${skipped} existing.`,
      created,
      skipped,
      errors: errors.length ? errors : undefined
    });
  } catch (err: any) {
    console.error("[seed]", err);
    return NextResponse.json({ error: err.message ?? "Seed failed" }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  await connectToDatabase();
  const count = await Product.countDocuments({ isActive: true });
  return NextResponse.json({ productCount: count, catalogCount: catalogProducts.length });
}
