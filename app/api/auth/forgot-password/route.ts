import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { sendEmail } from "@/lib/email";
import { getForgotPasswordTemplate } from "@/lib/emailTemplates";

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

    // Send reset email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const resetLink = `${siteUrl}/account/reset-password?token=${resetToken}`;
    
    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your Roop Shree password",
        html: getForgotPasswordTemplate(user.name, resetLink, "1 hour")
      });
      console.log(`Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);
    }

    return NextResponse.json({ 
      message: "Password reset link sent to your email. Please check your inbox."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process forgot password";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
