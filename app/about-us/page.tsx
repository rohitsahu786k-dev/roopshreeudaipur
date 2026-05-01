import type { Metadata } from "next";
import { StorefrontPageRenderer } from "@/components/content/StorefrontPageRenderer";
import { getPublishedPage } from "@/lib/storefrontPages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us | Roop Shree",
  description: "Discover the story behind Roop Shree. We're committed to bringing authentic designer ethnic wear to customers worldwide.",
  openGraph: {
    title: "About Us | Roop Shree",
    description: "Learn about Roop Shree's mission and values"
  }
};

export default async function AboutPage() {
  const backendPage = await getPublishedPage("about-us");
  if (backendPage) return <StorefrontPageRenderer page={backendPage} />;

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-sm font-bold uppercase tracking-wide text-primary">About us</p>
      <h1 className="mt-2 font-serif text-5xl font-bold">Made for occasion-led dressing</h1>
      <p className="mt-6 text-lg leading-8 text-ink/70">
        Roop Shree is a women&apos;s ethnic wear storefront for curated lehengas, suits, sarees, shararas, kurtas, and dupattas.
        The codebase is structured so catalog, checkout, shipment, and account features can evolve independently.
      </p>
    </section>
  );
}
