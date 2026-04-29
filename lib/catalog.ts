export type CategorySlug =
  | "lehenga"
  | "ladies-suit"
  | "kurta-set"
  | "sharara-set"
  | "saree"
  | "dupatta";

export type Product = {
  name: string;
  slug: string;
  category: CategorySlug;
  shortDescription: string;
  description: string;
  image: string;
  gallery: string[];
  price: number;
  comparePrice: number;
  rating: number;
  reviewCount: number;
  fabric: string;
  occasion: string[];
  workType: string;
  washCare: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  videoUrl: string;
  featured?: boolean;
};

export const categories: { label: string; slug: CategorySlug | "all" }[] = [
  { label: "All", slug: "all" },
  { label: "Lehenga", slug: "lehenga" },
  { label: "Ladies Suit", slug: "ladies-suit" },
  { label: "Kurta Set", slug: "kurta-set" },
  { label: "Sharara Set", slug: "sharara-set" },
  { label: "Saree", slug: "saree" },
  { label: "Dupatta", slug: "dupatta" }
];

const imageFor = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=82`;

export const products: Product[] = [
  {
    name: "Ruhani Embroidered Lehenga",
    slug: "ruhani-embroidered-lehenga",
    category: "lehenga",
    shortDescription: "A silk blend lehenga with zari embroidery and a soft net dupatta.",
    description:
      "Designed for sangeet nights and wedding receptions, this lehenga balances rich handwork with a lighter, dance-friendly flare.",
    image: imageFor("photo-1610030469983-98e550d6193c"),
    gallery: [
      imageFor("photo-1610030469983-98e550d6193c"),
      imageFor("photo-1583391733956-6c78276477e2"),
      imageFor("photo-1612336307429-8a898d10e223")
    ],
    price: 8990,
    comparePrice: 11990,
    rating: 4.8,
    reviewCount: 118,
    fabric: "Silk blend",
    occasion: ["Wedding", "Festival", "Party"],
    workType: "Zari and sequin embroidery",
    washCare: "Dry clean only",
    colors: [
      { name: "Rose", hex: "#B83262" },
      { name: "Wine", hex: "#6E1238" }
    ],
    sizes: ["XS", "S", "M", "L", "XL", "Custom"],
    videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    featured: true
  },
  {
    name: "Meher Cotton Anarkali Suit",
    slug: "meher-cotton-anarkali-suit",
    category: "ladies-suit",
    shortDescription: "Breathable cotton anarkali suit with printed dupatta.",
    description:
      "A comfortable everyday suit with a polished silhouette for office events, family lunches, and festive mornings.",
    image: imageFor("photo-1597983073493-88cd35cf93b0"),
    gallery: [
      imageFor("photo-1597983073493-88cd35cf93b0"),
      imageFor("photo-1610189017773-29214c0f9e40"),
      imageFor("photo-1609357605129-26f69add5d6e")
    ],
    price: 2490,
    comparePrice: 3190,
    rating: 4.6,
    reviewCount: 76,
    fabric: "Pure cotton",
    occasion: ["Casual", "Office", "Festival"],
    workType: "Block print",
    washCare: "Gentle hand wash",
    colors: [
      { name: "Indigo", hex: "#1D4E89" },
      { name: "Marigold", hex: "#E79E25" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    featured: true
  },
  {
    name: "Nazaakat Georgette Saree",
    slug: "nazaakat-georgette-saree",
    category: "saree",
    shortDescription: "Flowing georgette saree with pearl border detailing.",
    description:
      "An elegant drape for receptions and evening functions, finished with a ready blouse fabric and fall-ready border.",
    image: imageFor("photo-1583391733956-6c78276477e2"),
    gallery: [
      imageFor("photo-1583391733956-6c78276477e2"),
      imageFor("photo-1612336307429-8a898d10e223"),
      imageFor("photo-1597983073493-88cd35cf93b0")
    ],
    price: 3290,
    comparePrice: 4290,
    rating: 4.7,
    reviewCount: 94,
    fabric: "Pure georgette",
    occasion: ["Party", "Festival", "Wedding"],
    workType: "Pearl border",
    washCare: "Dry clean preferred",
    colors: [
      { name: "Ivory", hex: "#F5EFE5" },
      { name: "Emerald", hex: "#0B6B4B" }
    ],
    sizes: ["Free Size"],
    videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    featured: true
  },
  {
    name: "Aarohi Festive Kurta Set",
    slug: "aarohi-festive-kurta-set",
    category: "kurta-set",
    shortDescription: "Straight kurta, tapered pants, and an organza dupatta.",
    description:
      "A clean festive set with delicate thread work that moves easily between office celebrations and family gatherings.",
    image: imageFor("photo-1610189017773-29214c0f9e40"),
    gallery: [
      imageFor("photo-1610189017773-29214c0f9e40"),
      imageFor("photo-1597983073493-88cd35cf93b0"),
      imageFor("photo-1609357605129-26f69add5d6e")
    ],
    price: 2790,
    comparePrice: 3590,
    rating: 4.5,
    reviewCount: 51,
    fabric: "Rayon silk",
    occasion: ["Office", "Festival", "Casual"],
    workType: "Thread work",
    washCare: "Cold hand wash",
    colors: [
      { name: "Sage", hex: "#7F9772" },
      { name: "Coral", hex: "#D95F59" }
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U"
  },
  {
    name: "Zoya Mirror Work Sharara",
    slug: "zoya-mirror-work-sharara",
    category: "sharara-set",
    shortDescription: "Mirror work kurti with flared sharara pants.",
    description:
      "A vibrant mehendi-ready sharara set with comfortable lining and a coordinated dupatta.",
    image: imageFor("photo-1609357605129-26f69add5d6e"),
    gallery: [
      imageFor("photo-1609357605129-26f69add5d6e"),
      imageFor("photo-1610030469983-98e550d6193c"),
      imageFor("photo-1612336307429-8a898d10e223")
    ],
    price: 4590,
    comparePrice: 5790,
    rating: 4.6,
    reviewCount: 63,
    fabric: "Chinnon",
    occasion: ["Wedding", "Festival", "Party"],
    workType: "Mirror and gota work",
    washCare: "Dry clean only",
    colors: [
      { name: "Teal", hex: "#027C7B" },
      { name: "Fuchsia", hex: "#C2185B" }
    ],
    sizes: ["S", "M", "L", "XL"],
    videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U"
  },
  {
    name: "Saavni Banarasi Dupatta",
    slug: "saavni-banarasi-dupatta",
    category: "dupatta",
    shortDescription: "Lightweight Banarasi dupatta with woven motifs.",
    description:
      "A refined finishing layer for suits and kurta sets, woven with classic motifs and finished edges.",
    image: imageFor("photo-1612336307429-8a898d10e223"),
    gallery: [
      imageFor("photo-1612336307429-8a898d10e223"),
      imageFor("photo-1583391733956-6c78276477e2"),
      imageFor("photo-1597983073493-88cd35cf93b0")
    ],
    price: 1290,
    comparePrice: 1690,
    rating: 4.4,
    reviewCount: 37,
    fabric: "Banarasi silk blend",
    occasion: ["Festival", "Wedding", "Casual"],
    workType: "Woven zari",
    washCare: "Dry clean preferred",
    colors: [
      { name: "Gold", hex: "#C8912E" },
      { name: "Ruby", hex: "#9B143D" }
    ],
    sizes: ["Free Size"],
    videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U"
  }
];

export function formatPrice(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
