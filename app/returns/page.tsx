import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Exchange | Roop Shree",
  description: "Our return and exchange policy.",
};

export default function ReturnsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold uppercase tracking-wide text-ink">Returns & Exchange</h1>
      </div>

      <div className="prose prose-sm max-w-none text-ink/80 prose-headings:font-semibold prose-headings:uppercase prose-headings:text-ink">
        <h2>7-Day Return Policy</h2>
        <p>We offer a hassle-free 7-day return and exchange policy. If you are not satisfied with your purchase, you can return it within 7 days of delivery for a full refund or exchange.</p>

        <h2>Conditions for Return</h2>
        <ul>
          <li>Items must be unused, unwashed, and in their original condition with all tags attached.</li>
          <li>Customized or made-to-measure outfits cannot be returned or exchanged.</li>
          <li>Sale items are non-returnable.</li>
        </ul>

        <h2>How to initiate a return</h2>
        <p>Please contact our customer support at info@roopshreeudaipur.com or via WhatsApp with your order number and reason for return. Our team will guide you through the process.</p>
      </div>
    </main>
  );
}
