"use client";

import { Ruler, X } from "lucide-react";

const sizeRows = [
  ["XS", "32", "26", "34", "13.5"],
  ["S", "34", "28", "36", "14"],
  ["M", "36", "30", "38", "14.5"],
  ["L", "38", "32", "40", "15"],
  ["XL", "40", "34", "42", "15.5"],
  ["XXL", "42", "36", "44", "16"]
];

const measurePoints = [
  ["1", "Shoulder", "Measure shoulder point to shoulder point."],
  ["2", "Bust", "Measure around the fullest part of the bust."],
  ["3", "Waist", "Measure around the natural waistline."],
  ["4", "Length", "Measure from shoulder to desired hem."],
  ["5", "Hip", "Measure around the fullest part of the hip."]
];

type SizeGuidePopupProps = {
  open: boolean;
  onClose: () => void;
  notes?: string;
};

export function SizeGuidePopup({ open, onClose, notes }: SizeGuidePopupProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <button type="button" className="absolute inset-0 bg-black/55" aria-label="Close size guide" onClick={onClose} />
      <div className="relative z-10 max-h-[92vh] w-full max-w-5xl overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Roop Shree fit guide</p>
            <h2 className="mt-1 text-2xl font-semibold uppercase tracking-wide">Size Guide</h2>
          </div>
          <button type="button" className="focus-ring rounded p-2 hover:bg-neutral" onClick={onClose} aria-label="Close size guide">
            <X size={24} />
          </button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-black p-6 text-white">
            <div className="relative mx-auto h-[430px] max-w-sm">
              <div className="absolute left-1/2 top-6 h-16 w-12 -translate-x-1/2 rounded-full bg-white/12" />
              <div className="absolute left-1/2 top-24 h-64 w-28 -translate-x-1/2 rounded-t-[46px] bg-white/10" />
              <div className="absolute left-[31%] top-24 h-56 w-8 -rotate-12 rounded-full bg-white/10" />
              <div className="absolute right-[31%] top-24 h-56 w-8 rotate-12 rounded-full bg-white/10" />
              <div className="absolute left-[42%] bottom-8 h-36 w-8 rounded-full bg-white/10" />
              <div className="absolute right-[42%] bottom-8 h-36 w-8 rounded-full bg-white/10" />
              {[
                ["1", "left-[50%] top-[20%]"],
                ["2", "left-[34%] top-[34%]"],
                ["3", "left-[27%] top-[46%]"],
                ["4", "left-[22%] top-[70%]"],
                ["5", "left-[51%] top-[63%]"]
              ].map(([number, position]) => (
                <span key={number} className={`absolute ${position} grid h-7 w-7 place-items-center bg-white/20 text-xs font-bold`}>
                  {number}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-ink/70">
              <Ruler size={18} className="text-primary" />
              All measurements are body measurements in inches. Choose custom size for bridal and heavy work outfits.
            </div>

            <div className="overflow-x-auto border border-black/10">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-neutral text-xs uppercase tracking-wide text-ink/55">
                  <tr>
                    {["Size", "Bust", "Waist", "Hip", "Shoulder"].map((head) => (
                      <th key={head} className="px-4 py-3 font-bold">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizeRows.map((row) => (
                    <tr key={row[0]} className="border-t border-black/10">
                      {row.map((cell) => <td key={cell} className="px-4 py-3">{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-3">
              {measurePoints.map(([number, title, body]) => (
                <div key={number} className="grid grid-cols-[28px_1fr] gap-3">
                  <span className="grid h-7 w-7 place-items-center bg-ink text-xs font-bold text-white">{number}</span>
                  <p className="text-sm leading-6"><strong>{title}:</strong> <span className="text-ink/60">{body}</span></p>
                </div>
              ))}
            </div>

            {notes ? <div className="mt-6 border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-ink/70">{notes}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
