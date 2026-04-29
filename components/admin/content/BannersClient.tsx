"use client";

import { useEffect, useState } from "react";
import { Check, Edit, ImageIcon, Plus, Trash2, X } from "lucide-react";

type BannerItem = {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  placement: string;
  ctaLabel?: string;
  ctaHref?: string;
  couponCode?: string;
  position?: number;
  isActive: boolean;
};

const placements = ["home_hero", "home_strip", "shop_top", "cart", "checkout", "announcement"];

const emptyBanner = (): Partial<BannerItem> => ({
  title: "",
  subtitle: "",
  image: "",
  placement: "home_hero",
  ctaLabel: "Shop now",
  ctaHref: "/shop",
  couponCode: "",
  position: 0,
  isActive: true
});

export default function BannersClient() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [form, setForm] = useState<Partial<BannerItem> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadBanners() {
    setLoading(true);
    const res = await fetch("/api/admin/banners");
    const data = await res.json();
    setBanners(data.banners ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadBanners();
  }, []);

  async function save() {
    setSaving(true);
    const url = editId ? `/api/admin/banners/${editId}` : "/api/admin/banners";
    await fetch(url, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setSaving(false);
    setForm(null);
    setEditId(null);
    await loadBanners();
  }

  async function remove(id: string) {
    if (!confirm("Delete this banner?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    await loadBanners();
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Banners</h1>
          <p className="mt-0.5 text-sm text-gray-500">Manage home, shop, cart, checkout and announcement banners.</p>
        </div>
        <button onClick={() => { setForm(emptyBanner()); setEditId(null); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white">
          <Plus className="h-4 w-4" />
          New Banner
        </button>
      </div>

      {form ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">{editId ? "Edit Banner" : "New Banner"}</h2>
              <button onClick={() => setForm(null)} className="text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["title", "Title"],
                ["subtitle", "Subtitle"],
                ["image", "Image URL"],
                ["ctaLabel", "CTA Label"],
                ["ctaHref", "CTA Link"],
                ["couponCode", "Coupon Code"]
              ].map(([key, label]) => (
                <label key={key} className={key === "subtitle" || key === "image" ? "md:col-span-2" : ""}>
                  <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
                  <input value={String(form[key as keyof BannerItem] ?? "")} onChange={(e) => setForm((p) => ({ ...p!, [key]: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
                </label>
              ))}
              <label>
                <span className="mb-1 block text-sm font-medium text-gray-700">Placement</span>
                <select value={form.placement ?? "home_hero"} onChange={(e) => setForm((p) => ({ ...p!, placement: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm">
                  {placements.map((placement) => <option key={placement} value={placement}>{placement.replaceAll("_", " ")}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium text-gray-700">Position</span>
                <input type="number" value={form.position ?? 0} onChange={(e) => setForm((p) => ({ ...p!, position: Number(e.target.value) }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
              </label>
              <label className="flex items-center gap-2 md:col-span-2">
                <input type="checkbox" checked={form.isActive ?? true} onChange={(e) => setForm((p) => ({ ...p!, isActive: e.target.checked }))} className="rounded border-gray-300 text-primary" />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setForm(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm">Cancel</button>
              <button onClick={save} disabled={saving || !form.title || !form.image} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                <Check className="h-4 w-4" />
                {saving ? "Saving..." : "Save Banner"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-500">Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-sm text-gray-500">
            <ImageIcon className="mb-3 h-10 w-10 text-gray-300" />
            No banners yet
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Banner</th>
                <th className="px-4 py-3 text-left">Placement</th>
                <th className="px-4 py-3 text-left">Offer</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {banners.map((banner) => (
                <tr key={banner._id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{banner.title}</div>
                    <div className="line-clamp-1 text-xs text-gray-500">{banner.image}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{banner.placement.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3 text-gray-600">{banner.couponCode || banner.ctaLabel || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${banner.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {banner.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setForm(banner); setEditId(banner._id); }} className="rounded p-1.5 text-gray-400 hover:bg-gray-100"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => remove(banner._id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
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
