import { ClipboardList, PackageOpen, Truck, UsersRound } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardTable } from "@/components/dashboard/DashboardTable";
import { getDashboardMetrics, supportTickets } from "@/lib/dashboard";
import { requireRole } from "@/lib/auth";

export const metadata = {
  title: "Manager Dashboard"
};

export default async function ManagerDashboardPage() {
  const user = await requireRole(["manager", "admin"]);
  const metrics = getDashboardMetrics();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-primary">Operations workspace</p>
        <h1 className="mt-3 font-serif text-5xl font-bold">Manager dashboard</h1>
        <p className="mt-3 text-ink/70">Welcome, {user.name}. Monitor fulfillment, stock, customers, and support work.</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Orders to process" value={`${metrics.orders}`} note="Confirmed, packed, and shipped queue" icon={ClipboardList} />
        <DashboardCard title="Low stock" value={`${metrics.lowStock.length} SKUs`} note="Needs replenishment planning" icon={PackageOpen} />
        <DashboardCard title="Shipments" value="2 active" note="Shiprocket labels and tracking" icon={Truck} />
        <DashboardCard title="Support" value={`${supportTickets.length} tickets`} note="Customer updates pending" icon={UsersRound} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <DashboardTable />
        <aside className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="font-serif text-2xl font-bold">Support queue</h2>
          <div className="mt-5 grid gap-3">
            {supportTickets.map((ticket) => (
              <article key={ticket.id} className="rounded border border-black/10 bg-neutral p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold">{ticket.id}</p>
                  <span className="rounded bg-white px-2 py-1 text-xs font-bold text-primary">{ticket.priority}</span>
                </div>
                <p className="mt-2 text-sm font-semibold">{ticket.topic}</p>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
