"use client";

import Link from "next/link";
import { Heart, Share2, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useCommerce } from "@/components/providers/CommerceProvider";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, formatMoney, moveWishlistToCart, clearWishlist } = useCommerce();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState("date-desc");
  const [stockOnly, setStockOnly] = useState(false);
  const [removeAfterAdd, setRemoveAfterAdd] = useState(true);
  const [shareUrl, setShareUrl] = useState("");
  const [status, setStatus] = useState("");

  const visibleWishlist = useMemo(() => {
    const items = stockOnly ? wishlist : wishlist;
    if (sort === "price-low") return [...items].sort((a, b) => a.price - b.price);
    if (sort === "price-high") return [...items].sort((a, b) => b.price - a.price);
    return items;
  }, [sort, stockOnly, wishlist]);

  function toggleSelection(slug: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function moveSelectedToCart() {
    const slugs = selected.size ? Array.from(selected) : visibleWishlist.map((product) => product.slug);
    moveWishlistToCart(slugs, { removeAfterAdd });
    setSelected(new Set());
  }

  async function createShareLink() {
    setStatus("");
    const response = await fetch("/api/wishlist/lists");
    if (!response.ok) {
      setStatus("Sign in to create a public wishlist link.");
      return;
    }

    const data = (await response.json()) as { lists?: Array<{ id: string; isDefault: boolean }> };
    const list = data.lists?.find((item) => item.isDefault) ?? data.lists?.[0];
    if (!list) return;

    const shareResponse = await fetch(`/api/wishlist/lists/${list.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ share: true })
    });
    const shareData = (await shareResponse.json()) as { wishlist?: { shareToken?: string }; error?: string };

    if (!shareResponse.ok || !shareData.wishlist?.shareToken) {
      setStatus(shareData.error ?? "Unable to create share link.");
      return;
    }

    setShareUrl(`${window.location.origin}/api/wishlist/share/${shareData.wishlist.shareToken}`);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-primary">Saved styles</p>
          <h1 className="mt-3 font-serif text-5xl font-bold">Wishlist</h1>
          <p className="mt-3 text-ink/65">Keep bridal, festive and occasion wear shortlisted for later.</p>
        </div>
        <Link href="/shop" className="focus-ring bg-ink px-5 py-3 text-sm font-bold uppercase tracking-wide text-white">
          Continue shopping
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <div className="mt-12 grid place-items-center border border-black/10 bg-white px-6 py-16 text-center">
          <Heart className="text-primary" size={38} />
          <h2 className="mt-4 text-xl font-bold">No saved styles yet</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink/60">Tap the heart icon on any product to save it here for comparison, styling calls and checkout later.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="focus-ring border border-black/15 bg-white px-3 py-2 text-sm">
                <option value="date-desc">Newest saved</option>
                <option value="price-low">Price low to high</option>
                <option value="price-high">Price high to low</option>
              </select>
              <label className="flex items-center gap-2 text-sm font-semibold text-ink/65">
                <input type="checkbox" checked={stockOnly} onChange={(event) => setStockOnly(event.target.checked)} className="accent-primary" />
                In stock
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-ink/65">
                <input type="checkbox" checked={removeAfterAdd} onChange={(event) => setRemoveAfterAdd(event.target.checked)} className="accent-primary" />
                Remove after adding
              </label>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <button type="button" onClick={moveSelectedToCart} className="focus-ring inline-flex items-center gap-2 bg-ink px-4 py-2 text-xs font-bold uppercase text-white">
                <ShoppingBag size={15} /> {selected.size ? `Move ${selected.size}` : "Move all"}
              </button>
              <button type="button" onClick={createShareLink} className="focus-ring inline-flex items-center gap-2 border border-black/15 px-4 py-2 text-xs font-bold uppercase">
                <Share2 size={15} /> Share
              </button>
              <button type="button" onClick={clearWishlist} className="focus-ring border border-black/15 px-4 py-2 text-xs font-bold uppercase text-ink/60 hover:text-primary">
                Clear
              </button>
            </div>
            {shareUrl || status ? (
              <p className="text-sm font-semibold md:col-span-2">
                {shareUrl ? (
                  <a className="text-primary hover:underline" href={shareUrl} target="_blank" rel="noreferrer">
                    {shareUrl}
                  </a>
                ) : (
                  <span className="text-red-700">{status}</span>
                )}
              </p>
            ) : null}
          </div>
          <div className="mt-8 hidden overflow-hidden border border-black/10 bg-white lg:block">
            <table className="w-full text-sm">
              <thead className="bg-neutral text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-3 text-left">Select</th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Stock</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {visibleWishlist.map((product) => (
                  <tr key={product.slug}>
                    <td className="px-4 py-4">
                      <input
                        aria-label={`Select ${product.name}`}
                        type="checkbox"
                        checked={selected.has(product.slug)}
                        onChange={() => toggleSelection(product.slug)}
                        className="accent-primary"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/product/${product.slug}`} className="font-bold hover:text-primary">{product.name}</Link>
                      <p className="mt-1 text-xs text-ink/55">{product.shortDescription}</p>
                    </td>
                    <td className="px-4 py-4 capitalize text-primary">In stock</td>
                    <td className="px-4 py-4 font-bold text-primary">{formatMoney(product.price)}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            moveWishlistToCart([product.slug], { removeAfterAdd });
                          }}
                          className="focus-ring inline-flex items-center gap-2 bg-ink px-3 py-2 text-xs font-bold uppercase text-white"
                        >
                          <ShoppingBag size={15} /> Add
                        </button>
                        <button type="button" onClick={() => removeFromWishlist(product.slug)} className="focus-ring border border-black/15 p-2 text-ink/55 hover:text-primary">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-6 lg:hidden">
            {visibleWishlist.map((product) => <ProductCard key={product.slug} product={product} />)}
          </div>
        </>
      )}
    </section>
  );
}
