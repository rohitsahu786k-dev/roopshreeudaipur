import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CommerceProvider } from "@/components/providers/CommerceProvider";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

export const metadata: Metadata = {
  title: {
    default: "Roop Shree | Women's Ethnic Wear",
    template: "%s | Roop Shree"
  },
  description:
    "Shop lehenga, ladies suit, kurta set, sharara, saree and dupatta collections with secure checkout and worldwide delivery.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-sans antialiased">
        <CommerceProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </CommerceProvider>
      </body>
    </html>
  );
}
