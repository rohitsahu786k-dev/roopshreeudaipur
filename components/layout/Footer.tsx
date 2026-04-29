import {
  Facebook,
  Headphones,
  Instagram,
  Mail,
  MessageCircle,
  Plane,
  Shirt,
  Smartphone,
  Youtube
} from "lucide-react";
import Link from "next/link";

const aboutLinks = ["Purple Style Labs", "Roop Shree Pop Up Show", "Studio Locator", "First Look"];
const quickLinks = [
  "Bestsellers",
  "Exclusive",
  "Sale",
  "Gift Cards",
  "Celebrity Closet",
  "Personal Styling",
  "Occasions",
  "Client Diaries"
];
const customerLinks = [
  "Shipping Information",
  "Returns & Exchange",
  "Terms & Conditions",
  "Privacy & Cookie Policies",
  "FAQs",
  "Site Map"
];

const categoryBlocks = [
  {
    title: "Explore the incredible Ready To Ship Indian Outfits designer collection at Roop Shree",
    text:
      "Ready to wear clothes are now available at your doorstep. Roop Shree brings Indian ethnic wear, festive styles, bridal looks, lehengas, sarees, suits, kurtas, anarkalis, shararas, and accessories with convenient shopping and reliable support."
  },
  {
    title: "Browse ready to ship lehengas from top fashion houses",
    text:
      "Discover signature occasion looks with embroidered lehengas, elegant sarees, premium kurta sets, and coordinated dupattas for weddings, festivals, parties, office celebrations, and everyday dressing."
  },
  {
    title: "Related categories",
    text:
      "Kurtas for Women | Bridal Saree | Bridal Anarkali | Capes for Women | Tunics for Women | Western Wear for Women | Sharara Sets | Gown Saree | Resort Wear | Festive Offers"
  }
];

const designerRows = [
  {
    title: "Top Designers for Womenswear",
    items:
      "Raw Mango | Anita Dongre | Masaba | Manish Malhotra | Tarun Tahiliani | Payal Singhal | Ridhi Mehra | Papa Don't Preach | Seema Gujral | Varun Bahl | House of Masaba | Arpita Mehta"
  },
  {
    title: "Top Categories in Womenswear",
    items:
      "Lehengas | Anarkalis | Kurta Sets | Sarees | Dresses | Gown | Sharara Sets | Tops | Kaftans | Tunics | Bridesmaid Lehengas | Dhoti Pants | Dupattas | Nightwear | Blouses"
  },
  {
    title: "Top Categories in Menswear",
    items:
      "Kurta Sets | Nehru Jacket | Shirts | Sherwani | Kurtas | Suits | Pants | Jackets | Waist Coat | Tie Pins | Blazers | Jeans | Tuxedo | Angrakha | Bandhgala | Footwear"
  },
  {
    title: "Top Categories in Jewellery & Accessories",
    items:
      "Necklaces | Earrings | Cuffs | Bracelets | Rings | Bangles | Brooches | Nose Rings | Maangtikas | Anklets | Pendants | Shoes | Sandals | Belts | Clutches | Handbags"
  },
  {
    title: "Top Categories in Kidswear",
    items:
      "Girls Designer Clothes | Lehenga | Embroidered Lehenga | Sharara Suits | Kurta Set | Boys Designer Clothes | Nehru Jackets | Sherwani | Blazer | Shirt | Dhoti Pants"
  }
];

function FooterLink({ label }: { label: string }) {
  return (
    <Link href="/shop" className="block text-[13px] font-medium uppercase leading-7 tracking-wide text-ink hover:text-primary">
      {label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-[#f7f7f7] text-ink">
      <div className="mx-auto max-w-[1728px] px-6 py-8 lg:px-20">
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_0.9fr_1.25fr]">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest">About Us</h2>
            <div className="mt-3">
              {aboutLinks.map((link) => (
                <FooterLink key={link} label={link} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest">Quick Links</h2>
            <div className="mt-3">
              {quickLinks.map((link) => (
                <FooterLink key={link} label={link} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest">Customer Care</h2>
            <div className="mt-3">
              {customerLinks.map((link) => (
                <FooterLink key={link} label={link} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest">Contact Us</h2>
            <div className="mt-4 space-y-2 text-[13px] font-medium">
              <Link href="tel:+917847848484" className="flex items-center gap-2 hover:text-primary">
                <Smartphone size={14} /> +91 78478 48484
              </Link>
              <Link href="https://wa.me/918488070070" className="flex items-center gap-2 hover:text-primary">
                <MessageCircle size={14} /> Whatsapp us on +91 84880 70070
              </Link>
              <Link href="mailto:marketingpwspl@gmail.com" className="flex items-center gap-2 hover:text-primary">
                <Mail size={14} /> marketingpwspl@gmail.com
              </Link>
            </div>
            <h3 className="mt-6 text-sm font-bold uppercase tracking-widest">Follow Us</h3>
            <div className="mt-3 flex items-center gap-3">
              <Link href="#" aria-label="Facebook" className="hover:text-primary">
                <Facebook size={17} />
              </Link>
              <Link href="#" aria-label="Instagram" className="hover:text-primary">
                <Instagram size={17} />
              </Link>
              <Link href="#" aria-label="Pinterest" className="text-sm font-black hover:text-primary">
                P
              </Link>
              <Link href="#" aria-label="YouTube" className="hover:text-primary">
                <Youtube size={18} />
              </Link>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest">Get Roop Shree App</h2>
            <p className="mt-5 max-w-sm text-[13px] font-medium leading-7">
              We will send you a link on your Email or Phone, open it on your phone and download the App.
            </p>
            <div className="mt-4 flex gap-5 text-[12px] font-medium">
              <label className="flex items-center gap-2">
                <input type="radio" name="app-link" defaultChecked className="h-3.5 w-3.5 accent-primary" /> Email
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="app-link" className="h-3.5 w-3.5 accent-primary" /> Phone
              </label>
            </div>
            <form className="mt-4 flex max-w-sm">
              <label htmlFor="app-link-input" className="sr-only">
                Email Address
              </label>
              <input
                id="app-link-input"
                type="email"
                placeholder="Email Address"
                className="focus-ring min-w-0 flex-1 border border-black/20 bg-white px-3 py-2 text-[11px]"
              />
              <button type="submit" className="focus-ring bg-ink px-4 py-2 text-[10px] font-bold uppercase text-white">
                Share App Link
              </button>
            </form>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded bg-black px-4 py-2 text-xs font-bold leading-tight text-white">Download on the<br />App Store</span>
              <span className="rounded bg-black px-4 py-2 text-xs font-bold leading-tight text-white">Get it on<br />Google Play</span>
            </div>
          </section>
        </div>

        <div className="mt-12 grid border-y border-black/15 py-10 md:grid-cols-3">
          <div className="flex items-center justify-center gap-6 py-4">
            <Headphones size={28} strokeWidth={1.5} />
            <p className="text-sm font-semibold uppercase leading-6 tracking-wide">24x7<br />Customer Support</p>
          </div>
          <div className="flex items-center justify-center gap-6 py-4">
            <Shirt size={30} strokeWidth={1.5} />
            <p className="text-sm font-semibold uppercase leading-6 tracking-wide">500+<br />Designers</p>
          </div>
          <div className="flex items-center justify-center gap-6 py-4">
            <Plane size={30} strokeWidth={1.5} />
            <p className="text-sm font-semibold uppercase leading-6 tracking-wide">Free International<br />Shipping*</p>
          </div>
        </div>

        <div className="grid gap-8 border-b border-black/15 py-10 lg:grid-cols-[1fr_1.35fr]">
          <section className="text-center">
            <h2 className="text-lg font-semibold uppercase tracking-wide">Completely Safe and Secure Payment Method</h2>
            <p className="mt-2 text-[12px] font-medium">We accept Netbanking, all major credit cards. We also accept orders with cash payment</p>
            <div className="mt-3 flex justify-center gap-3 text-xs font-black text-primary">
              <span>VISA</span>
              <span>mastercard</span>
              <span>AMEX</span>
              <span>PayPal</span>
            </div>
          </section>

          <section className="border-black/15 lg:border-l lg:pl-12">
            <h2 className="text-[12px] font-bold">Sign up to get exclusive style tips, new arrival updates and a special discount code.</h2>
            <form className="mt-4 flex max-w-xl">
              <label htmlFor="newsletter-email" className="sr-only">
                Newsletter email
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Here's my Email"
                className="focus-ring min-w-0 flex-1 border border-black/20 bg-white px-4 py-3 text-[12px]"
              />
              <button type="submit" className="focus-ring bg-ink px-7 py-3 text-sm font-bold text-white">
                Sign Up
              </button>
            </form>
          </section>
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto max-w-[1728px] px-6 py-8 text-[11px] font-medium leading-6 text-ink lg:px-20">
          {categoryBlocks.map((block) => (
            <section key={block.title} className="mb-6">
              <h2 className="font-bold">{block.title}</h2>
              <p>{block.text}</p>
            </section>
          ))}

          <div className="mb-5">
            <h2 className="font-bold">Find Your Style by Price and Category</h2>
            <div className="mt-1 grid border border-black sm:grid-cols-2 lg:grid-cols-4">
              {["Sarees Under 15000", "Kurta Sets Under 25000", "Lehengas Under 50000", "Kurtas Under 5000"].map((item) => (
                <Link key={item} href="/shop" className="border-black px-2 py-1 hover:bg-neutral sm:border-r">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {designerRows.map((row) => (
            <section key={row.title} className="mb-5">
              <h2 className="font-bold">{row.title}</h2>
              <p>{row.items}</p>
            </section>
          ))}
        </div>
      </div>
    </footer>
  );
}
