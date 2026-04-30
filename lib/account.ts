import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function requireAccountUser() {
  const session = await getCurrentUser();
  if (!session) {
    return { error: NextResponse.json({ error: "Authentication is required" }, { status: 401 }) };
  }

  await connectToDatabase();
  const user = await User.findById(session.id);
  if (!user || user.deletedAt) {
    return { error: NextResponse.json({ error: "Account is unavailable" }, { status: 401 }) };
  }

  return { session, user };
}

export function publicProfile(user: any) {
  if (!user) return null;

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    avatar: user.avatar ?? "",
    emailVerified: Boolean(user.emailVerified),
    phoneVerified: Boolean(user.phoneVerified),
    pendingEmail: user.pendingEmail ?? "",
    pendingPhone: user.pendingPhone ?? "",
    role: user.role,
    settings: user.settings ?? {}
  };
}

export function normalizeAddress(input: Record<string, unknown>) {
  return {
    label: String(input.label ?? input.type ?? "Address").trim(),
    type: input.type === "billing" ? "billing" : "shipping",
    fullName: String(input.full_name ?? input.fullName ?? "").trim(),
    phone: String(input.phone ?? "").trim(),
    line1: String(input.address_line1 ?? input.line1 ?? "").trim(),
    line2: String(input.address_line2 ?? input.line2 ?? "").trim(),
    city: String(input.city ?? "").trim(),
    state: String(input.state ?? "").trim(),
    country: String(input.country ?? "India").trim(),
    postalCode: String(input.postal_code ?? input.postalCode ?? input.pincode ?? "").trim(),
    pincode: String(input.postal_code ?? input.postalCode ?? input.pincode ?? "").trim(),
    landmark: String(input.landmark ?? "").trim(),
    isDefault: Boolean(input.is_default ?? input.isDefault),
    isDefaultShipping: Boolean(input.isDefaultShipping),
    isDefaultBilling: Boolean(input.isDefaultBilling)
  };
}

export function validateAddress(address: ReturnType<typeof normalizeAddress>) {
  const required = ["fullName", "phone", "line1", "city", "state", "country", "postalCode"] as const;
  const missing = required.find((field) => !address[field]);
  return missing ? `${missing} is required` : "";
}

export async function verifyPassword(user: { password: string }, password: string) {
  if (!password) return false;
  return bcrypt.compare(password, user.password);
}
