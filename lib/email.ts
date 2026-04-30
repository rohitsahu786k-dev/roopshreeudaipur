import nodemailer from "nodemailer";
import {
  getWelcomeEmailTemplate,
  getForgotPasswordTemplate,
  getOrderConfirmationTemplate,
  getShippingNotificationTemplate,
  getContactReplyTemplate
} from "./emailTemplates";

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

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const config = getGoogleSmtpConfig();
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
    to,
    subject,
    html
  });
}

export async function sendContactEmail({ name, email, message }: ContactEmail) {
  const config = getGoogleSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  // Send to admin
  await transporter.sendMail({
    from: `"Roop Shree" <${config.from}>`,
    to: config.from,
    replyTo: email,
    subject: `New contact message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    html: `
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p>${escapeHtml(message).replaceAll("\n", "<br />")}></p>
    `
  });

  // Send confirmation to user
  await transporter.sendMail({
    from: `"Roop Shree" <${config.from}>`,
    to: email,
    subject: "We received your message - Roop Shree",
    html: getContactReplyTemplate(name, message)
  });
}

export async function sendWelcomeEmail(name: string, email: string) {
  const config = getGoogleSmtpConfig();
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
    to: email,
    subject: "Welcome to Roop Shree!",
    html: getWelcomeEmailTemplate(name, email)
  });
}

export async function sendForgotPasswordEmail(name: string, email: string, resetLink: string, expiryTime: string = "2 hours") {
  const config = getGoogleSmtpConfig();
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
    to: email,
    subject: "Reset your Roop Shree password",
    html: getForgotPasswordTemplate(name, resetLink, expiryTime)
  });
}

export async function sendOrderConfirmationEmail(
  name: string,
  email: string,
  orderId: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
  estimatedDelivery: string
) {
  const config = getGoogleSmtpConfig();
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
    to: email,
    subject: `Order Confirmation - #${orderId}`,
    html: getOrderConfirmationTemplate(name, orderId, items, total, estimatedDelivery)
  });
}

export async function sendShippingNotificationEmail(
  name: string,
  email: string,
  orderId: string,
  trackingNumber: string,
  carrier: string
) {
  const config = getGoogleSmtpConfig();
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
    to: email,
    subject: `Your order is on the way - #${orderId}`,
    html: getShippingNotificationTemplate(name, orderId, trackingNumber, carrier)
  });
}
