import type { Metadata } from "next";
import { AccountDashboardClient } from "@/components/account/AccountDashboardClient";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = {
  title: "My Account | Roop Shree",
  description: "Manage your Roop Shree profile, addresses, orders, wishlist, cart, and account preferences.",
  robots: {
    index: false
  }
};

export default async function UserDashboardPage() {
  await requireRole(["user", "manager", "admin"]);
  return <AccountDashboardClient />;
}
