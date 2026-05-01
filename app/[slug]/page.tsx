import { notFound } from "next/navigation";
import { StorefrontPageRenderer } from "@/components/content/StorefrontPageRenderer";
import { getPublishedPage } from "@/lib/storefrontPages";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await getPublishedPage(params.slug);
  return {
    title: page?.seo?.title ?? page?.title ?? "Page | Roop Shree",
    description: page?.seo?.description ?? page?.excerpt ?? "Roop Shree Udaipur"
  };
}

export default async function DynamicStorefrontPage({ params }: { params: { slug: string } }) {
  const page = await getPublishedPage(params.slug);
  if (!page) notFound();
  return <StorefrontPageRenderer page={page} />;
}
