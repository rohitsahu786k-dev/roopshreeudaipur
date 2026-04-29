import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-serif text-6xl font-bold">404</h1>
      <p className="mt-4 text-lg text-ink/70">This page is not available.</p>
      <Link href="/shop" className="focus-ring mt-8 inline-block rounded bg-primary px-5 py-3 font-bold text-white">
        Go to shop
      </Link>
    </section>
  );
}
