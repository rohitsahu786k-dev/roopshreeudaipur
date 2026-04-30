import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { sendOtpEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });

    if (!user || user.emailVerified) {
      return NextResponse.json({ error: "No pending verification found for this email" }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOtp = otp;
    user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    console.log(`Resend OTP for ${email}: ${otp}`);
    try {
      await sendOtpEmail(user.name, String(email).toLowerCase().trim(), otp);
    } catch (emailError) {
      console.error("Failed to resend OTP email:", emailError);
    }

    return NextResponse.json({ message: "OTP resent to your email" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to resend OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
