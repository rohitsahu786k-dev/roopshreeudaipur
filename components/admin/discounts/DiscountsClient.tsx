"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Percent, X, Check, Tag } from "lucide-react";
import { format } from "date-fns";

type Coupon = {
  _id: string;
  code: string;
  title: string;
  type: string;
  value: number;
  maxDiscountAmount?: number;
  usedCount: number;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  minimumOrderAmount?: number;
  appliesToProducts?: string[];
  excludedProducts?: string[];
  appliesToCategories?: string[];
  eligibleCustomers?: string[];
  firstTimeUserOnly?: boolean;
  stackable?: boolean;
  autoApply?: boolean;
  marketingTrigger?: string;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
  analytics?: {
    totalUsage: number;
    revenueGenerated: number;
    failedAttempts: number;
  };
};

const empty = (): Partial<Coupon> => ({
  code: "",
  title: "",
  type: "percentage",
  value: 10,
  usedCount: 0,
  usageLimitPerCustomer: 1,
  isActive: true,
  stackable: false,
  autoApply: false,
  marketingTrigger: "none"
});

const TYPE_LABELS: Record<string, string> = {
  percentage: "% Off",
  fixed_amount: "₹ Off",
  free_shipping: "Free Shipping",
  product_specific: "Product Specific",
  buy_x_get_y: "Buy X Get Y"
};

function csvToList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function listToCsv(value?: string[]) {
  return value?.join(", ") ?? "";
}

export default function DiscountsClient() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Coupon> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ total: 0 });

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/discounts");
    const data = await res.json();
    setCoupons(data.coupons ?? []);
    setPagination(data.pagination ?? { total: 0 });
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const save = async () => {
    if (!form?.code || !form?.title) { setError("Code and title required"); return; }
    setSaving(true);
    setError("");
    try {
      const url = editId ? `/api/admin/discounts/${editId}` : "/api/admin/discounts";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setForm(null);
      setEditId(null);
      fetchCoupons();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/discounts/${id}`, { method: "DELETE" });
    fetchCoupons();
  };

  const openCreate = () => { setForm(empty()); setEditId(null); setError(""); };
  const openEdit = (c: Coupon) => { setForm({ ...c }); setEditId(c._id); setError(""); };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Discounts & Coupons</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pagination.total} coupons</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Create Coupon
        </button>
      </div>

      {/* Form Modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                {editId ? "Edit Coupon" : "New Coupon"}
              </h2>
              <button onClick={() => { setForm(null); setEditId(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {error && <div className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Coupon Code *</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f!, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. SAVE20"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-mono uppercase focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f!, title: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f!, type: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                  >
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Value {form.type === "percentage" ? "(%)" : form.type === "fixed_amount" ? "(₹)" : ""}
                  </label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f!, value: Number(e.target.value) }))}
                    min={0}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Min Order (₹)</label>
                  <input
                    type="number"
                    value={form.minimumOrderAmount ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f!, minimumOrderAmount: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Usage Limit</label>
                  <input
                    type="number"
                    value={form.usageLimit ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f!, usageLimit: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="Unlimited"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Per User Limit</label>
                  <input
                    type="number"
                    value={form.usageLimitPerCustomer ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f!, usageLimitPerCustomer: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="1"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Max Discount</label>
                  <input
                    type="number"
                    value={form.maxDiscountAmount ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f!, maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Starts At</label>
                  <input
                    type="datetime-local"
                    value={form.startsAt ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f!, startsAt: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Expires At</label>
                  <input
                    type="datetime-local"
                    value={form.endsAt ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f!, endsAt: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Applicable Products</label>
                  <input
                    value={listToCsv(form.appliesToProducts)}
                    onChange={(e) => setForm((f) => ({ ...f!, appliesToProducts: csvToList(e.target.value) }))}
                    placeholder="product-slug, product-id"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Excluded Products</label>
                  <input
                    value={listToCsv(form.excludedProducts)}
                    onChange={(e) => setForm((f) => ({ ...f!, excludedProducts: csvToList(e.target.value) }))}
                    placeholder="product-slug, product-id"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Applicable Categories</label>
                  <input
                    value={listToCsv(form.appliesToCategories)}
                    onChange={(e) => setForm((f) => ({ ...f!, appliesToCategories: csvToList(e.target.value) }))}
                    placeholder="saree, lehenga"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Eligible Users</label>
                  <input
                    value={listToCsv(form.eligibleCustomers)}
                    onChange={(e) => setForm((f) => ({ ...f!, eligibleCustomers: csvToList(e.target.value) }))}
                    placeholder="user-id, user-id"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  ["isActive", "Active"],
                  ["firstTimeUserOnly", "First-time user only"],
                  ["stackable", "Stackable"],
                  ["autoApply", "Auto apply"]
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(form[key as keyof Coupon])}
                      onChange={(e) => setForm((f) => ({ ...f!, [key]: e.target.checked }))}
                      className="rounded border-gray-300 text-primary"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setForm(null); setEditId(null); }} className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                <Check className="h-4 w-4" />
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Tag className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No coupons yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Value</th>
                <th className="px-4 py-3 text-left">Used</th>
                <th className="px-4 py-3 text-left">Expires</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-gray-900">{c.code}</div>
                    <div className="text-xs text-gray-500">{c.title}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{TYPE_LABELS[c.type]}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {c.type === "percentage" ? `${c.value}%` : c.type === "fixed_amount" ? `₹${c.value}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.analytics?.totalUsage ?? c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ""}
                    {c.analytics ? <div className="text-[11px]">Failed {c.analytics.failedAttempts}</div> : null}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                    {c.endsAt ? format(new Date(c.endsAt), "dd MMM yyyy") : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => del(c._id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
