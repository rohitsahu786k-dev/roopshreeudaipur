import { Home, Grid, PlayCircle, Heart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommerce } from "@/components/providers/CommerceProvider";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { wishlistCount, user } = useCommerce();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Categories", href: "/shop", icon: Grid },
    { label: "Reels", href: "/#reels", icon: PlayCircle },
    { label: "Wishlist", href: "/wishlist", icon: Heart, count: wishlistCount },
    { label: user ? "Account" : "Login", href: "/account", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-2 py-2 lg:hidden">
      <nav className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`relative flex flex-col items-center gap-1 p-2 transition-colors ${
                isActive ? "text-primary" : "text-gray-500"
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {item.count ? (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {item.count}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
