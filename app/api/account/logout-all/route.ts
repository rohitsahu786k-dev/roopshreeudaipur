import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { requireAccountUser } from "@/lib/account";

export async function POST() {
  const result = await requireAccountUser();
  if (result.error) return result.error;

  result.user.logoutAllAt = new Date();
  await result.user.save();
  clearAuthCookie();
  return NextResponse.json({ ok: true });
}
