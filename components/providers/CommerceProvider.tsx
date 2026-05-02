"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  buildCartItem,
  calculateCartTotals,
  cartItems as initialCartItems,
  mergeCartItems,
  normalizeCartItem,
  type CartItem
} from "@/lib/cart";
import { coupons, getCouponDiscount, type Coupon } from "@/lib/coupons";
import { currencies } from "@/lib/currency";
import { products, type Product } from "@/lib/catalog";

type CommerceContextValue = {
  cartItems: CartItem[];
  cartOpen: boolean;
  cartLoading: boolean;
  cartMessage: string;
  setCartOpen: (open: boolean) => void;
  currencyCode: string;
  setCurrencyCode: (code: string) => void;
  couponCode: string;
  appliedCoupon: Coupon | null;
  availableCoupons: Coupon[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  wishlist: Product[];
  wishlistCount: number;
  wishlistLoading: boolean;
  formatMoney: (value: number) => string;
  user: any | null;
  userLoading: boolean;
  refreshUser: () => Promise<void>;
  addToCart: (product: Product, options?: { qty?: number; size?: string; color?: string }) => void;
  removeFromCart: (variantId: string) => void;
  updateQty: (variantId: string, qty: number) => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  clearCoupon: () => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
  moveWishlistToCart: (slugs: string[], options?: { removeAfterAdd?: boolean }) => void;
  clearWishlist: () => void;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);

export function CommerceProvider({ children }: { children: ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState("INR");
  const [couponCode, setCouponCode] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartMessage, setCartMessage] = useState("");
  const [cartIsServerBacked, setCartIsServerBacked] = useState(false);
  const [cartSessionId, setCartSessionId] = useState("");
  const [wishlistSlugs, setWishlistSlugs] = useState<string[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [wishlistIsServerBacked, setWishlistIsServerBacked] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const mergedGuestWishlist = useRef(false);
  const mergedGuestCart = useRef(false);
  const cartTotals = calculateCartTotals(cartItems, couponCode);
  const subtotal = cartTotals.subtotal;
  const discount = cartTotals.discount;
  const tax = cartTotals.tax;
  const shipping = cartTotals.shipping;
  const total = cartTotals.grandTotal;
  const { coupon } = getCouponDiscount(couponCode, subtotal);
  const currency = currencies.find((item) => item.code === currencyCode) ?? currencies[0];
  const wishlist = useMemo(
    () => wishlistSlugs.map((slug) => products.find((product) => product.slug === slug)).filter(Boolean) as Product[],
    [wishlistSlugs]
  );

  useEffect(() => {
    function ensureCartSessionId() {
      const existing = window.localStorage.getItem("roopshree_cart_session");
      if (existing) return existing;

      const next = `guest_${crypto.randomUUID()}`;
      window.localStorage.setItem("roopshree_cart_session", next);
      return next;
    }

    async function hydrateCommerce() {
      let guestSlugs: string[] = [];
      let guestCartItems: CartItem[] = [];
      let currentUser: any | null = null;
      const sessionId = ensureCartSessionId();
      setCartSessionId(sessionId);

      try {
        const meResponse = await fetch("/api/auth/me", { cache: "no-store" });
        if (meResponse.ok) {
          const userData = await meResponse.json();
          currentUser = userData.user;
          setUser(currentUser);
          setWishlistIsServerBacked(true);
          setCartIsServerBacked(true);
        } else {
          setUser(null);
          setWishlistIsServerBacked(false);
          setCartIsServerBacked(false);
        }
        setUserLoading(false);

        const stored = window.localStorage.getItem("roopshree_wishlist");
        if (stored) {
          const parsed = JSON.parse(stored) as Array<string | { productId?: string; slug?: string; product_id?: string }>;
          guestSlugs = parsed
            .map((item) => (typeof item === "string" ? item : item.productId ?? item.slug ?? item.product_id ?? ""))
            .filter(Boolean);
          setWishlistSlugs(guestSlugs);
        }

        const storedCart = window.localStorage.getItem("roopshree_cart");
        if (storedCart) {
          guestCartItems = (JSON.parse(storedCart) as CartItem[]).map(normalizeCartItem);
          setCartItems(guestCartItems);
        }

        if (currentUser && guestSlugs.length && !mergedGuestWishlist.current) {
          mergedGuestWishlist.current = true;
          await fetch("/api/wishlist/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: guestSlugs.map((productId) => ({ productId })) })
          });
          window.localStorage.removeItem("roopshree_wishlist");
        }

        if (currentUser && guestCartItems.length && !mergedGuestCart.current) {
          mergedGuestCart.current = true;
          await fetch("/api/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-cart-session-id": sessionId },
            body: JSON.stringify({ sessionId, items: guestCartItems })
          });
          window.localStorage.removeItem("roopshree_cart");
        }

        const wishlistResponse = await fetch("/api/wishlist", { cache: "no-store" });
        if (wishlistResponse.ok) {
          const data = (await wishlistResponse.json()) as { items?: Array<{ product_id: string; slug?: string }> };
          setWishlistSlugs((data.items ?? []).map((item) => item.slug ?? item.product_id));
        }

        const cartResponse = await fetch("/api/cart", {
          cache: "no-store",
          headers: { "x-cart-session-id": sessionId }
        });
        if (cartResponse.ok) {
          const data = (await cartResponse.json()) as { cart?: { items?: CartItem[]; coupon_code?: string } };
          setCartItems((data.cart?.items ?? []).map(normalizeCartItem));
          setCouponCode(data.cart?.coupon_code ?? "");
        }
      } finally {
        setWishlistLoading(false);
        setCartLoading(false);
      }
    }

    void hydrateCommerce();
  }, []);

  useEffect(() => {
    if (!cartLoading && !cartIsServerBacked) {
      window.localStorage.setItem("roopshree_cart", JSON.stringify(cartItems));
    }
  }, [cartIsServerBacked, cartItems, cartLoading]);

  useEffect(() => {
    if (!wishlistLoading && !wishlistIsServerBacked) {
      window.localStorage.setItem(
        "roopshree_wishlist",
        JSON.stringify(wishlistSlugs.map((productId) => ({ productId, addedAt: new Date().toISOString() })))
      );
    }
  }, [wishlistIsServerBacked, wishlistLoading, wishlistSlugs]);

  async function syncWishlistAdd(product: Product) {
    if (!wishlistIsServerBacked) return;

    await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.slug })
    });
  }

  async function syncWishlistRemove(slug: string) {
    if (!wishlistIsServerBacked) return;

    await fetch(`/api/wishlist?productId=${encodeURIComponent(slug)}`, {
      method: "DELETE"
    });
  }

  function headers() {
    return {
      "Content-Type": "application/json",
      "x-cart-session-id": cartSessionId
    };
  }

  function applyServerCart(data: { cart?: { items?: CartItem[]; coupon_code?: string }; message?: string }) {
    if (data.cart?.items) setCartItems(data.cart.items.map(normalizeCartItem));
    if (typeof data.cart?.coupon_code === "string") setCouponCode(data.cart.coupon_code);
    if (data.message) setCartMessage(data.message);
  }

  function addProductToCart(product: Product, options?: { qty?: number; size?: string; color?: string }) {
    const nextItem = buildCartItem(product, options);
    if (nextItem.available_stock <= 0) {
      setCartMessage(`${product.name} is out of stock.`);
      setCartOpen(true);
      return;
    }

    setCartItems((current) => {
      const next = mergeCartItems(current, nextItem);
      const changed = next.find((item) => item.variant_id === nextItem.variant_id);
      if (changed?.message) setCartMessage(changed.message);
      return next;
    });

    setCartOpen(true);

    if (cartIsServerBacked || cartSessionId) {
      void fetch("/api/cart", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          sessionId: cartSessionId,
          productId: product.slug,
          quantity: options?.qty ?? 1,
          size: nextItem.size,
          color: nextItem.color,
          variantId: nextItem.variant_id
        })
      })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error ?? "Unable to add to cart");
          applyServerCart(data);
        })
        .catch((error) => setCartMessage(error instanceof Error ? error.message : "Unable to sync cart"));
    }
  }

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  const value = useMemo<CommerceContextValue>(
    () => ({
      cartItems,
      cartOpen,
      cartLoading,
      cartMessage,
      setCartOpen,
      currencyCode,
      setCurrencyCode,
      couponCode,
      appliedCoupon: couponCode
        ? coupon ?? {
            code: couponCode,
            title: couponCode,
            description: "Applied coupon",
            discountType: "fixed",
            value: discount,
            minSpend: 0,
            badge: "Applied"
          }
        : null,
      availableCoupons: coupons,
      subtotal,
      discount,
      tax,
      shipping,
      total,
      wishlist,
      wishlistCount: wishlistSlugs.length,
      wishlistLoading,
      user,
      userLoading,
      refreshUser,
      formatMoney(value) {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: currency.code,
          maximumFractionDigits: currency.code === "INR" ? 0 : 2
        }).format(value * currency.rate);
      },
      addToCart(product, options) {
        addProductToCart(product, options);
      },
      removeFromCart(variantId) {
        setCartItems((current) => current.filter((item) => item.variant_id !== variantId && item.product_id !== variantId));
        if (cartIsServerBacked || cartSessionId) {
          void fetch(`/api/cart/remove?variantId=${encodeURIComponent(variantId)}`, {
            method: "DELETE",
            headers: { "x-cart-session-id": cartSessionId }
          })
            .then(async (response) => {
              const data = await response.json();
              if (response.ok) applyServerCart(data);
            })
            .catch(() => undefined);
        }
      },
      updateQty(variantId, qty) {
        setCartItems((current) =>
          current.map((item) =>
            item.variant_id === variantId || item.product_id === variantId
              ? normalizeCartItem({ ...item, quantity: Math.min(Math.max(1, qty), item.available_stock) })
              : item
          )
        );
        if (cartIsServerBacked || cartSessionId) {
          void fetch("/api/cart/update", {
            method: "PATCH",
            headers: headers(),
            body: JSON.stringify({ sessionId: cartSessionId, variantId, quantity: qty })
          })
            .then(async (response) => {
              const data = await response.json();
              if (response.ok) applyServerCart(data);
              else setCartMessage(data.error ?? "Unable to update cart");
            })
            .catch(() => setCartMessage("Unable to sync cart"));
        }
      },
      applyCoupon(code) {
        const normalizedCode = code.trim().toUpperCase();

        if (!normalizedCode) {
          setCouponCode("");
          return { ok: false, message: "Enter a coupon code." };
        }

        setCouponCode(normalizedCode);
        setCartMessage("Validating coupon...");

        if (cartIsServerBacked || cartSessionId) {
          void fetch("/api/coupons/apply", {
            method: "POST",
            headers: headers(),
            body: JSON.stringify({ sessionId: cartSessionId, code: normalizedCode })
          })
            .then(async (response) => {
              const data = await response.json();
              if (response.ok) {
                applyServerCart(data);
                setCartMessage(data.message ?? `${normalizedCode} applied successfully.`);
              } else {
                setCouponCode("");
                applyServerCart(data);
                setCartMessage(data.error ?? "Coupon is not applicable.");
              }
            })
            .catch(() => {
              setCouponCode("");
              setCartMessage("Unable to validate coupon.");
            });
        }

        return { ok: true, message: "Validating coupon..." };
      },
      clearCoupon() {
        setCouponCode("");
        if (cartIsServerBacked || cartSessionId) {
          void fetch("/api/cart/coupon", {
            method: "DELETE",
            headers: { "x-cart-session-id": cartSessionId }
          })
            .then(async (response) => {
              const data = await response.json();
              if (response.ok) applyServerCart(data);
            })
            .catch(() => undefined);
        }
      },
      clearCart() {
        setCartItems([]);
        setCouponCode("");
        if (cartIsServerBacked || cartSessionId) {
          void fetch("/api/cart", {
            method: "DELETE",
            headers: { "x-cart-session-id": cartSessionId }
          })
            .then(async (response) => {
              const data = await response.json();
              if (response.ok) applyServerCart(data);
            })
            .catch(() => undefined);
        }
      },
      toggleWishlist(product) {
        const shouldRemove = wishlistSlugs.includes(product.slug);
        setWishlistSlugs((current) =>
          current.includes(product.slug) ? current.filter((slug) => slug !== product.slug) : [...current, product.slug]
        );

        void (shouldRemove ? syncWishlistRemove(product.slug) : syncWishlistAdd(product)).catch(() => {
          setWishlistSlugs((current) =>
            shouldRemove ? [...current, product.slug] : current.filter((slug) => slug !== product.slug)
          );
        });
      },
      removeFromWishlist(slug) {
        setWishlistSlugs((current) => current.filter((item) => item !== slug));
        void syncWishlistRemove(slug).catch(() => {
          setWishlistSlugs((current) => (current.includes(slug) ? current : [...current, slug]));
        });
      },
      isWishlisted(slug) {
        return wishlistSlugs.includes(slug);
      },
      moveWishlistToCart(slugs, options) {
        const uniqueSlugs = Array.from(new Set(slugs));
        uniqueSlugs.forEach((slug) => {
          const product = products.find((item) => item.slug === slug);
          if (product) {
            addProductToCart(product);
          }
        });

        if (wishlistIsServerBacked) {
          void fetch("/api/wishlist/move-to-cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productIds: uniqueSlugs, removeAfterAdd: Boolean(options?.removeAfterAdd) })
          }).catch(() => undefined);
        }

        if (options?.removeAfterAdd) {
          setWishlistSlugs((current) => current.filter((slug) => !uniqueSlugs.includes(slug)));
        }
      },
      clearWishlist() {
        setWishlistSlugs([]);
        if (wishlistIsServerBacked) {
          void fetch("/api/wishlist/clear", { method: "DELETE" }).catch(() => undefined);
        }
      }
    }),
    [
      cartItems,
      coupon,
      couponCode,
      currency,
      currencyCode,
      discount,
      tax,
      shipping,
      subtotal,
      total,
      cartOpen,
      cartIsServerBacked,
      cartLoading,
      cartMessage,
      cartSessionId,
      wishlist,
      wishlistIsServerBacked,
      wishlistLoading,
      wishlistSlugs,
      user,
      userLoading
    ]
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
