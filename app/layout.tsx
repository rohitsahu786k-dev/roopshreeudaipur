import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { CommerceProvider } from "@/components/providers/CommerceProvider";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

export const metadata: Metadata = {
  title: {
    default: "Roop Shree | Women's Ethnic Wear - Lehenga, Suit, Saree Online",
    template: "%s | Roop Shree"
  },
  description:
    "Shop authentic women's ethnic wear including lehenga, ladies suit, kurta set, sharara, saree and dupatta with free shipping. 100% authentic designer products.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  keywords: [
    "lehenga online",
    "ladies suit",
    "kurta set",
    "sharara",
    "saree",
    "dupatta",
    "ethnic wear",
    "indian wear",
    "women's ethnic wear",
    "designer lehenga"
  ],
  authors: [{ name: "Roop Shree" }],
  creator: "Roop Shree",
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    siteName: "Roop Shree",
    title: "Roop Shree | Women's Ethnic Wear",
    description: "Shop authentic women's ethnic wear online with free shipping",
    images: [
      {
        url: "https://images.unsplash.com/photo-1595777707802-f3ee4f6faed6?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Roop Shree - Women's Ethnic Wear"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Roop Shree | Women's Ethnic Wear",
    description: "Shop lehenga, suit, kurta, saree and more ethnic wear"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-sans antialiased">
        <CommerceProvider>
          <SiteChrome>{children}</SiteChrome>
        </CommerceProvider>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="lazyOnload" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
