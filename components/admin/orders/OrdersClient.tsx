"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  FileDown,
  Printer,
  Mail
} from "lucide-react";
import { format } from "date-fns";
import { generateInvoicePDF, generateThermalInvoice } from "@/lib/invoice-client";
import toast from "react-hot-toast";

type Order = {
  _id: string;
  orderNumber: string;
  billing: { name: string; email: string; phone: string };
  total: number;
  currency: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  items: { qty: number }[];
  createdAt: string;
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-blue-100 text-blue-700",
  packed: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700"
};

const PAYMENT_COLORS: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cod_pending: "bg-orange-100 text-orange-700",
  failed: "bg-red-100 text-red-700"
};

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [stats, setStats] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchFullOrder = async (id: string) => {
    const res = await fetch(`/api/admin/orders/${id}`);
    if (!res.ok) throw new Error("Failed to fetch order");
    return res.json();
  };

  const handleDownloadInvoice = async (orderId: string) => {
    setActionLoading(orderId + "-pdf");
    try {
      const order = await fetchFullOrder(orderId);
      const settingsRes = await fetch("/api/admin/settings");
      const settings = await settingsRes.json();
      await generateInvoicePDF(order, settings);
      toast.success("Invoice generated");
    } catch (err) {
      toast.error("Failed to generate invoice");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePrintThermal = async (orderId: string) => {
    setActionLoading(orderId + "-thermal");
    try {
      const order = await fetchFullOrder(orderId);
      const settingsRes = await fetch("/api/admin/settings");
      const settings = await settingsRes.json();
      generateThermalInvoice(order, settings);
    } catch (err) {
      toast.error("Failed to prepare print");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendEmail = async (orderId: string) => {
    setActionLoading(orderId + "-email");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/send-invoice`, { method: "POST" });
      if (res.ok) {
        toast.success("Invoice sent via email");
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to send invoice");
    } finally {
      setActionLoading(null);
    }
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        ...(search && { search }),
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus })
      });
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders ?? []);
      setPagination(data.pagination ?? { total: 0, pages: 1 });
      setStats(data.stats ?? null);
    } finally {
      setLoading(false);
    }
  }, [page, search, orderStatus, paymentStatus]);

  useEffect(() => {
    const t = setTimeout(fetchOrders, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchOrders, search]);

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pagination.total} total orders</p>
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Revenue", value: `₹${stats.totalRevenue?.toLocaleString() ?? 0}`, color: "text-green-700" },
            { label: "Total Orders", value: stats.totalOrders ?? 0, color: "text-gray-900" },
            { label: "Pending", value: stats.pending ?? 0, color: "text-yellow-700" },
            { label: "Processing", value: stats.processing ?? 0, color: "text-blue-700" }
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
              <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Order #, name, email..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={orderStatus}
          onChange={(e) => { setOrderStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="">All Order Status</option>
          {["pending","confirmed","processing","packed","shipped","out_for_delivery","delivered","cancelled","refunded"].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="">All Payment Status</option>
          {["pending","paid","cod_pending","failed"].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No orders found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">Order</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Items</th>
                    <th className="px-4 py-3 text-left">Total</th>
                    <th className="px-4 py-3 text-left">Payment</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-medium text-gray-900 text-xs">
                        #{order.orderNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{order.billing.name}</div>
                        <div className="text-xs text-gray-500">{order.billing.email}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {format(new Date(order.createdAt), "dd MMM, HH:mm")}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {order.items.reduce((s, i) => s + i.qty, 0)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        ₹{order.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                            PAYMENT_COLORS[order.paymentStatus] ?? ""
                          }`}
                        >
                          {order.paymentStatus.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                            ORDER_STATUS_COLORS[order.orderStatus] ?? ""
                          }`}
                        >
                          {order.orderStatus.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownloadInvoice(order._id)}
                            disabled={!!actionLoading}
                            title="Download A4 Invoice"
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors disabled:opacity-50"
                          >
                            <FileDown size={16} />
                          </button>
                          <button
                            onClick={() => handlePrintThermal(order._id)}
                            disabled={!!actionLoading}
                            title="Print Thermal Invoice"
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors disabled:opacity-50"
                          >
                            <Printer size={16} />
                          </button>
                          <button
                            onClick={() => handleSendEmail(order._id)}
                            disabled={!!actionLoading}
                            title="Resend Invoice Email"
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors disabled:opacity-50"
                          >
                            <Mail size={16} />
                          </button>
                          <Link
                            href={`/admin/orders/${order._id}`}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors"
                          >
                            <ExternalLink size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                <p className="text-sm text-gray-500">
                  Page {page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === pagination.pages}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 hover:bg-gray-50"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
