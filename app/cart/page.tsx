import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart/CartPageClient";

export const metadata: Metadata = {
  title: "Shopping Cart | Roop Shree",
  description: "Review your shopping cart and proceed to checkout.",
  robots: {
    index: false
  }
};

export default function CartPage() {
  return <CartPageClient />;
}
