import nodemailer from "nodemailer";

type ContactEmail = {
  name: string;
  email: string;
  message: string;
};

function getGoogleSmtpConfig() {
  const host = process.env.GOOGLE_SMTP_HOST ?? "smtp.gmail.com";
  const port = Number(process.env.GOOGLE_SMTP_PORT ?? 587);
  const secure = process.env.GOOGLE_SMTP_SECURE === "true";
  const user = process.env.GOOGLE_SMTP_EMAIL;
  const pass = process.env.GOOGLE_SMTP_APP_PASSWORD?.replace(/\s/g, "");
  const from = process.env.GOOGLE_FROM_EMAIL ?? user;

  if (!user || !pass || !from) {
    throw new Error("Google SMTP email and app password are not configured");
  }

  return { host, port, secure, user, pass, from };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendContactEmail({ name, email, message }: ContactEmail) {
  const config = getGoogleSmtpConfig();
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  await transporter.sendMail({
    from: `"Roop Shree" <${config.from}>`,
    to: config.from,
    replyTo: email,
    subject: `New contact message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    html: `
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p>${safeMessage}</p>
    `
  });
}
