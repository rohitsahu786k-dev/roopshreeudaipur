"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { SaleTimer } from "@/components/ui/SaleTimer";

const DEFAULT_ENDS = "2026-05-15T23:59:59";
const DEFAULT_LABEL = "Sale Ends In";
const DEFAULT_MESSAGES = [
  "Grand Festive Sale — Up to 40% Off Sitewide",
  "Free shipping in India on orders above ₹2,999",
  "New bridal lehengas just dropped — Shop Now",
  "Handcrafted ethnic wear from Udaipur Studio"
];

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const [saleEndsAt, setSaleEndsAt] = useState(DEFAULT_ENDS);
  const [saleLabel, setSaleLabel] = useState(DEFAULT_LABEL);
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);

  useEffect(() => {
    if (sessionStorage.getItem("ann_closed")) { setVisible(false); return; }
    fetch("/api/store-settings")
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings ?? {};
        if (s.saleEndsAt) setSaleEndsAt(s.saleEndsAt);
        if (s.saleLabel) setSaleLabel(s.saleLabel);
        if (Array.isArray(s.announcementMessages) && s.announcementMessages.length)
          setMessages(s.announcementMessages);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (messages.length <= 1) return;
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => { setIdx((i) => (i + 1) % messages.length); setFading(false); }, 350);
    }, 4000);
    return () => clearInterval(id);
  }, [messages.length]);

  if (!visible) return null;

  return (
    <div className="relative bg-[#1C0606] text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:gap-4 sm:px-6">
        {/* Sale timer — left side on desktop */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/65">{saleLabel}:</span>
          <SaleTimer endsAt={saleEndsAt} dark />
        </div>

        {/* Rotating message — center */}
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          <p
            key={idx}
            className={`text-center text-[11px] font-semibold tracking-wide transition-opacity duration-300 sm:text-xs ${fading ? "opacity-0" : "opacity-100 animate-fadeIn"}`}
          >
            {messages[idx]}
          </p>
        </div>

        {/* Timer compact — right side on mobile */}
        <div className="flex shrink-0 items-center gap-1 lg:hidden">
          <SaleTimer endsAt={saleEndsAt} dark className="scale-75 origin-right" />
        </div>

        <button
          type="button"
          onClick={() => { setVisible(false); sessionStorage.setItem("ann_closed", "1"); }}
          className="shrink-0 rounded p-1 opacity-50 transition hover:opacity-100"
          aria-label="Close announcement"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
