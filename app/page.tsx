import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Headphones, Plane, Shirt } from "lucide-react";
import { InstagramVideoCarousel } from "@/components/home/InstagramVideoCarousel";
import { CategoryCircles } from "@/components/home/CategoryCircles";
import { HeroBanner } from "@/components/home/HeroBanner";
import { products as staticProducts, formatPrice, type Product } from "@/lib/catalog";
import { blogs as staticBlogs, type BlogPost } from "@/lib/blogs";
import { normalizeDbProduct } from "@/lib/normalize";
import { connectToDatabase } from "@/lib/mongodb";
import { Product as ProductModel } from "@/models/Product";
import { Blog as BlogModel } from "@/models/Blog";

export const dynamic = "force-dynamic";

const imageFor = (id: string, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=84`;

const topTiles = [
  { title: "Bridal Lehengas", image: imageFor("photo-1610030469983-98e550d6193c") },
  { title: "Hand Work Sarees", image: imageFor("photo-1583391733956-6c78276477e2") },
  { title: "Rajasthani Wedding Wear", image: imageFor("photo-1612336307429-8a898d10e223") }
];
const weddingStudio = [
  { title: "Bridal Trousseau", image: imageFor("photo-1610030469983-98e550d6193c") },
  { title: "Roka", image: imageFor("photo-1583391733956-6c78276477e2") },
  { title: "Best Dressed Guest", image: imageFor("photo-1597983073493-88cd35cf93b0") },
  { title: "Haldi & Mehendi", image: imageFor("photo-1609357605129-26f69add5d6e") },
  { title: "The New-Age Bride", image: imageFor("photo-1610189017773-29214c0f9e40") }
];
const bestsellers = [
  { title: "Udaipur Bridal", image: imageFor("photo-1610030469983-98e550d6193c") },
  { title: "Sangeet Edit", image: imageFor("photo-1583391733956-6c78276477e2") },
  { title: "Haldi Hues", image: imageFor("photo-1612336307429-8a898d10e223") },
  { title: "Reception Glam", image: imageFor("photo-1609357605129-26f69add5d6e") },
  { title: "Mehendi Mood", image: imageFor("photo-1610189017773-29214c0f9e40") }
];
const handpickedCollections = [
  { title: "The Getaway Glam", image: imageFor("photo-1597983073493-88cd35cf93b0") },
  { title: "Pret, Please!", image: imageFor("photo-1610030469983-98e550d6193c") },
  { title: "Summer-Ready Styles", image: imageFor("photo-1583391733956-6c78276477e2") }
];

// Fetch functions (server-side, with fallback)
async function getProducts(limit = 8): Promise<Product[]> {
  try {
    if (!process.env.MONGODB_URI) return staticProducts.slice(0, limit);
    await connectToDatabase();
    const dbProducts = await ProductModel
      .find({ isActive: true })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(limit)
      .lean();
    if (!dbProducts.length) return staticProducts.slice(0, limit);
    return dbProducts.map((p) => normalizeDbProduct(p as Record<string, any>));
  } catch {
    return staticProducts.slice(0, limit);
  }
}

async function getBlogs(limit = 5): Promise<BlogPost[]> {
  try {
    if (!process.env.MONGODB_URI) return staticBlogs.slice(0, limit);
    await connectToDatabase();
    const dbBlogs = await BlogModel
      .find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("author", "name")
      .lean();
    if (!dbBlogs.length) return staticBlogs.slice(0, limit);
    return dbBlogs.map((b) => ({
      id: b.slug,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: b.content,
      image: b.featuredImage ?? staticBlogs[0]?.image ?? "",
      category: (b.categories as string[])?.[0] ?? "Style",
      author: (b.author as { name?: string } | null)?.name ?? "Roop Shree",
      publishedAt: (b as { createdAt?: Date }).createdAt?.toISOString() ?? new Date().toISOString(),
      readTime: Math.max(1, Math.ceil(b.content.split(" ").length / 200))
    }));
  } catch {
    return staticBlogs.slice(0, limit);
  }
}

// Components
function SectionHeader({ title, href = "/shop" }: { title: string; href?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-[12px] font-bold uppercase tracking-[0.18em] text-ink sm:text-[13px]">{title}</h2>
      <Link href={href} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-ink/55 hover:text-primary sm:text-[11px]">
        View All <ChevronRight size={12} />
      </Link>
    </div>
  );
}

function ImageTile({ title, image, tall = false, sub }: { title: string; image: string; tall?: boolean; sub?: string }) {
  return (
    <Link href="/shop" className={`group relative block overflow-hidden bg-neutral ${tall ? "aspect-[3/4]" : "aspect-[4/5]"}`}>
      <Image src={image} alt={title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 25vw, 50vw" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent p-3 text-center">
        <p className="text-[11px] font-bold uppercase tracking-wide text-white leading-tight">{title}</p>
        {sub && <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/75">{sub}</p>}
      </div>
    </Link>
  );
}

function ProductMiniCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block min-w-0">
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral">
        <Image src={product.image} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 20vw, 50vw" />
        {product.comparePrice > product.price && (
          <span className="absolute left-2 top-2 bg-ink px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
            {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% Off
          </span>
        )}
      </div>
      <div className="pt-2 text-center">
        <h3 className="line-clamp-1 text-[11px] font-semibold uppercase tracking-wide sm:text-[12px]">{product.name}</h3>
        <p className="mt-0.5 text-[10px] capitalize text-ink/55 sm:text-[11px]">{product.category.replace(/-/g, " ")}</p>
        <div className="mt-0.5 flex items-center justify-center gap-1.5">
          <p className="text-[11px] font-bold text-primary sm:text-[12px]">{formatPrice(product.price)}</p>
          {product.comparePrice > product.price && (
            <p className="text-[10px] text-ink/40 line-through sm:text-[11px]">{formatPrice(product.comparePrice)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const [featuredProducts, storyBlogs] = await Promise.all([
    getProducts(12),
    getBlogs(5)
  ]);

  const newArrivals = featuredProducts.slice(0, 4);
  const partyReady = featuredProducts.slice(0, 4);
  const weddingShop = featuredProducts.slice(0, 4);

  return (
    <div className="bg-white text-ink">

      {/* Category Circles — right after header */}
      <CategoryCircles />

      {/* Hero Banner — from backend */}
      <HeroBanner />

      <main className="mx-auto max-w-[1728px] px-3 py-4 sm:px-4 lg:px-7">

        {/* The Bridal Store */}
        <section>
          <SectionHeader title="The Bridal Store" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {topTiles.map((tile) => <ImageTile key={tile.title} {...tile} tall />)}
          </div>
        </section>

        {/* New Arrivals — dynamic from backend */}
        <section className="mt-6">
          <SectionHeader title="New Arrivals" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {newArrivals.map((p) => <ProductMiniCard key={p.slug} product={p} />)}
          </div>
        </section>

        {/* Wedding Studio */}
        <section className="mt-6">
          <SectionHeader title="The Wedding Studio" />
          <div className="grid grid-cols-2 gap-2">
            {weddingStudio.slice(0, 4).map((item) => (
              <Link key={item.title} href="/shop" className="group relative block aspect-[4/5] overflow-hidden bg-neutral">
                <Image src={item.image} alt={item.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="50vw" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent p-3 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-white">{item.title}</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/75">Shop Now</p>
                </div>
              </Link>
            ))}
          </div>
          {weddingStudio[4] && (
            <Link href="/shop" className="group relative mt-2 block aspect-[16/7] overflow-hidden bg-neutral">
              <Image src={weddingStudio[4].image} alt={weddingStudio[4].title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="100vw" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-center">
                <p className="text-[13px] font-bold uppercase tracking-wide text-white">{weddingStudio[4].title}</p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/80">Shop Now</p>
              </div>
            </Link>
          )}
        </section>

        {/* Designer Spotlight */}
        <section className="mt-6 bg-[#f5f0ea] px-4 py-7">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div>
              <p className="text-4xl font-light tracking-widest sm:text-5xl">RS</p>
              <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.18em]">Roop Shree — Designer Spotlight</p>
              <p className="mt-1 text-[11px] text-ink/60">Hand-curated ethnic wear from Udaipur&apos;s finest ateliers</p>
            </div>
            <Link href="/shop" className="inline-flex bg-ink px-7 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white hover:bg-ink/85">
              Explore Collection
            </Link>
          </div>
        </section>

        {/* Instagram Reels */}
        <InstagramVideoCarousel />

        {/* Handpicked For You */}
        <section className="mt-6">
          <SectionHeader title="Handpicked For You" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link href="/shop" className="group relative block aspect-[4/3] overflow-hidden bg-neutral sm:row-span-2">
              <Image src={handpickedCollections[0].image} alt={handpickedCollections[0].title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 640px) 50vw, 100vw" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-center">
                <p className="text-[13px] font-bold uppercase tracking-wide text-white">{handpickedCollections[0].title}</p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase text-white/80">Shop Now</p>
              </div>
            </Link>
            {handpickedCollections.slice(1).map((item) => (
              <Link key={item.title} href="/shop" className="group relative block aspect-[4/3] overflow-hidden bg-neutral">
                <Image src={item.image} alt={item.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 640px) 50vw, 100vw" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-white">{item.title}</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase text-white/80">Shop Now</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Bestselling Designers */}
        <section className="mt-6">
          <SectionHeader title="Bestselling Designers" />
          <div className="grid grid-cols-2 gap-2">
            <Link href="/shop" className="group relative col-span-2 block aspect-[16/7] overflow-hidden bg-neutral">
              <Image src={bestsellers[0].image} alt={bestsellers[0].title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="100vw" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-center">
                <p className="text-sm font-bold uppercase tracking-wide text-white">{bestsellers[0].title}</p>
                <p className="text-[11px] font-semibold uppercase text-white/80">Shop Now</p>
              </div>
            </Link>
            {bestsellers.slice(1, 5).map((item) => (
              <Link key={item.title} href="/shop" className="group relative block aspect-[4/5] overflow-hidden bg-neutral">
                <Image src={item.image} alt={item.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="50vw" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-white">{item.title}</p>
                  <p className="text-[10px] font-semibold uppercase text-white/75">Shop Now</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Party Ready — dynamic */}
        <section className="mt-6">
          <SectionHeader title="Party Ready Styles" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {partyReady.map((p, i) => <ProductMiniCard key={`party-${p.slug}-${i}`} product={p} />)}
          </div>
        </section>

        {/* The Wedding Shop — dynamic */}
        <section className="mt-6">
          <SectionHeader title="The Wedding Shop" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {weddingShop.map((p, i) => <ProductMiniCard key={`wed-${p.slug}-${i}`} product={p} />)}
          </div>
        </section>

        {/* First Look Stories — dynamic from backend */}
        {storyBlogs.length > 0 && (
          <section className="mt-6">
            <SectionHeader title="First Look Stories" href="/blogs" />
            <div className="divide-y divide-black/8">
              {storyBlogs.map((blog) => (
                <Link key={blog.id} href={`/blogs/${blog.id}`} className="group flex gap-3 py-3 sm:gap-4 sm:py-4">
                  <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden bg-neutral sm:h-20 sm:w-20">
                    <Image src={blog.image} alt={blog.title} fill className="object-cover transition duration-300 group-hover:scale-105" sizes="80px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink/45 sm:text-[10px]">{blog.category} · {new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    <h3 className="mt-0.5 line-clamp-2 text-[12px] font-bold uppercase leading-[1.3] tracking-wide text-ink transition group-hover:text-primary sm:text-[13px]">{blog.title}</h3>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-ink/50">{blog.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/blogs" className="inline-flex items-center gap-1 border border-black/20 px-6 py-2.5 text-[11px] font-bold uppercase tracking-wide text-ink hover:bg-ink hover:text-white">
                View All Stories <ChevronRight size={12} />
              </Link>
            </div>
          </section>
        )}

        {/* Feature Strip */}
        <section className="mt-8 border-y border-black/10 py-6">
          <div className="grid grid-cols-3 divide-x divide-black/10">
            {[
              { icon: Headphones, title: "24x7", sub: "Customer Support" },
              { icon: Shirt, title: "500+", sub: "Designers" },
              { icon: Plane, title: "Free", sub: "International Shipping*" }
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex flex-col items-center gap-2 px-2 text-center sm:flex-row sm:justify-center sm:gap-4">
                <Icon size={22} strokeWidth={1.5} className="shrink-0" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide sm:text-xs">{title}</p>
                  <p className="text-[10px] text-ink/55 sm:text-[11px]">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Explore Section */}
        <section className="mt-6 pb-6">
          <h2 className="text-center text-[12px] font-bold uppercase tracking-[0.22em] sm:text-sm">Explore Roop Shree</h2>
          <div className="mx-auto mt-5 grid max-w-4xl grid-cols-1 gap-px border border-black/15 bg-black/15 sm:grid-cols-2">
            {[
              "Book a private styling appointment",
              "Find ready to ship wedding looks",
              "Explore Roop Shree festive edits",
              "Get size and custom fit support"
            ].map((item) => (
              <Link key={item} href="/contact-us" className="bg-white px-5 py-5 text-center text-[11px] font-bold uppercase tracking-wide hover:bg-neutral sm:px-8 sm:py-7">
                {item}
                <span className="mx-auto mt-2.5 block h-px w-10 bg-black/20" />
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
