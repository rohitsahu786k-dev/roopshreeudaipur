"use client";

import { useState, useEffect } from "react";
import { TrendingUp, ShoppingCart, Users, Package, IndianRupee } from "lucide-react";

type AnalyticsData = {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    newCustomers: number;
    totalProducts: number;
    avgOrderValue: number;
  };
  revenueChart: { _id: string; revenue: number; orders: number }[];
  orderStatusCounts: { _id: string; count: number }[];
  topProducts: { _id: string; name: string; revenue: number; unitsSold: number }[];
};

const PERIODS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" }
];

export default function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?period=${period}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const s = data?.summary;

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Revenue", value: `₹${s?.totalRevenue?.toLocaleString() ?? 0}`, icon: IndianRupee, color: "text-green-700 bg-green-50" },
          { label: "Orders", value: s?.totalOrders ?? 0, icon: ShoppingCart, color: "text-blue-700 bg-blue-50" },
          { label: "Avg Order", value: `₹${Math.round(s?.avgOrderValue ?? 0).toLocaleString()}`, icon: TrendingUp, color: "text-purple-700 bg-purple-50" },
          { label: "New Customers", value: s?.newCustomers ?? 0, icon: Users, color: "text-orange-700 bg-orange-50" },
          { label: "Active Products", value: s?.totalProducts ?? 0, icon: Package, color: "text-pink-700 bg-pink-50" }
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className={`inline-flex rounded-lg p-2 ${color.split(" ")[1]}`}>
              <Icon className={`h-5 w-5 ${color.split(" ")[0]}`} />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart (simple bar) */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Daily Revenue</h3>
          {data?.revenueChart && data.revenueChart.length > 0 ? (
            <div className="space-y-1">
              {(() => {
                const max = Math.max(...data.revenueChart.map((d) => d.revenue));
                return data.revenueChart.slice(-14).map((d) => (
                  <div key={d._id} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-gray-500 shrink-0">{d._id.slice(5)}</span>
                    <div className="flex-1 bg-gray-100 rounded h-5 overflow-hidden">
                      <div
                        className="h-full bg-primary/80 rounded"
                        style={{ width: max > 0 ? `${(d.revenue / max) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="w-20 text-xs text-right text-gray-700">₹{d.revenue.toLocaleString()}</span>
                  </div>
                ));
              })()}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No revenue data for this period</p>
          )}
        </div>

        {/* Top Products */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Top Products by Revenue</h3>
          {data?.topProducts && data.topProducts.length > 0 ? (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.unitsSold} units sold</p>
                  </div>
                  <span className="font-semibold text-gray-900">₹{p.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No sales data for this period</p>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Orders by Status</h3>
          {data?.orderStatusCounts && data.orderStatusCounts.length > 0 ? (
            <div className="space-y-2">
              {data.orderStatusCounts.map((s) => {
                const total = data.orderStatusCounts.reduce((acc, x) => acc + x.count, 0);
                return (
                  <div key={s._id} className="flex items-center gap-3">
                    <span className="w-32 text-sm text-gray-600 capitalize">{s._id.replace(/_/g, " ")}</span>
                    <div className="flex-1 bg-gray-100 rounded h-4">
                      <div
                        className="h-full bg-primary rounded"
                        style={{ width: `${(s.count / total) * 100}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm font-medium text-gray-900">{s.count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No orders for this period</p>
          )}
        </div>
      </div>
    </div>
  );
}
