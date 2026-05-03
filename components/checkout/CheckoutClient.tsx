"use client";

import Image from "next/image";
import { BadgeCheck, CreditCard, LocateFixed, LockKeyhole, MapPin, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import { GoKwikCheckout } from "@/components/GoKwikCheckout";
import { useCommerce } from "@/components/providers/CommerceProvider";

const countries = ["India", "United States", "United Kingdom", "United Arab Emirates", "Canada", "Australia", "Singapore"];

export function CheckoutClient() {
  const { cartItems, subtotal, discount, total, formatMoney, applyCoupon, clearCoupon, appliedCoupon } = useCommerce();
  const [country, setCountry] = useState("India");
  const [pincode, setPincode] = useState("");
  const [delivery, setDelivery] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  function checkDelivery() {
    if (!/^\d{5,6}$/.test(pincode)) {
      setDelivery("Enter a valid postal or pincode.");
      return;
    }
    setDelivery(country === "India" ? "Estimated delivery in 3-7 business days." : "Estimated international delivery in 8-14 business days.");
  }

  function fetchLocation() {
    if (!navigator.geolocation) {
      setDelivery("Location is not supported on this browser.");
      return;
    }

    setDelivery("Fetching location...");
    navigator.geolocation.getCurrentPosition(
      () => {
        setCountry("India");
        setPincode("313001");
        setDelivery("Location detected. Estimated delivery in 3-5 business days.");
      },
      () => setDelivery("Allow location permission or enter pincode manually.")
    );
  }

  function submitCoupon(formData: FormData) {
    const code = String(formData.get("coupon") ?? couponInput);
    const result = applyCoupon(code);
    setCouponMessage(result.message);
    if (result.ok) setCouponInput(code.toUpperCase());
  }

  return (
    <section className="bg-[#f8f8f8]">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:py-10">
        <div className="mb-8 border-b border-black/10 pb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Secure Checkout</p>
          <h1 className="mt-2 text-3xl font-semibold uppercase tracking-wide sm:text-4xl">Complete Your Order</h1>
          <p className="mt-2 text-sm text-ink/60">Professional checkout with billing, shipping, payment, and delivery checks.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <form className="grid gap-6">
            <section className="border border-black/10 bg-white p-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold uppercase tracking-wide"><MapPin size={20} /> Shipping Details</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  ["name", "Full name", "text", "name"],
                  ["email", "Email", "email", "email"],
                  ["phone", "Phone", "tel", "tel"],
                  ["city", "City", "text", "address-level2"]
                ].map(([id, label, type, autoComplete]) => (
                  <label key={id} className="grid gap-2 text-xs font-bold uppercase tracking-wide text-ink/65" htmlFor={id}>
                    {label}
                    <input id={id} type={type} autoComplete={autoComplete} className="focus-ring border border-black/15 px-3 py-3 text-sm font-medium normal-case tracking-normal" required />
                  </label>
                ))}
                <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-ink/65" htmlFor="country">
                  Country
                  <select id="country" value={country} onChange={(event) => setCountry(event.target.value)} className="focus-ring border border-black/15 px-3 py-3 text-sm font-medium normal-case tracking-normal">
                    {countries.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-ink/65" htmlFor="pincode">
                  Pincode / Postal Code
                  <input id="pincode" value={pincode} onChange={(event) => setPincode(event.target.value)} className="focus-ring border border-black/15 px-3 py-3 text-sm font-medium normal-case tracking-normal" required />
                </label>
              </div>
              <label className="mt-4 grid gap-2 text-xs font-bold uppercase tracking-wide text-ink/65" htmlFor="address">
                Complete Address
                <textarea id="address" className="focus-ring min-h-28 border border-black/15 px-3 py-3 text-sm font-medium normal-case tracking-normal" required />
              </label>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={checkDelivery} className="focus-ring bg-ink px-4 py-2 text-xs font-bold uppercase text-white">Check Delivery</button>
                <button type="button" onClick={fetchLocation} className="focus-ring flex items-center gap-2 border border-black/15 px-4 py-2 text-xs font-bold uppercase">
                  <LocateFixed size={15} /> Fetch Location
                </button>
              </div>
              {delivery ? <p className="mt-3 text-sm font-semibold text-primary">{delivery}</p> : null}
            </section>

            <section className="border border-black/10 bg-white p-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold uppercase tracking-wide"><CreditCard size={20} /> Payment Method</h2>
              <div className="mt-5 grid gap-3">
                {["Razorpay", "PayPal", "GoKwik COD", "GoKwik prepaid"].map((method) => (
                  <label key={method} className="flex items-center gap-3 border border-black/10 px-4 py-3 text-sm font-semibold">
                    <input type="radio" name="payment" defaultChecked={method === "GoKwik prepaid"} className="accent-primary" />
                    {method}
                  </label>
                ))}
              </div>
              <label className="mt-5 flex items-start gap-3 text-sm text-ink/65">
                <input type="checkbox" required className="mt-1 accent-primary" /> I agree to the terms, refund policy, and shipping policy.
              </label>
            </section>
          </form>

          <aside className="h-fit border border-black/10 bg-white">
            <div className="border-b border-black/10 p-5">
              <h2 className="text-lg font-semibold uppercase tracking-wide">Order Summary</h2>
            </div>
            <div className="space-y-4 p-5">
              {cartItems.map((item) => (
                <div key={item.variant_id} className="grid grid-cols-[64px_1fr_auto] gap-3">
                  <div className="relative aspect-[3/4] overflow-hidden bg-neutral">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div>
                    <p className="line-clamp-2 text-xs font-bold uppercase">{item.name}</p>
                    <p className="mt-1 text-xs text-ink/55">Qty {item.quantity} / {item.size}</p>
                  </div>
                  <p className="text-sm font-bold">{formatMoney(item.subtotal)}</p>
                </div>
              ))}
              <form onSubmit={(e) => { e.preventDefault(); submitCoupon(new FormData(e.currentTarget)); }} className="flex flex-col gap-2 border-t border-black/10 pt-4 sm:flex-row">
                <input
                  name="coupon"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="focus-ring min-w-0 flex-1 border border-black/15 px-3 py-3 text-sm font-semibold uppercase"
                />
                <button type="submit" className="focus-ring bg-ink px-4 py-3 text-xs font-bold uppercase text-white">Apply</button>
              </form>
              {couponMessage ? <p className="text-sm font-semibold text-primary">{couponMessage}</p> : null}
              <div className="space-y-3 border-t border-black/10 pt-4 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
                {discount > 0 ? <div className="flex justify-between text-primary"><span>Coupon discount</span><strong>-{formatMoney(discount)}</strong></div> : null}
                <div className="flex justify-between"><span>Shipping</span><span>Calculated after address</span></div>
                <div className="flex justify-between text-base"><span className="font-bold">Total</span><strong>{formatMoney(total)}</strong></div>
              </div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-primary">
                  <p className="flex items-center gap-2"><BadgeCheck size={16} /> {appliedCoupon.code} applied.</p>
                  <button type="button" onClick={clearCoupon} className="text-xs font-bold uppercase text-ink/60 hover:text-primary">Remove</button>
                </div>
              ) : null}
              <GoKwikCheckout amount={formatMoney(total)} />
              <div className="grid gap-2 text-xs leading-5 text-ink/60">
                <p className="flex gap-2"><LockKeyhole size={15} className="mt-0.5 text-primary" /> 100% encrypted checkout.</p>
                <p className="flex gap-2"><ShieldCheck size={15} className="mt-0.5 text-primary" /> Quality checked before dispatch.</p>
                <p className="flex gap-2"><Truck size={15} className="mt-0.5 text-primary" /> Tracked domestic and international shipping.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
