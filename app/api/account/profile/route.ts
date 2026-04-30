import { NextResponse, type NextRequest } from "next/server";
import { publicProfile, requireAccountUser, verifyPassword } from "@/lib/account";

function makeOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function GET() {
  const result = await requireAccountUser();
  if (result.error) return result.error;

  return NextResponse.json({ profile: publicProfile(result.user) });
}

export async function PATCH(request: NextRequest) {
  try {
    const result = await requireAccountUser();
    if (result.error) return result.error;

    const payload = await request.json();
    const user = result.user;

    if (typeof payload.name === "string" && payload.name.trim().length >= 2) user.name = payload.name.trim();
    if (typeof payload.avatar === "string") user.avatar = payload.avatar.trim();

    if (typeof payload.email === "string" && payload.email.trim().toLowerCase() !== user.email) {
      if (!(await verifyPassword(user, String(payload.currentPassword ?? "")))) {
        return NextResponse.json({ error: "Current password is required to change email" }, { status: 403 });
      }
      user.pendingEmail = payload.email.trim().toLowerCase();
      user.emailVerified = false;
      user.verificationOtp = makeOtp();
      user.verificationOtpExpires = new Date(Date.now() + 1000 * 60 * 10);
    }

    if (typeof payload.phone === "string" && payload.phone.trim() !== (user.phone ?? "")) {
      user.pendingPhone = payload.phone.trim();
      user.phoneVerified = false;
      user.verificationOtp = makeOtp();
      user.verificationOtpExpires = new Date(Date.now() + 1000 * 60 * 10);
    }

    await user.save();
    return NextResponse.json({
      profile: publicProfile(user),
      verificationRequired: Boolean(user.pendingEmail || user.pendingPhone)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
