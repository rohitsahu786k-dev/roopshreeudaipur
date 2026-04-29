"use client";

import { X } from "lucide-react";
import { useState } from "react";

const sizeRows = [
  ["XS", "32", "26", "34"],
  ["S", "34", "28", "36"],
  ["M", "36", "30", "38"],
  ["L", "38", "32", "40"],
  ["XL", "40", "34", "42"],
  ["XXL", "42", "36", "44"]
];

type SizeGuidePopupProps = {
  open: boolean;
  onClose: () => void;
};

export function SizeGuidePopup({ open, onClose }: SizeGuidePopupProps) {
  return (
    <>
      {open && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
          <button
            type="button"
            className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
            aria-label="Close size guide"
            onClick={onClose}
          />
          <div className={`relative z-10 max-h-[90vh] max-w-2xl overflow-y-auto bg-white p-6 md:p-8 ${open ? "scale-100" : "scale-95"} transition-transform`}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold uppercase">Size Guide</h2>
              <button type="button" className="focus-ring rounded p-2 hover:bg-neutral" onClick={onClose} aria-label="Close size guide">
                <X size={24} />
              </button>
            </div>

            <p className="mt-4 text-sm text-ink/60">Choose the size that matches your body measurements. All measurements are in inches.</p>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead className="bg-black/5">
                  <tr>
                    {["Size", "Bust", "Waist", "Hip"].map((head) => (
                      <th key={head} className="px-4 py-3 font-bold">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizeRows.map((row) => (
                    <tr key={row[0]} className="border-t border-black/10">
                      {row.map((cell) => (
                        <td key={cell} className="px-4 py-3">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 border-t border-black/10 pt-6">
              <h3 className="font-bold">How to measure:</h3>
              <ul className="mt-3 space-y-2 text-sm text-ink/60">
                <li><strong>Bust:</strong> Measure around the fullest part of your chest</li>
                <li><strong>Waist:</strong> Measure around your natural waistline</li>
                <li><strong>Hip:</strong> Measure around the fullest part of your hips</li>
              </ul>
            </div>

            <button
              type="button"
              className="focus-ring mt-6 w-full bg-ink px-5 py-3 font-bold uppercase tracking-wide text-white"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
