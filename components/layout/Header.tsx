"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Search, ShoppingBag, UserRound, X, LogOut, Settings, Package, ChevronDown, AlignJustify } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { SideCart } from "@/components/cart/SideCart";
import { AjaxSearch } from "@/components/search/AjaxSearch";
import { useCommerce } from "@/components/providers/CommerceProvider";
import { currencies } from "@/lib/currency";

const nav = [
  { label: "Shop", href: "/shop" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "Fabric Guide", href: "/fabric-guide" },
  { label: "Blogs", href: "/blogs" },
  { label: "Contact", href: "/contact-us" }
];

const mobileNav = [
  { label: "Home", href: "/" },
  { label: "Shop All", href: "/shop" },
  { label: "Lehengas", href: "/shop?category=lehenga" },
  { label: "Sarees", href: "/shop?category=saree" },
  { label: "Kurta Sets", href: "/shop?category=kurta-set" },
  { label: "Sharara Sets", href: "/shop?category=sharara-set" },
  { label: "Anarkalis", href: "/shop?category=anarkali" },
  { label: "Rajputi Poshak", href: "/shop?category=rajputi-poshak" },
  { label: "Ready To Ship", href: "/shop?tag=ready-to-ship" },
  { label: "Sale", href: "/shop?sale=true" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "Fabric Guide", href: "/fabric-guide" },
  { label: "Blogs", href: "/blogs" },
  { label: "Contact Us", href: "/contact-us" },
];

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { cartItems, cartOpen, setCartOpen, currencyCode, setCurrencyCode, wishlistCount, user, refreshUser } = useCommerce();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (drawerOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await refreshUser();
    window.location.href = "/";
  };

  return (
    <>
      <header className={`sticky top-0 z-40 w-full transition-shadow duration-300 ${isScrolled ? "shadow-md" : ""} bg-white border-b border-black/8`}>
        {/* Announcement */}
        <div className="bg-ink px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-widest text-white sm:text-xs">
          Free shipping in India on orders above ₹2,999 &nbsp;·&nbsp; WhatsApp: +91 98765 43210
        </div>

        {/* Main header row */}
        <div className="flex h-14 items-center px-3 sm:h-16 sm:px-4 md:px-6">

          {/* LEFT — menu icon (mobile) | logo + nav (desktop) */}
          <div className="flex items-center gap-4 lg:gap-5">
            {/* Mobile menu trigger */}
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-sm focus:outline-none lg:hidden"
            >
              <span className="h-[1.5px] w-6 bg-ink" />
              <span className="h-[1.5px] w-4 self-start bg-ink" />
              <span className="h-[1.5px] w-6 bg-ink" />
            </button>

            {/* Logo — desktop only */}
            <Link href="/" aria-label="Roop Shree Udaipur" className="hidden items-center gap-3 lg:flex">
              <Image src="/logo.jpg" alt="Roop Shree" width={48} height={48} priority className="h-12 w-12 rounded object-cover" />
              <span className="text-sm font-bold uppercase tracking-[0.18em]">Roop Shree</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-6 lg:flex">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="text-[12px] font-semibold uppercase tracking-wide text-ink/80 transition hover:text-primary">
                  {item.label}
                </Link>
              ))}
              {user?.role === "admin" && (
                <Link href="/admin" className="text-[12px] font-semibold uppercase tracking-wide text-red-600 hover:text-red-700">Admin</Link>
              )}
            </nav>
          </div>

          {/* CENTER — Logo on mobile (flex, not absolute) */}
          <div className="flex flex-1 justify-center lg:hidden">
            <Link href="/" aria-label="Roop Shree Udaipur">
              <Image src="/logo.jpg" alt="Roop Shree" width={38} height={38} priority className="h-9 w-9 rounded object-cover" />
            </Link>
          </div>

          {/* RIGHT — icons */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Currency — desktop only */}
            <select
              className="hidden rounded border border-black/12 bg-white px-2 py-1.5 text-[12px] focus:outline-none md:block"
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
            >
              {currencies.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>

            {/* Search */}
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-sm text-ink/75 transition hover:bg-neutral hover:text-ink"
            >
              <Search size={19} />
            </button>

            {/* Wishlist — desktop only */}
            <Link href="/wishlist" aria-label="Wishlist" className="relative hidden h-9 w-9 items-center justify-center rounded-sm text-ink/75 transition hover:bg-neutral hover:text-ink md:flex">
              <Heart size={19} />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">{wishlistCount}</span>
              )}
            </Link>

            {/* User — desktop only */}
            <div ref={userMenuRef} className="relative hidden md:block">
              {user ? (
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-neutral focus:outline-none">
                  {user.avatar
                    ? <Image src={user.avatar} alt={user.name} width={36} height={36} className="h-full w-full object-cover" />
                    : <UserRound size={18} className="text-ink/70" />}
                </button>
              ) : (
                <Link href="/account" className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-[12px] font-semibold uppercase tracking-wide text-ink/75 transition hover:text-ink">
                  <UserRound size={17} /> Login
                </Link>
              )}
              {user && userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-black/8 bg-white py-2 shadow-xl">
                  <div className="px-4 py-2">
                    <p className="truncate text-sm font-bold">{user.name}</p>
                    <p className="truncate text-xs text-ink/50">{user.email}</p>
                  </div>
                  <div className="my-1 border-t border-black/8" />
                  <Link href="/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink/75 hover:bg-neutral">
                    <UserRound size={15} /> My Profile
                  </Link>
                  <Link href="/account#orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink/75 hover:bg-neutral">
                    <Package size={15} /> Orders
                  </Link>
                  <Link href="/account#settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink/75 hover:bg-neutral">
                    <Settings size={15} /> Settings
                  </Link>
                  <div className="my-1 border-t border-black/8" />
                  <button onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              type="button"
              aria-label="Open cart"
              onClick={() => setCartOpen(true)}
              className="relative flex h-9 w-9 items-center justify-center rounded-sm text-ink/75 transition hover:bg-neutral hover:text-ink"
            >
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />

          {/* Drawer panel */}
          <div className="absolute left-0 top-0 flex h-full w-72 max-w-[80vw] flex-col bg-white shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-black/8 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <Image src="/logo.jpg" alt="Roop Shree" width={36} height={36} className="h-9 w-9 rounded object-cover" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink">Roop Shree</p>
                  <p className="text-[10px] text-ink/50">Udaipur, Rajasthan</p>
                </div>
              </div>
              <button type="button" aria-label="Close menu" onClick={() => setDrawerOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral">
                <X size={18} />
              </button>
            </div>

            {/* User section */}
            {user ? (
              <div className="border-b border-black/8 px-5 py-4">
                <p className="text-xs text-ink/50">Signed in as</p>
                <p className="mt-0.5 font-bold">{user.name}</p>
                <div className="mt-3 flex gap-2">
                  <Link href="/account" onClick={() => setDrawerOpen(false)} className="flex-1 border border-black/15 py-2 text-center text-[11px] font-bold uppercase tracking-wide hover:bg-neutral">Profile</Link>
                  <Link href="/account" onClick={() => setDrawerOpen(false)} className="flex-1 border border-black/15 py-2 text-center text-[11px] font-bold uppercase tracking-wide hover:bg-neutral">Orders</Link>
                </div>
              </div>
            ) : (
              <div className="border-b border-black/8 px-5 py-4">
                <Link href="/account" onClick={() => setDrawerOpen(false)} className="block w-full bg-ink py-2.5 text-center text-[12px] font-bold uppercase tracking-wide text-white hover:bg-ink/85">
                  Sign In / Create Account
                </Link>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto py-2">
              {mobileNav.map((item) => (
                <Link
                  key={item.label + item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center border-b border-black/5 px-5 py-3.5 text-[13px] font-medium uppercase tracking-wide text-ink/75 hover:bg-neutral hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
              {user?.role === "admin" && (
                <Link href="/admin" onClick={() => setDrawerOpen(false)} className="flex items-center border-b border-black/5 px-5 py-3.5 text-[13px] font-medium uppercase tracking-wide text-red-600">
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* Drawer footer */}
            <div className="border-t border-black/8 px-5 py-4">
              {user && (
                <button onClick={() => { handleLogout(); setDrawerOpen(false); }} className="mb-3 flex w-full items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700">
                  <LogOut size={15} /> Logout
                </button>
              )}
              <div className="flex items-center justify-between text-[11px] text-ink/40">
                <span>© 2025 Roop Shree Udaipur</span>
                <select className="bg-transparent text-[11px] focus:outline-none" value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value)}>
                  {currencies.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      <AjaxSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <SideCart open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
