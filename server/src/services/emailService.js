import nodemailer from "nodemailer";

// Create reusable transporter
const createTransporter = () => {
  // For development, you can use Gmail or Ethereal (fake SMTP)
  // For production, use services like SendGrid, AWS SES, Mailgun, etc.
  
  const config = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  // If no SMTP credentials, create test account (for development)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("⚠️  No SMTP credentials found. Emails will be logged to console.");
    return null;
  }

  return nodemailer.createTransport(config);
};

// Email template wrapper with ShopSphere branding
const emailTemplate = (content, preheader = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ShopSphere</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 32px; font-weight: bold; margin: 0; }
    .header p { color: #e0e7ff; font-size: 14px; margin-top: 8px; }
    .content { padding: 40px 30px; }
    .content h2 { color: #1f2937; font-size: 24px; margin-bottom: 20px; }
    .content p { color: #4b5563; font-size: 16px; margin-bottom: 15px; }
    .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; transition: transform 0.2s; }
    .button:hover { transform: translateY(-2px); }
    .order-details { background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb; }
    .order-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .order-item:last-child { border-bottom: none; }
    .order-total { display: flex; justify-content: space-between; padding-top: 15px; margin-top: 15px; border-top: 2px solid #667eea; font-weight: bold; font-size: 18px; }
    .footer { background-color: #1f2937; color: #9ca3af; padding: 30px 20px; text-align: center; font-size: 14px; }
    .footer a { color: #818cf8; text-decoration: none; }
    .social-links { margin: 20px 0; }
    .social-links a { display: inline-block; margin: 0 10px; color: #818cf8; }
    .preheader { display: none; max-height: 0; overflow: hidden; }
    @media only screen and (max-width: 600px) {
      .content { padding: 30px 20px; }
      .header h1 { font-size: 24px; }
      .content h2 { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div class="preheader">${preheader}</div>
  <div class="container">
    <div class="header">
      <h1>🛍️ ShopSphere</h1>
      <p>Your Premium Shopping Destination</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <div class="social-links">
        <a href="#">Facebook</a> | 
        <a href="#">Twitter</a> | 
        <a href="#">Instagram</a>
      </div>
      <p>&copy; ${new Date().getFullYear()} ShopSphere. All rights reserved.</p>
      <p>123 Commerce Street, Business District, City, 12345</p>
      <p>
        <a href="${process.env.CLIENT_URL}/account">Manage Preferences</a> | 
        <a href="${process.env.CLIENT_URL}">Visit Store</a>
      </p>
      <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">
        You're receiving this email because you have an account with ShopSphere.
      </p>
    </div>
  </div>
</body>
</html>
`;

// Send email helper
const sendEmail = async (to, subject, html) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log("\n📧 Email would be sent to:", to);
    console.log("📌 Subject:", subject);
    console.log("💬 Content:", html.substring(0, 200) + "...\n");
    return { success: true, messageId: "dev-mode" };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"ShopSphere" <noreply@shopsphere.com>',
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    return { success: false, error: error.message };
  }
};

// Welcome email
export const sendWelcomeEmail = async (user) => {
  const content = `
    <h2>Welcome to ShopSphere, ${user.firstName}! 🎉</h2>
    <p>Thank you for joining our community of shoppers. We're excited to have you!</p>
    <p>At ShopSphere, you'll discover:</p>
    <ul style="color: #4b5563; margin: 20px 0; padding-left: 20px;">
      <li>Thousands of quality products</li>
      <li>Exclusive deals and discounts</li>
      <li>Fast and reliable shipping</li>
      <li>Easy returns and refunds</li>
      <li>24/7 customer support</li>
    </ul>
    <a href="${process.env.CLIENT_URL}/products" class="button">Start Shopping</a>
    <p>If you have any questions, feel free to reach out to our support team.</p>
    <p>Happy shopping!<br>The ShopSphere Team</p>
  `;

  return sendEmail(
    user.email,
    "Welcome to ShopSphere! 🛍️",
    emailTemplate(content, "Welcome to ShopSphere - Start shopping today!")
  );
};

// Order confirmation email
export const sendOrderConfirmationEmail = async (order, user) => {
  const itemsHtml = order.items
    .map(
      (item) => `
    <div class="order-item">
      <span>${item.product.name} × ${item.quantity}</span>
      <span>$${parseFloat(item.price).toFixed(2)}</span>
    </div>
  `
    )
    .join("");

  const content = `
    <h2>Order Confirmed! 🎉</h2>
    <p>Hi ${user.firstName},</p>
    <p>Thank you for your order! We've received your order and it's being processed.</p>
    
    <div class="order-details">
      <h3 style="margin-bottom: 15px; color: #1f2937;">Order #${order.id.slice(-8).toUpperCase()}</h3>
      <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">
        Order Date: ${new Date(order.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </p>
      ${itemsHtml}
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
          <span style="color: #6b7280;">Subtotal:</span>
          <span>$${parseFloat(order.subtotal).toFixed(2)}</span>
        </div>
        ${order.discount > 0 ? `
        <div style="display: flex; justify-content: space-between; margin: 8px 0; color: #10b981;">
          <span>Discount:</span>
          <span>-$${parseFloat(order.discount).toFixed(2)}</span>
        </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
          <span style="color: #6b7280;">Shipping:</span>
          <span>$${parseFloat(order.shippingFee).toFixed(2)}</span>
        </div>
        ${order.tax > 0 ? `
        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
          <span style="color: #6b7280;">Tax:</span>
          <span>$${parseFloat(order.tax).toFixed(2)}</span>
        </div>
        ` : ''}
      </div>
      <div class="order-total">
        <span>Total:</span>
        <span style="color: #667eea;">$${parseFloat(order.total).toFixed(2)}</span>
      </div>
    </div>

    ${order.shippingAddress ? `
    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-bottom: 10px; color: #1f2937;">Shipping Address</h3>
      <p style="color: #4b5563; margin: 5px 0;">${order.shippingAddress.fullName}</p>
      <p style="color: #6b7280; margin: 5px 0;">${order.shippingAddress.line1}</p>
      ${order.shippingAddress.line2 ? `<p style="color: #6b7280; margin: 5px 0;">${order.shippingAddress.line2}</p>` : ''}
      <p style="color: #6b7280; margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
      <p style="color: #6b7280; margin: 5px 0;">${order.shippingAddress.country}</p>
    </div>
    ` : ''}

    <a href="${process.env.CLIENT_URL}/orders/${order.id}" class="button">View Order Details</a>
    
    <p>We'll send you a shipping confirmation email as soon as your order ships.</p>
    <p>Thank you for shopping with us!<br>The ShopSphere Team</p>
  `;

  return sendEmail(
    user.email,
    `Order Confirmed - #${order.id.slice(-8).toUpperCase()}`,
    emailTemplate(content, `Your order #${order.id.slice(-8).toUpperCase()} has been confirmed`)
  );
};

// Order shipped email
export const sendOrderShippedEmail = async (order, user, trackingNumber = null) => {
  const content = `
    <h2>Your Order Has Shipped! 📦</h2>
    <p>Hi ${user.firstName},</p>
    <p>Great news! Your order has been shipped and is on its way to you.</p>
    
    <div class="order-details">
      <h3 style="margin-bottom: 15px; color: #1f2937;">Order #${order.id.slice(-8).toUpperCase()}</h3>
      <p style="color: #4b5563; margin: 10px 0;">
        <strong>Status:</strong> <span style="color: #10b981;">Shipped</span>
      </p>
      ${trackingNumber ? `
      <p style="color: #4b5563; margin: 10px 0;">
        <strong>Tracking Number:</strong> ${trackingNumber}
      </p>
      ` : ''}
      <p style="color: #6b7280; font-size: 14px; margin-top: 15px;">
        Expected delivery: 3-5 business days
      </p>
    </div>

    <a href="${process.env.CLIENT_URL}/orders/${order.id}" class="button">Track Your Order</a>
    
    <p>You can track your shipment anytime by visiting your order details page.</p>
    <p>Thank you for your patience!<br>The ShopSphere Team</p>
  `;

  return sendEmail(
    user.email,
    `Your Order Has Shipped - #${order.id.slice(-8).toUpperCase()}`,
    emailTemplate(content, "Your order is on the way!")
  );
};

// Password reset email
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const content = `
    <h2>Reset Your Password 🔐</h2>
    <p>Hi ${user.firstName},</p>
    <p>We received a request to reset your password for your ShopSphere account.</p>
    <p>Click the button below to reset your password:</p>
    
    <a href="${resetUrl}" class="button">Reset Password</a>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
      This link will expire in 1 hour for security reasons.
    </p>
    
    <p style="color: #dc2626; background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
      <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
    </p>
    
    <p>For security, this link can only be used once.</p>
    <p>Best regards,<br>The ShopSphere Team</p>
  `;

  return sendEmail(
    user.email,
    "Reset Your Password - ShopSphere",
    emailTemplate(content, "Reset your ShopSphere password")
  );
};

// Order delivered email
export const sendOrderDeliveredEmail = async (order, user) => {
  const content = `
    <h2>Your Order Has Been Delivered! ✅</h2>
    <p>Hi ${user.firstName},</p>
    <p>Your order has been successfully delivered!</p>
    
    <div class="order-details">
      <h3 style="margin-bottom: 15px; color: #1f2937;">Order #${order.id.slice(-8).toUpperCase()}</h3>
      <p style="color: #4b5563; margin: 10px 0;">
        <strong>Status:</strong> <span style="color: #10b981;">Delivered</span>
      </p>
      <p style="color: #6b7280; font-size: 14px;">
        Delivered on: ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </p>
    </div>

    <a href="${process.env.CLIENT_URL}/orders/${order.id}" class="button">View Order</a>
    
    <p>We hope you love your purchase! If you're happy with your order, we'd appreciate if you could leave a review.</p>
    
    <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
      <h3 style="color: #166534; margin-bottom: 10px;">💚 Love Your Purchase?</h3>
      <p style="color: #15803d; margin-bottom: 15px;">Share your experience and help other shoppers!</p>
      <a href="${process.env.CLIENT_URL}/orders/${order.id}#reviews" 
         style="display: inline-block; padding: 10px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
        Write a Review
      </a>
    </div>

    <p>Thank you for shopping with ShopSphere!<br>The ShopSphere Team</p>
  `;

  return sendEmail(
    user.email,
    `Order Delivered - #${order.id.slice(-8).toUpperCase()}`,
    emailTemplate(content, "Your order has been delivered!")
  );
};

// Low stock alert (for wishlist items)
export const sendLowStockAlertEmail = async (user, product) => {
  const content = `
    <h2>Hurry! Low Stock Alert 🔔</h2>
    <p>Hi ${user.firstName},</p>
    <p>A product in your wishlist is running low on stock!</p>
    
    <div class="order-details">
      <h3 style="margin-bottom: 10px; color: #1f2937;">${product.name}</h3>
      ${product.images && product.images[0] ? `
        <img src="${product.images[0].url}" alt="${product.name}" 
             style="max-width: 100%; height: auto; border-radius: 8px; margin: 15px 0;" />
      ` : ''}
      <p style="color: #dc2626; font-weight: 600; font-size: 18px; margin: 15px 0;">
        Only ${product.stock} left in stock!
      </p>
      <p style="color: #4b5563; font-size: 16px;">
        ${product.discountPrice ? 
          `<span style="text-decoration: line-through; color: #9ca3af;">$${parseFloat(product.price).toFixed(2)}</span> 
           <span style="color: #10b981; font-weight: bold;">$${parseFloat(product.discountPrice).toFixed(2)}</span>` :
          `<span style="font-weight: bold;">$${parseFloat(product.price).toFixed(2)}</span>`
        }
      </p>
    </div>

    <a href="${process.env.CLIENT_URL}/products/${product.id}" class="button">Shop Now</a>
    
    <p>Don't miss out on this opportunity. Order now before it's gone!</p>
    <p>Happy shopping!<br>The ShopSphere Team</p>
  `;

  return sendEmail(
    user.email,
    `Low Stock Alert - ${product.name}`,
    emailTemplate(content, `Only ${product.stock} left: ${product.name}`)
  );
};

export default {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendPasswordResetEmail,
  sendLowStockAlertEmail,
};
