import { requireRole } from "@/lib/auth";
import AttributesClient from "@/components/admin/attributes/AttributesClient";

export default async function AttributesPage() {
  await requireRole(["admin"]);
  return <AttributesClient />;
}
