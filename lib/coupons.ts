export type Coupon = {
  code: string;
  title: string;
  description: string;
  discountType: "percent" | "fixed" | "free_shipping";
  value: number;
  minSpend: number;
  badge: string;
};

export const coupons: Coupon[] = [
  {
    code: "ROOP10",
    title: "10% off",
    description: "Get 10% off on orders above Rs 5,000.",
    discountType: "percent",
    value: 10,
    minSpend: 5000,
    badge: "Best for festive orders"
  },
  {
    code: "BRIDAL1500",
    title: "Rs 1,500 off",
    description: "Flat Rs 1,500 off on premium occasion orders above Rs 20,000.",
    discountType: "fixed",
    value: 1500,
    minSpend: 20000,
    badge: "Bridal cart offer"
  },
  {
    code: "SHIPFREE",
    title: "Free shipping",
    description: "Extra Rs 499 benefit on orders above Rs 2,999.",
    discountType: "free_shipping",
    value: 499,
    minSpend: 2999,
    badge: "Shipping saver"
  },
  {
    code: "UDAIPUR500",
    title: "Rs 500 boutique welcome",
    description: "For new Roop Shree customers on orders above Rs 8,000.",
    discountType: "fixed",
    value: 500,
    minSpend: 8000,
    badge: "New customer"
  }
];

export function getCouponDiscount(code: string, subtotal: number) {
  const coupon = coupons.find((item) => item.code.toLowerCase() === code.trim().toLowerCase());

  if (!coupon || subtotal < coupon.minSpend) {
    return { coupon, discount: 0 };
  }

  const discount = coupon.discountType === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return { coupon, discount: Math.min(discount, subtotal) };
}
