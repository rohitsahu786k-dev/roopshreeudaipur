"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { SideCart } from "@/components/cart/SideCart";
import { AjaxSearch } from "@/components/search/AjaxSearch";
import { useCommerce } from "@/components/providers/CommerceProvider";
import { currencies } from "@/lib/currency";

const nav = [
  { label: "Shop", href: "/shop" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "Fabric Guide", href: "/fabric-guide" },
  { label: "Blogs", href: "/blogs" },
  { label: "Contact", href: "/contact-us" }
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartItems, cartOpen, setCartOpen, currencyCode, setCurrencyCode, wishlistCount } = useCommerce();

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
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
          <Link aria-label="Account" className="focus-ring rounded p-2 hover:bg-neutral" href="/account">
            <UserRound size={20} />
          </Link>
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
              {cartItems.reduce((sum, item) => sum + item.qty, 0)}
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
          </div>
        </nav>
      ) : null}
      <AjaxSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <SideCart open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
