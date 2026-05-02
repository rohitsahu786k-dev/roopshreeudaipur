import { roopShreeBusiness } from "@/lib/business";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://roopshreeudaipur.com";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(value: number) {
  return `Rs ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
}

function baseTemplate({
  preheader,
  title,
  children,
  cta
}: {
  preheader: string;
  title: string;
  children: string;
  cta?: { label: string; href: string };
}) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#f4f1ed;color:#241f1f;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f1ed;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e7ded6;">
            <tr>
              <td style="padding:28px 30px 22px;border-bottom:1px solid #e7ded6;">
                <div style="font-size:11px;letter-spacing:2.4px;text-transform:uppercase;color:#9b6a45;font-weight:700;">${escapeHtml(roopShreeBusiness.location)}</div>
                <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:30px;line-height:1.15;color:#171313;">${escapeHtml(title)}</h1>
                <p style="margin:10px 0 0;color:#6d625c;font-size:14px;line-height:22px;">${escapeHtml(roopShreeBusiness.name)} - bridal lehengas, sarees, suits and handcrafted occasion wear.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px;">
                ${children}
                ${
                  cta
                    ? `<div style="margin-top:28px;"><a href="${cta.href}" style="display:inline-block;background:#171313;color:#ffffff;text-decoration:none;padding:13px 22px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${escapeHtml(cta.label)}</a></div>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="background:#171313;color:#f6eee8;padding:24px 30px;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:700;">Roop Shree Udaipur</p>
                <p style="margin:0;color:#c8bbb1;font-size:12px;line-height:19px;">
                  ${escapeHtml(roopShreeBusiness.supportEmail)} | ${escapeHtml(roopShreeBusiness.supportPhone)}<br>
                  Follow us: <a href="${roopShreeBusiness.instagramUrl}" style="color:#f6eee8;">Instagram</a>
                </p>
                <p style="margin:16px 0 0;color:#9f948d;font-size:11px;">This is an automated transactional email from Roop Shree.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function getWelcomeEmailTemplate(name: string, _email: string) {
  return baseTemplate({
    title: "Welcome to Roop Shree",
    preheader: "Your Roop Shree account is ready.",
    cta: { label: "Open Dashboard", href: `${siteUrl}/dashboard` },
    children: `
      <p style="margin:0 0 16px;font-size:15px;line-height:24px;">Dear ${escapeHtml(name)},</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:24px;">Your account is active. You can now track orders, view invoices, save billing details and receive member-only updates from our Udaipur studio.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:22px;border:1px solid #eadfd6;">
        ${["Order tracking", "Invoice access", "Wishlist and styling notes", "Early access to bridal and festive edits"]
          .map((item) => `<tr><td style="padding:12px 14px;border-bottom:1px solid #eadfd6;font-size:14px;">${item}</td></tr>`)
          .join("")}
      </table>
    `
  });
}

export function getForgotPasswordTemplate(name: string, resetLink: string, expiryTime: string = "2 hours") {
  return baseTemplate({
    title: "Reset Your Password",
    preheader: `Your password reset link expires in ${expiryTime}.`,
    cta: { label: "Reset Password", href: resetLink },
    children: `
      <p style="margin:0 0 16px;font-size:15px;line-height:24px;">Dear ${escapeHtml(name)},</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:24px;">We received a request to reset your Roop Shree account password. This secure link expires in <strong>${escapeHtml(expiryTime)}</strong>.</p>
      <div style="margin-top:20px;background:#f8f4f0;border:1px solid #eadfd6;padding:14px;word-break:break-all;font-size:12px;color:#6d625c;">${escapeHtml(resetLink)}</div>
      <p style="margin:18px 0 0;font-size:13px;line-height:21px;color:#756a64;">If you did not request this, you can safely ignore this email.</p>
    `
  });
}

export function getOrderConfirmationTemplate(
  name: string,
  orderId: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
  estimatedDelivery: string
) {
  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eadfd6;font-size:14px;">${escapeHtml(item.name)}</td>
          <td style="padding:12px;border-bottom:1px solid #eadfd6;text-align:center;font-size:14px;">${item.quantity}</td>
          <td style="padding:12px;border-bottom:1px solid #eadfd6;text-align:right;font-size:14px;font-weight:700;">${money(item.price)}</td>
        </tr>`
    )
    .join("");

  return baseTemplate({
    title: "Order Confirmed",
    preheader: `Order ${orderId} has been received.`,
    cta: { label: "Track Order", href: `${siteUrl}/tracking-order?orderId=${orderId}` },
    children: `
      <p style="margin:0 0 16px;font-size:15px;line-height:24px;">Dear ${escapeHtml(name)},</p>
      <p style="margin:0 0 18px;font-size:15px;line-height:24px;">Thank you for shopping with Roop Shree. Your outfit is now in our order queue for quality check, packing and dispatch.</p>
      <div style="background:#f8f4f0;border:1px solid #eadfd6;padding:16px;margin-bottom:20px;">
        <span style="display:block;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8b7668;">Order Number</span>
        <strong style="display:block;margin-top:4px;font-size:20px;">#${escapeHtml(orderId)}</strong>
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eadfd6;border-bottom:0;">
        <thead>
          <tr style="background:#f8f4f0;">
            <th style="padding:12px;text-align:left;font-size:12px;text-transform:uppercase;">Product</th>
            <th style="padding:12px;text-align:center;font-size:12px;text-transform:uppercase;">Qty</th>
            <th style="padding:12px;text-align:right;font-size:12px;text-transform:uppercase;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="margin-top:18px;text-align:right;font-size:16px;"><strong>Total: ${money(total)}</strong></div>
      <p style="margin:18px 0 0;font-size:14px;line-height:22px;color:#6d625c;"><strong>Estimated delivery:</strong> ${escapeHtml(estimatedDelivery)}</p>
    `
  });
}

export function getShippingNotificationTemplate(name: string, orderId: string, trackingNumber: string, carrier: string) {
  return baseTemplate({
    title: "Your Order Has Shipped",
    preheader: `Tracking for order ${orderId} is now available.`,
    cta: { label: "Track Shipment", href: `${siteUrl}/tracking-order?orderId=${orderId}` },
    children: `
      <p style="margin:0 0 16px;font-size:15px;line-height:24px;">Dear ${escapeHtml(name)},</p>
      <p style="margin:0 0 18px;font-size:15px;line-height:24px;">Your Roop Shree order has left our dispatch desk. Use the details below for live tracking.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eadfd6;">
        ${[
          ["Order Number", `#${orderId}`],
          ["Tracking Number", trackingNumber],
          ["Carrier", carrier]
        ]
          .map(([label, value]) => `<tr><td style="padding:12px;border-bottom:1px solid #eadfd6;color:#6d625c;font-size:13px;">${label}</td><td style="padding:12px;border-bottom:1px solid #eadfd6;text-align:right;font-weight:700;">${escapeHtml(value)}</td></tr>`)
          .join("")}
      </table>
    `
  });
}

export function getOtpEmailTemplate(name: string, otp: string) {
  return baseTemplate({
    title: "Verify Your Email",
    preheader: `Your Roop Shree verification code is ${otp}. Valid for 10 minutes.`,
    children: `
      <p style="margin:0 0 16px;font-size:15px;line-height:24px;">Dear ${escapeHtml(name)},</p>
      <p style="margin:0 0 20px;font-size:15px;line-height:24px;">Use the code below to verify your email address and activate your Roop Shree account.</p>
      <div style="margin:28px auto;text-align:center;">
        <div style="display:inline-block;background:#171313;color:#ffffff;padding:18px 48px;font-size:34px;font-weight:700;letter-spacing:14px;font-family:monospace;">${escapeHtml(otp)}</div>
      </div>
      <p style="margin:0 0 8px;font-size:13px;line-height:21px;color:#756a64;">This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
      <p style="margin:0;font-size:13px;line-height:21px;color:#756a64;">If you did not create an account with Roop Shree, please ignore this email.</p>
    `
  });
}

export function getContactReplyTemplate(name: string, message: string) {
  return baseTemplate({
    title: "We Received Your Message",
    preheader: "Roop Shree will reply to your enquiry soon.",
    cta: { label: "Visit Store", href: siteUrl },
    children: `
      <p style="margin:0 0 16px;font-size:15px;line-height:24px;">Dear ${escapeHtml(name)},</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:24px;">Thank you for contacting Roop Shree. Our team will review your enquiry and reply within 24 hours.</p>
      <div style="background:#f8f4f0;border:1px solid #eadfd6;padding:14px;font-size:14px;line-height:22px;color:#6d625c;">${escapeHtml(message)}</div>
    `
  });
}

export function getVerificationEmailTemplate(name: string, otp: string) {
  return baseTemplate({
    title: "Verify Your Email",
    preheader: "Your verification code is " + otp,
    children: `
      <p style="margin:0 0 16px;font-size:15px;line-height:24px;">Dear ${escapeHtml(name)},</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:24px;">Thank you for registering with Roop Shree. Use the verification code below to complete your registration.</p>
      <div style="margin:24px 0;text-align:center;">
        <div style="display:inline-block;background:#f8f4f0;border:1px solid #eadfd6;padding:16px 32px;font-size:32px;font-weight:700;letter-spacing:8px;color:#171313;">
          ${escapeHtml(otp)}
        </div>
      </div>
      <p style="margin:0 0 16px;font-size:14px;line-height:22px;color:#6d625c;">This code is valid for 10 minutes. If you did not request this, you can safely ignore this email.</p>
    `
  });
}
