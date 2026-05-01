import Link from "next/link";
import {
  Activity,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Boxes,
  Percent,
  Image,
  BarChart3,
  Settings,
  Tag,
  ArrowRight
} from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard — Admin" };

export default async function AdminPage() {
  await connectToDatabase();

  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalProducts, totalOrders, totalCustomers, revenueData, pendingOrders, lowStock] =
    await Promise.all([
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      User.countDocuments({ role: "user" }),
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: since30d } } },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }
      ]),
      Order.countDocuments({ orderStatus: { $in: ["pending", "confirmed", "processing"] } }),
      Product.countDocuments({ stock: { $lte: 5, $gt: 0 } })
    ]);

  const revenue30d = revenueData[0]?.total ?? 0;
  const orders30d = revenueData[0]?.count ?? 0;

  const STATS = [
    {
      label: "Revenue (30d)",
      value: `₹${revenue30d.toLocaleString()}`,
      note: `${orders30d} paid orders`,
      icon: Activity,
      color: "text-green-700 bg-green-50",
      href: "/admin/analytics"
    },
    {
      label: "Total Products",
      value: totalProducts.toString(),
      note: "Active in catalog",
      icon: Package,
      color: "text-blue-700 bg-blue-50",
      href: "/admin/products"
    },
    {
      label: "Pending Orders",
      value: pendingOrders.toString(),
      note: "Require attention",
      icon: ShoppingCart,
      color: "text-orange-700 bg-orange-50",
      href: "/admin/orders"
    },
    {
      label: "Customers",
      value: totalCustomers.toString(),
      note: "Registered accounts",
      icon: Users,
      color: "text-purple-700 bg-purple-50",
      href: "/admin/customers"
    }
  ];

  const QUICK_LINKS = [
    { label: "Add Product", href: "/admin/products/new", icon: Package, desc: "Create new product listing" },
    { label: "View Orders", href: "/admin/orders", icon: ShoppingCart, desc: "Process & fulfil orders" },
    { label: "Inventory", href: "/admin/inventory", icon: Boxes, desc: `${lowStock} items low on stock` },
    { label: "Categories", href: "/admin/categories", icon: Tag, desc: "Manage product categories" },
    { label: "Discounts", href: "/admin/discounts", icon: Percent, desc: "Create coupons & offers" },
    { label: "Media Library", href: "/admin/media", icon: Image, desc: "Images, videos & reels" },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3, desc: "Revenue & performance" },
    { label: "Settings", href: "/admin/settings", icon: Settings, desc: "Store & payment config" }
  ];

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back. Here&apos;s what&apos;s happening with your store.</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ label, value, note, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border border-gray-200 bg-white p-5 hover:border-primary/40 hover:shadow-soft transition-all"
          >
            <div className={`inline-flex rounded-lg p-2 ${color.split(" ")[1]}`}>
              <Icon className={`h-5 w-5 ${color.split(" ")[0]}`} />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{note}</p>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">Quick Access</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map(({ label, href, icon: Icon, desc }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:border-primary/40 hover:shadow-soft transition-all group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 truncate">{desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock > 0 && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-yellow-800">
              {lowStock} product{lowStock !== 1 ? "s" : ""} running low on stock
            </p>
            <p className="text-xs text-yellow-600 mt-0.5">Update inventory before items go out of stock</p>
          </div>
          <Link
            href="/admin/inventory?filter=low"
            className="flex items-center gap-1.5 rounded-lg bg-yellow-600 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-700"
          >
            View Inventory <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
