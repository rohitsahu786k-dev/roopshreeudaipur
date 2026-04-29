"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { products } from "@/lib/catalog";
import { useCommerce } from "@/components/providers/CommerceProvider";

type AjaxSearchProps = {
  open: boolean;
  onClose: () => void;
};

export function AjaxSearch({ open, onClose }: AjaxSearchProps) {
  const [query, setQuery] = useState("");
  const { formatMoney } = useCommerce();

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) return products.slice(0, 6);

    return products
      .filter((product) =>
        [product.name, product.category, product.shortDescription, product.fabric, product.workType, product.occasion.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(value)
      )
      .slice(0, 8);
  }, [query]);

  return (
    <div className={`fixed inset-0 z-50 bg-white/95 backdrop-blur transition ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-4">
          <div className="flex flex-1 items-center gap-3">
            <Search size={24} />
            <input
              autoFocus={open}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search lehengas, sarees, suits, designers..."
              className="focus-ring w-full bg-transparent py-3 text-xl font-semibold outline-none"
            />
          </div>
          <button type="button" className="focus-ring rounded p-2 hover:bg-neutral" onClick={onClose} aria-label="Close search">
            <X size={22} />
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          {results.map((product) => (
            <Link
              key={product.slug}
              href={`/product/${product.slug}`}
              className="grid grid-cols-[72px_1fr_auto] items-center gap-4 border border-black/10 bg-white p-3 hover:border-primary"
              onClick={onClose}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-neutral">
                <Image src={product.image} alt={product.name} fill className="object-cover" sizes="72px" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wide">{product.name}</p>
                <p className="mt-1 text-xs text-ink/55">{product.category.replace("-", " ")} / {product.fabric}</p>
              </div>
              <p className="text-sm font-bold text-primary">{formatMoney(product.price)}</p>
            </Link>
          ))}
          {!results.length ? <p className="py-10 text-center text-sm font-semibold text-ink/55">No products found.</p> : null}
        </div>
      </div>
    </div>
  );
}
