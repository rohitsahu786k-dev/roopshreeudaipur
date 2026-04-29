import Link from "next/link";
import { Activity, Package, ShieldCheck, ShoppingCart, Users } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardTable } from "@/components/dashboard/DashboardTable";
import { formatPrice } from "@/lib/catalog";
import { getDashboardMetrics } from "@/lib/dashboard";
import { requireRole } from "@/lib/auth";

export const metadata = {
  title: "Admin Dashboard"
};

export default async function AdminPage() {
  const user = await requireRole(["admin"]);
  const metrics = getDashboardMetrics();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-primary">Admin workspace</p>
          <h1 className="mt-3 font-serif text-5xl font-bold">Admin dashboard</h1>
          <p className="mt-3 text-ink/70">Welcome back, {user.name}. Manage catalog, revenue, people, and platform settings.</p>
        </div>
        <Link href="/manager" className="focus-ring rounded border border-black/15 bg-white px-4 py-3 text-sm font-bold">
          Open manager view
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Revenue" value={formatPrice(metrics.revenue)} note="From recent tracked orders" icon={Activity} />
        <DashboardCard title="Products" value={`${metrics.products} live`} note="Catalog connected to storefront" icon={Package} />
        <DashboardCard title="Orders" value={`${metrics.orders} active`} note="Ready for payment and shipping workflows" icon={ShoppingCart} />
        <DashboardCard title="Roles" value="3 roles" note="User, manager, and admin access" icon={Users} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <DashboardTable />
        <aside className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
          <ShieldCheck className="text-primary" />
          <h2 className="mt-4 font-serif text-2xl font-bold">Admin controls</h2>
          <div className="mt-5 grid gap-3">
            {["Create and edit products", "Review all orders", "Assign manager access", "Audit payments and shipping"].map((item) => (
              <div key={item} className="rounded border border-black/10 bg-neutral px-4 py-3 text-sm font-bold">
                {item}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
