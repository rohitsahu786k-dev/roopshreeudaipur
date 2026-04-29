"use client";

import { createContext, type ReactNode, useContext, useMemo, useState } from "react";
import { cartItems as initialCartItems } from "@/lib/cart";
import { coupons, getCouponDiscount, type Coupon } from "@/lib/coupons";
import { currencies } from "@/lib/currency";
import type { Product } from "@/lib/catalog";

type CartItem = (typeof initialCartItems)[number];

type CommerceContextValue = {
  cartItems: CartItem[];
  currencyCode: string;
  setCurrencyCode: (code: string) => void;
  couponCode: string;
  appliedCoupon: Coupon | null;
  availableCoupons: Coupon[];
  subtotal: number;
  discount: number;
  total: number;
  formatMoney: (value: number) => string;
  addToCart: (product: Product, options?: { qty?: number; size?: string; color?: string }) => void;
  removeFromCart: (slug: string) => void;
  updateQty: (slug: string, qty: number) => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  clearCoupon: () => void;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);

export function CommerceProvider({ children }: { children: ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState("INR");
  const [couponCode, setCouponCode] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const { coupon, discount } = getCouponDiscount(couponCode, subtotal);
  const currency = currencies.find((item) => item.code === currencyCode) ?? currencies[0];
  const total = Math.max(0, subtotal - discount);

  const value = useMemo<CommerceContextValue>(
    () => ({
      cartItems,
      currencyCode,
      setCurrencyCode,
      couponCode,
      appliedCoupon: discount > 0 ? coupon ?? null : null,
      availableCoupons: coupons,
      subtotal,
      discount,
      total,
      formatMoney(value) {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: currency.code,
          maximumFractionDigits: currency.code === "INR" ? 0 : 2
        }).format(value * currency.rate);
      },
      addToCart(product, options) {
        setCartItems((current) => {
          const existing = current.find((item) => item.product.slug === product.slug);
          const qty = options?.qty ?? 1;

          if (existing) {
            return current.map((item) =>
              item.product.slug === product.slug
                ? {
                    ...item,
                    qty: item.qty + qty,
                    size: options?.size ?? item.size,
                    color: options?.color ?? item.color
                  }
                : item
            );
          }

          return [
            ...current,
            {
              product,
              qty,
              size: options?.size ?? product.sizes[0] ?? "Free Size",
              color: options?.color ?? product.colors[0]?.name ?? "Default"
            }
          ];
        });
      },
      removeFromCart(slug) {
        setCartItems((current) => current.filter((item) => item.product.slug !== slug));
      },
      updateQty(slug, qty) {
        setCartItems((current) =>
          current.map((item) => (item.product.slug === slug ? { ...item, qty: Math.max(1, qty) } : item))
        );
      },
      applyCoupon(code) {
        const result = getCouponDiscount(code, subtotal);

        if (!result.coupon) {
          setCouponCode("");
          return { ok: false, message: "Coupon code is not valid." };
        }

        setCouponCode(result.coupon.code);

        if (!result.discount) {
          return {
            ok: false,
            message: `Add ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
              result.coupon.minSpend - subtotal
            )} more to use ${result.coupon.code}.`
          };
        }

        return { ok: true, message: `${result.coupon.code} applied successfully.` };
      },
      clearCoupon() {
        setCouponCode("");
      }
    }),
    [cartItems, coupon, couponCode, currency, currencyCode, discount, subtotal, total]
  );

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const context = useContext(CommerceContext);

  if (!context) {
    throw new Error("useCommerce must be used inside CommerceProvider");
  }

  return context;
}
