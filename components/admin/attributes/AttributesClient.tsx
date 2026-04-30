"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Trash2, X } from "lucide-react";

type AttributeValue = { label: string; value: string; colorHex?: string; sortOrder?: number; isActive?: boolean };
type Attribute = {
  _id: string;
  name: string;
  slug: string;
  type: "select" | "multi-select" | "range";
  inputType: "checkbox" | "radio" | "range" | "color" | "size";
  values: AttributeValue[];
  isFilterable: boolean;
  isSearchable: boolean;
  visibleOnPdp: boolean;
  isVariantOption: boolean;
  filterLogic: "or" | "and";
  priority: number;
  isActive: boolean;
};

const empty = (): Partial<Attribute> => ({
  name: "",
  slug: "",
  type: "multi-select",
  inputType: "checkbox",
  values: [],
  isFilterable: true,
  isSearchable: true,
  visibleOnPdp: true,
  isVariantOption: false,
  filterLogic: "or",
  priority: 100,
  isActive: true
});

function listToValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((label, index) => ({ label, value: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"), sortOrder: index, isActive: true }));
}

export default function AttributesClient() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [form, setForm] = useState<Partial<Attribute> | null>(null);
  const [editId, setEditId] = useState("");
  const [valuesInput, setValuesInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const response = await fetch("/api/admin/attributes");
    const data = await response.json();
    setAttributes(data.attributes ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    if (!form?.name) {
      setError("Attribute name is required");
      return;
    }

    const payload = { ...form, values: valuesInput ? listToValues(valuesInput) : form.values ?? [] };
    const response = await fetch(editId ? `/api/admin/attributes/${editId}` : "/api/admin/attributes", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error ?? "Unable to save attribute");
      return;
    }
    setForm(null);
    setEditId("");
    setValuesInput("");
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this filter attribute?")) return;
    await fetch(`/api/admin/attributes/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Filter Attributes</h1>
          <p className="mt-1 text-sm text-gray-500">Control storefront filters, variant options, and PDP specification visibility.</p>
        </div>
        <button onClick={() => { setForm(empty()); setEditId(""); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white">
          <Plus className="h-4 w-4" /> Create Attribute
        </button>
      </div>

      {form ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">{editId ? "Edit Attribute" : "New Attribute"}</h2>
              <button onClick={() => setForm(null)}><X className="h-5 w-5" /></button>
            </div>
            {error ? <div className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div> : null}
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.name ?? ""} onChange={(event) => setForm((current) => ({ ...current!, name: event.target.value }))} placeholder="Name, e.g. Fabric" className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
              <input value={form.slug ?? ""} onChange={(event) => setForm((current) => ({ ...current!, slug: event.target.value }))} placeholder="Slug, e.g. fabric" className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
              <select value={form.type} onChange={(event) => setForm((current) => ({ ...current!, type: event.target.value as Attribute["type"] }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm">
                <option value="select">Select</option>
                <option value="multi-select">Multi-select</option>
                <option value="range">Range</option>
              </select>
              <select value={form.inputType} onChange={(event) => setForm((current) => ({ ...current!, inputType: event.target.value as Attribute["inputType"] }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm">
                <option value="checkbox">Checkbox</option>
                <option value="radio">Radio</option>
                <option value="range">Range slider</option>
                <option value="color">Color swatches</option>
                <option value="size">Size selector</option>
              </select>
              <input type="number" value={form.priority ?? 100} onChange={(event) => setForm((current) => ({ ...current!, priority: Number(event.target.value) }))} placeholder="Priority" className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
              <select value={form.filterLogic} onChange={(event) => setForm((current) => ({ ...current!, filterLogic: event.target.value as "or" | "and" }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm">
                <option value="or">OR logic</option>
                <option value="and">AND logic</option>
              </select>
              <textarea value={valuesInput} onChange={(event) => setValuesInput(event.target.value)} placeholder="Values comma separated: S, M, L" className="md:col-span-2 min-h-24 rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
              {(["isFilterable", "isSearchable", "visibleOnPdp", "isVariantOption", "isActive"] as const).map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={Boolean(form[key])} onChange={(event) => setForm((current) => ({ ...current!, [key]: event.target.checked }))} />
                  {key}
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setForm(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm">Cancel</button>
              <button onClick={save} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"><Check className="h-4 w-4" /> Save</button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? <div className="p-10 text-center text-sm text-gray-500">Loading attributes...</div> : null}
        {!loading && attributes.length === 0 ? <div className="p-10 text-center text-sm text-gray-500">No filter attributes yet.</div> : null}
        {attributes.map((attribute) => (
          <div key={attribute._id} className="grid gap-3 border-b border-gray-100 p-4 last:border-b-0 md:grid-cols-[1fr_auto]">
            <div>
              <p className="font-bold text-gray-900">{attribute.name}</p>
              <p className="mt-1 text-xs text-gray-500">{attribute.slug} · {attribute.inputType} · {attribute.filterLogic.toUpperCase()} · priority {attribute.priority}</p>
              <p className="mt-2 text-xs text-gray-500">{attribute.values?.map((value) => value.label).join(", ") || "Range/custom values"}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditId(attribute._id); setForm(attribute); setValuesInput(attribute.values?.map((value) => value.label).join(", ") ?? ""); }} className="rounded border border-gray-200 px-3 py-2 text-xs font-bold uppercase">Edit</button>
              <button onClick={() => remove(attribute._id)} className="rounded border border-gray-200 p-2 text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
