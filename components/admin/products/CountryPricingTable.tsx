"use client";

import { useState } from "react";
import { Plus, Trash2, Globe } from "lucide-react";

type CountryPrice = {
  countryCode: string;
  countryName: string;
  currency: string;
  currencySymbol: string;
  price: number;
  comparePrice?: number;
  isActive: boolean;
};

const COUNTRIES = [
  { code: "US", name: "United States", currency: "USD", symbol: "$" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£" },
  { code: "EU", name: "European Union", currency: "EUR", symbol: "€" },
  { code: "CA", name: "Canada", currency: "CAD", symbol: "C$" },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "A$" },
  { code: "AE", name: "UAE", currency: "AED", symbol: "AED" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", symbol: "SAR" },
  { code: "SG", name: "Singapore", currency: "SGD", symbol: "S$" },
  { code: "MY", name: "Malaysia", currency: "MYR", symbol: "RM" },
  { code: "NZ", name: "New Zealand", currency: "NZD", symbol: "NZ$" },
  { code: "JP", name: "Japan", currency: "JPY", symbol: "¥" },
  { code: "KW", name: "Kuwait", currency: "KWD", symbol: "KWD" },
  { code: "QA", name: "Qatar", currency: "QAR", symbol: "QAR" },
  { code: "BH", name: "Bahrain", currency: "BHD", symbol: "BHD" },
  { code: "OM", name: "Oman", currency: "OMR", symbol: "OMR" },
  { code: "NL", name: "Netherlands", currency: "EUR", symbol: "€" },
  { code: "DE", name: "Germany", currency: "EUR", symbol: "€" },
  { code: "FR", name: "France", currency: "EUR", symbol: "€" },
  { code: "ZA", name: "South Africa", currency: "ZAR", symbol: "R" },
  { code: "KE", name: "Kenya", currency: "KES", symbol: "KSh" }
];

type Props = {
  countryPricing: CountryPrice[];
  basePrice: number;
  onChange: (cp: CountryPrice[]) => void;
};

export default function CountryPricingTable({ countryPricing, basePrice, onChange }: Props) {
  const [selected, setSelected] = useState("");

  const addCountry = () => {
    const country = COUNTRIES.find((c) => c.code === selected);
    if (!country || countryPricing.some((cp) => cp.countryCode === selected)) return;

    onChange([
      ...countryPricing,
      {
        countryCode: country.code,
        countryName: country.name,
        currency: country.currency,
        currencySymbol: country.symbol,
        price: basePrice,
        isActive: true
      }
    ]);
    setSelected("");
  };

  const update = (idx: number, key: keyof CountryPrice, value: unknown) => {
    const updated = [...countryPricing];
    updated[idx] = { ...updated[idx], [key]: value };
    onChange(updated);
  };

  const remove = (idx: number) => onChange(countryPricing.filter((_, i) => i !== idx));

  const addedCodes = new Set(countryPricing.map((cp) => cp.countryCode));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-gray-900">Country-Wise Pricing</h3>
        </div>
        <p className="mb-4 text-xs text-gray-500">
          Override the base price (₹{basePrice}) for specific countries. Customers see prices in their
          local currency.
        </p>

        {/* Add country */}
        <div className="mb-6 flex gap-2">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">Select country...</option>
            {COUNTRIES.filter((c) => !addedCodes.has(c.code)).map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.currency})
              </option>
            ))}
          </select>
          <button
            onClick={addCountry}
            disabled={!selected}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        {/* Table */}
        {countryPricing.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Country</th>
                  <th className="px-4 py-3 text-left">Currency</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Compare Price</th>
                  <th className="px-4 py-3 text-left">Active</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {countryPricing.map((cp, idx) => (
                  <tr key={cp.countryCode} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {cp.countryName}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {cp.currencySymbol} {cp.currency}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                          {cp.currencySymbol}
                        </span>
                        <input
                          type="number"
                          value={cp.price}
                          onChange={(e) => update(idx, "price", Number(e.target.value))}
                          className="w-28 rounded border border-gray-200 py-1.5 pl-6 pr-2 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                          {cp.currencySymbol}
                        </span>
                        <input
                          type="number"
                          value={cp.comparePrice ?? ""}
                          onChange={(e) =>
                            update(idx, "comparePrice", e.target.value ? Number(e.target.value) : undefined)
                          }
                          className="w-28 rounded border border-gray-200 py-1.5 pl-6 pr-2 text-sm focus:border-primary focus:outline-none"
                          placeholder="Optional"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={cp.isActive}
                        onChange={(e) => update(idx, "isActive", e.target.checked)}
                        className="rounded border-gray-300 text-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => remove(idx)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
            <Globe className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">
              No country-specific pricing yet. Add countries above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
