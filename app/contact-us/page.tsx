import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | Roop Shree",
  description: "Get in touch with our customer support team. We're here to help with any questions about our products and services.",
  openGraph: {
    title: "Contact Us | Roop Shree",
    description: "Reach out to our support team"
  }
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-5xl font-bold">Contact us</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <ContactForm />
        <aside className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="font-serif text-2xl font-bold">Support</h2>
          <p className="mt-4 leading-7 text-ink/70">Email marketingpwspl@gmail.com or WhatsApp for order, sizing, and shipment help.</p>
        </aside>
      </div>
    </section>
  );
}
