import { coupons as fallbackCoupons } from "@/lib/coupons";
import type { CartItem } from "@/lib/cart";
import { Coupon, CouponAttempt, CouponUsage } from "@/models/Coupon";
import { Order } from "@/models/Order";

type CouponOwner = {
  userId?: string;
  sessionId?: string;
  ip?: string;
};

export type CouponValidationResult = {
  valid: boolean;
  code: string;
  message: string;
  discount: number;
  freeShipping: boolean;
  couponId?: string;
  coupon?: unknown;
};

type CouponLike = {
  _id?: unknown;
  code: string;
  title?: string;
  type?: string;
  value: number;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usedCount?: number | null;
  usageLimitPerCustomer?: number | null;
  minimumOrderAmount?: number | null;
  appliesToAllProducts?: boolean | null;
  appliesToProducts?: string[] | null;
  appliesToCategories?: string[] | null;
  excludedProducts?: string[] | null;
  customerEligibility?: string | null;
  eligibleCustomers?: string[] | null;
  firstTimeUserOnly?: boolean | null;
  allowsCombining?: boolean | null;
  stackable?: boolean | null;
  startsAt?: Date | string | null;
  endsAt?: Date | string | null;
  isActive?: boolean | null;
};

const couponAttemptBuckets = new Map<string, { count: number; resetAt: number }>();

export function assertCouponRateLimit(owner: CouponOwner, code: string, limit = 12, windowMs = 60_000) {
  const key = `${owner.userId ?? owner.sessionId ?? owner.ip ?? "guest"}:${code.toUpperCase()}`;
  const now = Date.now();
  const current = couponAttemptBuckets.get(key);

  if (!current || current.resetAt < now) {
    couponAttemptBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  current.count += 1;
  if (current.count > limit) {
    throw new Error("Too many coupon attempts. Please try again shortly.");
  }
}

function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.discount_price * item.quantity, 0);
}

function eligibleItems(coupon: CouponLike, items: CartItem[]) {
  const applicableProducts = new Set((coupon.appliesToProducts ?? []).map(String));
  const excludedProducts = new Set((coupon.excludedProducts ?? []).map(String));
  const applicableCategories = new Set((coupon.appliesToCategories ?? []).map(String));

  return items.filter((item) => {
    if (excludedProducts.has(item.product_id) || excludedProducts.has(item.product.slug)) return false;
    if (coupon.appliesToAllProducts !== false && applicableProducts.size === 0 && applicableCategories.size === 0) return true;
    if (applicableProducts.has(item.product_id) || applicableProducts.has(item.product.slug)) return true;
    if (applicableCategories.has(item.product.category)) return true;
    return false;
  });
}

function calculateDiscount(coupon: CouponLike, items: CartItem[]) {
  const eligibleSubtotal = eligibleItems(coupon, items).reduce((sum, item) => sum + item.discount_price * item.quantity, 0);
  if (eligibleSubtotal <= 0 && coupon.type !== "free_shipping") return 0;

  let discount = 0;
  if (coupon.type === "percentage") discount = Math.round((eligibleSubtotal * coupon.value) / 100);
  if (coupon.type === "fixed_amount") discount = coupon.value;
  if (coupon.type === "product_specific") discount = Math.round((eligibleSubtotal * coupon.value) / 100);

  if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);
  return Math.min(discount, eligibleSubtotal);
}

async function fallbackCouponForCode(code: string): Promise<CouponLike | null> {
  const coupon = fallbackCoupons.find((item) => item.code.toLowerCase() === code.toLowerCase());
  if (!coupon) return null;

  return {
    code: coupon.code,
    title: coupon.title,
    type: coupon.discountType === "percent" ? "percentage" : coupon.discountType === "fixed" ? "fixed_amount" : "free_shipping",
    value: coupon.value,
    minimumOrderAmount: coupon.minSpend,
    maxDiscountAmount: coupon.maxDiscountAmount,
    isActive: true,
    appliesToAllProducts: true,
    usageLimitPerCustomer: 9999
  };
}

export async function validateCouponForCart(input: {
  code: string;
  items: CartItem[];
  owner?: CouponOwner;
  currentCouponCode?: string;
  recordAttempt?: boolean;
}): Promise<CouponValidationResult> {
  const code = input.code.trim().toUpperCase();
  const owner = input.owner ?? {};
  const subtotal = cartSubtotal(input.items);

  assertCouponRateLimit(owner, code);

  const dbCoupon = await Coupon.findOne({ code }).lean();
  const coupon = (dbCoupon as CouponLike | null) ?? (await fallbackCouponForCode(code));

  let result: CouponValidationResult = {
    valid: false,
    code,
    message: "Invalid code",
    discount: 0,
    freeShipping: false
  };

  if (!coupon) {
    await recordCouponAttempt(code, owner, result, subtotal, input.recordAttempt);
    return result;
  }

  const now = Date.now();
  const startsAt = coupon.startsAt ? new Date(coupon.startsAt).getTime() : undefined;
  const endsAt = coupon.endsAt ? new Date(coupon.endsAt).getTime() : undefined;

  if (coupon.isActive === false) result.message = "Coupon inactive";
  else if (startsAt && startsAt > now) result.message = "Coupon not started";
  else if (endsAt && endsAt < now) result.message = "Coupon expired";
  else if (coupon.usageLimit && (coupon.usedCount ?? 0) >= coupon.usageLimit) result.message = "Coupon usage limit reached";
  else if (coupon.minimumOrderAmount && subtotal < coupon.minimumOrderAmount) result.message = "Minimum order not met";
  else if (input.currentCouponCode && input.currentCouponCode !== code && !coupon.stackable && !coupon.allowsCombining) {
    result.message = "Only one coupon can be applied at a time";
  } else if ((coupon.customerEligibility === "specific_customers" || coupon.eligibleCustomers?.length) && (!owner.userId || !coupon.eligibleCustomers?.map(String).includes(owner.userId))) {
    result.message = "Coupon is not available for this user";
  } else if ((coupon.firstTimeUserOnly || coupon.customerEligibility === "first_time") && (!owner.userId || (await Order.exists({ user: owner.userId })))) {
    result.message = "Coupon is for first-time customers only";
  } else if (coupon._id && owner.userId && coupon.usageLimitPerCustomer) {
    const userUsage = await CouponUsage.aggregate([
      { $match: { coupon: coupon._id, user: owner.userId } },
      { $group: { _id: null, count: { $sum: "$usageCount" } } }
    ]);
    if ((userUsage[0]?.count ?? 0) >= coupon.usageLimitPerCustomer) {
      result.message = "Coupon usage limit reached for this user";
    } else {
      result = makeValidResult(coupon, input.items);
    }
  } else {
    result = makeValidResult(coupon, input.items);
  }

  await recordCouponAttempt(code, owner, result, subtotal, input.recordAttempt);
  return result;
}

function makeValidResult(coupon: CouponLike, items: CartItem[]): CouponValidationResult {
  const discount = calculateDiscount(coupon, items);
  const freeShipping = coupon.type === "free_shipping";

  if (!freeShipping && discount <= 0) {
    return {
      valid: false,
      code: coupon.code,
      message: "Coupon is not applicable to these cart items",
      discount: 0,
      freeShipping: false,
      couponId: coupon._id ? String(coupon._id) : undefined,
      coupon
    };
  }

  return {
    valid: true,
    code: coupon.code,
    message: `${coupon.code} applied successfully.`,
    discount,
    freeShipping,
    couponId: coupon._id ? String(coupon._id) : undefined,
    coupon
  };
}

export async function recordCouponAttempt(
  code: string,
  owner: CouponOwner,
  result: CouponValidationResult,
  cartValue: number,
  shouldRecord = true
) {
  if (!shouldRecord) return;

  await CouponAttempt.create({
    code,
    user: owner.userId,
    sessionId: owner.sessionId,
    ip: owner.ip,
    success: result.valid,
    reason: result.message,
    discountAmount: result.discount,
    cartValue
  });
}

export async function findBestAutoApplyCoupon(items: CartItem[], owner?: CouponOwner) {
  const coupons = await Coupon.find({ isActive: true, autoApply: true }).sort({ value: -1 }).lean();
  let best: CouponValidationResult | null = null;

  for (const coupon of coupons) {
    const result = await validateCouponForCart({
      code: coupon.code,
      items,
      owner,
      recordAttempt: false
    });

    if (result.valid && (!best || result.discount > best.discount || (result.freeShipping && !best.freeShipping))) {
      best = result;
    }
  }

  return best;
}
