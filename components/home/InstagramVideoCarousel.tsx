"use client";

import Link from "next/link";
import { Maximize2, Play, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player/lazy";

type Reel = {
  title: string;
  url: string;
  instagramUrl?: string;
};

const fallbackReels: Reel[] = [
  { title: "Bridal lehenga styling", url: "https://www.youtube.com/watch?v=ysz5S6PUM-U", instagramUrl: "https://www.instagram.com/roopshreeudaipur/" },
  { title: "Festive saree edit", url: "https://www.youtube.com/watch?v=ysz5S6PUM-U", instagramUrl: "https://www.instagram.com/roopshreeudaipur/" },
  { title: "Udaipur wedding wear", url: "https://www.youtube.com/watch?v=ysz5S6PUM-U", instagramUrl: "https://www.instagram.com/roopshreeudaipur/" },
  { title: "Ready to ship picks", url: "https://www.youtube.com/watch?v=ysz5S6PUM-U", instagramUrl: "https://www.instagram.com/roopshreeudaipur/" },
  { title: "Sangeet edit", url: "https://www.youtube.com/watch?v=ysz5S6PUM-U", instagramUrl: "https://www.instagram.com/roopshreeudaipur/" },
  { title: "Reception looks", url: "https://www.youtube.com/watch?v=ysz5S6PUM-U", instagramUrl: "https://www.instagram.com/roopshreeudaipur/" }
];

const fallbackInstagramPosts = [
  "https://www.instagram.com/roopshreeudaipur/",
  "https://www.instagram.com/roopshreeudaipur/",
  "https://www.instagram.com/roopshreeudaipur/",
  "https://www.instagram.com/roopshreeudaipur/",
  "https://www.instagram.com/roopshreeudaipur/",
  "https://www.instagram.com/roopshreeudaipur/"
];

function ReelCard({ reel, index, activeIndex, onOpen }: { reel: Reel; index: number; activeIndex: number; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="group relative block aspect-video snap-start overflow-hidden bg-black text-left">
      <ReactPlayer url={reel.url} width="100%" height="100%" playing={activeIndex === index} muted loop playsinline controls={false} />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 text-white">
        <p className="text-xs font-bold uppercase tracking-wide">{reel.title}</p>
      </div>
      <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center bg-white/90 text-ink opacity-0 transition group-hover:opacity-100">
        <Play size={16} fill="currentColor" />
      </span>
    </button>
  );
}

export function InstagramVideoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [reels, setReels] = useState<Reel[]>(fallbackReels);
  const [instagramPosts, setInstagramPosts] = useState(fallbackInstagramPosts);
  const [instagramUrl, setInstagramUrl] = useState("https://www.instagram.com/roopshreeudaipur/");
  const refs = useRef<Array<HTMLDivElement | null>>([]);
  const items = useMemo(() => reels.slice(0, 6), [reels]);
  const pages = useMemo(() => [items.slice(0, 3), items.slice(3, 6)], [items]);

  useEffect(() => {
    fetch("/api/store-settings", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        const settings = data.settings ?? {};
        if (settings.instagramUrl) setInstagramUrl(settings.instagramUrl);
        if (Array.isArray(settings.reels) && settings.reels.length) {
          setReels(settings.reels.map((item: Reel) => ({ title: item.title || "Roop Shree reel", url: item.url, instagramUrl: item.instagramUrl })).filter((item: Reel) => item.url));
        }
        if (Array.isArray(settings.instagramPosts) && settings.instagramPosts.length) {
          setInstagramPosts(settings.instagramPosts.map((item: { url?: string }) => item.url).filter(Boolean) as string[]);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const index = refs.current.findIndex((node) => node === visible?.target);
        if (index >= 0) setActiveIndex(index);
      },
      { threshold: [0.55, 0.75] }
    );

    refs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (modalIndex === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [modalIndex]);

  return (
    <section id="reels" className="mt-10 bg-white px-4 py-10 text-ink">
      <div className="mx-auto max-w-[1728px]">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/45">Reels</p>
            <h2 className="mt-2 text-lg font-semibold uppercase tracking-wide">Roop Shree In Motion</h2>
          </div>
          <Link href={instagramUrl} target="_blank" className="text-xs font-bold uppercase tracking-wide text-ink/55 hover:text-ink">
            Instagram
          </Link>
        </div>

        <div className="overflow-hidden">
          <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${page * 100}%)` }}>
            {pages.map((slide, slideIndex) => (
              <div key={slideIndex} className="grid w-full shrink-0 gap-3 md:grid-cols-3">
                {slide.map((item, localIndex) => {
                  const index = slideIndex * 3 + localIndex;
                  return (
                    <div key={`${item.title}-${index}`} ref={(node) => { refs.current[index] = node; }}>
                      <ReelCard reel={item} index={index} activeIndex={activeIndex} onOpen={() => setModalIndex(index)} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {pages.map((_, index) => (
              <button key={index} type="button" onClick={() => { setPage(index); setActiveIndex(index * 3); }} className={`h-1.5 w-10 ${page === index ? "bg-ink" : "bg-ink/15"}`} aria-label={`Show reel slide ${index + 1}`} />
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide">Latest Instagram</h3>
            <Link href={instagramUrl} target="_blank" className="text-xs font-bold uppercase text-ink/55 hover:text-ink">View profile</Link>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
            {instagramPosts.map((url, index) => (
              <Link key={`${url}-${index}`} href={url} target="_blank" className="grid aspect-square place-items-center border border-black/10 bg-[#f7f7f7] text-center text-[11px] font-bold uppercase tracking-wide text-ink/55 hover:bg-neutral">
                Post {index + 1}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {modalIndex !== null ? (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-black/80 p-4">
          <div className="w-full max-w-5xl bg-black">
            <div className="flex items-center justify-between bg-ink px-4 py-3 text-white">
              <p className="text-sm font-bold uppercase tracking-wide">{items[modalIndex].title}</p>
              <div className="flex items-center gap-2">
                <Maximize2 size={17} />
                <button type="button" onClick={() => setModalIndex(null)} aria-label="Close reel" className="rounded p-1 hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="aspect-video">
              <ReactPlayer url={items[modalIndex].url} width="100%" height="100%" playing controls playsinline />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
