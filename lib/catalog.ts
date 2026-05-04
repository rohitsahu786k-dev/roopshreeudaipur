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
  videoUrl?: string;
  seller?: string;
  sku?: string;
  dispatchTime?: string;
  returnPolicy?: string;
  sizeGuideNotes?: string;
  includedItems?: string[];
  careInstructions?: string[];
  moreInformation?: { label: string; value: string }[];
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

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=82`;

export const products: Product[] = [
  // ── LEHENGAS ──────────────────────────────────────────────────
  {
    name: "Ruhani Embroidered Bridal Lehenga",
    slug: "ruhani-embroidered-lehenga",
    category: "lehenga",
    shortDescription: "Silk blend lehenga with zari embroidery and soft net dupatta.",
    description: "Designed for sangeet nights and wedding receptions, this lehenga balances rich handwork with a lighter, dance-friendly flare. The zari and sequin embroidery catches every light beautifully.",
    image: img("photo-1610030469983-98e550d6193c"),
    gallery: [img("photo-1610030469983-98e550d6193c"), img("photo-1583391733956-6c78276477e2"), img("photo-1612336307429-8a898d10e223")],
    price: 8990,
    comparePrice: 11990,
    rating: 4.8,
    reviewCount: 118,
    fabric: "Silk blend",
    occasion: ["Wedding", "Festival", "Sangeet"],
    workType: "Zari and sequin embroidery",
    washCare: "Dry clean only",
    colors: [{ name: "Rose", hex: "#B83262" }, { name: "Wine", hex: "#6E1238" }],
    sizes: ["XS", "S", "M", "L", "XL", "Custom"],
    dispatchTime: "Ready to ship in 5-7 business days",
    returnPolicy: "Exchange within 7 days if unaltered",
    featured: true
  },
  {
    name: "Sundari Gota Patti Lehenga",
    slug: "sundari-gota-patti-lehenga",
    category: "lehenga",
    shortDescription: "Rajasthani gota patti lehenga in vibrant hues with mirror work choli.",
    description: "Hand-crafted in Udaipur with traditional gota patti detailing, this lehenga brings the essence of Rajasthani bridal culture to modern brides. Mirror work choli and flowy dupatta included.",
    image: img("photo-1583487305850-ac28d2a4c3be"),
    gallery: [img("photo-1583487305850-ac28d2a4c3be"), img("photo-1610030469983-98e550d6193c"), img("photo-1609357605129-26f69add5d6e")],
    price: 12500,
    comparePrice: 16000,
    rating: 4.9,
    reviewCount: 87,
    fabric: "Raw silk",
    occasion: ["Wedding", "Haldi", "Festival"],
    workType: "Gota patti and mirror work",
    washCare: "Dry clean only",
    colors: [{ name: "Saffron", hex: "#F4822A" }, { name: "Fuchsia", hex: "#C2185B" }],
    sizes: ["S", "M", "L", "XL", "Custom"],
    dispatchTime: "Ready to ship in 7-10 business days",
    featured: true
  },
  {
    name: "Meenakari Velvet Lehenga",
    slug: "meenakari-velvet-lehenga",
    category: "lehenga",
    shortDescription: "Rich velvet lehenga with meenakari embroidery, perfect for winter weddings.",
    description: "Luxurious velvet base with intricate meenakari work makes this lehenga a showstopper for winter receptions and sangeet nights. Comes with a matching dupatta and blouse fabric.",
    image: img("photo-1529139574466-a303027c1d8b"),
    gallery: [img("photo-1529139574466-a303027c1d8b"), img("photo-1610030469983-98e550d6193c"), img("photo-1583391733956-6c78276477e2")],
    price: 15990,
    comparePrice: 21000,
    rating: 4.7,
    reviewCount: 64,
    fabric: "Velvet",
    occasion: ["Wedding", "Reception", "Festival"],
    workType: "Meenakari and zardozi",
    washCare: "Dry clean only",
    colors: [{ name: "Royal Blue", hex: "#1D3A8A" }, { name: "Deep Maroon", hex: "#7B1022" }],
    sizes: ["XS", "S", "M", "L", "XL", "Custom"],
    dispatchTime: "Ships in 10-12 business days",
    featured: true
  },
  {
    name: "Naira Sequin Net Lehenga",
    slug: "naira-sequin-net-lehenga",
    category: "lehenga",
    shortDescription: "Lightweight sequin net lehenga, ideal for receptions and cocktail events.",
    description: "All-over sequin embroidery on a flowy net base creates a glamorous silhouette that photographs beautifully. Comes with a heavily embroidered blouse and sheer dupatta.",
    image: img("photo-1515886657613-9f3515b0c78f"),
    gallery: [img("photo-1515886657613-9f3515b0c78f"), img("photo-1612336307429-8a898d10e223"), img("photo-1583391733956-6c78276477e2")],
    price: 9490,
    comparePrice: 13500,
    rating: 4.6,
    reviewCount: 52,
    fabric: "Net with sequin work",
    occasion: ["Reception", "Party", "Cocktail"],
    workType: "All-over sequin embroidery",
    washCare: "Dry clean only",
    colors: [{ name: "Gold", hex: "#C8912E" }, { name: "Silver", hex: "#A0A0A0" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    dispatchTime: "Ready to ship in 5-7 business days"
  },

  // ── LADIES SUITS ──────────────────────────────────────────────
  {
    name: "Meher Cotton Anarkali Suit",
    slug: "meher-cotton-anarkali-suit",
    category: "ladies-suit",
    shortDescription: "Breathable cotton anarkali suit with block-printed dupatta.",
    description: "A comfortable everyday suit with a polished silhouette for office events, family lunches, and festive mornings. The block print adds artisan character to a classic shape.",
    image: img("photo-1597983073493-88cd35cf93b0"),
    gallery: [img("photo-1597983073493-88cd35cf93b0"), img("photo-1610189017773-29214c0f9e40"), img("photo-1609357605129-26f69add5d6e")],
    price: 2490,
    comparePrice: 3190,
    rating: 4.6,
    reviewCount: 76,
    fabric: "Pure cotton",
    occasion: ["Casual", "Office", "Festival"],
    workType: "Block print",
    washCare: "Gentle hand wash",
    colors: [{ name: "Indigo", hex: "#1D4E89" }, { name: "Marigold", hex: "#E79E25" }],
    sizes: ["S", "M", "L", "XL", "XXL"],
    featured: true
  },
  {
    name: "Zara Chanderi Silk Suit",
    slug: "zara-chanderi-silk-suit",
    category: "ladies-suit",
    shortDescription: "Lightweight chanderi silk suit with gold zari border and straight silhouette.",
    description: "Elegant and understated, this chanderi silk suit is ideal for festive gatherings and formal occasions. The gold zari border adds a touch of tradition to a contemporary fit.",
    image: img("photo-1581922261290-991b38693d1b"),
    gallery: [img("photo-1581922261290-991b38693d1b"), img("photo-1597983073493-88cd35cf93b0"), img("photo-1610189017773-29214c0f9e40")],
    price: 3790,
    comparePrice: 4990,
    rating: 4.7,
    reviewCount: 91,
    fabric: "Chanderi silk",
    occasion: ["Festival", "Office", "Wedding"],
    workType: "Zari border",
    washCare: "Dry clean preferred",
    colors: [{ name: "Ivory", hex: "#F5EFE5" }, { name: "Powder Blue", hex: "#AEC6CF" }],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    featured: true
  },
  {
    name: "Niharika Embroidered Pant Suit",
    slug: "niharika-embroidered-pant-suit",
    category: "ladies-suit",
    shortDescription: "Thread-embroidered kurta with tapered pants and organza dupatta.",
    description: "A sophisticated pant suit combining intricate thread embroidery with a clean modern silhouette. Perfect for corporate events, office parties, and formal lunches.",
    image: img("photo-1588287537317-aeb42ed2a121"),
    gallery: [img("photo-1588287537317-aeb42ed2a121"), img("photo-1597983073493-88cd35cf93b0"), img("photo-1609357605129-26f69add5d6e")],
    price: 4290,
    comparePrice: 5490,
    rating: 4.5,
    reviewCount: 43,
    fabric: "Georgette with lining",
    occasion: ["Office", "Party", "Festival"],
    workType: "Thread embroidery",
    washCare: "Gentle machine wash",
    colors: [{ name: "Blush", hex: "#E8AAAA" }, { name: "Sage", hex: "#7F9772" }],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"]
  },
  {
    name: "Priya Organza Palazzo Suit",
    slug: "priya-organza-palazzo-suit",
    category: "ladies-suit",
    shortDescription: "Flowy organza kurti with wide-leg palazzo pants for a relaxed festive look.",
    description: "The organza fabric catches light beautifully and gives a dreamy, ethereal effect. This palazzo suit is ideal for mehendi functions, family get-togethers, and day festivals.",
    image: img("photo-1590308513880-e96e55c61148"),
    gallery: [img("photo-1590308513880-e96e55c61148"), img("photo-1581922261290-991b38693d1b"), img("photo-1597983073493-88cd35cf93b0")],
    price: 3190,
    comparePrice: 4190,
    rating: 4.4,
    reviewCount: 38,
    fabric: "Organza",
    occasion: ["Festival", "Casual", "Wedding"],
    workType: "Printed with gota border",
    washCare: "Dry clean preferred",
    colors: [{ name: "Peach", hex: "#FFCBA4" }, { name: "Mint", hex: "#98D8C8" }],
    sizes: ["S", "M", "L", "XL", "XXL"]
  },

  // ── SAREES ─────────────────────────────────────────────────────
  {
    name: "Nazaakat Georgette Saree",
    slug: "nazaakat-georgette-saree",
    category: "saree",
    shortDescription: "Flowing georgette saree with pearl border detailing.",
    description: "An elegant drape for receptions and evening functions, finished with a ready blouse fabric and fall-ready border. The georgette fabric drapes effortlessly and stays wrinkle-free.",
    image: img("photo-1583391733956-6c78276477e2"),
    gallery: [img("photo-1583391733956-6c78276477e2"), img("photo-1612336307429-8a898d10e223"), img("photo-1597983073493-88cd35cf93b0")],
    price: 3290,
    comparePrice: 4290,
    rating: 4.7,
    reviewCount: 94,
    fabric: "Pure georgette",
    occasion: ["Party", "Festival", "Wedding"],
    workType: "Pearl border",
    washCare: "Dry clean preferred",
    colors: [{ name: "Ivory", hex: "#F5EFE5" }, { name: "Emerald", hex: "#0B6B4B" }],
    sizes: ["Free Size"],
    featured: true
  },
  {
    name: "Kanjivaram Silk Saree",
    slug: "kanjivaram-silk-saree",
    category: "saree",
    shortDescription: "Authentic Kanjivaram silk saree with traditional temple border.",
    description: "Woven in the age-old Kanjivaram tradition, this silk saree features a heavy gold zari temple border and intricate pallu. An heirloom-quality piece for weddings and special ceremonies.",
    image: img("photo-1626173866570-6dd0c140fc1b"),
    gallery: [img("photo-1626173866570-6dd0c140fc1b"), img("photo-1583391733956-6c78276477e2"), img("photo-1590308513880-e96e55c61148")],
    price: 7990,
    comparePrice: 10500,
    rating: 4.9,
    reviewCount: 142,
    fabric: "Pure Kanjivaram silk",
    occasion: ["Wedding", "Festival", "Puja"],
    workType: "Zari woven temple border",
    washCare: "Dry clean only",
    colors: [{ name: "Ruby Red", hex: "#9B143D" }, { name: "Peacock Green", hex: "#005F5B" }],
    sizes: ["Free Size"],
    featured: true
  },
  {
    name: "Bandhani Georgette Saree",
    slug: "bandhani-georgette-saree",
    category: "saree",
    shortDescription: "Traditional Rajasthani bandhani tie-dye saree in vivid festival colors.",
    description: "Hand-crafted using the ancient bandhani tie-dye technique from Rajasthan, each saree is unique. The vibrant color palette makes it a perfect choice for haldi, teej, and festive occasions.",
    image: img("photo-1506126613408-eca07ce68773"),
    gallery: [img("photo-1506126613408-eca07ce68773"), img("photo-1583391733956-6c78276477e2"), img("photo-1626173866570-6dd0c140fc1b")],
    price: 2890,
    comparePrice: 3790,
    rating: 4.6,
    reviewCount: 67,
    fabric: "Georgette",
    occasion: ["Festival", "Haldi", "Casual"],
    workType: "Bandhani tie-dye",
    washCare: "Gentle hand wash separately",
    colors: [{ name: "Mustard", hex: "#D4AC0D" }, { name: "Pink", hex: "#E91E8C" }],
    sizes: ["Free Size"]
  },
  {
    name: "Banarasi Tissue Saree",
    slug: "banarasi-tissue-saree",
    category: "saree",
    shortDescription: "Shimmering tissue saree with Banarasi brocade border and blouse.",
    description: "The delicate tissue fabric gives this saree a luminous, translucent quality that catches every light. The Banarasi brocade border adds richness to an otherwise light and airy drape.",
    image: img("photo-1521334884684-d80222895322"),
    gallery: [img("photo-1521334884684-d80222895322"), img("photo-1626173866570-6dd0c140fc1b"), img("photo-1583391733956-6c78276477e2")],
    price: 4590,
    comparePrice: 5990,
    rating: 4.7,
    reviewCount: 55,
    fabric: "Banarasi tissue silk",
    occasion: ["Wedding", "Reception", "Festival"],
    workType: "Brocade border and pallu",
    washCare: "Dry clean only",
    colors: [{ name: "Gold", hex: "#C8912E" }, { name: "Rose Gold", hex: "#D4A574" }],
    sizes: ["Free Size"]
  },

  // ── KURTA SETS ────────────────────────────────────────────────
  {
    name: "Aarohi Festive Kurta Set",
    slug: "aarohi-festive-kurta-set",
    category: "kurta-set",
    shortDescription: "Straight kurta, tapered pants, and an organza dupatta.",
    description: "A clean festive set with delicate thread work that moves easily between office celebrations and family gatherings. The organza dupatta adds a graceful finishing touch.",
    image: img("photo-1610189017773-29214c0f9e40"),
    gallery: [img("photo-1610189017773-29214c0f9e40"), img("photo-1597983073493-88cd35cf93b0"), img("photo-1609357605129-26f69add5d6e")],
    price: 2790,
    comparePrice: 3590,
    rating: 4.5,
    reviewCount: 51,
    fabric: "Rayon silk",
    occasion: ["Office", "Festival", "Casual"],
    workType: "Thread work",
    washCare: "Cold hand wash",
    colors: [{ name: "Sage", hex: "#7F9772" }, { name: "Coral", hex: "#D95F59" }],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    featured: true
  },
  {
    name: "Ishaan Floral Print Kurta Set",
    slug: "ishaan-floral-print-kurta-set",
    category: "kurta-set",
    shortDescription: "Vibrant floral print kurta with matching palazzo pants and dupatta.",
    description: "A cheerful and comfortable set printed with seasonal florals on soft rayon. Ideal for day outings, festive lunches, and casual celebrations with family.",
    image: img("photo-1512436991641-6745cdb1723f"),
    gallery: [img("photo-1512436991641-6745cdb1723f"), img("photo-1610189017773-29214c0f9e40"), img("photo-1609357605129-26f69add5d6e")],
    price: 1990,
    comparePrice: 2690,
    rating: 4.4,
    reviewCount: 83,
    fabric: "Rayon",
    occasion: ["Casual", "Office", "Festival"],
    workType: "Digital floral print",
    washCare: "Machine wash cold",
    colors: [{ name: "Sky Blue", hex: "#87CEEB" }, { name: "Coral", hex: "#FF6B6B" }],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"]
  },
  {
    name: "Kavya Chikankari Kurta Set",
    slug: "kavya-chikankari-kurta-set",
    category: "kurta-set",
    shortDescription: "Delicate Lucknowi chikankari kurta with cotton pants and sheer dupatta.",
    description: "Hand-embroidered chikankari work on fine cotton voile gives this kurta an heirloom quality. A must-have for summer festivals, home gatherings, and casual ethnic occasions.",
    image: img("photo-1496747611176-843222e1e57c"),
    gallery: [img("photo-1496747611176-843222e1e57c"), img("photo-1610189017773-29214c0f9e40"), img("photo-1597983073493-88cd35cf93b0")],
    price: 2490,
    comparePrice: 3290,
    rating: 4.8,
    reviewCount: 109,
    fabric: "Cotton voile",
    occasion: ["Casual", "Festival", "Wedding"],
    workType: "Chikankari hand embroidery",
    washCare: "Gentle hand wash",
    colors: [{ name: "White", hex: "#FAFAFA" }, { name: "Pastel Pink", hex: "#F4C2C2" }],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    featured: true
  },
  {
    name: "Radha Silk Straight Kurta Set",
    slug: "radha-silk-straight-kurta-set",
    category: "kurta-set",
    shortDescription: "Solid silk straight kurta with churidar pants, ideal for formal occasions.",
    description: "Clean lines and premium silk fabric make this straight kurta a go-to for formal office wear, client lunches, and festivals. The solid color pairs with any jewelry effortlessly.",
    image: img("photo-1555529669-e69e7aa0ba9a"),
    gallery: [img("photo-1555529669-e69e7aa0ba9a"), img("photo-1610189017773-29214c0f9e40"), img("photo-1588287537317-aeb42ed2a121")],
    price: 3190,
    comparePrice: 4190,
    rating: 4.6,
    reviewCount: 47,
    fabric: "Art silk",
    occasion: ["Office", "Festival", "Formal"],
    workType: "Solid with printed border",
    washCare: "Dry clean preferred",
    colors: [{ name: "Navy", hex: "#1A1A5C" }, { name: "Burgundy", hex: "#800020" }],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"]
  },

  // ── SHARARA SETS ──────────────────────────────────────────────
  {
    name: "Zoya Mirror Work Sharara",
    slug: "zoya-mirror-work-sharara",
    category: "sharara-set",
    shortDescription: "Mirror work kurti with flared sharara pants and dupatta.",
    description: "A vibrant mehendi-ready sharara set with comfortable lining and coordinated dupatta. The mirror work catches light beautifully for evening celebrations.",
    image: img("photo-1609357605129-26f69add5d6e"),
    gallery: [img("photo-1609357605129-26f69add5d6e"), img("photo-1610030469983-98e550d6193c"), img("photo-1612336307429-8a898d10e223")],
    price: 4590,
    comparePrice: 5790,
    rating: 4.6,
    reviewCount: 63,
    fabric: "Chinnon",
    occasion: ["Wedding", "Festival", "Mehendi"],
    workType: "Mirror and gota work",
    washCare: "Dry clean only",
    colors: [{ name: "Teal", hex: "#027C7B" }, { name: "Fuchsia", hex: "#C2185B" }],
    sizes: ["S", "M", "L", "XL"],
    featured: true
  },
  {
    name: "Ruhi Embroidered Sharara Set",
    slug: "ruhi-embroidered-sharara-set",
    category: "sharara-set",
    shortDescription: "Heavily embroidered sharara set with matching crop top and dupatta.",
    description: "A statement festive set with all-over thread and sequin embroidery on the sharara. The crop top and flowing dupatta complete a wedding-ready look for mehendi and sangeet.",
    image: img("photo-1612336307429-8a898d10e223"),
    gallery: [img("photo-1612336307429-8a898d10e223"), img("photo-1609357605129-26f69add5d6e"), img("photo-1583487305850-ac28d2a4c3be")],
    price: 6490,
    comparePrice: 8500,
    rating: 4.7,
    reviewCount: 44,
    fabric: "Georgette with lining",
    occasion: ["Sangeet", "Wedding", "Festival"],
    workType: "Thread and sequin embroidery",
    washCare: "Dry clean only",
    colors: [{ name: "Lavender", hex: "#967BB6" }, { name: "Coral", hex: "#E8735A" }],
    sizes: ["S", "M", "L", "XL"]
  },

  // ── DUPATTAS ─────────────────────────────────────────────────
  {
    name: "Saavni Banarasi Dupatta",
    slug: "saavni-banarasi-dupatta",
    category: "dupatta",
    shortDescription: "Lightweight Banarasi dupatta with woven motifs and zari border.",
    description: "A refined finishing layer for suits and kurta sets, woven with classic Banarasi motifs and finished edges. The zari border adds a festive touch to any ensemble.",
    image: img("photo-1612336307429-8a898d10e223"),
    gallery: [img("photo-1612336307429-8a898d10e223"), img("photo-1583391733956-6c78276477e2"), img("photo-1597983073493-88cd35cf93b0")],
    price: 1290,
    comparePrice: 1690,
    rating: 4.4,
    reviewCount: 37,
    fabric: "Banarasi silk blend",
    occasion: ["Festival", "Wedding", "Casual"],
    workType: "Woven zari motifs",
    washCare: "Dry clean preferred",
    colors: [{ name: "Gold", hex: "#C8912E" }, { name: "Ruby", hex: "#9B143D" }],
    sizes: ["Free Size"]
  },
  {
    name: "Phulkari Embroidered Dupatta",
    slug: "phulkari-embroidered-dupatta",
    category: "dupatta",
    shortDescription: "Vibrant Punjabi phulkari dupatta with dense floral silk thread work.",
    description: "Hand-embroidered using the traditional phulkari technique from Punjab, this dupatta transforms any simple kurta into a festive outfit. Dense silk thread floral motifs cover the entire length.",
    image: img("photo-1626173866570-6dd0c140fc1b"),
    gallery: [img("photo-1626173866570-6dd0c140fc1b"), img("photo-1612336307429-8a898d10e223"), img("photo-1583391733956-6c78276477e2")],
    price: 1890,
    comparePrice: 2490,
    rating: 4.6,
    reviewCount: 58,
    fabric: "Cotton with silk embroidery",
    occasion: ["Festival", "Wedding", "Casual"],
    workType: "Phulkari silk thread embroidery",
    washCare: "Gentle hand wash",
    colors: [{ name: "Red", hex: "#CC2929" }, { name: "Orange", hex: "#E8680A" }],
    sizes: ["Free Size"],
    featured: true
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
  return products.find((p) => p.slug === slug);
}
