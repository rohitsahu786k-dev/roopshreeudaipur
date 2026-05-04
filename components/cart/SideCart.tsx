"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Heart, Minus, Plus, ShoppingBag, Tag, Timer, Trash2, X, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { products } from "@/lib/catalog";
import { SaleTimer } from "@/components/ui/SaleTimer";
import { useCommerce } from "@/components/providers/CommerceProvider";

const DEFAULT_SALE_ENDS = "2026-05-15T23:59:59";
const FREE_SHIP = 2999;

type SideCartProps = { open: boolean; onClose: () => void };

export function SideCart({ open, onClose }: SideCartProps) {
  const {
    cartItems, cartLoading, cartMessage, subtotal, discount, shipping, total,
    formatMoney, availableCoupons, applyCoupon, appliedCoupon, clearCoupon,
    removeFromCart, updateQty
  } = useCommerce();

  const [saleEndsAt, setSaleEndsAt] = useState(DEFAULT_SALE_ENDS);
  const [saleLabel, setSaleLabel] = useState("Sale Ends In");
  const upsells = products.filter((p) => p.featured).slice(0, 3);
  const remaining = Math.max(0, FREE_SHIP - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIP) * 100);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/store-settings")
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings ?? {};
        if (s.saleEndsAt) setSaleEndsAt(s.saleEndsAt);
        if (s.saleLabel) setSaleLabel(s.saleLabel);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <div className={`fixed inset-0 z-[100] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      {/* Backdrop */}
      <button
        type="button"
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        aria-label="Close cart"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 flex h-[100svh] w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        onTouchStart={(e) => { touchStartX.current = e.touches[0]?.clientX ?? null; }}
        onTouchEnd={(e) => {
          const start = touchStartX.current;
          if (start !== null && (e.changedTouches[0]?.clientX ?? 0) - start > 80) onClose();
          touchStartX.current = null;
        }}
      >
        {/* Header */}
        <div className="shrink-0 bg-[#1C0606] px-5 py-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Shopping Bag</p>
              <h2 className="text-lg font-semibold">Your Cart ({cartItems.reduce((s, i) => s + i.quantity, 0)})</h2>
            </div>
            <button type="button" className="rounded p-1.5 hover:bg-white/10" onClick={onClose} aria-label="Close cart">
              <X size={20} />
            </button>
          </div>
          {/* Sale timer in cart */}
          <div className="mt-2 flex items-center gap-2 border-t border-white/15 pt-2">
            <Timer size={13} className="shrink-0 text-white/70" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">{saleLabel}:</span>
            <SaleTimer endsAt={saleEndsAt} dark />
          </div>
        </div>

        {/* Body */}
        <div className="scroll-touch min-h-0 flex-1 overflow-y-auto px-4 py-4">

          {/* Free shipping progress */}
          <div className={`mb-4 rounded-sm border p-3 ${remaining === 0 ? "border-green-200 bg-green-50" : "border-black/10 bg-[#fafafa]"}`}>
            <p className="text-[11px] font-bold uppercase tracking-wide">
              {remaining > 0
                ? <><span className="text-[#B83262]">{formatMoney(remaining)}</span> more for free India shipping 🚚</>
                : <span className="text-green-700">✓ Free India shipping unlocked!</span>
              }
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${remaining === 0 ? "bg-green-500" : "bg-[#B83262]"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Messages */}
          {cartLoading && (
            <div className="mb-3 rounded border border-black/10 p-3 text-sm text-ink/55">Loading cart…</div>
          )}
          {cartMessage && (
            <div className="mb-3 rounded border border-[#B83262]/30 bg-[#B83262]/5 p-3 text-xs font-semibold text-[#B83262]">
              {cartMessage}
            </div>
          )}

          {/* Empty cart */}
          {!cartLoading && cartItems.length === 0 && (
            <div className="grid place-items-center border border-black/10 px-5 py-12 text-center">
              <Heart className="text-[#B83262]" size={32} />
              <p className="mt-3 font-bold uppercase">Your cart is empty</p>
              <p className="mt-2 text-sm text-ink/60">Add a saved style or continue shopping.</p>
              <Link href="/shop" className="mt-5 bg-ink px-5 py-3 text-xs font-bold uppercase text-white" onClick={onClose}>
                Continue Shopping
              </Link>
            </div>
          )}

          {/* Cart items */}
          <div className="space-y-4">
            {cartItems.map((item) => {
              const discountPct = item.price > item.discount_price
                ? Math.round(((item.price - item.discount_price) / item.price) * 100)
                : 0;
              return (
                <article key={item.variant_id} className="grid grid-cols-[80px_1fr] gap-3 border-b border-black/8 pb-4 last:border-0">
                  <div className="relative h-[110px] overflow-hidden bg-neutral">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                    {discountPct > 0 && (
                      <span className="absolute left-0 top-0 bg-[#B83262] px-1.5 py-0.5 text-[9px] font-bold text-white">
                        -{discountPct}%
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="line-clamp-2 text-xs font-bold uppercase leading-4">{item.name}</h3>
                        <p className="mt-1 text-[10px] text-ink/55">Size {item.size} · {item.color}</p>
                        <p className={`mt-0.5 text-[10px] font-semibold ${item.stock_status === "in_stock" ? "text-green-600" : "text-red-600"}`}>
                          {item.stock_status.replace(/_/g, " ")}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded p-1 text-ink/30 hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                        onClick={() => removeFromCart(item.variant_id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center border border-black/15">
                        <button type="button" className="grid h-7 w-7 place-items-center hover:bg-neutral transition-colors" onClick={() => updateQty(item.variant_id, item.quantity - 1)}>
                          <Minus size={13} />
                        </button>
                        <span className="grid h-7 w-8 place-items-center text-sm font-bold">{item.quantity}</span>
                        <button type="button" className="grid h-7 w-7 place-items-center hover:bg-neutral transition-colors" disabled={item.quantity >= item.available_stock} onClick={() => updateQty(item.variant_id, item.quantity + 1)}>
                          <Plus size={13} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatMoney(item.subtotal)}</p>
                        {discountPct > 0 && (
                          <p className="text-[10px] text-ink/40 line-through">{formatMoney(item.price * item.quantity)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Coupons */}
          {cartItems.length > 0 && (
            <div className="mt-4 border border-black/10 bg-[#fafafa] p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide">
                <Tag size={14} /> Available Coupons
              </p>
              <div className="mt-2.5 flex snap-x gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                {availableCoupons.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    className="min-w-[160px] snap-start border border-dashed border-[#B83262]/40 bg-white p-2.5 text-left hover:border-[#B83262] transition-colors"
                    onClick={() => applyCoupon(c.code)}
                  >
                    <span className="text-xs font-black text-[#B83262]">{c.code}</span>
                    <span className="mt-0.5 block text-[10px] leading-4 text-ink/60">{c.title}</span>
                  </button>
                ))}
              </div>
              {appliedCoupon && (
                <div className="mt-2 flex items-center justify-between text-xs font-semibold text-[#B83262]">
                  <p className="flex items-center gap-1"><BadgeCheck size={13} /> {appliedCoupon.code} applied</p>
                  <button type="button" onClick={clearCoupon} className="font-bold uppercase text-ink/50 hover:text-ink">Remove</button>
                </div>
              )}
            </div>
          )}

          {/* Upsells */}
          {cartItems.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] font-bold uppercase tracking-wide">You May Also Like</p>
              <div className="mt-2 space-y-2">
                {upsells.map((p) => (
                  <Link key={p.slug} href={`/product/${p.slug}`} className="grid grid-cols-[52px_1fr_auto] items-center gap-2.5 border border-black/10 p-2 hover:bg-neutral transition-colors" onClick={onClose}>
                    <div className="relative h-[68px] overflow-hidden bg-neutral">
                      <Image src={p.image} alt={p.name} fill className="object-cover" sizes="52px" />
                    </div>
                    <p className="line-clamp-2 text-[11px] font-semibold uppercase leading-4">{p.name}</p>
                    <span className="shrink-0 text-xs font-bold">{formatMoney(p.price)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-black/10 bg-white p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.07)]">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span><strong className="text-ink">{formatMoney(subtotal)}</strong>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon saving</span><strong>-{formatMoney(discount)}</strong>
              </div>
            )}
            <div className="flex justify-between text-ink/60">
              <span>Shipping</span>
              <span>{shipping > 0 ? formatMoney(shipping) : <span className="font-bold text-green-600">Free</span>}</span>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-2 text-base font-bold">
              <span>Total</span><span>{formatMoney(total)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="mt-4 flex items-center justify-center gap-2 bg-[#1C0606] px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-black transition-colors"
            onClick={onClose}
          >
            <Zap size={16} /> Checkout Securely
          </Link>
          <Link
            href="/cart"
            className="mt-2 block border border-black/20 px-5 py-2.5 text-center text-xs font-bold uppercase tracking-wide hover:bg-neutral transition-colors"
            onClick={onClose}
          >
            View Full Cart
          </Link>
          <div className="mt-3 flex items-center justify-center gap-4 text-[10px] font-semibold text-ink/40">
            <span>🔒 Secure</span>
            <span>🚚 Free Shipping ₹2999+</span>
            <span>↩ Easy Returns</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
