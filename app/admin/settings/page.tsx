import { requireRole } from "@/lib/auth";
import SettingsClient from "@/components/admin/settings/SettingsClient";

export const metadata = { title: "Settings — Admin" };

export default async function SettingsPage() {
  await requireRole(["admin"]);
  return <SettingsClient />;
}
