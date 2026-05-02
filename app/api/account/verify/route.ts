import { NextResponse, type NextRequest } from "next/server";
import { publicProfile, requireAccountUser } from "@/lib/account";
import { normalizeOtp } from "@/lib/otp";

export async function POST(request: NextRequest) {
  const result = await requireAccountUser();
  if (result.error) return result.error;

  const { otp } = await request.json();
  const normalizedOtp = normalizeOtp(otp);
  const user = result.user;
  const storedOtp = String((user as any).verificationOtp ?? user.get?.("verificationOtp") ?? "");
  const otpExpires = (user as any).verificationOtpExpires ?? user.get?.("verificationOtpExpires");

  if (!storedOtp || storedOtp !== normalizedOtp || !otpExpires || new Date(otpExpires) < new Date()) {
    return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
  }

  if (user.pendingEmail) {
    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.emailVerified = true;
  }
  if (user.pendingPhone) {
    user.phone = user.pendingPhone;
    user.pendingPhone = undefined;
    user.phoneVerified = true;
  }
  user.verificationOtp = undefined;
  user.verificationOtpExpires = undefined;
  await user.save();

  return NextResponse.json({ profile: publicProfile(user) });
}
