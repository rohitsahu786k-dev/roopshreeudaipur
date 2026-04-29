"use client";

import { useEffect, useState } from "react";
import { Check, Edit, FileText, Plus, Trash2, X } from "lucide-react";

type PageItem = {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  pageType: string;
  excerpt?: string;
  seo?: { title?: string; description?: string; keywords?: string[]; schemaType?: string };
};

const emptyPage = (): Partial<PageItem> => ({
  title: "",
  slug: "",
  status: "draft",
  pageType: "standard",
  excerpt: "",
  seo: {
    title: "",
    description: "",
    keywords: [],
    schemaType: "WebPage"
  }
});

export default function PagesClient() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [form, setForm] = useState<Partial<PageItem> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadPages() {
    setLoading(true);
    const res = await fetch("/api/admin/pages");
    const data = await res.json();
    setPages(data.pages ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadPages();
  }, []);

  async function save() {
    if (!form?.title) {
      setError("Page title is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const url = editId ? `/api/admin/pages/${editId}` : "/api/admin/pages";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to save page");
      setForm(null);
      setEditId(null);
      await loadPages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save page");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this page?")) return;
    await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
    await loadPages();
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pages</h1>
          <p className="mt-0.5 text-sm text-gray-500">Create business pages with SEO, schema and publish status.</p>
        </div>
        <button onClick={() => { setForm(emptyPage()); setEditId(null); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white">
          <Plus className="h-4 w-4" />
          New Page
        </button>
      </div>

      {form ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">{editId ? "Edit Page" : "New Page"}</h2>
              <button onClick={() => setForm(null)} className="text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
            </div>
            {error ? <div className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div> : null}
            <div className="grid gap-3 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-gray-700">Title</span>
                <input value={form.title ?? ""} onChange={(e) => setForm((p) => ({ ...p!, title: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium text-gray-700">Slug</span>
                <input value={form.slug ?? ""} onChange={(e) => setForm((p) => ({ ...p!, slug: e.target.value }))} placeholder="auto from title" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium text-gray-700">Status</span>
                <select value={form.status ?? "draft"} onChange={(e) => setForm((p) => ({ ...p!, status: e.target.value as PageItem["status"] }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label className="md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-gray-700">Page Summary</span>
                <textarea value={form.excerpt ?? ""} onChange={(e) => setForm((p) => ({ ...p!, excerpt: e.target.value }))} rows={3} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
              </label>
              <label className="md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-gray-700">SEO Title</span>
                <input value={form.seo?.title ?? ""} onChange={(e) => setForm((p) => ({ ...p!, seo: { ...p!.seo, title: e.target.value } }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
              </label>
              <label className="md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-gray-700">Meta Description</span>
                <textarea value={form.seo?.description ?? ""} onChange={(e) => setForm((p) => ({ ...p!, seo: { ...p!.seo, description: e.target.value } }))} rows={3} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
              </label>
              <label className="md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-gray-700">Keywords</span>
                <input value={(form.seo?.keywords ?? []).join(", ")} onChange={(e) => setForm((p) => ({ ...p!, seo: { ...p!.seo, keywords: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) } }))} placeholder="bridal lehenga, saree, Udaipur" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setForm(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm">Cancel</button>
              <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                <Check className="h-4 w-4" />
                {saving ? "Saving..." : "Save Page"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-500">Loading pages...</div>
        ) : pages.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-sm text-gray-500">
            <FileText className="mb-3 h-10 w-10 text-gray-300" />
            No pages yet
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Page</th>
                <th className="px-4 py-3 text-left">SEO</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((page) => (
                <tr key={page._id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{page.title}</div>
                    <div className="text-xs text-gray-500">/{page.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{page.seo?.title || "Missing title"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-700">{page.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setForm(page); setEditId(page._id); }} className="rounded p-1.5 text-gray-400 hover:bg-gray-100"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => remove(page._id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
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
