import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { issueEmailVerificationOtp, makeOtp } from "@/lib/otp";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json();
    const normalizedEmail = String(email ?? "").toLowerCase().trim();

    if (!name || !normalizedEmail || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (!existingUser.emailVerified) {
        try {
          await issueEmailVerificationOtp(existingUser);
          return NextResponse.json({
            message: "Account already exists. A fresh OTP has been sent.",
            email: existingUser.email,
            requiresVerification: true
          });
        } catch {
          return NextResponse.json({ error: "Account exists but OTP email could not be sent. Please try resend OTP." }, { status: 500 });
        }
      }

      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate 6-digit OTP
    const otp = makeOtp();
    const otpExpires = new Date(Date.now() + 30 * 60 * 1000);

    const user = await User.create({ 
      name, 
      email: normalizedEmail,
      phone, 
      password: hashedPassword,
      verificationOtp: otp,
      verificationOtpExpires: otpExpires,
      emailVerified: false
    });

    // Send verification email
    try {
      await issueEmailVerificationOtp(user);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // We still created the user, they can try resending the OTP later
    }

    return NextResponse.json({
      message: "Registration successful. Please verify your email.",
      email: user.email
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to register";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
