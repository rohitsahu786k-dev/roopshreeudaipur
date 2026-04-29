"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Package, Truck, CreditCard, User, Check, X } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

const ORDER_STATUSES = [
  "pending", "confirmed", "processing", "packed",
  "shipped", "out_for_delivery", "delivered", "cancelled", "refunded"
];

const PAYMENT_STATUSES = ["pending", "paid", "cod_pending", "failed"];

export default function OrderDetailClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [trackingInput, setTrackingInput] = useState("");
  const [awbInput, setAwbInput] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`)
      .then((r) => r.json())
      .then((d) => {
        setOrder(d.order);
        setOrderStatus(d.order?.orderStatus ?? "");
        setPaymentStatus(d.order?.paymentStatus ?? "");
        setTrackingInput(d.order?.shiprocketTrackingUrl ?? "");
        setAwbInput(d.order?.shiprocketAwbCode ?? "");
        setNotes(d.order?.notes ?? "");
        setLoading(false);
      });
  }, [orderId]);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderStatus,
        paymentStatus,
        shiprocketTrackingUrl: trackingInput,
        shiprocketAwbCode: awbInput,
        notes
      })
    });
    setSaving(false);
    alert("Order updated");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center text-gray-500">Order not found</div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/orders"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Orders
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900">#{order.orderNumber}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left */}
        <div className="space-y-6">
          {/* Items */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Order Items
            </h3>
            <div className="space-y-3">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                    {item.productImage ? (
                      <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                    ) : (
                      <div className="h-full bg-gray-100" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500">
                      {item.variantSize} · {item.variantColor} · Qty: {item.qty}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">₹{(item.price * item.qty).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>₹{order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span><span>₹{order.shipping?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax</span><span>₹{order.tax?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 text-base">
                <span>Total</span><span>₹{order.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Update Order */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Update Order</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Order Status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">AWB Code</label>
                <input
                  value={awbInput}
                  onChange={(e) => setAwbInput(e.target.value)}
                  placeholder="Shiprocket AWB"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tracking URL</label>
                <input
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={save}
              disabled={saving}
              className="mt-4 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Customer
            </h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-gray-900">{order.billing.name}</p>
              <p className="text-gray-500">{order.billing.email}</p>
              <p className="text-gray-500">{order.billing.phone}</p>
            </div>
          </div>

          {/* Shipping address */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              Shipping Address
            </h3>
            <div className="space-y-0.5 text-sm text-gray-600">
              <p>{order.billing.address}</p>
              <p>{order.billing.city}, {order.billing.state}</p>
              <p>{order.billing.country} – {order.billing.pincode}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment
            </h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium capitalize">{order.paymentMethod?.replace(/_/g, " ")}</span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">ID</span>
                  <span className="font-mono text-xs text-gray-700">{order.paymentId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Timeline</h3>
            <p className="text-xs text-gray-500">
              Created: {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")}
            </p>
            {order.updatedAt && (
              <p className="text-xs text-gray-500">
                Updated: {format(new Date(order.updatedAt), "dd MMM yyyy, HH:mm")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
