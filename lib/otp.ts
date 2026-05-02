import { sendEmail } from "@/lib/email";
import { getVerificationEmailTemplate } from "@/lib/emailTemplates";

export function normalizeOtp(value: unknown) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 6);
}

export function makeOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function issueEmailVerificationOtp(user: any) {
  const otp = makeOtp();
  user.verificationOtp = otp;
  user.verificationOtpExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Your Roop Shree verification code",
    html: getVerificationEmailTemplate(user.name, otp)
  });

  return otp;
}
