"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { useCommerce } from "@/components/providers/CommerceProvider";

function Badge({ label, variant }: { label: string; variant: "sale" | "new" | "hot" | "bestseller" }) {
  const styles: Record<string, string> = {
    sale: "bg-[#B83262] text-white",
    new: "bg-black text-white",
    hot: "bg-[#D04000] text-white animate-pulseBadge",
    bestseller: "bg-[#1C5C3A] text-white"
  };
  return (
    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${styles[variant]}`}>
      {label}
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, formatMoney, isWishlisted, toggleWishlist } = useCommerce();
  const [hovered, setHovered] = useState(false);
  const [adding, setAdding] = useState(false);
  const secondary = product.gallery.find((img) => img !== product.image) ?? product.image;
  const discountPct = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    addToCart(product);
    setTimeout(() => setAdding(false), 800);
  }

  return (
    <article
      className="group relative min-w-0 overflow-hidden bg-white transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral">
        <Link href={`/product/${product.slug}`} className="block h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-700 ${hovered ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw"
          />
          <Image
            src={secondary}
            alt=""
            fill
            className={`object-cover transition-all duration-700 ${hovered ? "opacity-100 scale-105" : "opacity-0 scale-100"}`}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw"
          />
        </Link>

        {/* Badges top-left */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {discountPct >= 10 && <Badge label={`-${discountPct}%`} variant="sale" />}
          {product.featured && discountPct < 10 && <Badge label="New" variant="new" />}
          {product.reviewCount > 80 && <Badge label="Bestseller" variant="bestseller" />}
        </div>

        {/* Wishlist button */}
        <button
          type="button"
          aria-label={`${isWishlisted(product.slug) ? "Remove from" : "Add to"} wishlist`}
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white shadow-md transition-all duration-200 sm:h-9 sm:w-9 ${isWishlisted(product.slug) ? "text-[#B83262]" : "text-ink/40 hover:text-[#B83262]"}`}
        >
          <Heart size={15} fill={isWishlisted(product.slug) ? "currentColor" : "none"} />
        </button>

        {/* Quick view overlay */}
        <div className={`absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-black/75 py-2.5 transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"}`}>
          <Link
            href={`/product/${product.slug}`}
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-white hover:text-neutral transition-colors"
          >
            <Eye size={14} /> Quick View
          </Link>
          <span className="text-white/30">|</span>
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${adding ? "text-green-400" : "text-white hover:text-neutral"}`}
          >
            <ShoppingBag size={14} /> {adding ? "Added!" : "Add to Bag"}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3 sm:pb-4">
        {/* Stars */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={10}
                  fill={i < Math.round(product.rating) ? "#F4B400" : "none"}
                  className={i < Math.round(product.rating) ? "text-[#F4B400]" : "text-black/20"}
                />
              ))}
            </div>
            <span className="text-[10px] font-semibold text-ink/55">({product.reviewCount})</span>
          </div>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-1 text-[11px] font-bold uppercase leading-snug hover:text-[#B83262] transition-colors sm:text-[12px]">
            {product.name}
          </h3>
        </Link>
        <p className="line-clamp-1 text-[10px] text-ink/50 sm:text-[11px]">{product.category.replace(/-/g, " ")}</p>
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[12px] font-bold text-ink sm:text-sm">{formatMoney(product.price)}</span>
            {product.comparePrice > product.price && (
              <span className="text-[10px] text-ink/35 line-through sm:text-xs">{formatMoney(product.comparePrice)}</span>
            )}
          </div>
          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            className={`shrink-0 p-2 transition-all duration-200 ${adding ? "bg-green-600 text-white" : "bg-ink text-white hover:bg-[#1C0606]"}`}
            onClick={handleAddToCart}
          >
            <ShoppingBag size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
