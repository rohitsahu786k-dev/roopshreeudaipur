import { requireRole } from "@/lib/auth";
import Link from "next/link";
import { ChevronLeft, Construction } from "lucide-react";

export default async function Page() {
  await requireRole(["admin"]);
  return (
    <div className="flex flex-col items-center justify-center min-h-96 p-6 text-center">
      <Construction className="h-12 w-12 text-gray-300 mb-4" />
      <h2 className="text-lg font-semibold text-gray-900">Coming Soon</h2>
      <p className="mt-2 text-sm text-gray-500">This section is under development.</p>
      <Link href="/admin" className="mt-4 flex items-center gap-1 text-sm text-primary hover:underline">
        <ChevronLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
    </div>
  );
}
