"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { useCommerce } from "@/components/providers/CommerceProvider";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, formatMoney, isWishlisted, toggleWishlist } = useCommerce();
  const secondaryImage = product.gallery.find((image) => image !== product.image) ?? product.image;

  return (
    <article className="group min-w-0 overflow-hidden bg-white">
      <div className="relative">
        <Link href={`/product/${product.slug}`} className="block">
          <div className="relative aspect-[4/5] overflow-hidden bg-neutral">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition duration-500 group-hover:opacity-0"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
            <Image
              src={secondaryImage}
              alt=""
              fill
              className="object-cover opacity-0 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          </div>
        </Link>
        <button
          type="button"
          aria-label={`${isWishlisted(product.slug) ? "Remove" : "Add"} ${product.name} ${isWishlisted(product.slug) ? "from" : "to"} wishlist`}
          onClick={() => toggleWishlist(product)}
          className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow transition sm:right-3 sm:top-3 sm:h-9 sm:w-9 ${isWishlisted(product.slug) ? "text-primary" : "text-ink"}`}
        >
          <Heart size={16} fill={isWishlisted(product.slug) ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="min-w-0 space-y-1.5 px-2 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-3 sm:space-y-2">
        <div className="flex items-center gap-1 text-xs text-accent sm:text-sm">
          <Star size={13} fill="currentColor" />
          <span className="font-semibold">{product.rating}</span>
          <span className="text-ink/50">({product.reviewCount})</span>
        </div>
        <div className="min-w-0">
          <Link href={`/product/${product.slug}`}>
            <h3 className="line-clamp-1 text-[12px] font-semibold leading-snug hover:text-primary sm:text-[13px] md:text-sm">{product.name}</h3>
          </Link>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-5 text-ink/65 sm:text-xs sm:leading-6">{product.shortDescription}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[12px] font-bold text-primary sm:text-sm">{formatMoney(product.price)}</span>
            <span className="ml-1 text-[11px] text-ink/45 line-through sm:ml-2 sm:text-sm">{formatMoney(product.comparePrice)}</span>
          </div>
          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            className="focus-ring shrink-0 bg-ink p-2 text-white"
            onClick={() => addToCart(product)}
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
