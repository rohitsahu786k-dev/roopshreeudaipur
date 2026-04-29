import Link from "next/link";
import { CreditCard, Heart, MapPin, PackageCheck, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { AuthPanel } from "@/components/account/AuthPanel";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Login & Register | Roop Shree",
  description: "Sign in to your Roop Shree account to track orders, manage addresses, and enjoy faster checkout.",
  robots: {
    index: false
  }
};

const accountBenefits = [
  { icon: PackageCheck, title: "Track Orders", text: "Follow every order from confirmation to Shiprocket delivery." },
  { icon: Heart, title: "Wishlist", text: "Save designer edits, bridal picks, and festive looks." },
  { icon: MapPin, title: "Saved Addresses", text: "Keep checkout fast with secure address profiles." },
  { icon: CreditCard, title: "Faster Checkout", text: "Use saved details for a smoother payment experience." }
];

export default async function AccountPage() {
  const user = await getCurrentUser();

  return (
    <section className="bg-[#f8f8f8]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_460px] lg:items-start">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">My Account</p>
          <h1 className="mt-3 text-4xl font-semibold uppercase tracking-wide">Sign in for a tailored shopping experience</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/65">
            Manage orders, addresses, wishlist items, and dashboard access from one secure Roop Shree account.
          </p>

          {user ? (
            <div className="mt-7 border border-black/10 bg-white p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 text-primary" size={22} />
                <div>
                  <p className="font-bold">Signed in as {user.name}</p>
                  <p className="mt-1 text-sm text-ink/60">{user.email}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href="/dashboard" className="focus-ring bg-ink px-4 py-2 text-sm font-bold uppercase tracking-wide text-white">
                      User Dashboard
                    </Link>
                    {user.role === "manager" || user.role === "admin" ? (
                      <Link href="/manager" className="focus-ring border border-black/15 bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide">
                        Manager Dashboard
                      </Link>
                    ) : null}
                    {user.role === "admin" ? (
                      <Link href="/admin" className="focus-ring border border-black/15 bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide">
                        Admin Dashboard
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {accountBenefits.map((benefit) => (
              <article key={benefit.title} className="border border-black/10 bg-white p-5">
                <benefit.icon className="text-primary" size={24} />
                <h2 className="mt-4 text-sm font-bold uppercase tracking-wide">{benefit.title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink/60">{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>

        <AuthPanel />
      </div>
    </section>
  );
}
