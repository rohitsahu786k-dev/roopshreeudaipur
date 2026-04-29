import { CheckoutClient } from "@/components/checkout/CheckoutClient";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Roop Shree",
  description: "Securely complete your purchase with multiple payment options.",
  robots: {
    index: false
  }
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
