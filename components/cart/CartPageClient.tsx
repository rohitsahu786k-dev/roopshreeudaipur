"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Minus, Plus, ShieldCheck, ShoppingBag, Tag, Trash2, Truck } from "lucide-react";
import { useState } from "react";
import { products } from "@/lib/catalog";
import { useCommerce } from "@/components/providers/CommerceProvider";
import { coupons } from "@/lib/coupons";
import { ProductCard } from "@/components/ProductCard";

export function CartPageClient() {
  const { cartItems, subtotal, discount, total, formatMoney, applyCoupon, appliedCoupon, removeFromCart, updateQty } = useCommerce();
  const [couponInput, setCouponInput] = useState("");
  const [message, setMessage] = useState("");
  const shippingThreshold = 2999;
  const remaining = Math.max(0, shippingThreshold - subtotal);
  const crossSells = products.slice(2, 6);

  function applyCode(code: string) {
    const result = applyCoupon(code);
    setMessage(result.message);
    if (result.ok) setCouponInput(code);
  }

  function submitCoupon(formData: FormData) {
    const code = String(formData.get("coupon") ?? couponInput);
    applyCode(code);
  }

  return (
    <section className="bg-[#f8f8f8]">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-black/10 pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/55">Shopping Bag</p>
            <h1 className="mt-2 text-4xl font-semibold uppercase tracking-wide">Your Cart</h1>
            <p className="mt-2 text-sm text-ink/60">{cartItems.length} items reserved for checkout.</p>
          </div>
          <Link href="/shop" className="focus-ring border border-black/20 bg-white px-5 py-3 text-sm font-bold uppercase tracking-wide hover:bg-neutral">
            Continue Shopping
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {remaining > 0 ? (
              <div className="border border-black/10 bg-white p-4 text-sm font-semibold">
                Add {formatMoney(remaining)} more to unlock free shipping in India.
                <div className="mt-3 h-2 overflow-hidden bg-neutral">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, (subtotal / shippingThreshold) * 100)}%` }} />
                </div>
              </div>
            ) : (
              <div className="border border-black/10 bg-white p-4 text-sm font-semibold text-primary">Free shipping unlocked for this order.</div>
            )}

            {cartItems.map((item) => (
              <article key={item.product.slug} className="grid gap-4 border border-black/10 bg-white p-4 sm:grid-cols-[132px_1fr_auto]">
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral">
                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="132px" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold uppercase tracking-wide">{item.product.name}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-ink/60">{item.product.shortDescription}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-ink/60">
                    <span className="border border-black/10 px-3 py-2">Size {item.size}</span>
                    <span className="border border-black/10 px-3 py-2">{item.color}</span>
                    <span className="border border-black/10 px-3 py-2">{item.product.category.replace("-", " ")}</span>
                  </div>
                  <div className="mt-5 flex items-center gap-4">
                    <div className="flex items-center border border-black/15">
                      <button type="button" className="grid h-9 w-9 place-items-center hover:bg-neutral" aria-label="Decrease quantity" onClick={() => updateQty(item.product.slug, item.qty - 1)}>
                        <Minus size={14} />
                      </button>
                      <span className="grid h-9 w-10 place-items-center text-sm font-semibold">{item.qty}</span>
                      <button type="button" className="grid h-9 w-9 place-items-center hover:bg-neutral" aria-label="Increase quantity" onClick={() => updateQty(item.product.slug, item.qty + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <button type="button" className="focus-ring flex items-center gap-2 text-sm font-semibold text-ink/55 hover:text-primary" onClick={() => removeFromCart(item.product.slug)}>
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-bold text-primary">{formatMoney(item.product.price * item.qty)}</p>
                  <p className="mt-1 text-xs text-ink/45 line-through">{formatMoney(item.product.comparePrice * item.qty)}</p>
                </div>
              </article>
            ))}

            <section className="border border-black/10 bg-white p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide"><Tag size={17} /> Apply Coupon</h2>
              <form action={submitCoupon} className="mt-4 flex gap-2">
                <input
                  name="coupon"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="focus-ring min-w-0 flex-1 border border-black/15 px-3 py-3 text-sm font-semibold uppercase"
                />
                <button type="submit" className="focus-ring bg-ink px-5 py-3 text-sm font-bold uppercase text-white">Apply</button>
              </form>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {coupons.map((coupon) => (
                  <button key={coupon.code} type="button" onClick={() => applyCode(coupon.code)} className="border border-black/10 p-3 text-left hover:border-primary">
                    <span className="text-xs font-black text-primary">{coupon.code}</span>
                    <span className="mt-1 block text-xs text-ink/60">{coupon.description}</span>
                  </button>
                ))}
              </div>
              {message ? <p className={`mt-3 text-sm font-semibold ${appliedCoupon ? "text-primary" : "text-red-700"}`}>{message}</p> : null}
            </section>
          </div>

          <aside className="h-fit border border-black/10 bg-white">
            <div className="border-b border-black/10 p-5">
              <h2 className="text-lg font-semibold uppercase tracking-wide">Order Summary</h2>
            </div>
            <div className="space-y-4 p-5 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
              {discount > 0 ? <div className="flex justify-between text-primary"><span>Coupon discount</span><strong>-{formatMoney(discount)}</strong></div> : null}
              <div className="flex justify-between"><span>Estimated shipping</span><span>{remaining > 0 ? "At checkout" : "Free"}</span></div>
              <div className="flex justify-between"><span>Taxes</span><span>Calculated at checkout</span></div>
              <div className="border-t border-black/10 pt-4">
                <div className="flex justify-between text-base"><span className="font-semibold">Total</span><strong>{formatMoney(total)}</strong></div>
              </div>
              <Link href="/checkout" className="focus-ring flex items-center justify-center gap-2 bg-ink px-5 py-3 font-bold uppercase tracking-wide text-white">
                <ShoppingBag size={18} /> Proceed To Checkout
              </Link>
              <div className="grid gap-3 pt-2 text-xs leading-5 text-ink/60">
                <p className="flex gap-2"><ShieldCheck size={16} className="mt-0.5 text-primary" /> Secure checkout with Razorpay, PayPal, and GoKwik.</p>
                <p className="flex gap-2"><Truck size={16} className="mt-0.5 text-primary" /> Shiprocket tracking after dispatch.</p>
                {appliedCoupon ? <p className="flex gap-2 text-primary"><BadgeCheck size={16} className="mt-0.5" /> {appliedCoupon.code} coupon applied.</p> : null}
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-12">
          <h2 className="text-lg font-semibold uppercase tracking-wide">Frequently bought together</h2>
          <div className="mt-5 grid grid-cols-2 gap-6 md:grid-cols-4">
            {crossSells.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
