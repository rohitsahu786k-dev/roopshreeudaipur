import { NextResponse, type NextRequest } from "next/server";
import { publicProfile, requireAccountUser } from "@/lib/account";

export async function POST(request: NextRequest) {
  const result = await requireAccountUser();
  if (result.error) return result.error;

  const { otp } = await request.json();
  const user = result.user;

  if (!user.verificationOtp || user.verificationOtp !== String(otp) || !user.verificationOtpExpires || user.verificationOtpExpires < new Date()) {
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
