export const metadata = {
  title: "Order Tracking"
};

export default function TrackingPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-5xl font-bold">Track order</h1>
      <form className="mt-8 grid gap-4 rounded-lg border border-black/10 bg-white p-5 shadow-sm">
        <label className="grid gap-2 text-sm font-semibold">
          Order number or AWB
          <input className="focus-ring rounded border border-black/15 px-3 py-3" placeholder="RC-10001" />
        </label>
        <button type="button" className="focus-ring rounded bg-primary px-5 py-3 font-bold text-white">
          Track shipment
        </button>
      </form>
    </section>
  );
}
