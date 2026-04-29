"use client";

import { useState, useEffect } from "react";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";

type Option = { name: string; values: string[] };
type Variant = {
  _id?: string;
  title: string;
  option1?: string;
  option2?: string;
  option3?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku: string;
  isActive: boolean;
};

type Props = {
  hasVariants: boolean;
  options: Option[];
  variants: Variant[];
  basePrice: number;
  onChangeHasVariants: (v: boolean) => void;
  onChangeOptions: (o: Option[]) => void;
  onChangeVariants: (v: Variant[]) => void;
};

const COMMON_OPTIONS = ["Size", "Color", "Material", "Style", "Length"];
const COMMON_VALUES: Record<string, string[]> = {
  Size: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"],
  Color: ["Red", "Blue", "Green", "Yellow", "Black", "White", "Pink", "Orange", "Purple"],
  Material: ["Cotton", "Silk", "Georgette", "Crepe", "Chiffon", "Net"],
  Style: ["Traditional", "Modern", "Contemporary"],
  Length: ["Short", "Midi", "Long", "Floor Length"]
};

function cartesian(options: Option[]): string[][] {
  if (options.length === 0) return [];
  return options.reduce(
    (acc: string[][], option) =>
      acc.flatMap((combo) => option.values.map((v) => [...combo, v])),
    [[]]
  );
}

export default function VariantBuilder({
  hasVariants,
  options,
  variants,
  basePrice,
  onChangeHasVariants,
  onChangeOptions,
  onChangeVariants
}: Props) {
  const [valueInputs, setValueInputs] = useState<Record<number, string>>({});
  const [expanded, setExpanded] = useState<number | null>(null);

  const addOption = () => {
    if (options.length >= 3) return;
    onChangeOptions([...options, { name: "", values: [] }]);
  };

  const removeOption = (idx: number) => {
    const updated = options.filter((_, i) => i !== idx);
    onChangeOptions(updated);
    regenerateVariants(updated);
  };

  const updateOptionName = (idx: number, name: string) => {
    const updated = [...options];
    updated[idx] = { ...updated[idx], name };
    onChangeOptions(updated);
  };

  const addValue = (optIdx: number) => {
    const val = (valueInputs[optIdx] ?? "").trim();
    if (!val) return;
    const updated = [...options];
    if (!updated[optIdx].values.includes(val)) {
      updated[optIdx] = { ...updated[optIdx], values: [...updated[optIdx].values, val] };
      onChangeOptions(updated);
      regenerateVariants(updated);
    }
    setValueInputs((p) => ({ ...p, [optIdx]: "" }));
  };

  const removeValue = (optIdx: number, val: string) => {
    const updated = [...options];
    updated[optIdx] = {
      ...updated[optIdx],
      values: updated[optIdx].values.filter((v) => v !== val)
    };
    onChangeOptions(updated);
    regenerateVariants(updated);
  };

  const regenerateVariants = (opts: Option[]) => {
    const validOpts = opts.filter((o) => o.name && o.values.length > 0);
    if (validOpts.length === 0) {
      onChangeVariants([]);
      return;
    }
    const combos = cartesian(validOpts);
    const newVariants: Variant[] = combos.map((combo) => {
      const title = combo.join(" / ");
      const existing = variants.find((v) => v.title === title);
      return (
        existing ?? {
          title,
          option1: combo[0],
          option2: combo[1],
          option3: combo[2],
          price: basePrice,
          stock: 0,
          sku: "",
          isActive: true
        }
      );
    });
    onChangeVariants(newVariants);
  };

  const updateVariant = (idx: number, key: keyof Variant, value: unknown) => {
    const updated = [...variants];
    updated[idx] = { ...updated[idx], [key]: value };
    onChangeVariants(updated);
  };

  const bulkSetPrice = (price: number) => {
    onChangeVariants(variants.map((v) => ({ ...v, price })));
  };

  const bulkSetStock = (stock: number) => {
    onChangeVariants(variants.map((v) => ({ ...v, stock })));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Product Variants</h3>
            <p className="mt-1 text-xs text-gray-500">
              Add sizes, colors, materials — up to 3 options
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <div
              onClick={() => onChangeHasVariants(!hasVariants)}
              className={`relative h-5 w-9 rounded-full transition-colors ${
                hasVariants ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  hasVariants ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-sm text-gray-700">Enable variants</span>
          </label>
        </div>

        {hasVariants && (
          <div className="mt-6 space-y-4">
            {/* Options */}
            {options.map((opt, optIdx) => (
              <div key={optIdx} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Option {optIdx + 1} Name
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={opt.name}
                        onChange={(e) => updateOptionName(optIdx, e.target.value)}
                        placeholder="e.g. Size, Color"
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                      <select
                        onChange={(e) => {
                          if (e.target.value) updateOptionName(optIdx, e.target.value);
                        }}
                        className="rounded-lg border border-gray-200 px-2 py-2 text-sm"
                      >
                        <option value="">Quick select</option>
                        {COMMON_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => removeOption(optIdx)}
                    className="mt-5 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Values */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-600">Values</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {opt.values.map((val) => (
                      <span
                        key={val}
                        className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700"
                      >
                        {val}
                        <button onClick={() => removeValue(optIdx, val)}>
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Quick add from presets */}
                  {COMMON_VALUES[opt.name] && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {COMMON_VALUES[opt.name]
                        .filter((v) => !opt.values.includes(v))
                        .map((v) => (
                          <button
                            key={v}
                            onClick={() => {
                              setValueInputs((p) => ({ ...p, [optIdx]: v }));
                              const updated = [...options];
                              updated[optIdx] = {
                                ...updated[optIdx],
                                values: [...updated[optIdx].values, v]
                              };
                              onChangeOptions(updated);
                              regenerateVariants(updated);
                            }}
                            className="rounded border border-dashed border-gray-300 px-2 py-0.5 text-xs text-gray-500 hover:border-primary hover:text-primary"
                          >
                            + {v}
                          </button>
                        ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      value={valueInputs[optIdx] ?? ""}
                      onChange={(e) => setValueInputs((p) => ({ ...p, [optIdx]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && addValue(optIdx)}
                      placeholder="Add value and press Enter"
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                    <button
                      onClick={() => addValue(optIdx)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {options.length < 3 && (
              <button
                onClick={addOption}
                className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-primary hover:text-primary w-full justify-center"
              >
                <Plus className="h-4 w-4" />
                Add option
              </button>
            )}
          </div>
        )}
      </div>

      {/* Variants Table */}
      {hasVariants && variants.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              {variants.length} Variants
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <button
                onClick={() => {
                  const price = prompt("Set price for all variants:");
                  if (price && !isNaN(Number(price))) bulkSetPrice(Number(price));
                }}
                className="rounded border border-gray-200 px-2 py-1 hover:bg-gray-50"
              >
                Bulk set price
              </button>
              <button
                onClick={() => {
                  const stock = prompt("Set stock for all variants:");
                  if (stock && !isNaN(Number(stock))) bulkSetStock(Number(stock));
                }}
                className="rounded border border-gray-200 px-2 py-1 hover:bg-gray-50"
              >
                Bulk set stock
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Variant</th>
                  <th className="px-4 py-3 text-left">Price (₹)</th>
                  <th className="px-4 py-3 text-left">Compare (₹)</th>
                  <th className="px-4 py-3 text-left">Stock</th>
                  <th className="px-4 py-3 text-left">SKU</th>
                  <th className="px-4 py-3 text-left">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {variants.map((v, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{v.title}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={v.price}
                        onChange={(e) => updateVariant(idx, "price", Number(e.target.value))}
                        className="w-24 rounded border border-gray-200 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={v.comparePrice ?? ""}
                        onChange={(e) =>
                          updateVariant(idx, "comparePrice", e.target.value ? Number(e.target.value) : undefined)
                        }
                        className="w-24 rounded border border-gray-200 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => updateVariant(idx, "stock", Number(e.target.value))}
                        min={0}
                        className="w-20 rounded border border-gray-200 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={v.sku}
                        onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                        placeholder="SKU"
                        className="w-28 rounded border border-gray-200 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={v.isActive}
                        onChange={(e) => updateVariant(idx, "isActive", e.target.checked)}
                        className="rounded border-gray-300 text-primary"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
