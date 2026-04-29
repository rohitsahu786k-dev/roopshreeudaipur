import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/ShopClient";

export const metadata: Metadata = {
  title: "Shop Women's Ethnic Wear | Lehenga, Suit & More",
  description: "Browse and shop our curated collection of lehenga, ladies suit, kurta set, sharara, saree, and dupatta. Free shipping on orders above Rs 2,999.",
  keywords: ["shop", "lehenga", "suit", "kurta", "saree", "ethnic wear", "women's wear"],
  openGraph: {
    title: "Shop Women's Ethnic Wear | Roop Shree",
    description: "Discover our exclusive collection of authentic ethnic wear",
    type: "website"
  }
};

export default function ShopPage() {
  return <ShopClient />;
}
