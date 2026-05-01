"use client";

import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useCommerce } from "@/components/providers/CommerceProvider";
import { categories, products, type Product } from "@/lib/catalog";
import { Skeleton } from "@/components/ui/Skeleton";

type FilterGroup = {
  title: string;
  slug: string;
  values: { label: string; value: string; count?: number; colorHex?: string }[];
};

const filterGroups: FilterGroup[] = [
  { title: "Category", slug: "category", values: categories.filter((item) => item.slug !== "all").map((item) => ({ label: item.label, value: item.slug })) },
  { title: "Designer", slug: "designer", values: ["Urmil", "Nupur Kanoi", "Amit Aggarwal", "Simar Dugal", "Bannhi", "Roop Shree"].map((value) => ({ label: value, value })) },
  { title: "Size", slug: "size", values: ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "Custom"].map((value) => ({ label: value, value })) },
  { title: "Color", slug: "color", values: ["Red", "Pink", "Yellow", "Blue", "Green", "Ivory", "Gold", "Wine"].map((value) => ({ label: value, value })) },
  { title: "Discount", slug: "discount", values: ["0% - 20%", "21% - 30%", "31% - 40%", "41% - 50%"].map((value) => ({ label: value, value })) },
  { title: "Shipping Time", slug: "shipping-time", values: ["48 Hours", "7 Days", "10 Days", "14 Days", "1-2 Weeks", "3-4 Weeks"].map((value) => ({ label: value, value })) }
];

const designers = ["URMIL", "NUPUR KANOI", "AMIT AGGARWAL", "BANNHI BY PRIYANKA", "SIMAR DUGAL", "TWENTY NINE"];

type ApiFilter = {
  name: string;
  slug: string;
  inputType: "checkbox" | "radio" | "range" | "color" | "size";
  filterLogic: "or" | "and";
  values: { label: string; value: string; count: number; colorHex?: string }[];
  min?: number;
  max?: number;
};

type ShopBanner = {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

function enrichProducts() {
  return Array.from({ length: 4 })
    .flatMap((_, groupIndex) =>
      products.map((product, index) => ({
        ...product,
        displayDesigner: designers[(index + groupIndex) % designers.length],
        displayName: product.name.replace("Ruhani", "Roop Shree"),
        shippingLabel: index % 2 === 0 ? "Ready to ship" : "Ships in 14 days"
      }))
    )
    .slice(0, 24);
}

function productMatches(product: Product & { displayDesigner: string }, selected: Record<string, string[]>, query: string, maxPrice: number) {
  const text = `${product.name} ${product.category} ${product.shortDescription} ${product.fabric} ${product.workType} ${product.displayDesigner}`.toLowerCase();
  const selectedValues = Object.entries(selected).flatMap(([slug, values]) => values.map((value) => ({ slug, value })));

  if (query && !text.includes(query.toLowerCase())) return false;
  if (product.price > maxPrice) return false;

  return selectedValues.every(({ slug, value }) => {
    if (slug === "category") return product.category === value;
    if (slug === "designer") return product.displayDesigner.toLowerCase().includes(value.toLowerCase());
    if (slug === "size") return product.sizes.includes(value);
    if (slug === "color") return product.colors.some((color) => color.name.toLowerCase() === value.toLowerCase());
    if (slug === "discount") return value.includes("%");
    if (slug === "shipping-time") return value.includes("Days") || value.includes("Weeks") || value.includes("Hours");
    return false;
  });
}

export function ShopClient() {
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("popular");
  const [maxPrice, setMaxPrice] = useState(350000);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [apiFilters, setApiFilters] = useState<ApiFilter[]>([]);
  const [shopBanner, setShopBanner] = useState<ShopBanner | null>(null);
  const [loading, setLoading] = useState(false);
  const { formatMoney } = useCommerce();
  const allProducts = useMemo(() => enrichProducts(), []);

  useEffect(() => {
    fetch("/api/banners?placement=shop_top", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setShopBanner(data.banners?.[0] ?? null))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("maxPrice", String(maxPrice));
    params.set("sort", sort);
    Object.entries(selected).forEach(([slug, values]) => {
      values.forEach((value) => {
        if (slug === "category") params.set("category", value);
        else params.append(slug, value);
      });
    });

    window.history.replaceState(null, "", `/shop?${params.toString()}`);
    setLoading(true);
    fetch(`/api/products?${params.toString()}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        setApiProducts((data.products ?? []).map((item: any) => ({
          name: item.name,
          slug: item.slug,
          category: typeof item.category === "string" ? item.category : "saree",
          shortDescription: item.shortDescription ?? item.shortDescription ?? "",
          description: item.description ?? "",
          image: item.image ?? item.media?.[0]?.url ?? item.images?.[0] ?? "/logo.jpg",
          gallery: item.gallery ?? item.images ?? item.media?.map((media: any) => media.url) ?? [item.image ?? "/logo.jpg"],
          price: item.price ?? item.basePrice ?? 0,
          comparePrice: item.comparePrice ?? item.basePrice ?? 0,
          rating: item.rating ?? item.ratings?.average ?? 0,
          reviewCount: item.reviewCount ?? item.ratings?.count ?? 0,
          fabric: item.fabric ?? "",
          occasion: item.occasion ?? [],
          workType: item.workType ?? "",
          washCare: item.washCare ?? "",
          colors: item.colors ?? item.options?.find((option: any) => option.name?.toLowerCase() === "color")?.values?.map((name: string) => ({ name, hex: "#cccccc" })) ?? [],
          sizes: item.sizes ?? item.options?.find((option: any) => option.name?.toLowerCase() === "size")?.values ?? ["Free Size"],
          videoUrl: item.videoUrl ?? item.productVideoUrl
        })));
        setApiFilters(data.filters ?? []);
      })
      .finally(() => setLoading(false));
  }, [maxPrice, query, selected, sort]);

  const filteredProducts = useMemo(() => {
    const source = apiProducts.length ? apiProducts : allProducts;
    const result = source.filter((product) => productMatches({ ...product, displayDesigner: "" }, selected, query, maxPrice));

    if (sort === "price-low") return [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-high") return [...result].sort((a, b) => b.price - a.price);
    if (sort === "new") return [...result].reverse();
    return result;
  }, [allProducts, apiProducts, maxPrice, query, selected, sort]);

  function toggleFilter(slug: string, value: string) {
    setSelected((current) => {
      const values = current[slug] ?? [];
      const nextValues = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
      const next = { ...current };
      if (nextValues.length) next[slug] = nextValues;
      else delete next[slug];
      return next;
    });
  }

  const dynamicFilters = apiFilters.length
    ? apiFilters.filter((filter) => filter.slug !== "price").map((filter) => ({
        title: filter.name,
        slug: filter.slug,
        values: filter.values
      }))
    : filterGroups;

  const sidebar = (
    <aside className="h-fit bg-[#f7f7f7] pr-4 text-xs lg:sticky lg:top-28">
      <label className="mb-5 flex items-center gap-2 font-semibold">
        <input type="checkbox" className="accent-primary" /> Ready To Ship ({filteredProducts.length})
      </label>
      {dynamicFilters.map((group) => (
        <section key={group.title} className="border-b border-black/10 py-4">
          <h2 className="font-bold uppercase tracking-wide">{group.title}</h2>
          <input
            placeholder="Search"
            className="focus-ring mt-3 w-full border border-black/10 bg-white px-3 py-2 text-[11px]"
            onChange={(event) => group.title === "Category" && setQuery(event.target.value)}
          />
          <div className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1">
            {group.values.map((value) => (
              <label key={`${group.slug}-${value.value}`} className="flex items-center gap-2 text-[11px] text-ink/75">
                <input checked={(selected[group.slug] ?? []).includes(value.value)} onChange={() => toggleFilter(group.slug, value.value)} type="checkbox" className="accent-primary" />
                {value.colorHex ? <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: value.colorHex }} /> : null}
                <span>{value.label}{typeof value.count === "number" ? ` (${value.count})` : ""}</span>
              </label>
            ))}
          </div>
          <button type="button" className="mt-3 text-[11px] font-bold uppercase text-ink/60">View More</button>
        </section>
      ))}
      <section className="py-4">
        <h2 className="font-bold uppercase tracking-wide">Price</h2>
        <div className="mt-3 flex gap-2">
          <input value="0" readOnly className="w-1/2 border border-black/10 bg-white px-2 py-2 text-[11px]" />
          <input value={maxPrice} readOnly className="w-1/2 border border-black/10 bg-white px-2 py-2 text-[11px]" />
        </div>
        <input
          type="range"
          min={1000}
          max={350000}
          value={maxPrice}
          onChange={(event) => setMaxPrice(Number(event.target.value))}
          className="mt-4 w-full accent-primary"
        />
      </section>
    </aside>
  );

  return (
    <section className="bg-[#f7f7f7]">
      <div className="mx-auto max-w-[1728px] px-4 py-5 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <div className="hidden lg:block">{sidebar}</div>

          <div>
            <div className="relative min-h-[260px] overflow-hidden bg-neutral sm:aspect-[5/1] sm:min-h-[180px]">
              {shopBanner?.mobileImage ? (
                <Image
                  src={shopBanner.mobileImage}
                  alt={shopBanner.title}
                  fill
                  priority
                  className="object-cover md:hidden"
                  sizes="100vw"
                />
              ) : null}
              <Image
                src={shopBanner?.image ?? "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=1800&q=86"}
                alt="Most loved finds"
                fill
                priority
                className={`${shopBanner?.mobileImage ? "hidden md:block" : ""} object-cover object-center`}
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-black/30" />
              <div className="absolute inset-x-5 bottom-5 text-white sm:inset-auto sm:right-[8%] sm:top-1/2 sm:max-w-sm sm:-translate-y-1/2">
                <p className="text-3xl font-light italic sm:text-4xl">{shopBanner?.title ?? "Most-loved"}</p>
                <p className="text-2xl font-semibold sm:text-3xl">{shopBanner ? "" : "Finds"}</p>
                <p className="mt-2 max-w-xs text-sm">{shopBanner?.subtitle ?? "Designer styles setting the season alight."}</p>
                <Link href={shopBanner?.ctaHref ?? "/shop"} className="mt-4 inline-flex bg-white px-5 py-2 text-xs font-bold uppercase text-ink">{shopBanner?.ctaLabel ?? "Shop Now"}</Link>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-b border-black/20 pb-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs text-ink/45">Home &gt; Womenswear</p>
                <h1 className="mt-2 text-base font-bold uppercase tracking-wide">Womenswear <span className="font-normal text-ink/55">({loading ? "Loading" : `${filteredProducts.length} products`})</span></h1>
              </div>
              <div className="flex gap-2">
                <button type="button" className="focus-ring flex items-center gap-2 border border-black/15 bg-white px-3 py-2 text-xs font-bold uppercase lg:hidden" onClick={() => setMobileFiltersOpen(true)}>
                  <SlidersHorizontal size={16} /> Filters
                </button>
                <select value={sort} onChange={(event) => setSort(event.target.value)} className="focus-ring border border-black/15 bg-white px-3 py-2 text-xs">
                  <option value="popular">Sort by Popular</option>
                  <option value="new">Newest</option>
                  <option value="price-low">Price low to high</option>
                  <option value="price-high">Price high to low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[3/4] w-full rounded-none" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <p className="text-lg font-bold text-ink">No products found</p>
                <p className="text-sm text-ink/60">Try adjusting your filters or search query.</p>
                <button
                  type="button"
                  onClick={() => { setSelected({}); setQuery(""); setMaxPrice(350000); }}
                  className="mt-4 text-sm font-bold uppercase tracking-wide text-primary underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden">
          <div className="h-full max-w-xs overflow-y-auto bg-[#f7f7f7] p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-bold uppercase">Filters</p>
              <button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                <X size={20} />
              </button>
            </div>
            {sidebar}
          </div>
        </div>
      ) : null}
    </section>
  );
}
