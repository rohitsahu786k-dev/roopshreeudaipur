import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";
import { requireAccountUser, verifyPassword } from "@/lib/account";

export async function POST(request: NextRequest) {
  const result = await requireAccountUser();
  if (result.error) return result.error;

  const { currentPassword, newPassword } = await request.json();
  if (!newPassword || String(newPassword).length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }
  if (!(await verifyPassword(result.user, String(currentPassword ?? "")))) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
  }

  result.user.password = await bcrypt.hash(String(newPassword), 10);
  result.user.logoutAllAt = new Date();
  await result.user.save();

  return NextResponse.json({ ok: true });
}
