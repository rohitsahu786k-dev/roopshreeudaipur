const posts = [
  "How to choose a lehenga for a daytime wedding",
  "Cotton suits that work for summer office days",
  "Dupatta draping ideas for festive outfits"
];

export const metadata = {
  title: "Blog"
};

export default function BlogsPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-5xl font-bold">Blog</h1>
      <div className="mt-8 grid gap-4">
        {posts.map((post) => (
          <article key={post} className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-2xl font-bold">{post}</h2>
            <p className="mt-3 text-ink/70">Editorial content model and CRUD can plug into this listing.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
