"use client";

import {
  Facebook,
  Headphones,
  Instagram,
  Mail,
  MessageCircle,
  Plane,
  Shirt,
  Smartphone,
  Youtube,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const roopShreeInstagram = "https://www.instagram.com/roopshreeudaipur/";

const aboutLinks = [
  { label: "About Roop Shree", href: "/about-us" },
  { label: "Studio Locator", href: "/contact-us" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "Fabric Guide", href: "/fabric-guide" }
];

const quickLinks = [
  { label: "Bestsellers", href: "/shop" },
  { label: "New Arrivals", href: "/shop" },
  { label: "Sale", href: "/shop" },
  { label: "Wedding Wear", href: "/shop" },
  { label: "Bridal Lehengas", href: "/shop" },
  { label: "Ready To Ship", href: "/shop" },
  { label: "Blogs", href: "/blogs" },
  { label: "Contact Us", href: "/contact-us" }
];

const customerLinks = [
  { label: "Shipping Information", href: "/contact-us" },
  { label: "Returns & Exchange", href: "/contact-us" },
  { label: "Terms & Conditions", href: "/contact-us" },
  { label: "Privacy Policy", href: "/contact-us" },
  { label: "FAQs", href: "/contact-us" },
  { label: "Track My Order", href: "/tracking-order" }
];

const categoryBlocks = [
  {
    title: "Explore the incredible Ready To Ship Indian Outfits collection at Roop Shree",
    text: "Ready to wear clothes are now available at your doorstep. Roop Shree brings Indian ethnic wear, festive styles, bridal looks, lehengas, sarees, suits, kurtas, anarkalis, shararas, and accessories with convenient shopping and reliable support."
  },
  {
    title: "Browse ready to ship lehengas from top fashion houses",
    text: "Discover signature occasion looks with embroidered lehengas, elegant sarees, premium kurta sets, and coordinated dupattas for weddings, festivals, parties, and everyday dressing."
  },
  {
    title: "Related categories",
    text: "Kurtas for Women | Bridal Saree | Bridal Anarkali | Tunics for Women | Sharara Sets | Gown Saree | Resort Wear | Festive Offers | Rajputi Poshak"
  }
];

function AccordionSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="border-b border-black/10 lg:border-none">
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-sm font-bold uppercase tracking-widest lg:cursor-default lg:pointer-events-none"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {title}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 lg:hidden ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-200 lg:block ${open ? "max-h-[400px] pb-4" : "max-h-0 lg:max-h-none"}`}>
        {children}
      </div>
    </section>
  );
}

function FooterLink({ label, href = "/shop" }: { label: string; href?: string }) {
  return (
    <Link href={href} className="block text-[13px] font-medium uppercase leading-7 tracking-wide text-ink hover:text-primary">
      {label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-[#f7f7f7] text-ink">
      <div className="mx-auto max-w-[1728px] px-4 py-6 lg:px-20 lg:py-8">

        {/* Mobile accordion / Desktop grid */}
        <div className="lg:grid lg:gap-8 lg:grid-cols-[1fr_1fr_1fr_0.9fr_1.25fr]">

          <AccordionSection title="About Us">
            <div>
              {aboutLinks.map((link) => (
                <FooterLink key={link.label} label={link.label} href={link.href} />
              ))}
            </div>
          </AccordionSection>

          <AccordionSection title="Quick Links">
            <div>
              {quickLinks.map((link) => (
                <FooterLink key={link.label} label={link.label} href={link.href} />
              ))}
            </div>
          </AccordionSection>

          <AccordionSection title="Customer Care">
            <div>
              {customerLinks.map((link) => (
                <FooterLink key={link.label} label={link.label} href={link.href} />
              ))}
            </div>
          </AccordionSection>

          <AccordionSection title="Contact Us">
            <div className="space-y-3 text-[13px] font-medium">
              <Link href="tel:+919876543210" className="flex items-center gap-2 hover:text-primary">
                <Smartphone size={14} /> +91 98765 43210
              </Link>
              <Link href="https://wa.me/919876543210" className="flex items-center gap-2 hover:text-primary">
                <MessageCircle size={14} /> WhatsApp Us
              </Link>
              <Link href="mailto:info@roopshreeudaipur.com" className="flex items-center gap-2 hover:text-primary">
                <Mail size={14} /> info@roopshreeudaipur.com
              </Link>
            </div>
            <h3 className="mt-5 text-sm font-bold uppercase tracking-widest">Follow Us</h3>
            <div className="mt-3 flex items-center gap-4">
              <Link href={roopShreeInstagram} aria-label="Instagram" className="hover:text-primary">
                <Instagram size={17} />
              </Link>
              <Link href="#" aria-label="Facebook" className="hover:text-primary">
                <Facebook size={17} />
              </Link>
              <Link href="#" aria-label="YouTube" className="hover:text-primary">
                <Youtube size={18} />
              </Link>
            </div>
          </AccordionSection>

          {/* Newsletter & App — always visible */}
          <section className="border-b border-black/10 py-4 lg:border-none lg:py-0">
            <h2 className="text-sm font-bold uppercase tracking-widest">Stay in the Loop</h2>
            <p className="mt-3 text-[13px] font-medium leading-6">Sign up to get exclusive style tips, new arrival updates and a special discount code.</p>
            <form className="mt-3 flex max-w-sm" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Your email address"
                className="min-w-0 flex-1 border border-black/20 bg-white px-3 py-2.5 text-[12px] focus:outline-none"
              />
              <button type="submit" className="bg-ink px-5 py-2.5 text-[11px] font-bold uppercase text-white hover:bg-ink/85">
                Sign Up
              </button>
            </form>
          </section>
        </div>

        {/* Feature Strip */}
        <div className="mt-6 grid grid-cols-3 divide-x divide-black/15 border-y border-black/15 py-6">
          <div className="flex flex-col items-center justify-center gap-2 px-2 text-center sm:flex-row sm:gap-4">
            <Headphones size={24} strokeWidth={1.5} className="shrink-0" />
            <p className="text-[10px] font-semibold uppercase leading-[1.4] tracking-wide sm:text-xs">24x7<br className="sm:hidden" /> Customer Support</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 px-2 text-center sm:flex-row sm:gap-4">
            <Shirt size={26} strokeWidth={1.5} className="shrink-0" />
            <p className="text-[10px] font-semibold uppercase leading-[1.4] tracking-wide sm:text-xs">500+<br className="sm:hidden" /> Designers</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 px-2 text-center sm:flex-row sm:gap-4">
            <Plane size={24} strokeWidth={1.5} className="shrink-0" />
            <p className="text-[10px] font-semibold uppercase leading-[1.4] tracking-wide sm:text-xs">Free International<br className="sm:hidden" /> Shipping*</p>
          </div>
        </div>

        {/* Payment + Newsletter */}
        <div className="grid gap-6 py-6 border-b border-black/15 lg:grid-cols-[1fr_1.35fr]">
          <section className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wide">Completely Safe and Secure Payment</h2>
            <p className="mt-2 text-[12px] font-medium text-ink/70">We accept Netbanking, all major credit cards, UPI and cash payment</p>
            <div className="mt-3 flex justify-center gap-4 text-xs font-black text-primary">
              <span>VISA</span>
              <span>Mastercard</span>
              <span>AMEX</span>
              <span>PayPal</span>
              <span>UPI</span>
            </div>
          </section>

          <section className="border-black/15 lg:border-l lg:pl-10">
            <h2 className="text-[12px] font-bold">Sign up to get exclusive style tips, new arrival updates and a special discount code.</h2>
            <form className="mt-4 flex max-w-xl" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="footer-newsletter-email" className="sr-only">Newsletter email</label>
              <input
                id="footer-newsletter-email"
                type="email"
                placeholder="Here's my Email"
                className="min-w-0 flex-1 border border-black/20 bg-white px-4 py-3 text-[12px] focus:outline-none"
              />
              <button type="submit" className="bg-ink px-7 py-3 text-sm font-bold text-white hover:bg-ink/85">
                Sign Me Up
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* SEO Footer */}
      <div className="bg-white">
        <div className="mx-auto max-w-[1728px] px-4 py-8 text-[11px] font-medium leading-6 text-ink lg:px-20">
          {categoryBlocks.map((block) => (
            <section key={block.title} className="mb-6">
              <h2 className="font-bold">{block.title}</h2>
              <p>{block.text}</p>
            </section>
          ))}

          <div className="mb-5">
            <h2 className="font-bold">Find Your Style by Price and Category</h2>
            <div className="mt-1 grid border border-black grid-cols-2 sm:grid-cols-4">
              {["Sarees Under 15000", "Kurta Sets Under 25000", "Lehengas Under 50000", "Kurtas Under 5000"].map((item) => (
                <Link key={item} href="/shop" className="border-black px-2 py-1 hover:bg-neutral sm:border-r">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-ink/40">© {new Date().getFullYear()} Roop Shree Udaipur. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
