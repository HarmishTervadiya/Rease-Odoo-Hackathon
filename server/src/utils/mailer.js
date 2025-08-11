import nodemailer from "nodemailer";

// Initialize SMTP transporter with personal email details
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com"; // Change based on your email provider
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER; // Your email address
const SMTP_PASS = process.env.SMTP_PASS; // Your email password or app password

if (!SMTP_USER || !SMTP_PASS) {
  console.warn("WARNING: SMTP_USER or SMTP_PASS is not set in environment variables");
}

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// Sender email configuration
const DEFAULT_SENDER = `"PrepPoint" <${SMTP_USER}>`;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // ms

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Send an email with retry mechanism and template support
const sendMail = async (emailConfig) => {
  const {
    recipient,
    subject,
    template,
    templateData = {},
    from = DEFAULT_SENDER,
    cc,
    bcc,
    attachments,
    retries = MAX_RETRIES,
  } = emailConfig;

  if (!recipient) {
    return { success: false, error: "Recipient email is required" };
  }

  if (!template) {
    return { success: false, error: "Email template is required" };
  }

  // Generate the HTML content
  let htmlContent;
  try {
    if (typeof template === "function") {
      // If template is a function, call it with the provided data
      htmlContent = template(templateData);
    } else if (typeof template === "string") {
      // If it's a string, use it directly
      htmlContent = template;
    } else {
      return {
        success: false,
        error: "Template must be a string or a function",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: "Error generating email template",
      details: error,
    };
  }

  let attempts = 0;

  while (attempts <= retries) {
    try {
      // Incremental backoff for retries
      if (attempts > 0) {
        await sleep(RETRY_DELAY * attempts);
        console.log(`Retry attempt ${attempts} for email to ${recipient}`);
      }

      // Create mail options
      const mailOptions = {
        from,
        to: recipient,
        subject,
        html: htmlContent,
        cc,
        bcc,
        attachments,
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);

      return {
        success: true,
        data: info,
        messageId: info.messageId,
      };
    } catch (error) {
      attempts++;
      console.error(`Email sending exception (attempt ${attempts}):`, error);

      // If we've reached max retries, return the error
      if (attempts > retries) {
        return {
          success: false,
          error: error.message || "Exception while sending email",
          details: error,
        };
      }
    }
  }

  // This should not be reached due to the return statements above,
  // but adding as a fallback
  return {
    success: false,
    error: "Failed to send email after multiple attempts",
  };
};

/**
 * Email template generators - can be imported individually or used from this file
 */
export const EmailTemplates = {
  // Generate OTP email template
  otp: ({ otp, userName = "", expiryMinutes = 10 }) => {
    // Split OTP into individual characters for the styled boxes
    const otpDigits = otp.toString().split("");

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your OTP Code</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.5;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background-color: #f8f9fa;
          border-radius: 8px 8px 0 0;
        }
        .content {
          padding: 30px 20px;
          background-color: #ffffff;
        }
        .footer {
          font-size: 12px;
          text-align: center;
          color: #6c757d;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 0 0 8px 8px;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 20px;
        }
        .otp-container {
          display: flex;
          justify-content: center;
          margin: 30px 0;
        }
        .otp-digit {
          width: 45px;
          height: 45px;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          margin: 0 5px;
          font-size: 24px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8f9fa;
          color: #212529;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #0d6efd;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
        }
        .warning {
          color: #dc3545;
          font-size: 14px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>PrepPoint</h1>
        </div>
        <div class="content">
          <h2>Verification Code</h2>
          <p>Hello${userName ? ` ${userName}` : ""},</p>
          <p>Your verification code for PrepPoint is:</p>
          
          <div class="otp-container">
            ${otpDigits.map((digit) => `<div class="otp-digit">${digit}</div>`).join("")}
          </div>
          
          <p>This code will expire in ${expiryMinutes} minutes.</p>
          <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
          
          <p class="warning">Never share this code with anyone.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} PrepPoint. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  },
};

export const sendOTPEmail = async (
  recipient,
  otp,
  userName = "",
  expiryMinutes = 10
) => {
  return sendMail({
    recipient,
    subject: "Your PrepPoint Verification Code",
    template: EmailTemplates.otp,
    templateData: { otp, userName, expiryMinutes },
  });
};

export default sendMail;