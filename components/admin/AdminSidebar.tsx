"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  FolderOpen,
  Image,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Store,
  Truck,
  MessageSquare,
  FileText,
  Layers,
  Boxes,
  Percent,
  Globe,
  X
} from "lucide-react";
import { useState } from "react";

type NavItem = {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    label: "Products",
    icon: Package,
    children: [
      { label: "All Products", href: "/admin/products" },
      { label: "Add Product", href: "/admin/products/new" },
      { label: "Categories", href: "/admin/categories" },
      { label: "Attributes", href: "/admin/attributes" },
      { label: "Collections", href: "/admin/collections" }
    ]
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: Boxes
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    children: [
      { label: "All Orders", href: "/admin/orders" },
      { label: "Abandoned Carts", href: "/admin/abandoned-carts" }
    ]
  },
  { label: "Customers", href: "/admin/customers", icon: Users },
  {
    label: "Marketing",
    icon: Percent,
    children: [
      { label: "Discounts & Coupons", href: "/admin/discounts" },
      { label: "Upsell Rules", href: "/admin/upsell-rules" }
    ]
  },
  { label: "Media Library", href: "/admin/media", icon: Image },
  {
    label: "Content",
    icon: FileText,
    children: [
      { label: "Blogs", href: "/admin/blogs" },
      { label: "Pages", href: "/admin/pages" },
      { label: "Banners", href: "/admin/banners" }
    ]
  },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  {
    label: "Shipping",
    icon: Truck,
    children: [
      { label: "Zones & Rates", href: "/admin/shipping" },
      { label: "Shiprocket Sync", href: "/admin/shipping/shiprocket" }
    ]
  },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { label: "Store Settings", href: "/admin/settings" },
      { label: "Payments", href: "/admin/settings/payments" },
      { label: "Taxes", href: "/admin/settings/taxes" },
      { label: "Currencies", href: "/admin/settings/currencies" },
      { label: "Notifications", href: "/admin/settings/notifications" },
      { label: "Staff & Roles", href: "/admin/staff" }
    ]
  }
];

type Props = {
  onClose?: () => void;
};

export default function AdminSidebar({ onClose }: Props) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>(() => {
    return NAV.filter((item) =>
      item.children?.some((c) => pathname.startsWith(c.href))
    ).map((item) => item.label);
  });

  const toggle = (label: string) =>
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="flex h-full w-64 flex-col bg-[#1a1a2e] text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Store className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold leading-tight">Roop Shree</div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest">Admin</div>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="rounded p-1 hover:bg-white/10 lg:hidden">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <div className="space-y-0.5 px-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isOpen = expanded.includes(item.label);
            const hasChildren = !!item.children;
            const anyChildActive = item.children?.some((c) => isActive(c.href));

            if (!hasChildren && item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive(item.href)
                      ? "bg-primary text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            }

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggle(item.label)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    anyChildActive
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isOpen ? (
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  ) : (
                    <ChevronRight className="h-3 w-3 opacity-60" />
                  )}
                </button>
                {isOpen && (
                  <div className="mt-0.5 ml-4 space-y-0.5 border-l border-white/10 pl-3">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onClose}
                        className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                          isActive(child.href)
                            ? "bg-primary/80 text-white"
                            : "text-white/60 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Globe className="h-4 w-4" />
          View Store
        </Link>
      </div>
    </div>
  );
}
