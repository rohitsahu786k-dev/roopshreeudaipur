"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Boxes, Edit, AlertTriangle, XCircle } from "lucide-react";

type InventoryProduct = {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  stock: number;
  lowStockThreshold: number;
  status: string;
  category: { name: string } | null;
  media: { url: string; type: string }[];
  variants: { _id: string; title: string; stock: number; sku?: string }[];
};

export default function InventoryClient() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<{ productId: string; variantId?: string; stock: number } | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/inventory?filter=${filter}`);
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchInventory(); }, [filter]);

  const saveStock = async () => {
    if (!editing) return;
    setSaving(true);
    await fetch("/api/admin/inventory", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing)
    });
    setSaving(false);
    setEditing(null);
    fetchInventory();
  };

  const outOfStock = products.filter((p) =>
    p.variants.length > 0
      ? p.variants.every((v) => v.stock === 0)
      : p.stock === 0
  ).length;

  const lowStock = products.filter((p) =>
    p.variants.length > 0
      ? p.variants.some((v) => v.stock > 0 && v.stock <= p.lowStockThreshold)
      : p.stock > 0 && p.stock <= p.lowStockThreshold
  ).length;

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-xl border p-4 text-left transition-colors ${filter === "all" ? "border-primary bg-primary/5" : "border-gray-200 bg-white hover:bg-gray-50"}`}
        >
          <Boxes className="h-5 w-5 text-primary mb-1" />
          <p className="text-lg font-bold text-gray-900">{products.length}</p>
          <p className="text-xs text-gray-500">Total Products</p>
        </button>
        <button
          onClick={() => setFilter("low")}
          className={`rounded-xl border p-4 text-left transition-colors ${filter === "low" ? "border-yellow-400 bg-yellow-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}
        >
          <AlertTriangle className="h-5 w-5 text-yellow-500 mb-1" />
          <p className="text-lg font-bold text-yellow-700">{lowStock}</p>
          <p className="text-xs text-gray-500">Low Stock</p>
        </button>
        <button
          onClick={() => setFilter("out")}
          className={`rounded-xl border p-4 text-left transition-colors ${filter === "out" ? "border-red-400 bg-red-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}
        >
          <XCircle className="h-5 w-5 text-red-500 mb-1" />
          <p className="text-lg font-bold text-red-700">{outOfStock}</p>
          <p className="text-xs text-gray-500">Out of Stock</p>
        </button>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Update Stock</h3>
            <input
              type="number"
              min={0}
              value={editing.stock}
              onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 rounded-lg border border-gray-200 py-2 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={saveStock} disabled={saving} className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Boxes className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No inventory to show</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">SKU</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Stock</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  const thumb = product.media?.find((m) => m.type === "image")?.url;
                  const hasVariants = product.variants?.length > 0;
                  const totalStock = hasVariants
                    ? product.variants.reduce((s, v) => s + v.stock, 0)
                    : product.stock;
                  const isOut = totalStock === 0;
                  const isLow = totalStock > 0 && totalStock <= product.lowStockThreshold;

                  return (
                    <React.Fragment key={product._id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                              {thumb && <Image src={thumb} alt={product.name} fill className="object-cover" />}
                            </div>
                            <span className="font-medium text-gray-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{product.sku ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{product.category?.name ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${isOut ? "text-red-500" : isLow ? "text-yellow-600" : "text-gray-900"}`}>
                            {totalStock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isOut ? (
                            <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">Out of Stock</span>
                          ) : isLow ? (
                            <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">Low Stock</span>
                          ) : (
                            <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">In Stock</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            {!hasVariants && (
                              <button
                                onClick={() => setEditing({ productId: product._id, stock: product.stock })}
                                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            <Link href={`/admin/products/${product._id}`} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                              <Edit className="h-4 w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                      {hasVariants && product.variants.map((v) => (
                        <tr key={v._id} className="bg-gray-50/50 text-xs">
                          <td className="pl-16 pr-4 py-2 text-gray-600">{v.title}</td>
                          <td className="px-4 py-2 font-mono text-gray-400">{v.sku ?? "—"}</td>
                          <td className="px-4 py-2" />
                          <td className="px-4 py-2">
                            <span className={`font-medium ${v.stock === 0 ? "text-red-500" : v.stock <= product.lowStockThreshold ? "text-yellow-600" : "text-gray-700"}`}>
                              {v.stock}
                            </span>
                          </td>
                          <td className="px-4 py-2" />
                          <td className="px-4 py-2">
                            <button
                              onClick={() => setEditing({ productId: product._id, variantId: v._id, stock: v.stock })}
                              className="rounded p-1 text-gray-400 hover:text-gray-700"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
