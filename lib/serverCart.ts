import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { calculateCartTotals, type CartItem, type StockStatus } from "@/lib/cart";
import { validateCouponForCart } from "@/lib/couponEngine";
import { products, type Product } from "@/lib/catalog";
import { Cart, CartEvent } from "@/models/Cart";
import { Product as ProductModel } from "@/models/Product";

export type CartOwner = {
  userId?: string;
  sessionId?: string;
};

type ProductSnapshot = {
  product_id: string;
  variant_id: string;
  product?: Product;
  name: string;
  image: string;
  price: number;
  discount_price: number;
  stock_status: StockStatus;
  available_stock: number;
  size: string;
  color: string;
};

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

export function assertRateLimit(request: NextRequest, bucketName: string, limit = 80, windowMs = 60_000) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = `${bucketName}:${ip}`;
  const now = Date.now();
  const current = rateLimitBuckets.get(key);

  if (!current || current.resetAt < now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  current.count += 1;
  if (current.count > limit) {
    throw new Error("Too many cart requests. Please try again shortly.");
  }
}

export function getSessionId(request: NextRequest, bodySessionId?: string) {
  return (
    bodySessionId ??
    request.headers.get("x-cart-session-id") ??
    request.cookies.get("roopshree_cart_session")?.value ??
    undefined
  );
}

export async function getOrCreateCart(owner: CartOwner) {
  if (!owner.userId && !owner.sessionId) {
    throw new Error("A user or session cart identifier is required");
  }

  const query = owner.userId ? { user: owner.userId } : { sessionId: owner.sessionId };
  const existing = await Cart.findOne(query);
  if (existing) return existing;

  const cart = await Cart.create({
    user: owner.userId,
    sessionId: owner.sessionId,
    items: [],
    totals: calculateCartTotals([])
  });
  await logCartEvent(owner, String(cart._id), "created", 0);
  return cart;
}

function staticProductSnapshot(productId: string, size?: string, color?: string): ProductSnapshot | null {
  const product = products.find((item) => item.slug === productId);
  if (!product) return null;

  const selectedSize = size ?? product.sizes[0] ?? "Free Size";
  const selectedColor = color ?? product.colors[0]?.name ?? "Default";
  const variantId = `${product.slug}:${selectedSize}:${selectedColor}`;

  return {
    product_id: product.slug,
    variant_id: variantId,
    product,
    name: product.name,
    image: product.image,
    price: product.comparePrice,
    discount_price: product.price,
    stock_status: "in_stock",
    available_stock: 99,
    size: selectedSize,
    color: selectedColor
  };
}

async function databaseProductSnapshot(productId: string, size?: string, color?: string, variantId?: string): Promise<ProductSnapshot | null> {
  const productQuery = mongoose.Types.ObjectId.isValid(productId) ? { $or: [{ _id: productId }, { slug: productId }] } : { slug: productId };
  const product = await ProductModel.findOne(productQuery).lean();
  if (!product) return null;

  const variant = product.variants?.find((item) => String(item._id) === variantId || item.option1 === size || item.option2 === color);
  const selectedSize = size ?? variant?.option1 ?? product.options?.[0]?.values?.[0] ?? "Free Size";
  const selectedColor = color ?? variant?.option2 ?? product.options?.[1]?.values?.[0] ?? "Default";
  const resolvedVariantId = variant ? String(variant._id) : `${product.slug}:${selectedSize}:${selectedColor}`;
  const stock = product.hasVariants ? variant?.stock ?? 0 : product.stock ?? 0;
  const threshold = product.lowStockThreshold ?? 5;
  const stockStatus: StockStatus = stock <= 0 ? "out_of_stock" : stock <= threshold ? "low_stock" : "in_stock";

  return {
    product_id: String(product._id),
    variant_id: resolvedVariantId,
    name: product.name,
    image: variant?.image ?? product.media?.find((item) => item.type === "image")?.url ?? product.images?.[0] ?? "/placeholder-product.jpg",
    price: variant?.comparePrice ?? product.comparePrice ?? product.basePrice,
    discount_price: variant?.price ?? product.basePrice,
    stock_status: stockStatus,
    available_stock: stock,
    size: selectedSize,
    color: selectedColor
  };
}

export async function resolveCartProduct(input: { productId: string; variantId?: string; size?: string; color?: string }) {
  return (
    (await databaseProductSnapshot(input.productId, input.size, input.color, input.variantId)) ??
    staticProductSnapshot(input.productId, input.size, input.color)
  );
}

export function serializeCartItem(item: {
  productId: string;
  variantId: string;
  name: string;
  image?: string | null;
  price: number;
  discountPrice: number;
  quantity: number;
  subtotal: number;
  stockStatus?: StockStatus;
  availableStock?: number;
  size?: string | null;
  color?: string | null;
}): CartItem {
  const product = products.find((entry) => entry.slug === item.productId) ?? {
    name: item.name,
    slug: item.productId,
    category: "saree",
    shortDescription: "",
    description: "",
    image: item.image ?? "/placeholder-product.jpg",
    gallery: [item.image ?? "/placeholder-product.jpg"],
    price: item.discountPrice,
    comparePrice: item.price,
    rating: 0,
    reviewCount: 0,
    fabric: "",
    occasion: [],
    workType: "",
    washCare: "",
    colors: item.color ? [{ name: item.color, hex: "#cccccc" }] : [],
    sizes: item.size ? [item.size] : []
  };

  return {
    key: item.variantId,
    product_id: item.productId,
    variant_id: item.variantId,
    product,
    name: item.name,
    image: item.image ?? product.image,
    price: item.price,
    discount_price: item.discountPrice,
    quantity: item.quantity,
    subtotal: item.subtotal,
    stock_status: item.stockStatus ?? "in_stock",
    available_stock: item.availableStock ?? 0,
    size: item.size ?? "Free Size",
    color: item.color ?? "Default"
  };
}

export function serializeCart(cart: Awaited<ReturnType<typeof getOrCreateCart>>) {
  const items = cart.items.map((item) => serializeCartItem(item));
  const totals = cart.totals ?? calculateCartTotals(items, "");

  return {
    cart: {
      id: String(cart._id),
      user_id: cart.user ? String(cart.user) : null,
      session_id: cart.sessionId ?? null,
      coupon_code: cart.couponCode ?? "",
      items,
      totals: {
        subtotal: totals.subtotal ?? 0,
        discount: totals.discount ?? 0,
        tax: totals.tax ?? 0,
        shipping: totals.shipping ?? 0,
        grand_total: totals.grandTotal ?? 0
      },
      updated_at: cart.updatedAt
    }
  };
}

export async function recalculateAndSaveCart(cart: Awaited<ReturnType<typeof getOrCreateCart>>) {
  const items = cart.items.map((item) => serializeCartItem(item));
  let totals = calculateCartTotals(items, "");
  let couponCode = cart.couponCode ?? "";

  if (couponCode) {
    const couponResult = await validateCouponForCart({
      code: couponCode,
      items,
      owner: {
        userId: cart.user ? String(cart.user) : undefined,
        sessionId: cart.sessionId ?? undefined
      },
      recordAttempt: false
    });

    if (couponResult.valid) {
      const discountedSubtotal = Math.max(0, totals.subtotal - couponResult.discount);
      totals = {
        subtotal: totals.subtotal,
        discount: couponResult.discount,
        tax: Math.round(discountedSubtotal * 0.05),
        shipping: couponResult.freeShipping || totals.subtotal >= 2999 || totals.subtotal === 0 ? 0 : 99,
        grandTotal: discountedSubtotal + Math.round(discountedSubtotal * 0.05) + (couponResult.freeShipping || totals.subtotal >= 2999 || totals.subtotal === 0 ? 0 : 99),
        coupon: undefined
      };
      couponCode = couponResult.code;
    } else {
      couponCode = "";
    }
  }

  cart.set(
    "items",
    items.map((item) => ({
      productId: item.product_id,
      variantId: item.variant_id,
      name: item.name,
      image: item.image,
      price: item.price,
      discountPrice: item.discount_price,
      quantity: item.quantity,
      subtotal: item.discount_price * item.quantity,
      stockStatus: item.stock_status,
      availableStock: item.available_stock,
      size: item.size,
      color: item.color
    }))
  );
  cart.couponCode = couponCode || undefined;
  cart.set("totals", {
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    shipping: totals.shipping,
    grandTotal: totals.grandTotal
  });

  await cart.save();
  return cart;
}

export async function logCartEvent(owner: CartOwner, cartId: string, type: string, value = 0, metadata?: Record<string, string>) {
  await CartEvent.create({
    user: owner.userId,
    sessionId: owner.sessionId,
    cart: cartId,
    type,
    value,
    metadata: metadata ? new Map(Object.entries(metadata)) : undefined
  });
}
