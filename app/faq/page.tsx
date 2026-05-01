import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Roop Shree",
  description: "Find answers to common questions about shopping at Roop Shree.",
};

const faqs = [
  {
    q: "How do I know what size to order?",
    a: "Please refer to our detailed Size Guide linked in the footer. If you are between sizes, we recommend sizing up or opting for our custom tailoring service."
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, we ship globally! International shipping costs are calculated at checkout. Please note that customs duties may apply depending on your country."
  },
  {
    q: "Can I customize an outfit?",
    a: "We offer customization for select items. Please contact our support team on WhatsApp before placing your order to discuss customization options."
  },
  {
    q: "How long will my order take to arrive?",
    a: "Ready-to-ship items typically arrive within 5-7 business days domestically. Made-to-order and customized items take 3-4 weeks."
  },
  {
    q: "What is your return policy?",
    a: "We accept returns within 7 days of delivery for non-customized items in their original condition. Please refer to our Returns & Exchange policy page for full details."
  }
];

export default function FAQPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold uppercase tracking-wide text-ink">Frequently Asked Questions</h1>
      </div>

      <div className="space-y-8">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-black/10 pb-6">
            <h2 className="text-lg font-semibold uppercase text-ink">{faq.q}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/75">{faq.a}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center bg-neutral p-8 rounded-lg">
        <h3 className="text-lg font-semibold uppercase">Still have questions?</h3>
        <p className="mt-2 text-sm text-ink/70">Contact our support team at info@roopshreeudaipur.com or WhatsApp us.</p>
      </div>
    </main>
  );
}
