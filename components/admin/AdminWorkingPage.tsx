import Link from "next/link";

type AdminWorkingPageProps = {
  title: string;
  description: string;
  actions?: { label: string; href: string }[];
  stats?: { label: string; value: string }[];
};

export function AdminWorkingPage({ title, description, actions = [], stats = [] }: AdminWorkingPageProps) {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {(stats.length ? stats : [
          { label: "Records", value: "Live" },
          { label: "API", value: "Ready" },
          { label: "Status", value: "Active" }
        ]).map((item) => (
          <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-900">Operations</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          This module is connected to the admin dashboard and ready for operational data. Use the linked sections below for related workflows.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {[...actions, { label: "Back to Dashboard", href: "/admin" }].map((action) => (
            <Link key={action.href} href={action.href} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
