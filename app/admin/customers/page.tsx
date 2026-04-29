import { requireRole } from "@/lib/auth";
import CustomersClient from "@/components/admin/customers/CustomersClient";

export const metadata = { title: "Customers — Admin" };

export default async function CustomersPage() {
  await requireRole(["admin"]);
  return <CustomersClient />;
}
