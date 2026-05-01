import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Roop Shree",
  description: "Terms and conditions for using the Roop Shree website.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold uppercase tracking-wide text-ink">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-ink/60">Last updated: May 2026</p>
      </div>

      <div className="prose prose-sm max-w-none text-ink/80 prose-headings:font-semibold prose-headings:uppercase prose-headings:text-ink">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>

        <h2>2. Products and Services</h2>
        <p>We strive to display our products as accurately as possible. However, colors and details may vary depending on your screen settings. All products are subject to availability.</p>

        <h2>3. Pricing and Payments</h2>
        <p>All prices are in INR (Indian Rupees) unless otherwise stated. We reserve the right to change prices at any time without notice. Payments are securely processed through our payment gateways.</p>

        <h2>4. Modifications to Service</h2>
        <p>Roop Shree reserves the right to modify or discontinue any service or product without prior notice.</p>
      </div>
    </main>
  );
}
