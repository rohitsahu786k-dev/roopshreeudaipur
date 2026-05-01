import { connectToDatabase } from "@/lib/mongodb";
import { StorefrontPage } from "@/models/StorefrontPage";

export type PublicStorefrontPage = {
  title: string;
  excerpt?: string;
  sections?: { type: string; title?: string; subtitle?: string; body?: string; image?: string; ctaLabel?: string; ctaHref?: string; isActive?: boolean; position?: number }[];
  seo?: { title?: string; description?: string };
};

export async function getPublishedPage(slug: string): Promise<PublicStorefrontPage | null> {
  try {
    if (!process.env.MONGODB_URI) return null;
    await connectToDatabase();
    const page = await StorefrontPage.findOne({ slug, status: "published" }).lean();
    if (!page) return null;
    return {
      title: page.title,
      excerpt: page.excerpt ?? undefined,
      sections: (page.sections ?? []).map((section) => ({
        type: section.type,
        title: section.title ?? undefined,
        subtitle: section.subtitle ?? undefined,
        body: section.body ?? undefined,
        image: section.image ?? undefined,
        ctaLabel: section.ctaLabel ?? undefined,
        ctaHref: section.ctaHref ?? undefined,
        isActive: section.isActive ?? undefined,
        position: section.position ?? 0
      })).sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
      seo: page.seo ? {
        title: page.seo.title ?? undefined,
        description: page.seo.description ?? undefined
      } : undefined
    };
  } catch {
    return null;
  }
}
