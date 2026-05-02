import { NextResponse, type NextRequest } from "next/server";
import { setAuthCookie, signAuthToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { issueEmailVerificationOtp, normalizeOtp } from "@/lib/otp";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();
    const normalizedEmail = String(email ?? "").toLowerCase().trim();
    const normalizedOtp = normalizeOtp(otp);

    if (!normalizedEmail || !normalizedOtp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      const token = signAuthToken(user);
      setAuthCookie(token);
      return NextResponse.json({
        message: "Email is already verified",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    const storedOtp = String((user as any).verificationOtp ?? user.get?.("verificationOtp") ?? "");
    const otpExpires = (user as any).verificationOtpExpires ?? user.get?.("verificationOtpExpires");

    if (!storedOtp) {
      try {
        await issueEmailVerificationOtp(user);
      } catch {
        return NextResponse.json({ error: "No active OTP found. Please click Resend OTP." }, { status: 400 });
      }

      return NextResponse.json({ error: "No active OTP found. A fresh OTP has been sent." }, { status: 400 });
    }

    if (storedOtp !== normalizedOtp) {
      return NextResponse.json({ error: "Invalid OTP. Please check the latest code sent to your email." }, { status: 400 });
    }

    if (!otpExpires || new Date(otpExpires) < new Date()) {
      try {
        await issueEmailVerificationOtp(user);
      } catch {
        return NextResponse.json({ error: "OTP expired. Please click Resend OTP and use the latest code." }, { status: 400 });
      }

      return NextResponse.json({ error: "OTP expired. A fresh OTP has been sent to your email." }, { status: 400 });
    }

    user.emailVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    await user.save();

    const token = signAuthToken(user);
    setAuthCookie(token);

    return NextResponse.json({
      message: "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
