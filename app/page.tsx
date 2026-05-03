import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { roopShreeBusiness } from "@/lib/business";

const InstagramVideoCarousel = dynamic(
  () => import("@/components/home/InstagramVideoCarousel").then((mod) => mod.InstagramVideoCarousel),
  { ssr: false, loading: () => <div className="mt-10 h-64 animate-pulse bg-neutral" /> }
);
import { formatPrice, products } from "@/lib/catalog";

const navItems = [
  "New",
  "Women",
  "Lehengas",
  "Sarees",
  "Kurta Sets",
  "Anarkalis",
  "Shararas",
  "Gowns",
  "Rajputi Poshak",
  "Fusion",
  "Wedding",
  "Ready To Ship",
  "Sale"
];

const heroImage = "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=88";

const imageFor = (id: string, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=84`;

const topTiles = [
  { title: "Bridal Lehengas", image: imageFor("photo-1610030469983-98e550d6193c") },
  { title: "Hand Work Sarees", image: imageFor("photo-1583391733956-6c78276477e2") },
  { title: "Rajasthani Wedding Wear", image: imageFor("photo-1612336307429-8a898d10e223") }
];

const shopCategories = [
  { title: "Lehengas", image: imageFor("photo-1609357605129-26f69add5d6e") },
  { title: "Kurta Sets", image: imageFor("photo-1610189017773-29214c0f9e40") },
  { title: "Sarees", image: imageFor("photo-1583391733956-6c78276477e2") },
  { title: "Sharara Sets", image: imageFor("photo-1597983073493-88cd35cf93b0") },
  { title: "Anarkalis", image: imageFor("photo-1603252109303-2751441dd157") },
  { title: "Rajputi Poshak", image: imageFor("photo-1612336307429-8a898d10e223") }
];

const collectionGrid = [
  { title: "Udaipur Wedding", image: imageFor("photo-1610030469983-98e550d6193c") },
  { title: "Sangeet Edit", image: imageFor("photo-1583391733956-6c78276477e2") },
  { title: "Destination Wedding", image: imageFor("photo-1597983073493-88cd35cf93b0") },
  { title: "Haldi Hues", image: imageFor("photo-1609357605129-26f69add5d6e") },
  { title: "Reception Glam", image: imageFor("photo-1610189017773-29214c0f9e40") },
  { title: "Mehendi Mood", image: imageFor("photo-1612336307429-8a898d10e223") }
];

const designerCards = [
  { title: "Bridal Hand Work", subtitle: "Zari, gota patti and thread work", image: imageFor("photo-1610030469983-98e550d6193c") },
  { title: "Mewar Festive", subtitle: "Sarees and suits for rituals", image: imageFor("photo-1583391733956-6c78276477e2") },
  { title: "Gown Studio", subtitle: "Reception and cocktail styles", image: imageFor("photo-1609357605129-26f69add5d6e") },
  { title: "Ready To Ship", subtitle: "Fast dispatch ethnic wear", image: imageFor("photo-1597983073493-88cd35cf93b0") }
];

const storeImages = [
  { title: "Udaipur Boutique", image: imageFor("photo-1555529669-e69e7aa0ba9a") },
  { title: "Hand Work Studio", image: imageFor("photo-1512436991641-6745cdb1723f") },
  { title: "Bridal Trial Lounge", image: imageFor("photo-1521334884684-d80222895322") },
  { title: "Private Styling", image: imageFor("photo-1496747611176-843222e1e57c") }
];

function SectionTitle({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/60">{eyebrow}</p> : null}
        <h2 className="mt-1 text-lg font-semibold uppercase tracking-wide text-ink">{title}</h2>
      </div>
      <Link href="/shop" className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-ink/70 hover:text-primary">
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
        <h3 className="line-clamp-1 text-[12px] font-semibold uppercase tracking-wide">{product.name}</h3>
        <p className="mt-1 text-[11px] text-ink/60">{product.category.replace("-", " ")}</p>
        <p className="mt-1 text-[12px] font-bold text-ink">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const productLoop = [...products, ...products];

  return (
    <div className="bg-white text-ink">
      <section className="relative">
        <div className="relative h-[420px] overflow-hidden md:h-[560px]">
          <Image src={heroImage} alt="Ready to ship occasion wear" fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/35 to-transparent" />
          <div className="absolute inset-x-4 top-1/2 max-w-sm -translate-y-1/2 sm:left-[7%] sm:right-auto">
            <p className="text-xs font-bold uppercase tracking-[0.24em]">Ready to Ship</p>
            <h1 className="mt-3 text-3xl font-semibold uppercase tracking-wide sm:text-4xl md:text-5xl">{roopShreeBusiness.name}</h1>
            <p className="mt-3 text-sm font-medium leading-6">Bridal lehengas, sarees, suits, gowns and hand work ethnic wear crafted for Udaipur weddings and festive celebrations.</p>
            <Link href="/shop" className="mt-5 inline-flex bg-ink px-6 py-2 text-[11px] font-bold uppercase tracking-wide text-white">
              Shop Now
            </Link>
          </div>
        </div>
        <nav className="border-y border-black/10 bg-white">
          <div className="mx-auto flex max-w-[1728px] gap-7 overflow-x-auto px-6 py-3 text-[11px] font-semibold uppercase tracking-wide lg:justify-center">
            {navItems.map((item) => (
              <Link key={item} href="/shop" className={item === "Ready To Ship" || item === "Sale" ? "whitespace-nowrap text-primary" : "whitespace-nowrap hover:text-primary"}>
                {item}
              </Link>
            ))}
          </div>
        </nav>
      </section>

      <main className="mx-auto max-w-[1728px] px-4 py-5 lg:px-7">
        <section>
          <SectionTitle title="The Bridal Store" />
          <div className="grid gap-2 md:grid-cols-3">
            {topTiles.map((tile) => (
              <ImageTile key={tile.title} {...tile} tall />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <SectionTitle title="Shop By Categories" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {shopCategories.map((tile) => (
              <ImageTile key={tile.title} {...tile} />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <SectionTitle title="Big Styles On Discount" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {products.slice(0, 4).map((product) => (
              <ProductMiniCard key={product.slug} product={product} />
            ))}
          </div>
        </section>

        <section className="mt-10 bg-[#f5f5f5] px-4 py-8">
          <div className="grid gap-5 lg:grid-cols-[0.55fr_1.45fr] lg:items-center">
            <div className="text-center lg:text-left">
              <p className="text-5xl font-light tracking-widest">RS</p>
              <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.18em]">Designer spotlight</p>
              <Link href="/shop" className="mt-5 inline-flex bg-ink px-6 py-2 text-[11px] font-bold uppercase text-white">
                Shop Now
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {designerCards.map((card) => (
                <Link key={card.title} href="/shop" className="group block bg-white p-2">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image src={card.image} alt={card.title} fill loading="lazy" className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 18vw, 50vw" />
                  </div>
                  <p className="mt-2 text-[12px] font-bold uppercase">{card.title}</p>
                  <p className="text-[11px] text-ink/60">{card.subtitle}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <InstagramVideoCarousel />

        <section className="mt-8">
          <div className="grid gap-3 lg:grid-cols-[1.12fr_0.88fr]">
            <Link href="/shop" className="group relative block aspect-[16/9] overflow-hidden bg-neutral">
              <Image src={imageFor("photo-1597983073493-88cd35cf93b0", 1200)} alt="Lehenga edit" fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 58vw, 100vw" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-sm font-bold uppercase tracking-wide">Lehengas In Blue Hues</p>
              </div>
            </Link>
            <div>
              <SectionTitle title="Party Ready Styles" />
              <div className="grid grid-cols-2 gap-2">
                {products.slice(0, 4).map((product) => (
                  <ProductMiniCard key={`party-${product.slug}`} product={product} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <SectionTitle title="Bestselling Designers" />
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {collectionGrid.map((tile) => (
              <ImageTile key={tile.title} {...tile} tall />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <SectionTitle title="Closet Love" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {productLoop.slice(0, 6).map((product, index) => (
              <ProductMiniCard key={`closet-${product.slug}-${index}`} product={product} />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <SectionTitle title="Udaipur Wedding Edits" />
          <div className="grid gap-3 md:grid-cols-2">
            <ImageTile title="Rajputi Poshak" image={imageFor("photo-1529139574466-a303027c1d8b", 1200)} tall />
            <ImageTile title="Indo Western Gowns" image={imageFor("photo-1515886657613-9f3515b0c78f", 1200)} tall />
          </div>
        </section>

        <section className="mt-8">
          <SectionTitle title="The Wedding Shop" />
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {productLoop.slice(2, 10).map((product, index) => (
              <ProductMiniCard key={`wedding-${product.slug}-${index}`} product={product} />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <SectionTitle title="Stores" />
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {storeImages.map((store) => (
              <Link key={store.title} href="/contact-us" className="group block">
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral">
                  <Image src={store.image} alt={store.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 25vw, 50vw" />
                </div>
                <p className="mt-2 text-center text-[12px] font-bold uppercase tracking-wide">{store.title}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 border-y border-black/15 py-10">
          <h2 className="text-center text-lg font-semibold uppercase tracking-[0.2em]">First Look Book</h2>
          <div className="mx-auto mt-8 grid max-w-5xl gap-px border border-black/20 bg-black/20 md:grid-cols-2">
            {[
              "Book a private styling appointment",
              "Find ready to ship wedding looks",
              "Explore Roop Shree festive edits",
              "Get size and custom fit support"
            ].map((item) => (
              <Link key={item} href="/contact-us" className="bg-white p-8 text-center text-[12px] font-bold uppercase tracking-wide hover:bg-neutral">
                {item}
                <span className="mx-auto mt-4 block h-px w-16 bg-black/30" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
