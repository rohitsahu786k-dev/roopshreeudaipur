"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react";
import { products } from "@/lib/catalog";
import { useCommerce } from "@/components/providers/CommerceProvider";

type SideCartProps = {
  open: boolean;
  onClose: () => void;
};

export function SideCart({ open, onClose }: SideCartProps) {
  const {
    cartItems,
    subtotal,
    discount,
    total,
    formatMoney,
    availableCoupons,
    applyCoupon,
    appliedCoupon,
    removeFromCart,
    updateQty
  } = useCommerce();
  const upsells = products.slice(2, 5);

  return (
    <div className={`fixed inset-0 z-[100] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        type="button"
        className={`absolute inset-0 bg-black/45 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        aria-label="Close cart"
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 flex h-screen min-h-dvh w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping cart"
      >
        <div className="shrink-0 border-b border-black/10 px-5 py-4">
          <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/55">Shopping Bag</p>
            <h2 className="text-xl font-semibold">Your cart</h2>
          </div>
          <button type="button" className="focus-ring rounded p-2 hover:bg-neutral" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <article key={item.product.slug} className="grid grid-cols-[78px_1fr] gap-3 border-b border-black/10 pb-4 last:border-b-0">
                <div className="relative h-[104px] overflow-hidden bg-neutral">
                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="92px" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="line-clamp-2 text-sm font-semibold uppercase leading-5">{item.product.name}</h3>
                      <p className="mt-1 text-xs text-ink/55">Size {item.size} / {item.color}</p>
                    </div>
                    <button
                      type="button"
                      className="focus-ring rounded p-1 text-ink/45 hover:text-primary"
                      aria-label={`Remove ${item.product.name}`}
                      onClick={() => removeFromCart(item.product.slug)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center border border-black/15">
                      <button
                        type="button"
                        className="grid h-7 w-7 place-items-center hover:bg-neutral"
                        aria-label="Decrease quantity"
                        onClick={() => updateQty(item.product.slug, item.qty - 1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="grid h-7 w-8 place-items-center text-sm font-semibold">{item.qty}</span>
                      <button
                        type="button"
                        className="grid h-7 w-7 place-items-center hover:bg-neutral"
                        aria-label="Increase quantity"
                        onClick={() => updateQty(item.product.slug, item.qty + 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="shrink-0 text-sm font-bold">{formatMoney(item.product.price * item.qty)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 border border-black/10 bg-neutral p-3">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide"><Tag size={15} /> Available Coupons</p>
            <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-1">
              {availableCoupons.map((coupon) => (
                <button
                  key={coupon.code}
                  type="button"
                  className="min-w-[170px] snap-start border border-black/15 bg-white p-3 text-left"
                  onClick={() => applyCoupon(coupon.code)}
                >
                  <span className="text-xs font-black text-primary">{coupon.code}</span>
                  <span className="mt-1 block text-[11px] leading-4 text-ink/60">{coupon.title}</span>
                </button>
              ))}
            </div>
            {appliedCoupon ? <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary"><BadgeCheck size={14} /> {appliedCoupon.code} applied</p> : null}
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wide">You may also like</p>
            <div className="mt-3 grid gap-2">
              {upsells.map((product) => (
                <Link key={product.slug} href={`/product/${product.slug}`} className="grid grid-cols-[48px_1fr_auto] items-center gap-3 border border-black/10 p-2" onClick={onClose}>
                  <div className="relative h-16 overflow-hidden bg-neutral">
                    <Image src={product.image} alt={product.name} fill className="object-cover" sizes="58px" />
                  </div>
                  <p className="line-clamp-2 text-xs font-semibold uppercase">{product.name}</p>
                  <span className="text-xs font-bold">{formatMoney(product.price)}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-black/10 bg-white p-4 shadow-[0_-8px_20px_rgba(0,0,0,0.06)]">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <strong>{formatMoney(subtotal)}</strong>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between text-primary">
                <span>Coupon discount</span>
                <strong>-{formatMoney(discount)}</strong>
              </div>
            ) : null}
            <div className="flex justify-between text-ink/60">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-2 font-bold">
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>
          <Link href="/checkout" className="focus-ring mt-4 flex items-center justify-center gap-2 bg-ink px-5 py-3 text-sm font-bold uppercase tracking-wide text-white" onClick={onClose}>
            <ShoppingBag size={18} /> Checkout
          </Link>
          <Link href="/cart" className="focus-ring mt-2 block border border-black/20 px-5 py-2.5 text-center text-sm font-bold uppercase tracking-wide hover:bg-neutral" onClick={onClose}>
            View Bag
          </Link>
        </div>
      </aside>
    </div>
  );
}
