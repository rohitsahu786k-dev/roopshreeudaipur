import Link from "next/link";
import { Heart, MapPin, PackageCheck, ShoppingBag } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { formatPrice, products } from "@/lib/catalog";
import { recentOrders } from "@/lib/dashboard";
import { requireRole } from "@/lib/auth";

export const metadata = {
  title: "User Dashboard"
};

export default async function UserDashboardPage() {
  const user = await requireRole(["user", "manager", "admin"]);
  const lastOrder = recentOrders[0];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-primary">Customer workspace</p>
          <h1 className="mt-3 font-serif text-5xl font-bold">User dashboard</h1>
          <p className="mt-3 text-ink/70">Welcome, {user.name}. Track orders, save addresses, and continue shopping.</p>
        </div>
        <Link href="/shop" className="focus-ring rounded bg-primary px-5 py-3 text-sm font-bold text-white">
          Continue shopping
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Latest order" value={lastOrder.orderNumber} note={lastOrder.status.replaceAll("_", " ")} icon={PackageCheck} />
        <DashboardCard title="Wishlist" value="3 items" note="Saved from festive edit" icon={Heart} />
        <DashboardCard title="Addresses" value="1 saved" note="Default shipping profile" icon={MapPin} />
        <DashboardCard title="Total spent" value={formatPrice(12280)} note="Across completed orders" icon={ShoppingBag} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="font-serif text-2xl font-bold">Order timeline</h2>
          <div className="mt-5 grid gap-3">
            {["Order confirmed", "Outfit quality check", "Packing", "Shiprocket pickup", "Delivery"].map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded border border-black/10 bg-neutral px-4 py-3">
                <span className={`h-3 w-3 rounded-full ${index < 3 ? "bg-primary" : "bg-black/20"}`} />
                <span className="font-semibold">{step}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="font-serif text-2xl font-bold">Recommended for you</h2>
          <div className="mt-5 grid gap-3">
            {products.slice(0, 3).map((product) => (
              <Link key={product.slug} href={`/product/${product.slug}`} className="flex items-center justify-between gap-4 rounded border border-black/10 p-3 hover:border-primary">
                <span className="font-bold">{product.name}</span>
                <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
