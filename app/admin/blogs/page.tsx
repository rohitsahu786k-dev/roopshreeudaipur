import BlogsClient from "@/components/admin/content/BlogsClient";
import { requireRole } from "@/lib/auth";

export default async function Page() {
  await requireRole(["admin"]);
  return <BlogsClient />;
}
