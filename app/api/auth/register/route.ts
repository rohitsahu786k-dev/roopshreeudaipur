import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";
import { setAuthCookie, signAuthToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({ 
      name, 
      email, 
      phone, 
      password: hashedPassword,
      verificationOtp: otp,
      verificationOtpExpires: otpExpires,
      emailVerified: false
    });

    // In a real app, you'd send an email here
    console.log(`Verification OTP for ${email}: ${otp}`);

    return NextResponse.json({
      message: "Registration successful. Please verify your email.",
      email: user.email
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to register";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
