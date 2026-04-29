import type { Metadata } from "next";
import Link from "next/link";
import { Activity, Download, Heart, MapPin, PackageCheck, ReceiptText, ShoppingBag } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { requireRole } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { CustomerActivity } from "@/models/CustomerActivity";
import { formatPrice, products } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Dashboard | Roop Shree",
  description: "Manage your Roop Shree account, view invoices, orders, activity and saved profile details.",
  robots: {
    index: false
  }
};

function formatDate(value?: Date | string) {
  if (!value) return "Pending";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export default async function UserDashboardPage() {
  const user = await requireRole(["user", "manager", "admin"]);
  await connectToDatabase();

  const orders = await Order.find({ user: user.id }).sort({ createdAt: -1 }).limit(10).lean();
  const activities = await CustomerActivity.find({ user: user.id }).sort({ createdAt: -1 }).limit(8).lean();
  const latestOrder = orders[0];
  const paidOrders = orders.filter((order) => order.paymentStatus === "paid");
  const totalSpent = paidOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);

  const fallbackActivities = [
    latestOrder
      ? {
          title: `Order ${latestOrder.orderNumber} placed`,
          description: `Current status: ${String(latestOrder.orderStatus).replaceAll("_", " ")}`,
          createdAt: latestOrder.createdAt
        }
      : {
          title: "Account ready",
          description: "Your Roop Shree account is ready for orders, invoices and tracking.",
          createdAt: new Date()
        }
  ];
  const visibleActivities = activities.length ? activities : fallbackActivities;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-primary">Customer workspace</p>
          <h1 className="mt-3 font-serif text-5xl font-bold">Your dashboard</h1>
          <p className="mt-3 text-ink/70">Welcome, {user.name}. Track orders, download invoices, view activity and manage your profile.</p>
        </div>
        <Link href="/shop" className="focus-ring rounded bg-primary px-5 py-3 text-sm font-bold text-white">
          Continue shopping
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Latest order" value={latestOrder?.orderNumber ?? "No orders"} note={latestOrder ? String(latestOrder.orderStatus).replaceAll("_", " ") : "Start your first order"} icon={PackageCheck} />
        <DashboardCard title="Invoices" value={`${orders.length}`} note="Available from order history" icon={ReceiptText} />
        <DashboardCard title="Addresses" value="Profile" note="Billing details saved at checkout" icon={MapPin} />
        <DashboardCard title="Total spent" value={formatPrice(totalSpent)} note="Across paid orders" icon={ShoppingBag} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-2xl font-bold">Orders & invoices</h2>
            <Link href="/tracking-order" className="text-sm font-bold uppercase tracking-wide text-primary">Track order</Link>
          </div>
          <div className="mt-5 overflow-hidden rounded border border-black/10">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-sm text-ink/60">No orders yet. Once you place an order, invoices and tracking will appear here.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-neutral text-xs uppercase tracking-wide text-ink/50">
                  <tr>
                    <th className="px-4 py-3 text-left">Order</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {orders.map((order) => (
                    <tr key={String(order._id)}>
                      <td className="px-4 py-3 font-bold">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-ink/60">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3 capitalize">{String(order.orderStatus).replaceAll("_", " ")}</td>
                      <td className="px-4 py-3 text-right font-bold">{formatPrice(Number(order.total ?? 0))}</td>
                      <td className="px-4 py-3 text-right">
                        {order.invoiceUrl || order.shiprocketInvoiceUrl ? (
                          <Link href={String(order.invoiceUrl || order.shiprocketInvoiceUrl)} className="inline-flex items-center gap-1 font-bold text-primary" target="_blank">
                            <Download size={14} />
                            Download
                          </Link>
                        ) : (
                          <span className="text-xs text-ink/45">Generating</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-bold"><Activity size={20} /> Activity</h2>
          <div className="mt-5 grid gap-3">
            {visibleActivities.map((item, index) => (
              <div key={`${item.title}-${index}`} className="rounded border border-black/10 bg-neutral px-4 py-3">
                <div className="text-sm font-bold">{item.title}</div>
                <div className="mt-1 text-xs text-ink/55">{item.description}</div>
                <div className="mt-2 text-[11px] font-bold uppercase tracking-wide text-ink/40">{formatDate(item.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-bold"><Heart size={20} /> Profile support</h2>
          <div className="mt-5 grid gap-3 text-sm text-ink/70">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Need changes?</strong> Contact support for address, invoice GST details or custom outfit notes.</p>
          </div>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="font-serif text-2xl font-bold">Recommended for you</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {products.slice(0, 3).map((product) => (
              <Link key={product.slug} href={`/product/${product.slug}`} className="rounded border border-black/10 p-3 hover:border-primary">
                <span className="line-clamp-2 text-sm font-bold">{product.name}</span>
                <span className="mt-2 block text-sm font-bold text-primary">{formatPrice(product.price)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
