export const metadata = {
  title: "About Us"
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-sm font-bold uppercase tracking-wide text-primary">About us</p>
      <h1 className="mt-2 font-serif text-5xl font-bold">Made for occasion-led dressing</h1>
      <p className="mt-6 text-lg leading-8 text-ink/70">
        Roop Shree is a women&apos;s ethnic wear storefront for curated lehengas, suits, sarees, shararas, kurtas, and dupattas.
        The codebase is structured so catalog, checkout, shipment, and account features can evolve independently.
      </p>
    </section>
  );
}
