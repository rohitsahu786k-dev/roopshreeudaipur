import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });

    if (!user) {
      // Don't reveal if user exists for security, but in this case we return success
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // In a real app, send email with resetToken
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return NextResponse.json({ 
      message: "Password reset link sent to your email.",
      debugToken: resetToken // Only for development/testing
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process forgot password";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
