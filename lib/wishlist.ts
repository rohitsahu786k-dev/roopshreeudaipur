import crypto from "crypto";
import mongoose from "mongoose";
import slugify from "slugify";
import { products } from "@/lib/catalog";
import { Product } from "@/models/Product";
import { Wishlist, WishlistEvent, WishlistItem } from "@/models/Wishlist";

type WishlistSort = "manual" | "date_desc" | "date_asc" | "price_asc" | "price_desc";

type WishlistFilters = {
  sort?: WishlistSort;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
};

type ProductSnapshot = {
  product_id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  discount: number;
  stock_status: "in_stock" | "out_of_stock" | "low_stock";
  product: unknown;
};

function isObjectId(value: string) {
  return mongoose.Types.ObjectId.isValid(value);
}

function staticProductSnapshot(productId: string): ProductSnapshot | null {
  const product = products.find((item) => item.slug === productId);
  if (!product) return null;

  return {
    product_id: product.slug,
    slug: product.slug,
    name: product.name,
    image: product.image,
    price: product.price,
    discount: Math.max(0, product.comparePrice - product.price),
    stock_status: "in_stock",
    product
  };
}

async function databaseProductSnapshot(productId: string): Promise<ProductSnapshot | null> {
  if (!isObjectId(productId)) return null;

  const product = await Product.findById(productId).lean();
  if (!product) return null;

  const image =
    product.media?.find((item) => item.type === "image")?.url ??
    product.images?.[0] ??
    "/placeholder-product.jpg";
  const stock = product.hasVariants
    ? product.variants?.reduce((sum, variant) => sum + (variant.isActive ? variant.stock ?? 0 : 0), 0) ?? 0
    : product.stock ?? 0;
  const status = stock <= 0 ? "out_of_stock" : stock <= (product.lowStockThreshold ?? 5) ? "low_stock" : "in_stock";

  return {
    product_id: String(product._id),
    slug: product.slug,
    name: product.name,
    image,
    price: product.basePrice,
    discount: Math.max(0, (product.comparePrice ?? product.basePrice) - product.basePrice),
    stock_status: status,
    product
  };
}

export async function getOrCreateDefaultWishlist(userId: string) {
  const existing = await Wishlist.findOne({ user: userId, isDefault: true });
  if (existing) return existing;

  return Wishlist.create({
    user: userId,
    name: "Default",
    slug: "default",
    isDefault: true
  });
}

export async function getWishlistForUser(userId: string, wishlistId?: string) {
  if (wishlistId) {
    const wishlist = await Wishlist.findOne({ _id: wishlistId, user: userId });
    if (wishlist) return wishlist;
  }

  return getOrCreateDefaultWishlist(userId);
}

export async function createWishlistForUser(userId: string, name: string) {
  const baseSlug = slugify(name, { lower: true, strict: true }) || "wishlist";
  let slug = baseSlug;
  let suffix = 2;

  while (await Wishlist.exists({ user: userId, slug })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return Wishlist.create({ user: userId, name, slug });
}

export async function ensureShareToken(userId: string, wishlistId: string) {
  const wishlist = await Wishlist.findOne({ _id: wishlistId, user: userId });
  if (!wishlist) return null;

  if (!wishlist.shareToken) {
    wishlist.shareToken = crypto.randomBytes(18).toString("hex");
  }

  wishlist.isPublic = true;
  await wishlist.save();
  return wishlist;
}

export async function resolveProductSnapshot(productId: string) {
  return (await databaseProductSnapshot(productId)) ?? staticProductSnapshot(productId);
}

export async function formatWishlistItems(userId: string, wishlistId?: string, filters: WishlistFilters = {}) {
  const wishlist = await getWishlistForUser(userId, wishlistId);
  const records = await WishlistItem.find({ user: userId, wishlist: wishlist._id }).lean();
  const snapshots = await Promise.all(
    records.map(async (record) => {
      const snapshot = await resolveProductSnapshot(record.productId);
      if (!snapshot) return null;

      return {
        ...snapshot,
        wishlist_item_id: String(record._id),
        wishlist_id: String(record.wishlist),
        added_at: record.createdAt,
        notes: record.notes ?? "",
        priority: record.priority ?? "medium"
      };
    })
  );

  let items = snapshots.filter(Boolean) as Array<NonNullable<(typeof snapshots)[number]>>;

  if (filters.inStock) items = items.filter((item) => item.stock_status === "in_stock" || item.stock_status === "low_stock");
  if (typeof filters.minPrice === "number") items = items.filter((item) => item.price >= filters.minPrice!);
  if (typeof filters.maxPrice === "number") items = items.filter((item) => item.price <= filters.maxPrice!);

  if (filters.sort === "manual" && wishlist.manualOrder?.length) {
    const order = new Map(wishlist.manualOrder.map((id, index) => [id, index]));
    items = [...items].sort((a, b) => (order.get(a.product_id) ?? 9999) - (order.get(b.product_id) ?? 9999));
  } else if (filters.sort === "date_asc") {
    items = [...items].sort((a, b) => +new Date(a.added_at) - +new Date(b.added_at));
  } else if (filters.sort === "price_asc") {
    items = [...items].sort((a, b) => a.price - b.price);
  } else if (filters.sort === "price_desc") {
    items = [...items].sort((a, b) => b.price - a.price);
  } else {
    items = [...items].sort((a, b) => +new Date(b.added_at) - +new Date(a.added_at));
  }

  return { wishlist, items };
}

export async function logWishlistEvent(input: {
  userId?: string;
  wishlistId?: string;
  productId: string;
  type: "added" | "removed" | "moved_to_cart" | "price_drop" | "back_in_stock" | "low_stock" | "reminder_sent" | "shared" | "purchased";
  channel?: "site" | "email" | "sms" | "whatsapp";
  metadata?: Record<string, string>;
}) {
  await WishlistEvent.create({
    user: input.userId,
    wishlist: input.wishlistId,
    productId: input.productId,
    type: input.type,
    channel: input.channel ?? "site",
    metadata: input.metadata ? new Map(Object.entries(input.metadata)) : undefined
  });
}
