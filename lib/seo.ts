import type { Metadata } from "next";

export function generateMetadata(
  title: string,
  description: string,
  path: string = "/",
  ogImage: string = "https://images.unsplash.com/photo-1595777707802-f3ee4f6faed6?w=1200&h=630&fit=crop"
): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://roopshree.local";
  const canonicalUrl = `${siteUrl}${path}`;

  return {
    title: {
      default: `${title} | Roop Shree`,
      template: `%s | Roop Shree`
    },
    description,
    metadataBase: new URL(siteUrl),
    canonical: canonicalUrl,
    openGraph: {
      title: `${title} | Roop Shree`,
      description,
      url: canonicalUrl,
      siteName: "Roop Shree",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Roop Shree`,
      description,
      images: [ogImage]
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    },
    alternates: {
      canonical: canonicalUrl
    }
  };
}

export const defaultMetadata: Metadata = {
  title: {
    default: "Roop Shree | Women's Ethnic Wear",
    template: "%s | Roop Shree"
  },
  description:
    "Shop lehenga, ladies suit, kurta set, sharara, saree and dupatta collections with secure checkout and worldwide delivery.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  }
};
