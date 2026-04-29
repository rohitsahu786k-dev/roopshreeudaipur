import { formatPrice } from "@/lib/catalog";
import { recentOrders } from "@/lib/dashboard";

export function DashboardTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm">
      <div className="border-b border-black/10 px-5 py-4">
        <h2 className="font-serif text-2xl font-bold">Recent orders</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead className="bg-neutral text-ink/70">
            <tr>
              <th className="px-5 py-3 font-bold">Order</th>
              <th className="px-5 py-3 font-bold">Customer</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 font-bold">Payment</th>
              <th className="px-5 py-3 font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.orderNumber} className="border-t border-black/10">
                <td className="px-5 py-4 font-bold">{order.orderNumber}</td>
                <td className="px-5 py-4">{order.customer}</td>
                <td className="px-5 py-4 capitalize">{order.status.replaceAll("_", " ")}</td>
                <td className="px-5 py-4 capitalize">{order.payment.replaceAll("_", " ")}</td>
                <td className="px-5 py-4 font-bold">{formatPrice(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
