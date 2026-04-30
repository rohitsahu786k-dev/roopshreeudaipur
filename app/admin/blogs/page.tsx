import { AdminWorkingPage } from "@/components/admin/AdminWorkingPage";
import { requireRole } from "@/lib/auth";

export default async function Page() {
  await requireRole(["admin"]);
  return <AdminWorkingPage title="Blogs" description="Manage editorial content, buying guides, festive stories, and SEO-led posts." actions={[{ label: "Pages", href: "/admin/pages" }]} />;
}
