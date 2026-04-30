import { getCouponDiscount, type Coupon } from "@/lib/coupons";
import type { Product } from "@/lib/catalog";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "unavailable";

export type CartItem = {
  key: string;
  product_id: string;
  variant_id: string;
  product: Product;
  name: string;
  image: string;
  price: number;
  discount_price: number;
  quantity: number;
  subtotal: number;
  stock_status: StockStatus;
  available_stock: number;
  size: string;
  color: string;
  message?: string;
};

export type CartTotals = {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  grandTotal: number;
};

export const defaultShippingThreshold = 2999;
export const defaultShippingCharge = 99;
export const defaultTaxRate = 0.05;

export const cartItems: CartItem[] = [];

export function getVariantId(product: Product, options?: { size?: string; color?: string }) {
  const size = options?.size ?? product.sizes[0] ?? "Free Size";
  const color = options?.color ?? product.colors[0]?.name ?? "Default";
  return `${product.slug}:${size}:${color}`;
}

export function getAvailableStock(_product: Product, _options?: { size?: string; color?: string }) {
  return 99;
}

export function buildCartItem(product: Product, options?: { qty?: number; size?: string; color?: string }): CartItem {
  const quantity = Math.max(1, options?.qty ?? 1);
  const size = options?.size ?? product.sizes[0] ?? "Free Size";
  const color = options?.color ?? product.colors[0]?.name ?? "Default";
  const availableStock = getAvailableStock(product, { size, color });
  const stockStatus: StockStatus = availableStock <= 0 ? "out_of_stock" : availableStock <= 5 ? "low_stock" : "in_stock";

  return {
    key: getVariantId(product, { size, color }),
    product_id: product.slug,
    variant_id: getVariantId(product, { size, color }),
    product,
    name: product.name,
    image: product.image,
    price: product.comparePrice,
    discount_price: product.price,
    quantity: Math.min(quantity, availableStock),
    subtotal: product.price * Math.min(quantity, availableStock),
    stock_status: stockStatus,
    available_stock: availableStock,
    size,
    color,
    message: quantity > availableStock ? `Only ${availableStock} available.` : undefined
  };
}

export function normalizeCartItem(item: CartItem): CartItem {
  const quantity = Math.max(1, Math.min(item.quantity, item.available_stock));
  return {
    ...item,
    quantity,
    subtotal: item.discount_price * quantity,
    stock_status: item.available_stock <= 0 ? "out_of_stock" : item.available_stock <= 5 ? "low_stock" : "in_stock"
  };
}

export function calculateCartTotals(items: CartItem[], couponCode = ""): CartTotals & { coupon: Coupon | undefined } {
  const subtotal = items.reduce((sum, item) => sum + item.discount_price * item.quantity, 0);
  const { coupon, discount } = getCouponDiscount(couponCode, subtotal);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = Math.round(discountedSubtotal * defaultTaxRate);
  const shipping = subtotal === 0 || subtotal >= defaultShippingThreshold || coupon?.discountType === "free_shipping" ? 0 : defaultShippingCharge;

  return {
    subtotal,
    discount,
    tax,
    shipping,
    grandTotal: discountedSubtotal + tax + shipping,
    coupon
  };
}

export function mergeCartItems(items: CartItem[], nextItem: CartItem): CartItem[] {
  const existing = items.find((item) => item.variant_id === nextItem.variant_id);

  if (!existing) return [...items, normalizeCartItem(nextItem)];

  return items.map((item) =>
    item.variant_id === nextItem.variant_id
      ? normalizeCartItem({
          ...item,
          quantity: Math.min(item.quantity + nextItem.quantity, item.available_stock),
          message:
            item.quantity + nextItem.quantity > item.available_stock ? `Only ${item.available_stock} available.` : undefined
        })
      : item
  );
}
