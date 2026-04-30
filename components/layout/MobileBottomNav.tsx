import { Home, LayoutGrid, PlayCircle, Heart, User, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommerce } from "@/components/providers/CommerceProvider";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { wishlistCount, cartItems, user, setCartOpen } = useCommerce();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Categories", href: "/shop", icon: LayoutGrid },
    { label: "Reels", href: "/#reels", icon: PlayCircle },
    { label: "Wishlist", href: "/wishlist", icon: Heart, count: wishlistCount > 0 ? wishlistCount : undefined },
    { label: user ? "Account" : "Login", href: "/account", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white pb-safe lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <nav className="flex items-center justify-around px-1 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 transition-colors ${
                isActive ? "text-primary" : "text-gray-500"
              }`}
            >
              <div className="relative">
                <Icon size={21} strokeWidth={isActive ? 2.5 : 1.75} />
                {item.count ? (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                    {item.count}
                  </span>
                ) : null}
              </div>
              <span className="text-[9px] font-semibold">{item.label}</span>
            </Link>
          );
        })}

        {/* Cart button */}
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 text-gray-500 transition-colors"
          aria-label="Open cart"
        >
          <div className="relative">
            <ShoppingBag size={21} strokeWidth={1.75} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-semibold">Cart</span>
        </button>
      </nav>
    </div>
  );
}
