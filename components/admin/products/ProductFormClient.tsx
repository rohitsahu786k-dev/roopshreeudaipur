"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Eye, Trash2, Plus, X, GripVertical, AlertCircle } from "lucide-react";
import Link from "next/link";
import MediaUploadSection from "./MediaUploadSection";
import VariantBuilder from "./VariantBuilder";
import CountryPricingTable from "./CountryPricingTable";
import UpsellCrossSellPanel from "./UpsellCrossSellPanel";
import AttributeEditor from "./AttributeEditor";
import SEOPanel from "./SEOPanel";

type Category = { _id: string; name: string; slug: string };
type Product = Record<string, any>;

type Props = {
  product?: Product;
  categories: Category[];
};

const OCCASIONS = [
  "Wedding", "Festival", "Casual", "Party", "Office", "Formal",
  "Bridal", "Anniversary", "Reception", "Sangeet", "Pooja"
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "Custom"];

export default function ProductFormClient({ product, categories }: Props) {
  const router = useRouter();
  const isEdit = !!product;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("general");

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    status: product?.status ?? "draft",
    description: product?.description ?? "",
    shortDescription: product?.shortDescription ?? "",
    category: product?.category?._id ?? product?.category ?? "",
    subCategory: product?.subCategory ?? "",
    tags: (product?.tags ?? []) as string[],
    vendor: product?.vendor ?? "",
    collections: (product?.collections ?? []) as string[],

    // Pricing
    basePrice: product?.basePrice ?? "",
    comparePrice: product?.comparePrice ?? "",
    costPerItem: product?.costPerItem ?? "",

    // Inventory
    sku: product?.sku ?? "",
    barcode: product?.barcode ?? "",
    stock: product?.stock ?? 0,
    lowStockThreshold: product?.lowStockThreshold ?? 5,
    trackInventory: product?.trackInventory ?? true,

    // Shipping
    requiresShipping: product?.shipping?.requiresShipping ?? true,
    weight: product?.shipping?.weight ?? "",
    weightUnit: product?.shipping?.weightUnit ?? "kg",
    length: product?.shipping?.length ?? "",
    width: product?.shipping?.width ?? "",
    height: product?.shipping?.height ?? "",

    // Product details
    fabric: product?.fabric ?? "",
    occasion: (product?.occasion ?? []) as string[],
    workType: product?.workType ?? "",
    washCare: product?.washCare ?? "",
    features: (product?.features ?? []) as string[],
    attributes: (product?.attributes ?? []) as { name: string; value: string }[],

    // Media
    media: (product?.media ?? []) as { url: string; type: "image" | "video" | "reel"; alt: string; position: number; thumbnailUrl?: string }[],

    // Variants
    hasVariants: product?.hasVariants ?? false,
    options: (product?.options ?? []) as { name: string; values: string[] }[],
    variants: (product?.variants ?? []) as any[],

    // Country pricing
    countryPricing: (product?.countryPricing ?? []) as any[],

    // Related
    upsells: (product?.upsells ?? []) as any[],
    crossSells: (product?.crossSells ?? []) as any[],

    // SEO
    seo: product?.seo ?? { title: "", description: "", keywords: [] },

    // Flags
    isFeatured: product?.isFeatured ?? false,
    isNew: product?.isNew ?? false,
    isBestseller: product?.isBestseller ?? false
  });

  const [tagInput, setTagInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        isActive: form.status === "active",
        shipping: {
          requiresShipping: form.requiresShipping,
          weight: form.weight ? Number(form.weight) : undefined,
          weightUnit: form.weightUnit,
          length: form.length ? Number(form.length) : undefined,
          width: form.width ? Number(form.width) : undefined,
          height: form.height ? Number(form.height) : undefined
        },
        basePrice: Number(form.basePrice),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
        costPerItem: form.costPerItem ? Number(form.costPerItem) : undefined,
        stock: Number(form.stock)
      };

      const url = isEdit ? `/api/admin/products/${product._id}` : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }

      const data = await res.json();
      if (!isEdit) {
        router.push(`/admin/products/${data.product._id}`);
      } else {
        router.refresh();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/products/${product!._id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/products");
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  };

  const addFeature = () => {
    const f = featureInput.trim();
    if (f) set("features", [...form.features, f]);
    setFeatureInput("");
  };

  const autoSlug = () => {
    if (!form.slug && form.name) {
      set("slug", form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  };

  const TABS = [
    { id: "general", label: "General" },
    { id: "media", label: "Media & Reels" },
    { id: "pricing", label: "Pricing" },
    { id: "variants", label: "Variants" },
    { id: "country", label: "Country Pricing" },
    { id: "inventory", label: "Inventory" },
    { id: "shipping", label: "Shipping" },
    { id: "attributes", label: "Attributes" },
    { id: "related", label: "Upsell / Cross-sell" },
    { id: "seo", label: "SEO" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Products
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-medium text-gray-900">
              {isEdit ? form.name || "Edit Product" : "New Product"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isEdit && (
              <>
                <Link
                  href={`/product/${product.slug}`}
                  target="_blank"
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </>
            )}
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 lg:mx-6">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="min-w-0 flex-1">
            {/* Tab Navigation */}
            <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* General Tab */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 text-sm font-semibold text-gray-900">Product Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Product Title *
                      </label>
                      <input
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        onBlur={autoSlug}
                        placeholder="e.g. Bridal Lehenga Red Embroidery"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">URL Slug</label>
                      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                        <span className="flex items-center bg-gray-50 px-3 text-sm text-gray-400 border-r border-gray-200">
                          /product/
                        </span>
                        <input
                          value={form.slug}
                          onChange={(e) => set("slug", e.target.value)}
                          placeholder="auto-generated"
                          className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Short Description *
                      </label>
                      <textarea
                        value={form.shortDescription}
                        onChange={(e) => set("shortDescription", e.target.value)}
                        rows={2}
                        placeholder="One or two sentences for listing pages"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Full Description *
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        rows={6}
                        placeholder="Detailed product description..."
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 text-sm font-semibold text-gray-900">Product Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Fabric</label>
                      <input
                        value={form.fabric}
                        onChange={(e) => set("fabric", e.target.value)}
                        placeholder="e.g. Pure Silk, Georgette"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Work Type</label>
                      <input
                        value={form.workType}
                        onChange={(e) => set("workType", e.target.value)}
                        placeholder="e.g. Zari Work, Thread Work"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Wash Care</label>
                      <input
                        value={form.washCare}
                        onChange={(e) => set("washCare", e.target.value)}
                        placeholder="e.g. Dry Clean Only"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700">Occasions</label>
                      <div className="flex flex-wrap gap-2">
                        {OCCASIONS.map((occ) => (
                          <button
                            key={occ}
                            type="button"
                            onClick={() =>
                              set(
                                "occasion",
                                form.occasion.includes(occ)
                                  ? form.occasion.filter((o) => o !== occ)
                                  : [...form.occasion, occ]
                              )
                            }
                            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                              form.occasion.includes(occ)
                                ? "border-primary bg-primary text-white"
                                : "border-gray-200 bg-white text-gray-600 hover:border-primary"
                            }`}
                          >
                            {occ}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 text-sm font-semibold text-gray-900">Key Features</h3>
                  <div className="space-y-2">
                    {form.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span className="flex-1 text-sm text-gray-700">{f}</span>
                        <button
                          onClick={() =>
                            set("features", form.features.filter((_, j) => j !== i))
                          }
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-3">
                      <input
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addFeature()}
                        placeholder="Add a feature and press Enter"
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                      <button
                        onClick={addFeature}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 text-sm font-semibold text-gray-900">Tags</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                      >
                        {tag}
                        <button onClick={() => set("tags", form.tags.filter((t) => t !== tag))}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTag()}
                      placeholder="Add tag and press Enter"
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                    <button
                      onClick={addTag}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === "media" && (
              <MediaUploadSection
                media={form.media}
                onChange={(media) => set("media", media)}
              />
            )}

            {/* Pricing Tab */}
            {activeTab === "pricing" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 text-sm font-semibold text-gray-900">Pricing</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Price (INR) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                        <input
                          type="number"
                          value={form.basePrice}
                          onChange={(e) => set("basePrice", e.target.value)}
                          className="w-full rounded-lg border border-gray-200 py-2.5 pl-7 pr-3 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Compare-at Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                        <input
                          type="number"
                          value={form.comparePrice}
                          onChange={(e) => set("comparePrice", e.target.value)}
                          placeholder="Crossed-out price"
                          className="w-full rounded-lg border border-gray-200 py-2.5 pl-7 pr-3 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Cost per Item
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                        <input
                          type="number"
                          value={form.costPerItem}
                          onChange={(e) => set("costPerItem", e.target.value)}
                          placeholder="Your cost"
                          className="w-full rounded-lg border border-gray-200 py-2.5 pl-7 pr-3 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  {form.basePrice && form.comparePrice && Number(form.comparePrice) > Number(form.basePrice) && (
                    <div className="mt-3 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
                      Discount:{" "}
                      {Math.round(
                        ((Number(form.comparePrice) - Number(form.basePrice)) /
                          Number(form.comparePrice)) *
                          100
                      )}
                      % off
                      {form.costPerItem && (
                        <span className="ml-3">
                          Margin:{" "}
                          {Math.round(
                            ((Number(form.basePrice) - Number(form.costPerItem)) /
                              Number(form.basePrice)) *
                              100
                          )}
                          %
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Variants Tab */}
            {activeTab === "variants" && (
              <VariantBuilder
                hasVariants={form.hasVariants}
                options={form.options}
                variants={form.variants}
                basePrice={Number(form.basePrice) || 0}
                onChangeHasVariants={(v) => set("hasVariants", v)}
                onChangeOptions={(o) => set("options", o)}
                onChangeVariants={(v) => set("variants", v)}
              />
            )}

            {/* Country Pricing Tab */}
            {activeTab === "country" && (
              <CountryPricingTable
                countryPricing={form.countryPricing}
                basePrice={Number(form.basePrice) || 0}
                onChange={(cp) => set("countryPricing", cp)}
              />
            )}

            {/* Inventory Tab */}
            {activeTab === "inventory" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 text-sm font-semibold text-gray-900">Inventory</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">SKU</label>
                      <input
                        value={form.sku}
                        onChange={(e) => set("sku", e.target.value)}
                        placeholder="Stock Keeping Unit"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Barcode / ISBN</label>
                      <input
                        value={form.barcode}
                        onChange={(e) => set("barcode", e.target.value)}
                        placeholder="Barcode or ISBN"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        value={form.stock}
                        onChange={(e) => set("stock", e.target.value)}
                        min={0}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Low Stock Alert at
                      </label>
                      <input
                        type="number"
                        value={form.lowStockThreshold}
                        onChange={(e) => set("lowStockThreshold", e.target.value)}
                        min={0}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <label className="mt-4 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.trackInventory}
                      onChange={(e) => set("trackInventory", e.target.checked)}
                      className="rounded border-gray-300 text-primary"
                    />
                    <span className="text-sm text-gray-700">Track inventory for this product</span>
                  </label>
                </div>
              </div>
            )}

            {/* Shipping Tab */}
            {activeTab === "shipping" && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">Shipping</h3>
                <label className="mb-4 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.requiresShipping}
                    onChange={(e) => set("requiresShipping", e.target.checked)}
                    className="rounded border-gray-300 text-primary"
                  />
                  <span className="text-sm text-gray-700">This product requires shipping</span>
                </label>
                {form.requiresShipping && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Weight</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={form.weight}
                          onChange={(e) => set("weight", e.target.value)}
                          className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                        />
                        <select
                          value={form.weightUnit}
                          onChange={(e) => set("weightUnit", e.target.value)}
                          className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="lb">lb</option>
                          <option value="oz">oz</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Dimensions (cm)
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(["length", "width", "height"] as const).map((dim) => (
                          <div key={dim}>
                            <input
                              type="number"
                              value={form[dim]}
                              onChange={(e) => set(dim, e.target.value)}
                              placeholder={dim.charAt(0).toUpperCase() + dim.slice(1)}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Attributes Tab */}
            {activeTab === "attributes" && (
              <AttributeEditor
                attributes={form.attributes}
                onChange={(attrs) => set("attributes", attrs)}
              />
            )}

            {/* Related Tab */}
            {activeTab === "related" && (
              <UpsellCrossSellPanel
                upsells={form.upsells}
                crossSells={form.crossSells}
                currentProductId={product?._id}
                onChangeUpsells={(u) => set("upsells", u)}
                onChangeCrossSells={(cs) => set("crossSells", cs)}
              />
            )}

            {/* SEO Tab */}
            {activeTab === "seo" && (
              <SEOPanel
                seo={form.seo}
                productName={form.name}
                slug={form.slug}
                onChange={(seo) => set("seo", seo)}
              />
            )}
          </div>

          {/* Right Sidebar */}
          <div className="hidden w-72 shrink-0 space-y-4 xl:block">
            {/* Organization */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Organization</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Vendor</label>
                  <input
                    value={form.vendor}
                    onChange={(e) => set("vendor", e.target.value)}
                    placeholder="Vendor / Manufacturer"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Status & Flags */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Product Flags</h3>
              <div className="space-y-2">
                {[
                  { key: "isFeatured", label: "Featured Product" },
                  { key: "isNew", label: "Mark as New" },
                  { key: "isBestseller", label: "Bestseller" }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[key as keyof typeof form] as boolean}
                      onChange={(e) =>
                        set(key, e.target.checked)
                      }
                      className="rounded border-gray-300 text-primary"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quick Stats (edit mode) */}
            {isEdit && (
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Product Info</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span
                      className={`font-medium ${
                        form.status === "active"
                          ? "text-green-600"
                          : form.status === "archived"
                          ? "text-red-500"
                          : "text-yellow-600"
                      }`}
                    >
                      {form.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Variants</span>
                    <span className="font-medium">{form.variants.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Images</span>
                    <span className="font-medium">{form.media.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
