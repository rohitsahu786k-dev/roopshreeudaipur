"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Upload, Image as ImageIcon, Video, Film, Search, Trash2, Grid, List, X, Check
} from "lucide-react";

type MediaItem = {
  _id: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  type: "image" | "video" | "reel" | "document";
  alt?: string;
  size?: number;
  width?: number;
  height?: number;
  createdAt: string;
};

const TYPE_ICONS = {
  image: ImageIcon,
  video: Video,
  reel: Film,
  document: ImageIcon
};

export default function MediaLibraryClient() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [urlInput, setUrlInput] = useState("");
  const [addType, setAddType] = useState<"image" | "video" | "reel">("image");
  const [addAlt, setAddAlt] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    const params = typeFilter ? `?type=${typeFilter}` : "";
    const res = await fetch(`/api/admin/media${params}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchMedia(); }, [typeFilter]);

  const addMedia = async () => {
    if (!urlInput.trim()) return;
    setAdding(true);
    await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: urlInput,
        type: addType,
        alt: addAlt,
        filename: urlInput.split("/").pop() ?? "media",
        folder: "general"
      })
    });
    setUrlInput("");
    setAddAlt("");
    setAdding(false);
    fetchMedia();
  };

  const deleteSelected = async () => {
    if (!confirm(`Delete ${selected.size} items?`)) return;
    await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) })
    });
    setSelected(new Set());
    fetchMedia();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "—";
    return bytes > 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      : `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Media Library</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setView("grid")} className={`rounded p-2 ${view === "grid" ? "bg-gray-100" : "hover:bg-gray-100"}`}>
            <Grid className="h-4 w-4" />
          </button>
          <button onClick={() => setView("list")} className={`rounded p-2 ${view === "list" ? "bg-gray-100" : "hover:bg-gray-100"}`}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Add Media */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Add Media by URL</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {(["image", "video", "reel"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setAddType(type)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm capitalize ${
                addType === type ? "border-primary bg-primary text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMedia()}
            placeholder="https://..."
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <input
            value={addAlt}
            onChange={(e) => setAddAlt(e.target.value)}
            placeholder="Alt text"
            className="w-40 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <button
            onClick={addMedia}
            disabled={adding || !urlInput}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {adding ? "Adding…" : "Add"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="reel">Reels</option>
        </select>
        {selected.size > 0 && (
          <button
            onClick={deleteSelected}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            Delete {selected.size}
          </button>
        )}
        <span className="ml-auto text-sm text-gray-500">{items.length} items</span>
      </div>

      {/* Grid View */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
          {items.map((item) => {
            const Icon = TYPE_ICONS[item.type];
            const isSelected = selected.has(item._id);
            return (
              <div
                key={item._id}
                onClick={() => toggleSelect(item._id)}
                className={`group relative aspect-square cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                  isSelected ? "border-primary" : "border-gray-200 hover:border-gray-400"
                }`}
              >
                {item.type === "image" ? (
                  <Image src={item.url} alt={item.alt || ""} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100">
                    <Icon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[9px] text-white truncate">{item.filename}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
              <tr>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3 text-left">File</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Dimensions</th>
                <th className="px-4 py-3 text-left">Size</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const Icon = TYPE_ICONS[item.type];
                return (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(item._id)}
                        onChange={() => toggleSelect(item._id)}
                        className="rounded border-gray-300 text-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded overflow-hidden border border-gray-200 shrink-0">
                          {item.type === "image" ? (
                            <Image src={item.url} alt={item.alt || ""} fill className="object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gray-100">
                              <Icon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-700 truncate max-w-xs">{item.filename}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-500">{item.type}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {item.width && item.height ? `${item.width}×${item.height}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatBytes(item.size)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={async () => {
                          if (!confirm("Delete?")) return;
                          await fetch("/api/admin/media", {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ids: [item._id] })
                          });
                          fetchMedia();
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
