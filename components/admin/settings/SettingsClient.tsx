"use client";

import { useEffect, useState } from "react";
import { Bell, Check, PlaySquare, Plus, Save, Store, Timer, Trash2, Truck } from "lucide-react";

type ShippingZone = {
  countryCode: string;
  countryName: string;
  currency: string;
  baseRate: number;
  freeShippingThreshold: number;
  estimatedDelivery: string;
  isActive: boolean;
};

type StoreSettings = {
  storeName: string;
  legalName: string;
  tagline: string;
  logoUrl: string;
  gstNumber: string;
  email: string;
  phone: string;
  whatsapp: string;
  instagramUrl: string;
  announcement: string;
  saleEndsAt: string;
  saleLabel: string;
  announcementMessages: string[];
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    pincode?: string;
  };
  defaultSeo: {
    title: string;
    description: string;
    keywords: string[];
    schemaType: string;
    ogImage?: string;
  };
  cart: {
    freeShippingThreshold: number;
    suggestedCoupons: string[];
    giftWrapThreshold: number;
  };
  reels: { title: string; url: string; isActive: boolean; sortOrder: number }[];
  instagramPosts: { url: string; image?: string; caption?: string; sortOrder: number }[];
  shippingZones: ShippingZone[];
};

const emptySettings: StoreSettings = {
  storeName: "Roop Shree Udaipur",
  legalName: "Roop Shree Udaipur",
  tagline: "Bridal lehengas, sarees, suits and handcrafted occasion wear from Udaipur.",
  logoUrl: "/logo.jpg",
  gstNumber: "08ABKFR6839B1ZY",
  email: "info@roopshreeudaipur.com",
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  instagramUrl: "https://www.instagram.com/roopshreeudaipur/",
  announcement: "Free shipping in India on eligible orders. New bridal edits now available.",
  saleEndsAt: "2026-05-15T23:59:59",
  saleLabel: "Sale Ends In",
  announcementMessages: [
    "Grand Festive Sale — Up to 40% Off Sitewide",
    "Free shipping in India on orders above ₹2,999",
    "New bridal lehengas just dropped — Shop Now",
    "Handcrafted ethnic wear from Udaipur Studio"
  ],
  address: {
    line1: "Udaipur, Rajasthan",
    city: "Udaipur",
    state: "Rajasthan",
    country: "India"
  },
  defaultSeo: {
    title: "Roop Shree Udaipur | Bridal Lehengas, Sarees & Ethnic Wear",
    description: "Shop bridal lehengas, sarees, suits, gowns and hand work ethnic wear from Roop Shree Udaipur.",
    keywords: ["Roop Shree Udaipur", "bridal lehenga Udaipur", "ethnic wear Udaipur"],
    schemaType: "ClothingStore"
  },
  cart: {
    freeShippingThreshold: 2999,
    suggestedCoupons: ["ROOP10", "SHIPFREE", "BRIDAL1500"],
    giftWrapThreshold: 12000
  },
  reels: [],
  instagramPosts: [],
  shippingZones: []
};

const tabs = [
  { id: "store", label: "Store", icon: Store },
  { id: "sale", label: "Sale Timer", icon: Timer },
  { id: "reels", label: "Reels", icon: PlaySquare },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "notifications", label: "Notifications", icon: Bell }
];

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState("store");
  const [settings, setSettings] = useState<StoreSettings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/store-settings");
      const data = await res.json();
      setSettings({ ...emptySettings, ...(data.settings ?? {}) });
      setLoading(false);
    }
    load();
  }, []);

  function update(path: string, value: unknown) {
    setSettings((current) => {
      const next: StoreSettings = structuredClone(current);
      const keys = path.split(".");
      let target: any = next;
      keys.slice(0, -1).forEach((key) => {
        target = target[key];
      });
      target[keys[keys.length - 1]] = value;
      return next;
    });
  }

  async function save() {
    setSaving(true);
    await fetch("/api/admin/store-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function addZone() {
    update("shippingZones", [
      ...settings.shippingZones,
      {
        countryCode: "GB",
        countryName: "United Kingdom",
        currency: "GBP",
        baseRate: 2499,
        freeShippingThreshold: 35000,
        estimatedDelivery: "8-14 business days",
        isActive: true
      }
    ]);
  }

  function addReel() {
    update("reels", [...(settings.reels ?? []), { title: "New reel", url: "", isActive: true, sortOrder: settings.reels?.length ?? 0 }]);
  }

  function updateReel(index: number, key: "title" | "url" | "isActive" | "sortOrder", value: string | number | boolean) {
    update("reels", settings.reels.map((reel, reelIndex) => (reelIndex === index ? { ...reel, [key]: value } : reel)));
  }

  function addPost() {
    update("instagramPosts", [...(settings.instagramPosts ?? []), { url: "", image: "", caption: "", sortOrder: settings.instagramPosts?.length ?? 0 }]);
  }

  function updateZone(index: number, key: keyof ShippingZone, value: string | number | boolean) {
    update(
      "shippingZones",
      settings.shippingZones.map((zone, zoneIndex) => (zoneIndex === index ? { ...zone, [key]: value } : zone))
    );
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Store Settings</h1>
          <p className="mt-0.5 text-sm text-gray-500">Manage business details, SEO defaults, cart nudges and country-wise shipping.</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved" : saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="flex gap-6">
        <nav className="w-48 shrink-0 space-y-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${activeTab === tab.id ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1">
          {activeTab === "store" ? (
            <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-6 md:grid-cols-2">
              {[
                ["storeName", "Store Name"],
                ["legalName", "Legal Name"],
                ["gstNumber", "GSTIN"],
                ["logoUrl", "Invoice Logo URL"],
                ["tagline", "Tagline"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["whatsapp", "WhatsApp"],
                ["instagramUrl", "Instagram URL"],
                ["announcement", "Announcement Bar"],
                ["address.line1", "Address"],
                ["address.city", "City"],
                ["address.state", "State"],
                ["address.country", "Country"],
                ["address.pincode", "Pincode"]
              ].map(([path, label]) => (
                <label key={path} className={path === "tagline" || path === "announcement" || path === "address.line1" ? "md:col-span-2" : ""}>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
                  <input value={String(path.split(".").reduce((acc: any, key) => acc?.[key], settings) ?? "")} onChange={(e) => update(path, e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </label>
              ))}

              <div className="border-t border-gray-100 pt-4 md:col-span-2">
                <h2 className="mb-3 text-sm font-semibold text-gray-900">Default SEO</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  <input value={settings.defaultSeo.title} onChange={(e) => update("defaultSeo.title", e.target.value)} placeholder="SEO title" className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
                  <input value={settings.defaultSeo.schemaType} onChange={(e) => update("defaultSeo.schemaType", e.target.value)} placeholder="Schema type" className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
                  <textarea value={settings.defaultSeo.description} onChange={(e) => update("defaultSeo.description", e.target.value)} placeholder="Meta description" rows={3} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm md:col-span-2" />
                  <input value={settings.defaultSeo.keywords.join(", ")} onChange={(e) => update("defaultSeo.keywords", e.target.value.split(",").map((item) => item.trim()).filter(Boolean))} placeholder="SEO keywords" className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm md:col-span-2" />
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "sale" ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="mb-1 text-base font-bold text-gray-900">Sale Countdown Timer</h2>
                <p className="mb-5 text-sm text-gray-500">Set when the sale ends. The timer shows in the announcement bar and cart sidebar.</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="mb-1.5 block text-sm font-medium text-gray-700">Sale End Date &amp; Time</span>
                    <input
                      type="datetime-local"
                      value={settings.saleEndsAt?.slice(0, 16) ?? ""}
                      onChange={(e) => update("saleEndsAt", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-400">Leave blank or set a past date to hide the timer.</p>
                  </label>
                  <label>
                    <span className="mb-1.5 block text-sm font-medium text-gray-700">Timer Label</span>
                    <input
                      value={settings.saleLabel}
                      onChange={(e) => update("saleLabel", e.target.value)}
                      placeholder="e.g. Sale Ends In"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="mb-1 text-base font-bold text-gray-900">Announcement Bar Messages</h2>
                <p className="mb-4 text-sm text-gray-500">These rotate every 4 seconds in the top announcement bar.</p>
                <div className="space-y-2">
                  {(settings.announcementMessages ?? []).map((msg, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={msg}
                        onChange={(e) => {
                          const next = [...(settings.announcementMessages ?? [])];
                          next[i] = e.target.value;
                          update("announcementMessages", next);
                        }}
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        placeholder={`Message ${i + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => update("announcementMessages", (settings.announcementMessages ?? []).filter((_, j) => j !== i))}
                        className="rounded-lg border border-red-200 px-2.5 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => update("announcementMessages", [...(settings.announcementMessages ?? []), ""])}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    <Plus size={15} /> Add message
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "shipping" ? (
            <div className="space-y-4">
              <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-6 md:grid-cols-3">
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">Free Shipping Threshold</span>
                  <input type="number" value={settings.cart.freeShippingThreshold} onChange={(e) => update("cart.freeShippingThreshold", Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
                </label>
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">Gift Wrap Threshold</span>
                  <input type="number" value={settings.cart.giftWrapThreshold} onChange={(e) => update("cart.giftWrapThreshold", Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
                </label>
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">Suggested Coupons</span>
                  <input value={settings.cart.suggestedCoupons.join(", ")} onChange={(e) => update("cart.suggestedCoupons", e.target.value.split(",").map((item) => item.trim().toUpperCase()).filter(Boolean))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
                </label>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">Country-wise Shipping Zones</h2>
                  <button onClick={addZone} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
                    <Plus className="h-4 w-4" />
                    Add Zone
                  </button>
                </div>
                <div className="space-y-3">
                  {settings.shippingZones.map((zone, index) => (
                    <div key={`${zone.countryCode}-${index}`} className="grid gap-3 rounded-lg border border-gray-100 p-4 md:grid-cols-6">
                      <input value={zone.countryCode} onChange={(e) => updateZone(index, "countryCode", e.target.value.toUpperCase())} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                      <input value={zone.countryName} onChange={(e) => updateZone(index, "countryName", e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm md:col-span-2" />
                      <input type="number" value={zone.baseRate} onChange={(e) => updateZone(index, "baseRate", Number(e.target.value))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                      <input type="number" value={zone.freeShippingThreshold} onChange={(e) => updateZone(index, "freeShippingThreshold", Number(e.target.value))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                      <button onClick={() => update("shippingZones", settings.shippingZones.filter((_, zoneIndex) => zoneIndex !== index))} className="grid place-items-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <input value={zone.estimatedDelivery} onChange={(e) => updateZone(index, "estimatedDelivery", e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm md:col-span-6" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "reels" ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">Homepage Reels</h2>
                  <button onClick={addReel} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
                    <Plus className="h-4 w-4" /> Add Reel
                  </button>
                </div>
                <div className="space-y-3">
                  {(settings.reels ?? []).map((reel, index) => (
                    <div key={index} className="grid gap-3 rounded-lg border border-gray-100 p-4 md:grid-cols-[1fr_2fr_90px_40px]">
                      <input value={reel.title ?? ""} onChange={(e) => updateReel(index, "title", e.target.value)} placeholder="Title" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                      <input value={reel.url ?? ""} onChange={(e) => updateReel(index, "url", e.target.value)} placeholder="Instagram, YouTube or video URL" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                      <input type="number" value={reel.sortOrder ?? 0} onChange={(e) => updateReel(index, "sortOrder", Number(e.target.value))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                      <button onClick={() => update("reels", settings.reels.filter((_, reelIndex) => reelIndex !== index))} className="grid place-items-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <label className="flex items-center gap-2 md:col-span-4">
                        <input type="checkbox" checked={reel.isActive ?? true} onChange={(e) => updateReel(index, "isActive", e.target.checked)} className="rounded border-gray-300 text-primary" />
                        <span className="text-sm text-gray-700">Active</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">Instagram Grid Links</h2>
                  <button onClick={addPost} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
                    <Plus className="h-4 w-4" /> Add Link
                  </button>
                </div>
                <div className="space-y-3">
                  {(settings.instagramPosts ?? []).map((post, index) => (
                    <div key={index} className="grid gap-3 rounded-lg border border-gray-100 p-4 md:grid-cols-[2fr_1fr_40px]">
                      <input value={post.url ?? ""} onChange={(e) => update("instagramPosts", settings.instagramPosts.map((item, itemIndex) => itemIndex === index ? { ...item, url: e.target.value } : item))} placeholder="Instagram post URL" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                      <input type="number" value={post.sortOrder ?? 0} onChange={(e) => update("instagramPosts", settings.instagramPosts.map((item, itemIndex) => itemIndex === index ? { ...item, sortOrder: Number(e.target.value) } : item))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                      <button onClick={() => update("instagramPosts", settings.instagramPosts.filter((_, itemIndex) => itemIndex !== index))} className="grid place-items-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "notifications" ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-gray-900">Email Notifications</h2>
              <div className="grid gap-3">
                {[
                  "Welcome email",
                  "Order confirmation with invoice link",
                  "Shipment tracking email",
                  "Contact auto-reply",
                  "Abandoned cart reminder",
                  "Low-stock admin alert"
                ].map((label) => (
                  <label key={label} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary" />
                    <span className="text-sm font-medium text-gray-800">{label}</span>
                  </label>
                ))}
              </div>
              <p className="mt-4 text-xs text-gray-500">SMTP keys still stay in environment variables; customer-facing content is editable from settings and content sections.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
