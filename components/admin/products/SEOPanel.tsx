"use client";

import { useState } from "react";
import { Eye } from "lucide-react";

type SEO = {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
};

type Props = {
  seo: SEO;
  productName: string;
  slug: string;
  onChange: (seo: SEO) => void;
};

export default function SEOPanel({ seo, productName, slug, onChange }: Props) {
  const [kwInput, setKwInput] = useState("");

  const set = (key: keyof SEO, value: unknown) =>
    onChange({ ...seo, [key]: value });

  const addKeyword = () => {
    const kw = kwInput.trim();
    if (kw && !seo.keywords.includes(kw)) {
      set("keywords", [...seo.keywords, kw]);
    }
    setKwInput("");
  };

  const removeKeyword = (kw: string) =>
    set("keywords", seo.keywords.filter((k) => k !== kw));

  const titleLen = seo.title.length;
  const descLen = seo.description.length;

  const titleColor =
    titleLen === 0 ? "text-gray-400" : titleLen < 30 ? "text-yellow-500" : titleLen <= 60 ? "text-green-600" : "text-red-500";
  const descColor =
    descLen === 0 ? "text-gray-400" : descLen < 70 ? "text-yellow-500" : descLen <= 160 ? "text-green-600" : "text-red-500";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Search Engine Optimization</h3>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">Meta Title</label>
              <span className={`text-xs ${titleColor}`}>{titleLen}/60</span>
            </div>
            <input
              value={seo.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={productName || "Product title for search results"}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">Meta Description</label>
              <span className={`text-xs ${descColor}`}>{descLen}/160</span>
            </div>
            <textarea
              value={seo.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Brief description shown in search results..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Focus Keywords
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {seo.keywords.map((kw) => (
                <span
                  key={kw}
                  className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                >
                  {kw}
                  <button onClick={() => removeKeyword(kw)} className="text-gray-400 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={kwInput}
                onChange={(e) => setKwInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                placeholder="Add keyword and press Enter"
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <button
                onClick={addKeyword}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
              >
                Add
              </button>
            </div>
          </div>

          {/* OG Image */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Social Share Image URL
            </label>
            <input
              value={seo.ogImage ?? ""}
              onChange={(e) => set("ogImage", e.target.value)}
              placeholder="https://... (defaults to first product image)"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      {(seo.title || seo.description || productName) && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900">Google Preview</h3>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 bg-white font-sans">
            <div className="text-xs text-green-700 mb-1">
              roopshreeudaipur.com/product/{slug || "your-product"}
            </div>
            <div className="text-lg text-blue-700 hover:underline cursor-pointer leading-tight mb-1">
              {seo.title || productName || "Product Title"}
            </div>
            <div className="text-sm text-gray-600 leading-relaxed">
              {seo.description || "Add a meta description to improve click-through rates from search results."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
