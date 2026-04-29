import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type DashboardCardProps = {
  title: string;
  value: string;
  note?: string;
  icon: LucideIcon;
  children?: ReactNode;
};

export function DashboardCard({ title, value, note, icon: Icon, children }: DashboardCardProps) {
  return (
    <article className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-ink/60">{title}</p>
          <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded bg-primary/10 text-primary">
          <Icon size={22} />
        </span>
      </div>
      {note ? <p className="mt-3 text-sm leading-6 text-ink/65">{note}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </article>
  );
}
