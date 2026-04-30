import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Instagram, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { roopShreeBusiness } from "@/lib/business";

export const metadata: Metadata = {
  title: "Contact Us | Roop Shree Udaipur",
  description: "Contact Roop Shree Udaipur for bridal lehengas, sarees, suits, sizing help, order support, WhatsApp assistance, and studio hours.",
  openGraph: {
    title: "Contact Roop Shree Udaipur",
    description: "Reach our Udaipur ethnic wear studio for product, order, and styling support."
  }
};

const whatsappHref = `https://wa.me/${roopShreeBusiness.whatsappNumber}?text=${encodeURIComponent("Hi Roop Shree, I need help with an outfit enquiry.")}`;

const contactCards = [
  {
    title: "Call the studio",
    value: roopShreeBusiness.supportPhone,
    detail: "Order updates, urgent sizing questions, and consultation help.",
    href: `tel:${roopShreeBusiness.supportPhone.replace(/\s/g, "")}`,
    icon: Phone
  },
  {
    title: "Email support",
    value: roopShreeBusiness.supportEmail,
    detail: "Best for detailed requirements, invoices, and collaboration enquiries.",
    href: `mailto:${roopShreeBusiness.supportEmail}`,
    icon: Mail
  },
  {
    title: "Visit us",
    value: roopShreeBusiness.location,
    detail: roopShreeBusiness.address,
    href: "https://www.google.com/maps/search/?api=1&query=Roop%20Shree%20Udaipur",
    icon: MapPin
  }
];

export default function ContactPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-black/10 bg-[#f7f7f7]">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/55">Roop Shree Udaipur</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
              Let us help you find the right occasion look.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-ink/68">
              Connect with our team for order support, bridal appointments, custom sizing, styling advice, or product availability. We reply quickly on WhatsApp during studio hours.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href={whatsappHref}
                className="inline-flex items-center justify-center gap-2 bg-ink px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-white transition hover:bg-ink/85"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={16} />
                WhatsApp Us
              </Link>
              <Link
                href={`tel:${roopShreeBusiness.supportPhone.replace(/\s/g, "")}`}
                className="inline-flex items-center justify-center gap-2 border border-black/20 bg-white px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-ink transition hover:border-ink"
              >
                <Phone size={16} />
                Call Studio
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border border-black/10 bg-white p-5 shadow-sm">
              <Clock size={22} strokeWidth={1.7} />
              <h2 className="mt-4 text-sm font-bold uppercase tracking-widest">Studio Hours</h2>
              <div className="mt-4 space-y-3 text-sm">
                {roopShreeBusiness.businessHours.map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-4 border-b border-black/8 pb-3 last:border-0 last:pb-0">
                    <span className="font-medium text-ink/60">{item.label}</span>
                    <span className="text-right font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-black/10 bg-white p-5 shadow-sm">
              <Sparkles size={22} strokeWidth={1.7} />
              <h2 className="mt-4 text-sm font-bold uppercase tracking-widest">Best For</h2>
              <div className="mt-4 space-y-2 text-sm leading-6 text-ink/68">
                <p>Bridal appointments</p>
                <p>Custom sizing guidance</p>
                <p>Ready-to-ship availability</p>
                <p>Order and delivery support</p>
              </div>
            </div>
            <div className="border border-black/10 bg-white p-5 shadow-sm sm:col-span-2">
              <ShieldCheck size={22} strokeWidth={1.7} />
              <h2 className="mt-4 text-sm font-bold uppercase tracking-widest">Quick Response Promise</h2>
              <p className="mt-3 text-sm leading-7 text-ink/68">
                Messages sent through the form are routed to our support desk. For same-day outfit checks, WhatsApp is the fastest way to reach us.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {contactCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href} className="group border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-soft" target={card.href.startsWith("http") ? "_blank" : undefined} rel={card.href.startsWith("http") ? "noreferrer" : undefined}>
                <div className="flex h-11 w-11 items-center justify-center border border-black/15 bg-[#f7f7f7]">
                  <Icon size={20} strokeWidth={1.7} />
                </div>
                <h2 className="mt-5 text-sm font-bold uppercase tracking-widest">{card.title}</h2>
                <p className="mt-2 text-base font-bold">{card.value}</p>
                <p className="mt-3 text-sm leading-6 text-ink/62">{card.detail}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="border border-black/10 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/50">Send an enquiry</p>
              <h2 className="mt-2 text-3xl font-bold">Tell us what you need</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/62">
                Share the occasion, preferred category, timeline, and budget so our team can guide you with relevant options.
              </p>
            </div>
            <ContactForm />
          </div>

          <aside className="space-y-4">
            <div className="border border-black/10 bg-[#f7f7f7] p-6">
              <h2 className="text-sm font-bold uppercase tracking-widest">WhatsApp Concierge</h2>
              <p className="mt-3 text-sm leading-7 text-ink/65">
                Send screenshots, product links, measurements, or event dates directly on WhatsApp for faster assistance.
              </p>
              <Link
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-ink px-4 py-3 text-[12px] font-bold uppercase tracking-widest text-white transition hover:bg-ink/85"
              >
                <MessageCircle size={16} />
                Start Chat
              </Link>
            </div>

            <div className="border border-black/10 bg-white p-6">
              <h2 className="text-sm font-bold uppercase tracking-widest">Follow the studio</h2>
              <p className="mt-3 text-sm leading-7 text-ink/65">
                Explore new arrivals, bridal inspiration, and behind-the-scenes updates from Roop Shree Udaipur.
              </p>
              <Link href={roopShreeBusiness.instagramUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide hover:text-ink/60">
                <Instagram size={17} />
                Instagram
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
