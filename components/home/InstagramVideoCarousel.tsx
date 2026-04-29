"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ReactPlayer from "react-player/lazy";

type Reel = {
  title: string;
  url: string;
};

const reels: Reel[] = [
  {
    title: "Bridal lehenga styling",
    url: "https://www.instagram.com/roopshreeudaipur/"
  },
  {
    title: "Festive saree edit",
    url: "https://www.instagram.com/roopshreeudaipur/"
  },
  {
    title: "Udaipur wedding wear",
    url: "https://www.instagram.com/roopshreeudaipur/"
  }
];

function instagramEmbedUrl(url: string) {
  if (!/\/(p|reel|tv)\//i.test(url)) return "";
  const clean = url.split("?")[0].replace(/\/$/, "");
  return `${clean}/embed`;
}

export function InstagramVideoCarousel() {
  const [active, setActive] = useState(0);
  const items = useMemo(() => reels.filter((item) => item.url), []);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % items.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <section className="mt-10 bg-ink px-4 py-10 text-white">
      <div className="mx-auto max-w-[1728px]">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">Instagram reels</p>
            <h2 className="mt-2 text-lg font-semibold uppercase tracking-wide">Roop Shree In Motion</h2>
          </div>
          <Link href="https://www.instagram.com/roopshreeudaipur/" target="_blank" className="text-xs font-bold uppercase tracking-wide text-white/70 hover:text-white">
            Follow on Instagram
          </Link>
        </div>

        <div className="overflow-hidden">
          <div className="flex transition-transform duration-700" style={{ transform: `translateX(-${active * 100}%)` }}>
            {items.map((item, index) => {
              const embed = instagramEmbedUrl(item.url);
              return (
                <div key={`${item.title}-${index}`} className="w-full shrink-0">
                  <div className="grid gap-5 md:grid-cols-[0.72fr_1.28fr] md:items-center">
                    <div>
                      <p className="text-3xl font-semibold uppercase leading-tight">{item.title}</p>
                      <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">Auto-scrolling reel showcase. Add direct MP4/Reel URLs from admin media for active-slide muted playback.</p>
                    </div>
                    <div className="mx-auto aspect-[9/14] w-full max-w-[320px] overflow-hidden bg-black">
                      {embed ? (
                        <iframe src={embed} title={item.title} className="h-full w-full" loading={index === 0 ? "eager" : "lazy"} allow="autoplay; encrypted-media; picture-in-picture" />
                      ) : item.url.includes("instagram.com/roopshreeudaipur") ? (
                        <div className="grid h-full place-items-center p-6 text-center">
                          <div>
                            <p className="text-sm font-bold uppercase tracking-wide">Add Reel URL</p>
                            <p className="mt-3 text-sm leading-6 text-white/60">Paste specific Instagram reel links in this carousel to show embeds here.</p>
                          </div>
                        </div>
                      ) : (
                        <ReactPlayer url={item.url} width="100%" height="100%" playing={index === active} muted loop playsinline controls={false} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex justify-center gap-2">
          {items.map((item, index) => (
            <button key={item.title} type="button" onClick={() => setActive(index)} className={`h-1.5 w-8 ${index === active ? "bg-white" : "bg-white/25"}`} aria-label={`Show reel ${index + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
