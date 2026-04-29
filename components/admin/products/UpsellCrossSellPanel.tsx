"use client";

import { useState, useEffect } from "react";
import { Search, X, ArrowUp, ArrowRight } from "lucide-react";
import Image from "next/image";

type ProductRef = {
  _id: string;
  name: string;
  basePrice?: number;
  media?: { url: string }[];
};

type Props = {
  upsells: ProductRef[];
  crossSells: ProductRef[];
  currentProductId?: string;
  onChangeUpsells: (products: ProductRef[]) => void;
  onChangeCrossSells: (products: ProductRef[]) => void;
};

function ProductPicker({
  label,
  description,
  selected,
  currentProductId,
  onAdd,
  onRemove,
  icon: Icon
}: {
  label: string;
  description: string;
  selected: ProductRef[];
  currentProductId?: string;
  onAdd: (p: ProductRef) => void;
  onRemove: (id: string) => void;
  icon: React.ElementType;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ProductRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/products?search=${encodeURIComponent(search)}&limit=10`);
        const data = await res.json();
        const selectedIds = new Set(selected.map((p) => p._id));
        setResults(
          (data.products ?? []).filter(
            (p: ProductRef) => p._id !== currentProductId && !selectedIds.has(p._id)
          )
        );
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, selected, currentProductId]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
      </div>
      <p className="mb-4 text-xs text-gray-500">{description}</p>

      {/* Selected */}
      {selected.length > 0 && (
        <div className="mb-4 space-y-2">
          {selected.map((p) => (
            <div
              key={p._id}
              className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-2"
            >
              {p.media?.[0]?.url ? (
                <div className="relative h-10 w-10 rounded overflow-hidden shrink-0">
                  <Image src={p.media[0].url} alt={p.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded bg-gray-200 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium text-gray-900">{p.name}</div>
                {p.basePrice && (
                  <div className="text-xs text-gray-500">₹{p.basePrice.toLocaleString()}</div>
                )}
              </div>
              <button onClick={() => onRemove(p._id)} className="text-gray-400 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      {showSearch ? (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
          />
          {(results.length > 0 || loading) && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg z-10 max-h-64 overflow-y-auto">
              {loading && (
                <div className="p-3 text-sm text-gray-500 text-center">Searching...</div>
              )}
              {results.map((p) => (
                <button
                  key={p._id}
                  onClick={() => { onAdd(p); setSearch(""); setResults([]); setShowSearch(false); }}
                  className="flex w-full items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left"
                >
                  {p.media?.[0]?.url ? (
                    <div className="relative h-8 w-8 rounded overflow-hidden shrink-0">
                      <Image src={p.media[0].url} alt={p.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded bg-gray-200 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium text-gray-900">{p.name}</div>
                    {p.basePrice && (
                      <div className="text-xs text-gray-500">₹{p.basePrice.toLocaleString()}</div>
                    )}
                  </div>
                </button>
              ))}
              {!loading && results.length === 0 && search && (
                <div className="p-3 text-sm text-gray-500 text-center">No products found</div>
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowSearch(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-primary hover:text-primary"
        >
          <Search className="h-4 w-4" />
          Search and add products
        </button>
      )}
    </div>
  );
}

export default function UpsellCrossSellPanel({
  upsells,
  crossSells,
  currentProductId,
  onChangeUpsells,
  onChangeCrossSells
}: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h4 className="text-sm font-semibold text-yellow-800 mb-1">How these work</h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>
            <strong>Upsells</strong> — Shown on the product page as premium alternatives (&quot;You might also like&quot;)
          </li>
          <li>
            <strong>Cross-sells</strong> — Shown in cart/checkout as complementary items (&quot;Complete the look&quot;)
          </li>
        </ul>
      </div>

      <ProductPicker
        label="Upsell Products"
        description="Higher-value alternatives shown on the product page to encourage upgrading"
        selected={upsells}
        currentProductId={currentProductId}
        onAdd={(p) => onChangeUpsells([...upsells, p])}
        onRemove={(id) => onChangeUpsells(upsells.filter((u) => u._id !== id))}
        icon={ArrowUp}
      />

      <ProductPicker
        label="Cross-sell Products"
        description="Complementary products shown in the cart to increase average order value"
        selected={crossSells}
        currentProductId={currentProductId}
        onAdd={(p) => onChangeCrossSells([...crossSells, p])}
        onRemove={(id) => onChangeCrossSells(crossSells.filter((c) => c._id !== id))}
        icon={ArrowRight}
      />
    </div>
  );
}
