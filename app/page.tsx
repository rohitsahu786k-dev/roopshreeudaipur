import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { roopShreeBusiness } from "@/lib/business";
import { formatPrice, products } from "@/lib/catalog";
import { blogs } from "@/lib/blogs";

const InstagramVideoCarousel = dynamic(
  () => import("@/components/home/InstagramVideoCarousel").then((mod) => mod.InstagramVideoCarousel),
  { ssr: false, loading: () => <div className="mt-10 h-64 animate-pulse bg-neutral" /> }
);

const navItems = [
  "New", "Women", "Lehengas", "Sarees", "Kurta Sets",
  "Anarkalis", "Shararas", "Gowns", "Rajputi Poshak", "Fusion",
  "Wedding", "Ready To Ship", "Sale"
];

const heroImage = "https://images.unsplash.com/photo-1583487305850-ac28d2a4c3be?auto=format&fit=crop&w=1800&q=88";

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=84`;

const topTiles = [
  { title: "Bridal Lehengas", image: img("photo-1610030469983-98e550d6193c") },
  { title: "Hand Work Sarees", image: img("photo-1583391733956-6c78276477e2") },
  { title: "Rajasthani Wedding Wear", image: img("photo-1612336307429-8a898d10e223") }
];

const shopCategories = [
  { title: "Lehengas", image: img("photo-1609357605129-26f69add5d6e") },
  { title: "Kurta Sets", image: img("photo-1610189017773-29214c0f9e40") },
  { title: "Sarees", image: img("photo-1583391733956-6c78276477e2") },
  { title: "Sharara Sets", image: img("photo-1597983073493-88cd35cf93b0") },
  { title: "Anarkalis", image: img("photo-1529139574466-a303027c1d8b") },
  { title: "Rajputi Poshak", image: img("photo-1612336307429-8a898d10e223") }
];

function SectionTitle({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/60">{eyebrow}</p> : null}
        <h2 className="mt-1 text-base font-semibold uppercase tracking-wide text-ink sm:text-lg">{title}</h2>
      </div>
      <Link href="/shop" className="flex shrink-0 items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-ink/70 hover:text-primary">
        View All <ChevronRight size={14} />
      </Link>
    </div>
  );
}

function ImageTile({ title, image, tall = false }: { title: string; image: string; tall?: boolean }) {
  return (
    <Link href="/shop" className={`group relative block overflow-hidden bg-neutral ${tall ? "aspect-[3/4]" : "aspect-[4/5]"}`}>
      <Image src={image} alt={title} fill loading="lazy" className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 25vw, 50vw" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-white">{title}</p>
      </div>
    </Link>
  );
}

function ProductMiniCard({ product }: { product: (typeof products)[number] }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block bg-white">
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral">
        <Image src={product.image} alt={product.name} fill loading="lazy" className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 20vw, 50vw" />
      </div>
      <div className="pt-2 text-center">
        <h3 className="line-clamp-1 text-[11px] font-semibold uppercase tracking-wide sm:text-[12px]">{product.name}</h3>
        <p className="mt-0.5 text-[10px] text-ink/60 sm:text-[11px]">{product.category.replace(/-/g, " ")}</p>
        <p className="mt-0.5 text-[11px] font-bold text-ink sm:text-[12px]">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

function BlogCard({ post }: { post: (typeof blogs)[number] }) {
  return (
    <Link href={`/blogs/${post.id}`} className="group block bg-white">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image src={post.image} alt={post.title} fill loading="lazy" className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 20vw, 50vw" />
      </div>
      <div className="p-3 sm:p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-primary sm:text-[11px]">{post.category}</p>
        <h3 className="mt-1 line-clamp-2 text-[12px] font-semibold leading-snug sm:text-sm">{post.title}</h3>
        <p className="mt-1 text-[11px] text-ink/55">{post.readTime} min read</p>
      </div>
    </Link>
  );
}

const featuredProducts = products.filter((p) => p.featured);
const discountProducts = products.slice(0, 4);
const partyProducts = products.slice(4, 8);
const weddingProducts = products.slice(8, 16);

export default function HomePage() {
  return (
    <div className="bg-white text-ink">
      {/* ── HERO ── */}
      <section className="relative">
        <div className="relative h-[400px] overflow-hidden sm:h-[480px] md:h-[560px]">
          <Image src={heroImage} alt="Roop Shree Bridal Collection" fill priority className="object-cover object-top" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
          <div className="absolute inset-x-4 top-1/2 max-w-xs -translate-y-1/2 sm:left-[7%] sm:right-auto sm:max-w-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/80 sm:text-xs">Udaipur · Bridal Studio</p>
            <h1 className="mt-2 text-2xl font-semibold uppercase leading-tight tracking-wide text-white sm:mt-3 sm:text-3xl md:text-5xl">{roopShreeBusiness.name}</h1>
            <p className="mt-2 text-xs font-medium leading-6 text-white/85 sm:mt-3 sm:text-sm">Bridal lehengas, sarees, suits & handcrafted ethnic wear for Udaipur weddings and festive celebrations.</p>
            <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
              <Link href="/shop" className="inline-flex bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-wide text-ink sm:px-6 sm:text-xs">
                Shop Now
              </Link>
              <Link href="/shop?category=lehenga" className="inline-flex border border-white/70 px-5 py-2 text-[11px] font-bold uppercase tracking-wide text-white sm:px-6 sm:text-xs">
                Bridal Edit
              </Link>
            </div>
          </div>
        </div>

        {/* Category nav pills */}
        <nav className="border-y border-black/10 bg-white">
          <div className="mx-auto flex max-w-[1728px] gap-5 overflow-x-auto px-4 py-3 [&::-webkit-scrollbar]:hidden sm:gap-7 sm:px-6 lg:justify-center">
            {navItems.map((item) => (
              <Link
                key={item}
                href="/shop"
                className={`shrink-0 whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide sm:text-[11px] ${item === "Ready To Ship" || item === "Sale" ? "text-primary" : "hover:text-primary"}`}
              >
                {item}
              </Link>
            ))}
          </div>
        </nav>
      </section>

      <main className="mx-auto max-w-[1728px] px-3 py-5 sm:px-4 lg:px-7">

        {/* ── THE BRIDAL STORE ── */}
        <section>
          <SectionTitle title="The Bridal Store" />
          <div className="grid gap-2 sm:grid-cols-3">
            {topTiles.map((tile) => (
              <ImageTile key={tile.title} {...tile} tall />
            ))}
          </div>
        </section>

        {/* ── SHOP BY CATEGORY ── */}
        <section className="mt-8">
          <SectionTitle title="Shop By Categories" />
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {shopCategories.map((tile) => (
              <ImageTile key={tile.title} {...tile} />
            ))}
          </div>
        </section>

        {/* ── NEW ARRIVALS / FEATURED ── */}
        <section className="mt-8">
          <SectionTitle eyebrow="Handpicked for you" title="New Arrivals" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductMiniCard key={product.slug} product={product} />
            ))}
          </div>
        </section>

        {/* ── FEATURE STRIP ── */}
        <section className="mt-8 border-y border-black/10 py-4">
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
            {[
              ["24×7", "Customer Support"],
              ["500+", "Designer Styles"],
              ["Free Shipping", "Orders above ₹2,999"],
              ["Easy Returns", "7-day exchange"]
            ].map(([head, sub]) => (
              <div key={head} className="px-2 py-2">
                <p className="text-sm font-bold uppercase tracking-wide text-ink sm:text-base">{head}</p>
                <p className="mt-0.5 text-[10px] text-ink/55 sm:text-xs">{sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── BIG STYLES ON DISCOUNT ── */}
        <section className="mt-8">
          <SectionTitle eyebrow="Limited time" title="Big Styles On Discount" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {discountProducts.map((product) => (
              <ProductMiniCard key={product.slug} product={product} />
            ))}
          </div>
        </section>

        {/* ── INSTAGRAM REELS ── */}
        <InstagramVideoCarousel />

        {/* ── PARTY READY ── */}
        <section className="mt-8">
          <div className="grid gap-3 lg:grid-cols-[1.12fr_0.88fr]">
            <Link href="/shop" className="group relative block aspect-[16/9] overflow-hidden bg-neutral">
              <Image src={img("photo-1597983073493-88cd35cf93b0", 1200)} alt="Lehenga edit" fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 58vw, 100vw" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <p className="text-sm font-bold uppercase tracking-wide text-white">Lehengas In Blue Hues</p>
              </div>
            </Link>
            <div>
              <SectionTitle title="Party Ready Styles" />
              <div className="grid grid-cols-2 gap-2">
                {partyProducts.map((product) => (
                  <ProductMiniCard key={`party-${product.slug}`} product={product} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── THE WEDDING SHOP ── */}
        <section className="mt-8">
          <SectionTitle eyebrow="Bridal collection" title="The Wedding Shop" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {weddingProducts.map((product) => (
              <ProductMiniCard key={`wedding-${product.slug}`} product={product} />
            ))}
          </div>
        </section>

        {/* ── BLOGS ── */}
        <section className="mt-10 border-t border-black/10 pt-8">
          <SectionTitle eyebrow="Style guide" title="From The Studio" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {blogs.slice(0, 5).map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        {/* ── FIRST LOOK BOOK ── */}
        <section className="mt-10 border-y border-black/15 py-8">
          <h2 className="text-center text-base font-semibold uppercase tracking-[0.15em] sm:text-lg sm:tracking-[0.2em]">First Look Book</h2>
          <div className="mx-auto mt-6 grid max-w-5xl gap-px border border-black/20 bg-black/20 sm:grid-cols-2">
            {[
              "Book a private styling appointment",
              "Find ready to ship wedding looks",
              "Explore Roop Shree festive edits",
              "Get size and custom fit support"
            ].map((item) => (
              <Link
                key={item}
                href="/contact-us"
                className="bg-white px-4 py-6 text-center text-[11px] font-bold uppercase tracking-wide hover:bg-neutral sm:p-8 sm:text-[12px]"
              >
                {item}
                <span className="mx-auto mt-3 block h-px w-12 bg-black/30 sm:mt-4 sm:w-16" />
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
