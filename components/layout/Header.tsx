"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, UserRound, X, LogOut, Settings, Package, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { SideCart } from "@/components/cart/SideCart";
import { AjaxSearch } from "@/components/search/AjaxSearch";
import { useCommerce } from "@/components/providers/CommerceProvider";
import { currencies } from "@/lib/currency";

type MenuItem = {
  label: string;
  href?: string;
  icon?: string;
  sortOrder: number;
};

type Category = {
  _id: string;
  name: string;
  slug: string;
};

const fallbackNav = [
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
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const { cartItems, cartOpen, setCartOpen, currencyCode, setCurrencyCode, wishlistCount, user, refreshUser } = useCommerce();

  useEffect(() => {
    // Fetch menu and categories
    const fetchMenuAndCategories = async () => {
      try {
        // Fetch header menu
        const menuRes = await fetch("/api/menus?placement=header&name=header");
        const menuData = await menuRes.json();
        if (menuData.menus && menuData.menus.length > 0) {
          setMenuItems(menuData.menus[0].items || []);
        }

        // Fetch categories for Shop dropdown
        const catRes = await fetch("/api/products/categories");
        const catData = await catRes.json();
        if (catData.categories) {
          setCategories(catData.categories);
        }
      } catch (error) {
        console.error("Failed to fetch menu/categories:", error);
      } finally {
        setLoadingMenu(false);
      }
    };

    fetchMenuAndCategories();
  }, []);

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

  // Get navigation items - use menu items if available, otherwise fallback
  const navItems = menuItems.length > 0 ? menuItems : fallbackNav.map((item, idx) => ({
    label: item.label,
    href: item.href,
    sortOrder: idx
  }));

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      isScrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur"
    } border-b border-black/10`}>
      <div className="mx-auto grid max-w-7xl grid-cols-[44px_1fr_auto] items-center gap-2 px-3 py-3 sm:px-4 lg:flex lg:justify-between lg:gap-4 lg:py-4">
        <button
          type="button"
          className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Open navigation menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="focus-ring flex min-w-0 items-center justify-center gap-2 rounded lg:justify-start" aria-label="Roop Shree Udaipur home">
          <Image
            src="/logo.jpg"
            alt=""
            width={64}
            height={64}
            priority
            className="h-11 w-11 rounded-full object-cover ring-1 ring-black/10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 lg:rounded"
          />
          <span className="hidden text-sm font-black uppercase tracking-[0.2em] sm:block lg:sr-only">Roop Shree</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold lg:flex">
          {navItems.map((item) => (
            <div key={item.label} className="relative group">
              {item.label === "Shop" ? (
                <>
                  <button className="flex items-center gap-1 transition hover:text-primary">
                    {item.label}
                    <ChevronDown size={16} className="group-hover:rotate-180 transition" />
                  </button>
                  
                  {/* Categories Dropdown */}
                  <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-max z-50">
                    {categories.length > 0 ? (
                      <>
                        <Link
                          href="/shop"
                          className="block px-4 py-2 hover:bg-gray-50 text-gray-700"
                        >
                          All Products
                        </Link>
                        <div className="border-t border-gray-100" />
                        {categories.map((cat) => (
                          <Link
                            key={cat._id}
                            href={`/shop?category=${cat.slug}`}
                            className="block px-4 py-2 hover:bg-gray-50 text-gray-700"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </>
                    ) : (
                      <Link
                        href="/shop"
                        className="block px-4 py-2 hover:bg-gray-50 text-gray-700"
                      >
                        Shop All
                      </Link>
                    )}
                  </div>
                </>
              ) : item.href ? (
                <Link href={item.href} className="transition hover:text-primary">
                  {item.label}
                </Link>
              ) : null}
            </div>
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

        <div className="flex items-center justify-end gap-1 md:hidden">
          <button type="button" aria-label="Search" className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white" onClick={() => setSearchOpen(true)}>
            <Search size={18} />
          </button>
          <Link aria-label="Wishlist" className="focus-ring relative grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white" href="/wishlist">
            <Heart size={18} />
            {wishlistCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            aria-label="Open cart"
            className="focus-ring relative grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag size={18} />
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] font-bold text-white">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <nav className="scroll-touch max-h-[calc(100svh-112px)] border-t border-black/10 bg-white px-4 py-4 shadow-xl lg:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.label === "Shop" ? (
                  <>
                    <button
                      onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                      className="w-full flex items-center justify-between rounded px-3 py-3 font-semibold hover:bg-neutral"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={18}
                        className={`transition ${shopDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {shopDropdownOpen && (
                      <div className="pl-4 space-y-1">
                        <Link
                          href="/shop"
                          className="block rounded px-3 py-2 text-sm hover:bg-neutral"
                          onClick={() => {
                            setOpen(false);
                            setShopDropdownOpen(false);
                          }}
                        >
                          All Products
                        </Link>
                        {categories.map((cat) => (
                          <Link
                            key={cat._id}
                            href={`/shop?category=${cat.slug}`}
                            className="block rounded px-3 py-2 text-sm hover:bg-neutral"
                            onClick={() => {
                              setOpen(false);
                              setShopDropdownOpen(false);
                            }}
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="rounded px-3 py-3 font-semibold hover:bg-neutral block"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : null}
              </div>
            ))}
            <Link href="/cart" className="rounded px-3 py-3 font-semibold hover:bg-neutral block">
              Cart
            </Link>
            {user ? (
              <>
                <Link href="/account" className="rounded px-3 py-3 font-semibold hover:bg-neutral block">
                  My Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="rounded px-3 py-3 text-left font-semibold text-red-600 hover:bg-red-50 w-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/account" className="rounded px-3 py-3 font-semibold hover:bg-neutral block">
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

