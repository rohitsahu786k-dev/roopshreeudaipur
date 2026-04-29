"use client";

import { X } from "lucide-react";
import { useState } from "react";
import ReactPlayer from "react-player/lazy";

export function ProductVideoPopup({ url }: { url: string }) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <aside className="fixed bottom-5 right-5 z-50 w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-lg bg-ink text-white shadow-soft">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-semibold">Product video</span>
        <button type="button" className="focus-ring rounded p-1 hover:bg-white/10" onClick={() => setOpen(false)} aria-label="Close video">
          <X size={18} />
        </button>
      </div>
      <div className="aspect-video bg-black">
        <ReactPlayer url={url} width="100%" height="100%" controls muted />
      </div>
    </aside>
  );
}
