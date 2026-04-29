export function getWelcomeEmailTemplate(name: string, email: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #231f20; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; }
          .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; color: #000; }
          .content { margin: 30px 0; }
          .content p { margin: 15px 0; }
          .button { display: inline-block; background-color: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: bold; }
          .footer { border-top: 1px solid #e0e0e0; margin-top: 40px; padding-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Roop Shree</h1>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for creating an account with us! We're excited to have you as part of the Roop Shree family.</p>
            <p>Your account is now active and you can start exploring our exclusive collection of ethnic wear.</p>
            <p><strong>What you can now enjoy:</strong></p>
            <ul>
              <li>Access to your saved addresses for faster checkout</li>
              <li>Track your orders in real-time</li>
              <li>Manage your wishlist</li>
              <li>Exclusive member offers and early access to new collections</li>
            </ul>
            <a href="https://roopshree.local/dashboard" class="button">View Your Account</a>
            <p>If you have any questions or need assistance, our support team is here to help.</p>
            <p>Best regards,<br/>The Roop Shree Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Roop Shree. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getForgotPasswordTemplate(name: string, resetLink: string, expiryTime: string = "2 hours") {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #231f20; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; }
          .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; color: #000; }
          .alert { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .content { margin: 30px 0; }
          .content p { margin: 15px 0; }
          .button { display: inline-block; background-color: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: bold; }
          .footer { border-top: 1px solid #e0e0e0; margin-top: 40px; padding-top: 20px; font-size: 12px; color: #666; text-align: center; }
          .code-box { background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="alert">
            <strong>Action Required:</strong> This link will expire in ${expiryTime}
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password.</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <div class="code-box">${resetLink}</div>
            <p><strong>Didn't request a password reset?</strong></p>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged. If you believe this was sent in error, please contact our support team.</p>
            <p>Best regards,<br/>The Roop Shree Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Roop Shree. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getOrderConfirmationTemplate(
  name: string,
  orderId: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
  estimatedDelivery: string
) {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right;">₹${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #231f20; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; }
          .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; color: #000; }
          .order-id { background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .order-id strong { display: block; font-size: 12px; color: #666; }
          .order-id .id { display: block; font-size: 18px; font-weight: bold; color: #000; margin-top: 5px; }
          table { width: 100%; margin: 20px 0; }
          table th { background-color: #f5f5f5; padding: 10px; text-align: left; font-weight: bold; }
          .summary { margin: 20px 0; text-align: right; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .summary-total { border-top: 2px solid #000; padding-top: 10px; font-weight: bold; font-size: 18px; }
          .button { display: inline-block; background-color: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: bold; }
          .footer { border-top: 1px solid #e0e0e0; margin-top: 40px; padding-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for your order! We're delighted to confirm that your purchase has been received and is being prepared.</p>
            
            <div class="order-id">
              <strong>Order Number</strong>
              <span class="id">#${orderId}</span>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>₹${total.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div class="summary-row summary-total">
                <span>Total Amount</span>
                <span>₹${total.toFixed(2)}</span>
              </div>
            </div>

            <p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>

            <a href="https://roopshree.local/tracking-order?orderId=${orderId}" class="button">Track Your Order</a>

            <p>If you have any questions about your order, please contact our support team.</p>
            <p>Best regards,<br/>The Roop Shree Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Roop Shree. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getShippingNotificationTemplate(name: string, orderId: string, trackingNumber: string, carrier: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #231f20; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; }
          .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; color: #000; }
          .alert { background-color: #d4edda; border: 1px solid #28a745; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .tracking-box { background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .tracking-box p { margin: 10px 0; }
          .tracking-box strong { display: block; font-size: 12px; color: #666; }
          .tracking-value { display: block; font-size: 16px; font-weight: bold; color: #000; margin-top: 5px; }
          .button { display: inline-block; background-color: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: bold; }
          .footer { border-top: 1px solid #e0e0e0; margin-top: 40px; padding-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Order is on the Way!</h1>
          </div>
          <div class="alert">
            <strong>Great news!</strong> Your order has been shipped.
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>We're excited to let you know that your order is now on its way to you!</p>
            
            <div class="tracking-box">
              <p>
                <strong>Order Number</strong>
                <span class="tracking-value">#${orderId}</span>
              </p>
              <p>
                <strong>Tracking Number</strong>
                <span class="tracking-value">${trackingNumber}</span>
              </p>
              <p>
                <strong>Carrier</strong>
                <span class="tracking-value">${carrier}</span>
              </p>
            </div>

            <a href="https://roopshree.local/tracking-order?orderId=${orderId}" class="button">Track Your Shipment</a>

            <p>You can also use the tracking number above on the ${carrier} website to get real-time updates on your shipment.</p>
            <p>If you have any concerns or questions, please reach out to our support team.</p>
            <p>Best regards,<br/>The Roop Shree Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Roop Shree. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getContactReplyTemplate(name: string, message: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #231f20; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; }
          .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; color: #000; }
          .content { margin: 30px 0; }
          .content p { margin: 15px 0; }
          .footer { border-top: 1px solid #e0e0e0; margin-top: 40px; padding-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Contacting Us</h1>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for reaching out to us. We have received your message and appreciate your interest in Roop Shree.</p>
            <p><strong>Your Message:</strong></p>
            <p>${message}</p>
            <p>Our team will review your inquiry and get back to you within 24 hours. We look forward to assisting you.</p>
            <p>Best regards,<br/>The Roop Shree Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Roop Shree. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
