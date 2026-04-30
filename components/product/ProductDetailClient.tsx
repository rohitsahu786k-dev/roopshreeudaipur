"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ChevronDown, Heart, LocateFixed, PackageCheck, Play, RotateCcw, ShieldCheck, ShoppingBag, Star, Truck, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ProductMediaPlayer } from "@/components/product/ProductMediaPlayer";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductVideoPopup } from "@/components/product/ProductVideoPopup";
import { SizeGuidePopup } from "@/components/product/SizeGuidePopup";
import { useCommerce } from "@/components/providers/CommerceProvider";
import type { Product } from "@/lib/catalog";
import { coupons } from "@/lib/coupons";

type ProductDetailClientProps = {
  product: Product;
  related: Product[];
};

function getDeliveryMessage(pincode: string) {
  if (!/^\d{6}$/.test(pincode)) return "Enter a valid 6 digit pincode.";
  const fastMetroCodes = ["110", "400", "560", "700", "600", "302", "313"];
  const prefix = pincode.slice(0, 3);
  return fastMetroCodes.includes(prefix) ? "Estimated delivery in 3-5 business days." : "Estimated delivery in 5-8 business days.";
}

function ProductAccordion({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between bg-[#f1f1f1] px-4 py-4 text-left text-sm font-semibold text-ink">
        {title}
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? <div className="bg-white px-4 py-5 text-sm leading-7 text-ink/65">{children}</div> : null}
    </div>
  );
}

export function ProductDetailClient({ product, related }: ProductDetailClientProps) {
  const [activeImage, setActiveImage] = useState(product.image);
  const [activeMedia, setActiveMedia] = useState<"image" | "video">("image");
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? "");
  const [pincode, setPincode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const { addToCart, formatMoney, applyCoupon, appliedCoupon, setCartOpen, isWishlisted, toggleWishlist } = useCommerce();

  const upsells = useMemo(() => related.slice(0, 4), [related]);
  const productFacts = [
    ["Fabric", product.fabric],
    ["Work type", product.workType],
    ["Occasion", product.occasion.join(", ")],
    ["Wash care", product.washCare],
    ["SKU", product.sku ?? `RS-${product.slug.slice(0, 6).toUpperCase()}`],
    ["Dispatch", product.dispatchTime ?? "Ready to ship in 3-7 business days"]
  ].filter(([, value]) => Boolean(value));
  const includedItems = product.includedItems ?? ["Main outfit", "Matching dupatta where applicable", "Boutique quality check"];
  const careInstructions = product.careInstructions ?? [product.washCare, "Steam iron on low heat from reverse side", "Store heavy work outfits in a breathable garment bag"];
  const moreInfoItems = [
    { label: "Occasion", value: product.occasion.join(", ") },
    { label: "Available sizes", value: product.sizes.join(", ") },
    { label: "Available colours", value: product.colors.map((color) => color.name).join(", ") },
    ...(product.moreInformation ?? [])
  ];

  function checkDelivery() {
    setDeliveryMessage(getDeliveryMessage(pincode));
  }

  function fetchLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Location is not supported on this browser.");
      return;
    }

    setLocationStatus("Fetching location...");
    navigator.geolocation.getCurrentPosition(
      () => {
        setPincode("313001");
        setDeliveryMessage("Location detected near Udaipur. Estimated delivery in 3-5 business days.");
        setLocationStatus("Location detected.");
      },
      () => setLocationStatus("Allow location permission or enter pincode manually.")
    );
  }

  return (
    <section className="bg-[#f8f8f8]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-[86px_1fr]">
            <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:block sm:space-y-3">
              {product.gallery.map((image) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => {
                    setActiveImage(image);
                    setActiveMedia("image");
                  }}
                  className={`relative h-24 w-20 shrink-0 overflow-hidden border bg-white ${activeMedia === "image" && activeImage === image ? "border-primary" : "border-black/10"}`}
                >
                  <Image src={image} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
              {product.videoUrl ? (
                <button
                  type="button"
                  onClick={() => setActiveMedia("video")}
                  className={`relative grid h-24 w-20 shrink-0 place-items-center overflow-hidden border bg-black text-white ${activeMedia === "video" ? "border-primary" : "border-black/10"}`}
                >
                  <Image src={product.image} alt="" fill className="object-cover opacity-50" sizes="80px" />
                  <Play size={22} fill="currentColor" />
                </button>
              ) : null}
            </div>
            <div className="relative order-1 aspect-[4/5] overflow-hidden bg-white sm:order-2">
              {activeMedia === "video" && product.videoUrl ? (
                <ProductMediaPlayer url={product.videoUrl} active />
              ) : (
                <Image src={activeImage} alt={product.name} fill priority className="object-cover" sizes="(min-width: 1024px) 52vw, 100vw" />
              )}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow ${isWishlisted(product.slug) ? "text-primary" : "text-ink"}`}
                aria-label={isWishlisted(product.slug) ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={20} fill={isWishlisted(product.slug) ? "currentColor" : "none"} />
              </button>
              <div className="absolute left-4 top-4 bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">Roop Shree Pick</div>
            </div>
          </div>

          <div className="bg-white p-5 md:p-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">{product.category.replace("-", " ")}</p>
            <h1 className="mt-3 text-3xl font-semibold uppercase leading-tight tracking-wide">{product.name}</h1>
            <p className="mt-2 text-sm text-ink/60">{product.shortDescription}</p>
            <div className="mt-4 flex items-center gap-2 text-accent">
              <Star size={18} fill="currentColor" />
              <span className="font-bold">{product.rating}</span>
              <span className="text-sm text-ink/55">{product.reviewCount} reviews</span>
            </div>
            <div className="mt-5 flex items-end gap-3">
              <p className="text-3xl font-bold text-primary">{formatMoney(product.price)}</p>
              <p className="text-lg text-ink/40 line-through">{formatMoney(product.comparePrice)}</p>
            </div>
            <p className="mt-2 text-xs font-semibold text-ink/55">Inclusive of all taxes. Shipping calculated at checkout.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Boutique quality check", "Secure checkout", "Styling support"].map((label) => (
                <span key={label} className="border border-black/10 bg-neutral px-3 py-2 text-xs font-bold uppercase tracking-wide text-ink/55">{label}</span>
              ))}
            </div>

            <div className="mt-7 grid gap-5">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold uppercase tracking-wide">Select Size</p>
                  <button type="button" onClick={() => setSizeGuideOpen(true)} className="text-xs font-bold text-primary hover:underline">Size Guide</button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`focus-ring border px-4 py-2 text-sm font-semibold ${selectedSize === size ? "border-ink bg-ink text-white" : "border-black/15 bg-white"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-wide">Select Color</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color.name)}
                      className={`focus-ring flex items-center gap-2 border px-3 py-2 text-sm font-semibold ${selectedColor === color.name ? "border-ink" : "border-black/15"}`}
                    >
                      <span className="h-5 w-5 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="focus-ring inline-flex items-center justify-center gap-2 border border-ink px-5 py-3 font-bold uppercase tracking-wide hover:bg-neutral"
                onClick={() => {
                  addToCart(product, { size: selectedSize, color: selectedColor });
                  setCartOpen(true);
                }}
              >
                <ShoppingBag size={18} /> Add To Bag
              </button>
              <Link href="/checkout" className="focus-ring inline-flex items-center justify-center gap-2 bg-primary px-5 py-3 font-bold uppercase tracking-wide text-white hover:bg-primary-dark">
                <Zap size={18} /> Buy Now
              </Link>
            </div>

            <section className="mt-7 border border-black/10 bg-[#fafafa] p-4">
              <h2 className="text-sm font-bold uppercase tracking-wide">Available Offers</h2>
              <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-1">
                {coupons.map((coupon) => (
                  <button
                    key={coupon.code}
                    type="button"
                    onClick={() => applyCoupon(coupon.code)}
                    className="min-w-[220px] snap-start border border-black/15 bg-white p-4 text-left"
                  >
                    <span className="text-sm font-black text-primary">{coupon.code}</span>
                    <span className="mt-1 block text-sm font-bold">{coupon.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-ink/60">{coupon.description}</span>
                  </button>
                ))}
              </div>
              {appliedCoupon ? <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary"><BadgeCheck size={16} /> {appliedCoupon.code} applied to your cart.</p> : null}
            </section>

            <section className="mt-7 border border-black/10 p-4">
              <h2 className="text-sm font-bold uppercase tracking-wide">Check Delivery Date</h2>
              <div className="mt-3 flex gap-2">
                <input
                  value={pincode}
                  onChange={(event) => setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter pincode"
                  className="focus-ring min-w-0 flex-1 border border-black/15 px-3 py-3 text-sm"
                />
                <button type="button" onClick={checkDelivery} className="focus-ring bg-ink px-5 py-3 text-sm font-bold uppercase text-white">
                  Check
                </button>
              </div>
              <button type="button" onClick={fetchLocation} className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary">
                <LocateFixed size={16} /> Fetch my location automatically
              </button>
              {deliveryMessage ? <p className="mt-3 text-sm font-semibold text-ink/70">{deliveryMessage}</p> : null}
              {locationStatus ? <p className="mt-1 text-xs text-ink/55">{locationStatus}</p> : null}
            </section>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, label: "Secure payments" },
                { icon: RotateCcw, label: "Easy returns" },
                { icon: Truck, label: "Tracked shipping" }
              ].map((item) => (
                <div key={item.label} className="border border-black/10 p-3 text-center">
                  <item.icon className="mx-auto text-primary" size={22} />
                  <p className="mt-2 text-xs font-bold uppercase tracking-wide">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1fr]">
          <div className="bg-white p-6">
            <h2 className="text-lg font-semibold uppercase tracking-wide">At a glance</h2>
            <dl className="mt-5 grid gap-3 text-sm">
              {productFacts.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-black/10 pb-3">
                  <dt className="font-bold">{label}</dt>
                  <dd className="text-right text-ink/60">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-sm font-semibold text-ink/60">Seller: <span className="text-ink">{product.seller ?? "ROOP SHREE UDAIPUR"}</span></p>
          </div>
          <div className="bg-white p-6">
            <h2 className="text-lg font-semibold uppercase tracking-wide">Complete The Look</h2>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {upsells.slice(0, 2).map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 bg-white">
          <ProductAccordion title="Product Description" defaultOpen>
            <p>{product.description}</p>
            <ul className="mt-4 grid gap-2">
              {includedItems.map((item) => <li key={item}>- {item}</li>)}
            </ul>
          </ProductAccordion>
          <ProductAccordion title="Shipping & Return">
            <p>{product.dispatchTime ?? "Ready to ship in 3-7 business days"}. Shipping is tracked through our logistics partners.</p>
            <p className="mt-3">{product.returnPolicy ?? "Returns and exchanges are accepted as per product eligibility. Custom stitched and altered outfits may not be returnable."}</p>
          </ProductAccordion>
          <ProductAccordion title="Fabric and Care">
            <p><strong>Fabric:</strong> {product.fabric}</p>
            <p className="mt-2"><strong>Work:</strong> {product.workType}</p>
            <ul className="mt-3 grid gap-2">
              {careInstructions.map((item) => <li key={item}>- {item}</li>)}
            </ul>
          </ProductAccordion>
          <ProductAccordion title="More Information">
            <dl className="grid gap-3 sm:grid-cols-2">
              {moreInfoItems.map(({ label, value }) => (
                <div key={label} className="border border-black/10 p-3">
                  <dt className="text-xs font-bold uppercase tracking-wide text-ink/45">{label}</dt>
                  <dd className="mt-1 font-semibold text-ink/70">{value}</dd>
                </div>
              ))}
            </dl>
          </ProductAccordion>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-lg font-semibold uppercase tracking-wide">You May Also Like</h2>
            <Link href="/shop" className="text-xs font-bold uppercase tracking-wide text-primary">View All</Link>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {upsells.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>

        <ProductReviews product={product} />

        <div className="mt-8 flex items-center justify-center gap-2 bg-white p-4 text-sm font-semibold">
          <PackageCheck className="text-primary" size={20} /> Authentic designer products. Quality checked before dispatch.
        </div>
      </div>

      <SizeGuidePopup open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} notes={product.sizeGuideNotes} />
      <ProductVideoPopup url={product.videoUrl} />
      <div className="fixed inset-x-0 bottom-[64px] z-40 border-t border-black/10 bg-white p-3 shadow-[0_-8px_20px_rgba(0,0,0,0.08)] md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold uppercase">{product.name}</p>
            <p className="text-sm font-bold text-primary">{formatMoney(product.price)}</p>
          </div>
          <button
            type="button"
            className="focus-ring bg-ink px-4 py-3 text-xs font-bold uppercase text-white"
            onClick={() => {
              addToCart(product, { size: selectedSize, color: selectedColor });
              setCartOpen(true);
            }}
          >
            Add To Bag
          </button>
        </div>
      </div>
    </section>
  );
}
