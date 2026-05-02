"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Check, Edit, FileText, Plus, Trash2, X } from "lucide-react";

const RichTextEditor = dynamic(
  () => import("@/components/admin/content/RichTextEditor").then((mod) => mod.RichTextEditor),
  { ssr: false, loading: () => <textarea className="min-h-[260px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Loading editor..." /> }
);

type BlogItem = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  categories?: string[];
  tags?: string[];
  isPublished: boolean;
  seoTitle?: string;
  seoDescription?: string;
};

const emptyBlog = (): Partial<BlogItem> => ({
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featuredImage: "",
  categories: ["Style"],
  tags: [],
  isPublished: false,
  seoTitle: "",
  seoDescription: ""
});

export default function BlogsClient() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [form, setForm] = useState<Partial<BlogItem> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadBlogs() {
    setLoading(true);
    const res = await fetch("/api/admin/blogs");
    const data = await res.json();
    setBlogs(data.blogs ?? []);
    setLoading(false);
  }

  useEffect(() => { loadBlogs(); }, []);

  async function save() {
    if (!form?.title || !form?.excerpt || !form?.content) {
      setError("Title, excerpt and content are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(editId ? `/api/admin/blogs/${editId}` : "/api/admin/blogs", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to save blog");
      setForm(null);
      setEditId(null);
      await loadBlogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save blog");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this blog post?")) return;
    await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
    await loadBlogs();
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Blogs</h1>
          <p className="mt-0.5 text-sm text-gray-500">Create professional buying guides, stories and SEO content.</p>
        </div>
        <button onClick={() => { setForm(emptyBlog()); setEditId(null); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white">
          <Plus className="h-4 w-4" /> New Blog
        </button>
      </div>

      {form ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">{editId ? "Edit Blog" : "New Blog"}</h2>
              <button onClick={() => setForm(null)} className="text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
            </div>
            {error ? <div className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div> : null}
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.title ?? ""} onChange={(e) => setForm((p) => ({ ...p!, title: e.target.value }))} placeholder="Blog title" className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm md:col-span-2" />
              <input value={form.slug ?? ""} onChange={(e) => setForm((p) => ({ ...p!, slug: e.target.value }))} placeholder="slug auto from title" className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
              <input value={form.featuredImage ?? ""} onChange={(e) => setForm((p) => ({ ...p!, featuredImage: e.target.value }))} placeholder="Featured image URL" className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
              <textarea value={form.excerpt ?? ""} onChange={(e) => setForm((p) => ({ ...p!, excerpt: e.target.value }))} placeholder="Excerpt" rows={3} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm md:col-span-2" />
              <div className="md:col-span-2">
                <RichTextEditor value={form.content ?? ""} onChange={(content) => setForm((p) => ({ ...p!, content }))} placeholder="Write your blog with headings, images, links and lists..." />
              </div>
              <input value={(form.categories ?? []).join(", ")} onChange={(e) => setForm((p) => ({ ...p!, categories: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))} placeholder="Categories" className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
              <input value={(form.tags ?? []).join(", ")} onChange={(e) => setForm((p) => ({ ...p!, tags: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))} placeholder="Tags" className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
              <input value={form.seoTitle ?? ""} onChange={(e) => setForm((p) => ({ ...p!, seoTitle: e.target.value }))} placeholder="SEO title" className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
              <input value={form.seoDescription ?? ""} onChange={(e) => setForm((p) => ({ ...p!, seoDescription: e.target.value }))} placeholder="SEO description" className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
              <label className="flex items-center gap-2 md:col-span-2">
                <input type="checkbox" checked={form.isPublished ?? false} onChange={(e) => setForm((p) => ({ ...p!, isPublished: e.target.checked }))} className="rounded border-gray-300 text-primary" />
                <span className="text-sm text-gray-700">Published</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setForm(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm">Cancel</button>
              <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                <Check className="h-4 w-4" /> {saving ? "Saving..." : "Save Blog"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? <div className="py-16 text-center text-sm text-gray-500">Loading blogs...</div> : blogs.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-sm text-gray-500"><FileText className="mb-3 h-10 w-10 text-gray-300" />No blog posts yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-4 py-3 text-left">Blog</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3"></th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {blogs.map((blog) => (
                <tr key={blog._id}>
                  <td className="px-4 py-3"><div className="font-semibold text-gray-900">{blog.title}</div><div className="text-xs text-gray-500">/blogs/{blog.slug}</div></td>
                  <td className="px-4 py-3"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium">{blog.isPublished ? "Published" : "Draft"}</span></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1"><button onClick={() => { setForm(blog); setEditId(blog._id); }} className="rounded p-1.5 text-gray-400 hover:bg-gray-100"><Edit className="h-4 w-4" /></button><button onClick={() => remove(blog._id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
