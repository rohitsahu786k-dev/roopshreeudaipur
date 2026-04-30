import { NextResponse, type NextRequest } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { requireAccountUser } from "@/lib/account";

export async function GET() {
  const result = await requireAccountUser();
  if (result.error) return result.error;

  return NextResponse.json({ settings: result.user.settings ?? {} });
}

export async function PATCH(request: NextRequest) {
  const result = await requireAccountUser();
  if (result.error) return result.error;

  const payload = await request.json();
  result.user.settings = {
    ...(result.user.settings ?? {}),
    ...payload,
    notifications: {
      ...(result.user.settings?.notifications ?? {}),
      ...(payload.notifications ?? {})
    }
  };
  await result.user.save();

  return NextResponse.json({ settings: result.user.settings });
}

export async function DELETE() {
  const result = await requireAccountUser();
  if (result.error) return result.error;

  result.user.settings = {
    ...(result.user.settings ?? {}),
    accountDeletionRequestedAt: new Date()
  };
  result.user.deletedAt = new Date();
  await result.user.save();
  clearAuthCookie();
  return NextResponse.json({ ok: true });
}
