"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  Database,
  Loader2
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

type Product = {
  _id: string;
  name: string;
  slug: string;
  status: "draft" | "active" | "archived";
  basePrice: number;
  comparePrice?: number;
  stock: number;
  hasVariants: boolean;
  category: { name: string } | null;
  media: { url: string; type: string }[];
  isFeatured: boolean;
  variants: any[];
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  archived: "bg-gray-100 text-gray-600"
};

export default function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search && { search }),
        ...(status && { status })
      });
      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      setProducts(data.products ?? []);
      setPagination(data.pagination ?? { total: 0, pages: 1 });
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchProducts, search]);

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} products?`)) return;
    await Promise.all(Array.from(selected).map((id) => fetch(`/api/admin/products/${id}`, { method: "DELETE" })));
    setSelected(new Set());
    fetchProducts();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(
      selected.size === products.length ? new Set() : new Set(products.map((p) => p._id))
    );
  };

  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

  const seedProducts = async () => {
    if (!confirm("This will add all 20 catalog products to the database. Existing products with the same slug will be skipped. Continue?")) return;
    setSeeding(true);
    setSeedMsg("");
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json();
      setSeedMsg(data.message ?? "Done");
      fetchProducts();
    } catch {
      setSeedMsg("Seed failed");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pagination.total} total products</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={seedProducts}
            disabled={seeding}
            title="Import 20 products from static catalog"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            {seeding ? "Seeding…" : "Seed 20 Products"}
          </button>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>
      {seedMsg && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          {seedMsg}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none bg-white"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        {selected.size > 0 && (
          <button
            onClick={bulkDelete}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            Delete {selected.size}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <Skeleton className="h-10 w-10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search || status ? "Try different filters" : "Add your first product to get started"}
            </p>
            {!search && !status && (
              <Link
                href="/admin/products/new"
                className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
              >
                <Plus className="h-4 w-4" /> Add Product
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.size === products.length && products.length > 0}
                        onChange={toggleAll}
                        className="rounded border-gray-300 text-primary"
                      />
                    </th>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-left">Stock</th>
                    <th className="px-4 py-3 text-left">Variants</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => {
                    const thumb = product.media?.find((m) => m.type === "image")?.url;
                    const totalStock = product.hasVariants
                      ? (product.variants ?? []).reduce((s, v) => s + (v.stock ?? 0), 0)
                      : product.stock;

                    return (
                      <tr key={product._id} className="hover:bg-gray-50 group">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.has(product._id)}
                            onChange={() => toggleSelect(product._id)}
                            className="rounded border-gray-300 text-primary"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                              {thumb ? (
                                <Image src={thumb} alt={product.name} fill className="object-cover" />
                              ) : (
                                <Package className="h-5 w-5 text-gray-300 m-auto" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/admin/products/${product._id}`}
                                className="font-medium text-gray-900 hover:text-primary truncate block max-w-xs"
                              >
                                {product.name}
                              </Link>
                              {product.isFeatured && (
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                              STATUS_COLORS[product.status] ?? ""
                            }`}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {product.category?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            ₹{product.basePrice?.toLocaleString()}
                          </div>
                          {product.comparePrice && (
                            <div className="text-xs text-gray-400 line-through">
                              ₹{product.comparePrice?.toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-medium ${
                              totalStock === 0
                                ? "text-red-500"
                                : totalStock <= 5
                                ? "text-yellow-600"
                                : "text-gray-900"
                            }`}
                          >
                            {totalStock}
                          </span>
                          {totalStock === 0 && (
                            <span className="ml-1.5 text-xs text-red-400">Out</span>
                          )}
                          {totalStock > 0 && totalStock <= 5 && (
                            <span className="ml-1.5 text-xs text-yellow-500">Low</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {product.variants?.length > 0 ? product.variants.length : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative flex justify-end">
                            <button
                              onClick={() =>
                                setActionMenu(actionMenu === product._id ? null : product._id)
                              }
                              className="rounded p-1 text-gray-400 hover:bg-gray-100"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {actionMenu === product._id && (
                              <div
                                className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-gray-200 bg-white shadow-lg z-10"
                                onBlur={() => setActionMenu(null)}
                              >
                                <Link
                                  href={`/admin/products/${product._id}`}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  onClick={() => setActionMenu(null)}
                                >
                                  <Edit className="h-4 w-4" /> Edit
                                </Link>
                                <Link
                                  href={`/product/${product.slug}`}
                                  target="_blank"
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  onClick={() => setActionMenu(null)}
                                >
                                  <Eye className="h-4 w-4" /> View
                                </Link>
                                <button
                                  onClick={() => { deleteProduct(product._id); setActionMenu(null); }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                <p className="text-sm text-gray-500">
                  Page {page} of {pagination.pages} ({pagination.total} products)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === pagination.pages}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 hover:bg-gray-50"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
