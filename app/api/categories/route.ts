import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Category } from "@/models/Category";

export const revalidate = 300;

const fallbackImage = (slug: string) => {
  const map: Record<string, string> = {
    lehenga: "photo-1609357605129-26f69add5d6e",
    "kurta-set": "photo-1610189017773-29214c0f9e40",
    saree: "photo-1583391733956-6c78276477e2",
    "sharara-set": "photo-1597983073493-88cd35cf93b0",
    anarkali: "photo-1603252109303-2751441dd157",
    "ladies-suit": "photo-1610030469983-98e550d6193c",
    gown: "photo-1609357605129-26f69add5d6e",
    dupatta: "photo-1583391733956-6c78276477e2",
    "co-ord-set": "photo-1612336307429-8a898d10e223"
  };
  const id = map[slug] ?? "photo-1612336307429-8a898d10e223";
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=80`;
};

const staticCategories = [
  { name: "Lehengas", slug: "lehenga", image: fallbackImage("lehenga"), description: "Bridal & festive lehengas" },
  { name: "Kurta Sets", slug: "kurta-set", image: fallbackImage("kurta-set"), description: "Designer kurta sets" },
  { name: "Sarees", slug: "saree", image: fallbackImage("saree"), description: "Handcrafted sarees" },
  { name: "Sharara Sets", slug: "sharara-set", image: fallbackImage("sharara-set"), description: "Sharara & palazzo sets" },
  { name: "Anarkalis", slug: "anarkali", image: fallbackImage("anarkali"), description: "Flared anarkali suits" },
  { name: "Ladies Suits", slug: "ladies-suit", image: fallbackImage("ladies-suit"), description: "Salwar & churidar suits" },
  { name: "Gowns", slug: "gown", image: fallbackImage("gown"), description: "Reception & party gowns" },
  { name: "Rajputi Poshak", slug: "rajputi-poshak", image: fallbackImage("rajputi-poshak"), description: "Traditional Rajputi styles" }
];

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ categories: staticCategories });
    }
    await connectToDatabase();
    const dbCategories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
    if (!dbCategories.length) {
      return NextResponse.json({ categories: staticCategories });
    }
    return NextResponse.json({
      categories: dbCategories.map((c) => ({
        name: c.name,
        slug: c.slug,
        image: c.image ?? fallbackImage(c.slug),
        description: c.description ?? ""
      }))
    });
  } catch {
    return NextResponse.json({ categories: staticCategories });
  }
}
