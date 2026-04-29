"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { useCommerce } from "@/components/providers/CommerceProvider";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, formatMoney } = useCommerce();
  const secondaryImage = product.gallery.find((image) => image !== product.image) ?? product.image;

  return (
    <article className="group bg-white">
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
      <div className="space-y-2 pt-3">
        <div className="flex items-center gap-1 text-sm text-accent">
          <Star size={16} fill="currentColor" />
          <span className="font-semibold">{product.rating}</span>
          <span className="text-ink/50">({product.reviewCount})</span>
        </div>
        <div>
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-semibold leading-snug hover:text-primary">{product.name}</h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-ink/65">{product.shortDescription}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="font-bold text-primary">{formatMoney(product.price)}</span>
            <span className="ml-2 text-sm text-ink/45 line-through">{formatMoney(product.comparePrice)}</span>
          </div>
          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            className="focus-ring bg-ink p-2 text-white"
            onClick={() => addToCart(product)}
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
