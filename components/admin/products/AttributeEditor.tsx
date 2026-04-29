"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";

type Attribute = { name: string; value: string };

const PRESET_ATTRIBUTES = [
  "Material", "Care Instructions", "Country of Origin", "Brand",
  "Net Weight", "Package Contents", "Model Number", "Warranty",
  "Style", "Pattern", "Embellishments", "Closure Type", "Sleeve Length",
  "Neck Type", "Set Content", "Inner Lining"
];

type Props = {
  attributes: Attribute[];
  onChange: (attrs: Attribute[]) => void;
};

export default function AttributeEditor({ attributes, onChange }: Props) {
  const [nameInput, setNameInput] = useState("");
  const [valueInput, setValueInput] = useState("");

  const add = () => {
    const name = nameInput.trim();
    const value = valueInput.trim();
    if (!name || !value) return;
    onChange([...attributes, { name, value }]);
    setNameInput("");
    setValueInput("");
  };

  const remove = (idx: number) => onChange(attributes.filter((_, i) => i !== idx));

  const update = (idx: number, key: "name" | "value", val: string) => {
    const updated = [...attributes];
    updated[idx] = { ...updated[idx], [key]: val };
    onChange(updated);
  };

  const addPreset = (name: string) => {
    if (attributes.some((a) => a.name === name)) return;
    onChange([...attributes, { name, value: "" }]);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-1 text-sm font-semibold text-gray-900">Product Attributes</h3>
        <p className="mb-4 text-xs text-gray-500">
          Custom key-value attributes shown in the product specification table
        </p>

        {/* Quick presets */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-gray-500">Quick Add</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_ATTRIBUTES.filter((p) => !attributes.some((a) => a.name === p)).map((preset) => (
              <button
                key={preset}
                onClick={() => addPreset(preset)}
                className="rounded-full border border-dashed border-gray-300 px-2.5 py-1 text-xs text-gray-500 hover:border-primary hover:text-primary"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Attribute list */}
        {attributes.length > 0 && (
          <div className="mb-4 space-y-2">
            {attributes.map((attr, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />
                <input
                  value={attr.name}
                  onChange={(e) => update(idx, "name", e.target.value)}
                  placeholder="Attribute name"
                  className="w-40 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <span className="text-gray-400 text-sm">:</span>
                <input
                  value={attr.value}
                  onChange={(e) => update(idx, "value", e.target.value)}
                  placeholder="Value"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <button
                  onClick={() => remove(idx)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new */}
        <div className="flex gap-2">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Attribute name"
            className="w-40 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <input
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Value"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <button
            onClick={add}
            className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
