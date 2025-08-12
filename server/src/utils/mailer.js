import nodemailer from "nodemailer";
import { promisify } from "util";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

if (!SMTP_USER || !SMTP_PASS) {
  console.warn("⚠️ SMTP_USER or SMTP_PASS not set in env vars");
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

const DEFAULT_SENDER = `"Rease" <${SMTP_USER}>`;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1500;

const sleep = promisify(setTimeout);

export const sendMail = async ({
  recipient,
  subject,
  template,
  templateData = {},
  from = DEFAULT_SENDER,
  cc,
  bcc,
  attachments,
  retries = MAX_RETRIES,
}) => {
  if (!recipient) return { success: false, error: "Recipient email is required" };
  if (!template) return { success: false, error: "Email template is required" };

  let htmlContent;
  try {
    htmlContent =
      typeof template === "function" ? template(templateData) : template;
  } catch (error) {
    return { success: false, error: "Error generating template", details: error };
  }

  let attempts = 0;
  while (attempts <= retries) {
    try {
      if (attempts > 0) {
        await sleep(RETRY_DELAY * attempts);
        console.log(`📧 Retry attempt ${attempts} for ${recipient}`);
      }

      const info = await transporter.sendMail({
        from,
        to: recipient,
        subject,
        html: htmlContent,
        cc,
        bcc,
        attachments,
      });

      return { success: true, messageId: info.messageId, data: info };
    } catch (error) {
      attempts++;
      console.error(`Email send failed (attempt ${attempts}):`, error.message);

      if (attempts > retries) {
        return { success: false, error: error.message, details: error };
      }
    }
  }
};

export const EmailTemplates = {
  baseStyles: `
    <style>
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f8f9fa;
      }
      .email-header {
        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
        padding: 30px 20px;
        text-align: center;
        border-radius: 12px 12px 0 0;
      }
      .email-header h1 {
        color: white;
        margin: 0;
        font-size: 28px;
        font-weight: 600;
      }
      .email-body {
        background: white;
        padding: 40px 30px;
        box-shadow: 0 4px 6px rgba(30, 58, 138, 0.1);
      }
      .email-footer {
        background: #f8f9fa;
        padding: 20px 30px;
        text-align: center;
        border-radius: 0 0 12px 12px;
        border-top: 1px solid #e9ecef;
      }
      .greeting {
        font-size: 18px;
        margin-bottom: 20px;
        color: #495057;
      }
      .highlight-box {
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
        padding: 25px;
        border-radius: 12px;
        margin: 25px 0;
        text-align: center;
        box-shadow: 0 4px 15px rgba(30, 58, 138, 0.3);
      }
      .btn {
        display: inline-block;
        padding: 14px 28px;
        background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        margin: 15px 0;
        box-shadow: 0 4px 15px rgba(30, 58, 138, 0.4);
        transition: transform 0.2s;
      }
      .btn:hover {
        transform: translateY(-2px);
      }
      .info-card {
        background: #f0f7ff;
        border-left: 4px solid #1e3a8a;
        padding: 20px;
        margin: 20px 0;
        border-radius: 0 8px 8px 0;
      }
      .warning-card {
        background: #fff3cd;
        border-left: 4px solid #f59e0b;
        padding: 20px;
        margin: 20px 0;
        border-radius: 0 8px 8px 0;
      }
      .otp-container {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin: 30px 0;
        flex-wrap: wrap;
      }
      .otp-digit {
        width: 50px;
        height: 50px;
        background: white;
        border: 2px solid #1e3a8a;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: bold;
        color: #1e3a8a;
        box-shadow: 0 2px 10px rgba(30, 58, 138, 0.2);
      }
      .footer-text {
        font-size: 14px;
        color: #6c757d;
        margin: 0;
      }
      .brand-logo {
        color: white;
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 8px;
      }
    </style>
  `,

  otp: ({ otp, userName = "", expiryMinutes = 10 }) => {
    const digits = otp.toString().split("");
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code - Rease</title>
        ${EmailTemplates.baseStyles}
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f8f9fa;">
        <div class="email-container">
          <div class="email-header">
            <div class="brand-logo">🔐 Rease</div>
            <h1>Verification Code</h1>
          </div>
          
          <div class="email-body">
            <p class="greeting">Hello${userName ? ` ${userName}` : ""}! 👋</p>
            
            <p>We received a request to verify your account. Please use the following One-Time Password (OTP) to complete your verification:</p>
            
            <div class="highlight-box">
              <div class="otp-container">
                ${digits.map(d => `<div class="otp-digit">${d}</div>`).join("")}
              </div>
              <p style="color: white; margin: 0; font-weight: 500;">
                ⏰ Valid for ${expiryMinutes} minutes
              </p>
            </div>
            
            <div class="info-card">
              <p style="margin: 0;"><strong>Security Note:</strong> Never share this code with anyone. Rease will never ask for your OTP via phone or email.</p>
            </div>
          </div>
          
          <div class="email-footer">
            <p class="footer-text">This is an automated email from Rease. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  orderConfirmed: ({ orderId, total, items = [], estimatedDelivery = "" }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmed - Rease</title>
      ${EmailTemplates.baseStyles}
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f8f9fa;">
      <div class="email-container">
        <div class="email-header">
          <div class="brand-logo">✅ Rease</div>
          <h1>Order Confirmed!</h1>
        </div>
        
        <div class="email-body">
          <p class="greeting">Great news! Your order has been confirmed. 🎉</p>
          
          <div class="highlight-box">
            <h2 style="color: white; margin: 0 0 10px 0;">Order #${orderId}</h2>
            <p style="color: white; font-size: 24px; font-weight: bold; margin: 0;">₹${total}</p>
          </div>
          
          ${estimatedDelivery ? `
            <div class="info-card">
              <p style="margin: 0;"><strong>📦 Estimated Delivery:</strong> ${estimatedDelivery}</p>
            </div>
          ` : ''}
          
          <p>We're now processing your order and will keep you updated on its progress. You can track your order status anytime in your Rease account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" class="btn">Track Your Order</a>
          </div>
        </div>
        
        <div class="email-footer">
          <p class="footer-text">Thank you for choosing Rease! Questions? Contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  pickupScheduled: ({ date, location, timeSlot = "", contactNumber = "" }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pickup Scheduled - Rease</title>
      ${EmailTemplates.baseStyles}
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f8f9fa;">
      <div class="email-container">
        <div class="email-header">
          <div class="brand-logo">🚚 Rease</div>
          <h1>Pickup Scheduled</h1>
        </div>
        
        <div class="email-body">
          <p class="greeting">Your pickup has been successfully scheduled! 📅</p>
          
          <div class="highlight-box">
            <h2 style="color: white; margin: 0 0 15px 0;">📍 Pickup Details</h2>
            <p style="color: white; margin: 5px 0;"><strong>Date:</strong> ${date}</p>
            ${timeSlot ? `<p style="color: white; margin: 5px 0;"><strong>Time:</strong> ${timeSlot}</p>` : ''}
            <p style="color: white; margin: 5px 0;"><strong>Location:</strong> ${location}</p>
          </div>
          
          <div class="info-card">
            <h3 style="margin-top: 0;">📋 Pickup Instructions:</h3>
            <ul style="margin: 10px 0;">
              <li>Please ensure someone is available at the pickup location</li>
              <li>Keep your items ready and properly packaged</li>
              <li>Have your order ID ready for verification</li>
              ${contactNumber ? `<li>Our delivery partner will call ${contactNumber} before arrival</li>` : ''}
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" class="btn">Reschedule Pickup</a>
          </div>
        </div>
        
        <div class="email-footer">
          <p class="footer-text">Need to make changes? Contact us at support@rease.com</p>
        </div>
      </div>
    </body>
    </html>
  `,

  returnReminder: ({ date, productName = "", orderId = "", lateFee = "" }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Return Reminder - Rease</title>
      ${EmailTemplates.baseStyles}
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f8f9fa;">
      <div class="email-container">
        <div class="email-header">
          <div class="brand-logo">⏰ Rease</div>
          <h1>Return Reminder</h1>
        </div>
        
        <div class="email-body">
          <p class="greeting">This is a friendly reminder about your upcoming return! 🔔</p>
          
          <div class="warning-card">
            <h3 style="margin-top: 0;">⚠️ Return Due Date</h3>
            <p style="font-size: 18px; font-weight: bold; color: #856404; margin: 10px 0;">
              ${date}
            </p>
            ${productName ? `<p><strong>Product:</strong> ${productName}</p>` : ''}
            ${orderId ? `<p><strong>Order ID:</strong> #${orderId}</p>` : ''}
          </div>
          
          <p>Please ensure your item is returned by the due date to avoid any late fees. ${lateFee ? `Late returns will incur a fee of ₹${lateFee} per day.` : ''}</p>
          
          <div class="info-card">
            <h3 style="margin-top: 0;">📦 Return Options:</h3>
            <ul style="margin: 10px 0;">
              <li>Schedule a free pickup from your location</li>
              <li>Drop off at any Rease partner location</li>
              <li>Use our express return service</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" class="btn">Schedule Return Pickup</a>
          </div>
        </div>
        
        <div class="email-footer">
          <p class="footer-text">Questions about your return? We're here to help at support@rease.com</p>
        </div>
      </div>
    </body>
    </html>
  `,

  paymentLink: ({ link, amount = "", orderId = "", expiryTime = "" }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Complete Your Payment - Rease</title>
      ${EmailTemplates.baseStyles}
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f8f9fa;">
      <div class="email-container">
        <div class="email-header">
          <div class="brand-logo">💳 Rease</div>
          <h1>Complete Your Payment</h1>
        </div>
        
        <div class="email-body">
          <p class="greeting">You're almost done! Complete your payment to confirm your order. 💪</p>
          
          <div class="highlight-box">
            <h2 style="color: white; margin: 0 0 15px 0;">💰 Payment Details</h2>
            ${amount ? `<p style="color: white; font-size: 24px; font-weight: bold; margin: 10px 0;">₹${amount}</p>` : ''}
            ${orderId ? `<p style="color: white; margin: 5px 0;">Order #${orderId}</p>` : ''}
            ${expiryTime ? `<p style="color: white; margin: 5px 0;">⏰ Link expires: ${expiryTime}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${link}" class="btn" style="font-size: 18px; padding: 18px 36px;">
              💳 Pay Now Securely
            </a>
          </div>
          
          <div class="info-card">
            <h3 style="margin-top: 0;">🔒 Secure Payment</h3>
            <p style="margin: 0;">Your payment is processed through our secure, encrypted gateway. We accept all major credit cards, debit cards, and digital wallets.</p>
          </div>
        </div>
        
        <div class="email-footer">
          <p class="footer-text">Having trouble with payment? Contact us at support@rease.com or call our helpline.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  genericNotification: ({ title, message, userName = "", actionText = "", actionLink = "", type = "info" }) => {
    const getHeaderIcon = (type) => {
      switch (type) {
        case 'success': return '✅';
        case 'warning': return '⚠️';
        case 'error': return '❌';
        case 'info': 
        default: return '📢';
      }
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Rease</title>
        ${EmailTemplates.baseStyles}
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f8f9fa;">
        <div class="email-container">
          <div class="email-header">
            <div class="brand-logo">${getHeaderIcon(type)} Rease</div>
            <h1>${title}</h1>
          </div>
          
          <div class="email-body">
            <p class="greeting">Hello${userName ? ` ${userName}` : ""}! 👋</p>
            
            <div class="highlight-box">
              <p style="color: white; font-size: 16px; margin: 0; line-height: 1.6;">
                ${message}
              </p>
            </div>
            
            ${actionText && actionLink ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${actionLink}" class="btn">${actionText}</a>
              </div>
            ` : ''}
          </div>
          
          <div class="email-footer">
            <p class="footer-text">This is an automated notification from Rease. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
};
export const sendOTPEmail = async (recipient, otp, userName = "", expiryMinutes = 10) =>
  sendMail({
    recipient,
    subject: "Your Rease Verification Code",
    template: EmailTemplates.otp,
    templateData: { otp, userName, expiryMinutes },
  });
