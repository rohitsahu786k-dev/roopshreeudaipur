import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { issueEmailVerificationOtp } from "@/lib/otp";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const normalizedEmail = String(email ?? "").toLowerCase().trim();

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email is already verified" });
    }

    await issueEmailVerificationOtp(user);

    return NextResponse.json({ message: "New OTP sent. Please use the latest code from your email." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to resend verification code";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
