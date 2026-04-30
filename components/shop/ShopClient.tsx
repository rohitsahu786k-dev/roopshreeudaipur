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
  values: string[];
};

const filterGroups: FilterGroup[] = [
  { title: "Category", values: categories.filter((item) => item.slug !== "all").map((item) => item.label) },
  { title: "Designer", values: ["Urmil", "Nupur Kanoi", "Amit Aggarwal", "Simar Dugal", "Bannhi", "Roop Shree"] },
  { title: "Size", values: ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "Custom"] },
  { title: "Color", values: ["Red", "Pink", "Yellow", "Blue", "Green", "Ivory", "Gold", "Wine"] },
  { title: "Discount", values: ["0% - 20%", "21% - 30%", "31% - 40%", "41% - 50%"] },
  { title: "Shipping Time", values: ["48 Hours", "7 Days", "10 Days", "14 Days", "1-2 Weeks", "3-4 Weeks"] }
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

function productMatches(product: Product & { displayDesigner: string }, selected: Set<string>, query: string, maxPrice: number) {
  const text = `${product.name} ${product.category} ${product.shortDescription} ${product.fabric} ${product.workType} ${product.displayDesigner}`.toLowerCase();
  const categoryLabel = categories.find((item) => item.slug === product.category)?.label;
  const selectedValues = Array.from(selected);

  if (query && !text.includes(query.toLowerCase())) return false;
  if (product.price > maxPrice) return false;

  return selectedValues.every((value) => {
    if (categoryLabel === value) return true;
    if (product.displayDesigner.toLowerCase().includes(value.toLowerCase())) return true;
    if (product.sizes.includes(value)) return true;
    if (product.colors.some((color) => color.name.toLowerCase() === value.toLowerCase())) return true;
    if (value.includes("%")) return true;
    if (value.includes("Days") || value.includes("Weeks") || value.includes("Hours")) return true;
    return false;
  });
}

export function ShopClient() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("popular");
  const [maxPrice, setMaxPrice] = useState(350000);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [apiFilters, setApiFilters] = useState<ApiFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const { formatMoney } = useCommerce();
  const allProducts = useMemo(() => enrichProducts(), []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("maxPrice", String(maxPrice));
    selected.forEach((value) => {
      const category = categories.find((item) => item.label === value);
      if (category) params.set("category", category.slug);
      else params.append(value.toLowerCase().replace(/\s+/g, "-"), value);
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
  }, [maxPrice, query, selected]);

  const filteredProducts = useMemo(() => {
    const source = apiProducts.length ? apiProducts : allProducts;
    const result = source.filter((product) => productMatches({ ...product, displayDesigner: "" }, selected, query, maxPrice));

    if (sort === "price-low") return [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-high") return [...result].sort((a, b) => b.price - a.price);
    if (sort === "new") return [...result].reverse();
    return result;
  }, [allProducts, maxPrice, query, selected, sort]);

  function toggleFilter(value: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  const dynamicFilters = apiFilters.length
    ? apiFilters.filter((filter) => filter.slug !== "price").map((filter) => ({ title: filter.name, values: filter.values.map((value) => `${value.label} (${value.count})`) }))
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
            {group.values.map((value, index) => (
              <label key={value} className="flex items-center gap-2 text-[11px] text-ink/75">
                <input checked={selected.has(value.replace(/\s\(\d+\)$/, ""))} onChange={() => toggleFilter(value.replace(/\s\(\d+\)$/, ""))} type="checkbox" className="accent-primary" />
                <span>{value}</span>
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
            <div className="relative aspect-[5/1] min-h-[180px] overflow-hidden bg-neutral">
              <Image
                src="https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=1800&q=86"
                alt="Most loved finds"
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-black/30" />
              <div className="absolute right-[8%] top-1/2 -translate-y-1/2 text-white">
                <p className="text-4xl font-light italic">Most-loved</p>
                <p className="text-3xl font-semibold">Finds</p>
                <p className="mt-2 text-sm">Designer styles setting the season alight.</p>
                <Link href="/shop" className="mt-4 inline-flex bg-white px-5 py-2 text-xs font-bold uppercase text-ink">Shop Now</Link>
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
                  onClick={() => { setSelected(new Set()); setQuery(""); setMaxPrice(350000); }}
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
