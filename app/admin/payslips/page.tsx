import { AdminShell } from "@/components/admin/AdminShell";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import PayslipsClient from "@/components/admin/payslips/PayslipsClient";

export default async function PayslipsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/account");

  return (
    <AdminShell user={user}>
      <PayslipsClient />
    </AdminShell>
  );
}
