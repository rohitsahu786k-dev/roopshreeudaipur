"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useCommerce } from "@/components/providers/CommerceProvider";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart, formatMoney } = useCommerce();

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
          <div className="mt-8 hidden overflow-hidden border border-black/10 bg-white lg:block">
            <table className="w-full text-sm">
              <thead className="bg-neutral text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {wishlist.map((product) => (
                  <tr key={product.slug}>
                    <td className="px-4 py-4">
                      <Link href={`/product/${product.slug}`} className="font-bold hover:text-primary">{product.name}</Link>
                      <p className="mt-1 text-xs text-ink/55">{product.shortDescription}</p>
                    </td>
                    <td className="px-4 py-4 capitalize text-ink/60">{product.category.replace("-", " ")}</td>
                    <td className="px-4 py-4 font-bold text-primary">{formatMoney(product.price)}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => addToCart(product)} className="focus-ring inline-flex items-center gap-2 bg-ink px-3 py-2 text-xs font-bold uppercase text-white">
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
            {wishlist.map((product) => <ProductCard key={product.slug} product={product} />)}
          </div>
        </>
      )}
    </section>
  );
}
