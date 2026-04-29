const rows = [
  ["XS", "32", "26", "34"],
  ["S", "34", "28", "36"],
  ["M", "36", "30", "38"],
  ["L", "38", "32", "40"],
  ["XL", "40", "34", "42"],
  ["XXL", "42", "36", "44"]
];

export const metadata = {
  title: "Size Guide"
};

export default function SizeGuidePage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-5xl font-bold">Size guide</h1>
      <div className="mt-8 overflow-x-auto rounded-lg border border-black/10 bg-white">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-neutral">
            <tr>
              {["Size", "Bust", "Waist", "Hip"].map((head) => (
                <th key={head} className="px-4 py-3 font-bold">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="border-t border-black/10">
                {row.map((cell) => (
                  <td key={cell} className="px-4 py-3">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
