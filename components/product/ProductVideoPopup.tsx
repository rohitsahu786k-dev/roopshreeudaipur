"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactPlayer from "react-player/lazy";

function instagramEmbedUrl(url: string) {
  const clean = url.split("?")[0].replace(/\/$/, "");
  return `${clean}/embed`;
}

export function ProductVideoPopup({ url }: { url?: string }) {
  const [open, setOpen] = useState(false);
  const isInstagram = useMemo(() => Boolean(url && /instagram\.com/i.test(url)), [url]);

  useEffect(() => {
    if (!url) return;
    const closed = window.sessionStorage.getItem(`product_reel_closed:${url}`);
    setOpen(!closed);
  }, [url]);

  if (!url || !open) return null;

  return (
    <aside className="fixed bottom-5 right-5 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden bg-ink text-white shadow-soft">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-semibold">Product video</span>
        <button
          type="button"
          className="focus-ring rounded p-1 hover:bg-white/10"
          onClick={() => {
            window.sessionStorage.setItem(`product_reel_closed:${url}`, "1");
            setOpen(false);
          }}
          aria-label="Close video"
        >
          <X size={18} />
        </button>
      </div>
      <div className="aspect-[9/13] bg-black">
        {isInstagram ? (
          <iframe
            src={instagramEmbedUrl(url)}
            title="Instagram product reel"
            className="h-full w-full"
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        ) : (
          <ReactPlayer url={url} width="100%" height="100%" playing muted loop playsinline controls={false} />
        )}
      </div>
    </aside>
  );
}
