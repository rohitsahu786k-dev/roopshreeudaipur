import Image from "next/image";
import Link from "next/link";
import type { PublicStorefrontPage } from "@/lib/storefrontPages";

export function StorefrontPageRenderer({ page }: { page: PublicStorefrontPage }) {
  const sections = (page.sections ?? []).filter((section) => section.isActive !== false);

  return (
    <main className="bg-white">
      <section className="border-b border-black/10 bg-[#f7f7f7] px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">{page.title}</h1>
          {page.excerpt ? <p className="mt-4 max-w-3xl text-base leading-8 text-ink/65">{page.excerpt}</p> : null}
        </div>
      </section>
      <div className="mx-auto max-w-4xl px-4 py-10">
        {sections.map((section, index) => (
          <section key={index} className="mb-10 last:mb-0">
            {section.image ? (
              <div className="relative mb-6 aspect-[16/7] overflow-hidden bg-neutral">
                <Image src={section.image} alt={section.title ?? page.title} fill className="object-cover" sizes="100vw" />
              </div>
            ) : null}
            {section.title ? <h2 className="text-2xl font-bold text-ink">{section.title}</h2> : null}
            {section.subtitle ? <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-ink/50">{section.subtitle}</p> : null}
            {section.body ? <div className="mt-4 space-y-4 leading-8 text-ink/70 [&_a]:font-semibold [&_a]:text-primary [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-xl [&_h3]:font-bold [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc" dangerouslySetInnerHTML={{ __html: section.body }} /> : null}
            {section.ctaHref ? (
              <Link href={section.ctaHref} className="mt-5 inline-flex bg-ink px-5 py-3 text-xs font-bold uppercase tracking-widest text-white">
                {section.ctaLabel ?? "Learn more"}
              </Link>
            ) : null}
          </section>
        ))}
      </div>
    </main>
  );
}
