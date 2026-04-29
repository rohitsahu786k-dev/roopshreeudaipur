import { products } from "@/lib/catalog";

export const cartItems = products.slice(0, 2).map((product, index) => ({
  product,
  qty: index + 1,
  size: index === 0 ? "M" : "Free Size",
  color: product.colors[0]?.name ?? "Default"
}));

export function getCartSubtotal() {
  return cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);
}
