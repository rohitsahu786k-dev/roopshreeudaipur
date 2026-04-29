import type { Product } from "@/lib/catalog";

export type ProductReview = {
  id: string;
  productSlug: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  location: string;
  verified: boolean;
  helpful: number;
  size?: string;
  images: string[];
};

const reviewNames = [
  "Ananya Sharma",
  "Priya Jain",
  "Ritika Mehta",
  "Neha Soni",
  "Kavya Rathore",
  "Isha Agarwal",
  "Mansi Kothari",
  "Pooja Vyas",
  "Sakshi Bhandari",
  "Riya Malhotra",
  "Aditi Singh",
  "Charu Kapoor",
  "Tanvi Shah",
  "Nidhi Pareek",
  "Megha Joshi",
  "Simran Arora",
  "Jaya Choudhary",
  "Avni Goyal",
  "Khushi Lodha",
  "Sneha Tak",
  "Divya Mathur",
  "Bhavya Jain"
];

const cities = ["Udaipur", "Jaipur", "Mumbai", "Delhi", "Ahmedabad", "Surat", "Indore", "Pune"];
const titles = [
  "Beautiful outfit and premium finish",
  "Looks exactly like boutique wear",
  "Perfect for wedding functions",
  "Fabric quality is really good",
  "Loved the fitting and colour",
  "Worth the price",
  "Elegant work and fast delivery",
  "Very graceful in person"
];
const comments = [
  "The embroidery feels neat and the outfit looks much richer in real life. Packing was also clean.",
  "I wore it for a family function and received many compliments. The colour is very close to the photos.",
  "Good finishing, comfortable lining and the fall is lovely. Size guide helped me pick the right size.",
  "The fabric is soft and the work does not feel rough on skin. Overall a very boutique-like experience.",
  "Delivery was on time and the product was quality checked well. I would shop again from Roop Shree.",
  "The outfit has a premium look without feeling too heavy. Great option for festive and wedding wear."
];

export function getProductReviews(product: Product): ProductReview[] {
  return Array.from({ length: 22 }, (_, index) => {
    const rating = index % 11 === 0 ? 4 : index % 17 === 0 ? 3 : 5;
    return {
      id: `${product.slug}-${index + 1}`,
      productSlug: product.slug,
      name: reviewNames[index % reviewNames.length],
      rating,
      title: titles[index % titles.length],
      comment: comments[index % comments.length],
      date: new Date(2026, 3 - (index % 3), 24 - index).toISOString(),
      location: cities[index % cities.length],
      verified: index % 5 !== 0,
      helpful: 42 - index,
      size: product.sizes[index % product.sizes.length],
      images: index % 4 === 0 ? product.gallery.slice(0, 2) : index % 5 === 0 ? [product.image] : []
    };
  });
}

export function getRatingBreakdown(reviews: ProductReview[]) {
  return [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length
  }));
}
