const fabrics = [
  ["Georgette", "Fluid drape for sarees, party suits, and lightweight lehengas."],
  ["Banarasi Silk", "Rich woven texture for dupattas, sarees, and wedding pieces."],
  ["Cotton", "Breathable daily wear suited for warm weather and office use."],
  ["Chinnon", "Soft sheen and movement for shararas and festive silhouettes."]
];

import type { Metadata } from "next";
import { StorefrontPageRenderer } from "@/components/content/StorefrontPageRenderer";
import { getPublishedPage } from "@/lib/storefrontPages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fabric Guide | Roop Shree",
  description: "Learn about different fabrics used in ethnic wear, their characteristics, and care instructions."
};

export default async function FabricGuidePage() {
  const backendPage = await getPublishedPage("fabric-guide");
  if (backendPage) return <StorefrontPageRenderer page={backendPage} />;

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-5xl font-bold">Fabric guide</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {fabrics.map(([name, description]) => (
          <article key={name} className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-2xl font-bold">{name}</h2>
            <p className="mt-3 leading-7 text-ink/70">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
