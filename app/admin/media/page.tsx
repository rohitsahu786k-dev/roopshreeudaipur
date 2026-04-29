import { requireRole } from "@/lib/auth";
import MediaLibraryClient from "@/components/admin/media/MediaLibraryClient";

export const metadata = { title: "Media Library — Admin" };

export default async function MediaPage() {
  await requireRole(["admin"]);
  return <MediaLibraryClient />;
}
