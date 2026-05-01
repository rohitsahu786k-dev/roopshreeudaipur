import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Information | Roop Shree",
  description: "Details about our shipping and delivery processes.",
};

export default function ShippingPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold uppercase tracking-wide text-ink">Shipping Information</h1>
      </div>

      <div className="prose prose-sm max-w-none text-ink/80 prose-headings:font-semibold prose-headings:uppercase prose-headings:text-ink">
        <h2>Domestic Shipping (India)</h2>
        <p>We offer FREE shipping on all orders above Rs. 2,999 across India. Standard delivery takes 5-7 business days. For customized or made-to-order items, shipping may take up to 3-4 weeks.</p>

        <h2>International Shipping</h2>
        <p>We ship worldwide. Shipping costs are calculated at checkout based on the destination and package weight. International deliveries typically take 10-15 business days. Customs duties and taxes may apply and are the responsibility of the customer.</p>

        <h2>Order Tracking</h2>
        <p>Once your order is shipped, you will receive a tracking link via email and SMS. You can also track your order through the Track Order page on our website.</p>
      </div>
    </main>
  );
}
