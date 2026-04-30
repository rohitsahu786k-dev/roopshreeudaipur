"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Banner = {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  ctaLabel?: string;
  ctaHref?: string;
  couponCode?: string;
};

const FALLBACK: Banner[] = [
  {
    _id: "fallback",
    title: "Roop Shree Udaipur",
    subtitle: "Bridal lehengas, sarees, suits and hand work ethnic wear crafted for Udaipur weddings and festive celebrations.",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=88",
    ctaLabel: "Shop Now",
    ctaHref: "/shop"
  }
];

export function HeroBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    fetch("/api/banners?placement=home_hero")
      .then((r) => r.json())
      .then((data) => {
        const list: Banner[] = data.banners ?? [];
        setBanners(list.length ? list : FALLBACK);
        setLoaded(true);
      })
      .catch(() => {
        setBanners(FALLBACK);
        setLoaded(true);
      });
  }, []);

  const list = banners.length ? banners : FALLBACK;

  // Auto-advance
  useEffect(() => {
    if (list.length <= 1) return;
    timerRef.current = setTimeout(() => {
      setCurrent((c) => (c + 1) % list.length);
    }, 5000);
    return () => clearTimeout(timerRef.current);
  }, [current, list.length]);

  const prev = () => {
    clearTimeout(timerRef.current);
    setCurrent((c) => (c - 1 + list.length) % list.length);
  };
  const next = () => {
    clearTimeout(timerRef.current);
    setCurrent((c) => (c + 1) % list.length);
  };

  const banner = list[current] ?? list[0];
  if (!banner) return null;

  return (
    <section className="relative">
      {/* Desktop image */}
      <div className="relative h-[360px] overflow-hidden sm:h-[450px] md:h-[560px]">
        {/* Mobile image (hidden on md+) */}
        {banner.mobileImage && (
          <div className="absolute inset-0 md:hidden">
            <Image
              key={`mobile-${banner._id}`}
              src={banner.mobileImage}
              alt={banner.title}
              fill
              priority
              className="object-cover object-top transition-opacity duration-700"
              sizes="100vw"
            />
          </div>
        )}
        {/* Desktop image */}
        <div className={banner.mobileImage ? "hidden md:block absolute inset-0" : "absolute inset-0"}>
          <Image
            key={`desktop-${banner._id}`}
            src={banner.image}
            alt={banner.title}
            fill
            priority
            className="object-cover object-top transition-opacity duration-700"
            sizes="100vw"
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent md:from-white/80 md:via-white/30 md:to-transparent" />

        {/* Text content */}
        <div className="absolute left-4 top-1/2 max-w-[230px] -translate-y-1/2 sm:left-6 sm:max-w-[280px] md:left-[7%] md:max-w-sm">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/75 md:text-[11px] md:text-ink">
            Ready to Ship
          </p>
          <h2 className="mt-2 text-xl font-bold uppercase leading-tight tracking-wide text-white sm:text-2xl md:text-4xl md:font-semibold md:text-ink lg:text-5xl">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="mt-2 hidden text-sm font-medium leading-relaxed text-white/85 sm:block md:text-ink/80">
              {banner.subtitle}
            </p>
          )}
          {banner.ctaHref && (
            <Link
              href={banner.ctaHref}
              className="mt-4 inline-flex bg-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-ink transition hover:bg-ink hover:text-white sm:text-[11px] md:mt-5 md:bg-ink md:text-white"
            >
              {banner.ctaLabel ?? "Shop Now"}
            </Link>
          )}
          {banner.couponCode && (
            <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-white/80 md:text-ink/60">
              Use code: <span className="text-white md:text-primary">{banner.couponCode}</span>
            </p>
          )}
        </div>

        {/* Navigation arrows — only if multiple banners */}
        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous banner"
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow backdrop-blur-sm transition hover:bg-white sm:h-10 sm:w-10"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next banner"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow backdrop-blur-sm transition hover:bg-white sm:h-10 sm:w-10"
            >
              <ChevronRight size={18} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {list.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { clearTimeout(timerRef.current); setCurrent(i); }}
                  aria-label={`Go to banner ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === current ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Loading shimmer */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-black/5" />
      )}
    </section>
  );
}
