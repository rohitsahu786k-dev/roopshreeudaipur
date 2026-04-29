import { requireRole } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["admin"]);

  return <AdminShell user={user}>{children}</AdminShell>;
}
