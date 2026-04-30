"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, UserRound, X, LogOut, Settings, Package } from "lucide-react";
import { useState, useEffect } from "react";
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

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { cartItems, cartOpen, setCartOpen, currencyCode, setCurrencyCode, wishlistCount, user, refreshUser } = useCommerce();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await refreshUser();
    window.location.href = "/";
  };

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      isScrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur"
    } border-b border-black/10`}>
      <div className="bg-ink px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white">
        Free shipping in India on orders above Rs 2,999
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded" aria-label="Roop Shree Udaipur home">
          <Image
            src="/logo.jpg"
            alt=""
            width={64}
            height={64}
            priority
            className="h-14 w-14 rounded object-cover"
          />
          <span className="sr-only">Roop Shree Udaipur</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-primary">
              {item.label}
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link href="/admin" className="text-red-600 transition hover:text-red-700">
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <label className="sr-only" htmlFor="currency">
            Currency
          </label>
          <select
            id="currency"
            className="focus-ring rounded border border-black/15 bg-white px-3 py-2 text-sm"
            value={currencyCode}
            onChange={(event) => setCurrencyCode(event.target.value)}
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code}
              </option>
            ))}
          </select>
          <button type="button" aria-label="Search" className="focus-ring rounded p-2 hover:bg-neutral" onClick={() => setSearchOpen(true)}>
            <Search size={20} />
          </button>
          
          {/* User Profile / Login */}
          <div className="relative">
            {user ? (
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="focus-ring flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100"
              >
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} width={40} height={40} className="h-full w-full object-cover" />
                ) : (
                  <UserRound size={20} className="text-gray-600" />
                )}
              </button>
            ) : (
              <Link href="/account" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold transition hover:text-primary">
                <UserRound size={20} />
                <span>Login</span>
              </Link>
            )}

            {user && userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-xl">
                <div className="px-3 py-2">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <div className="my-1 border-t border-gray-100" />
                <Link href="/account" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <UserRound size={16} />
                  <span>My Profile</span>
                </Link>
                <Link href="/account#orders" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Package size={16} />
                  <span>Orders</span>
                </Link>
                <Link href="/account#settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Settings size={16} />
                  <span>Settings</span>
                </Link>
                <div className="my-1 border-t border-gray-100" />
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          <Link aria-label="Wishlist" className="focus-ring relative rounded p-2 hover:bg-neutral" href="/wishlist">
            <Heart size={20} />
            {wishlistCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-white">
                {wishlistCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            aria-label="Open cart"
            className="focus-ring relative rounded p-2 hover:bg-neutral"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag size={20} />
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-accent text-[11px] font-bold text-white">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </button>
        </div>

        <button
          type="button"
          className="focus-ring rounded p-2 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Open navigation menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-black/10 bg-white px-4 py-4 lg:hidden">
          <div className="grid gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded px-3 py-3 font-semibold hover:bg-neutral"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/cart" className="rounded px-3 py-3 font-semibold hover:bg-neutral">
              Cart
            </Link>
            {user ? (
              <>
                <Link href="/account" className="rounded px-3 py-3 font-semibold hover:bg-neutral">
                  My Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="rounded px-3 py-3 text-left font-semibold text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/account" className="rounded px-3 py-3 font-semibold hover:bg-neutral">
                Login / Signup
              </Link>
            )}
          </div>
        </nav>
      ) : null}
      <AjaxSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <SideCart open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
