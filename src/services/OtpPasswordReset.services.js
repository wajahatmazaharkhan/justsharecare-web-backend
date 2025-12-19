import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  secure: true,
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: process.env.NODEMAILER_USER_EMAIL,
    pass: process.env.NODEMAILER_USER_PASSWORD,
  },
});

// 🔐 Safe Harbor - Forgot Password OTP Email Template
const forgotPasswordOtpTemplate = (name, email, otp) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Safe Harbor - Reset Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f9f9;
      font-family: Arial, sans-serif;
      color: #2c3e50;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    }
    .header {
      background: linear-gradient(135deg, #4CAF9E, #6BCFC7);
      padding: 30px 20px;
      text-align: center;
    }
    .logo {
      font-size: 26px;
      font-weight: bold;
      color: #ffffff;
      letter-spacing: 1px;
    }
    .tagline {
      font-size: 14px;
      color: #eafffb;
      margin-top: 6px;
    }
    .content {
      padding: 30px 25px;
    }
    h1 {
      font-size: 22px;
      margin-bottom: 10px;
      text-align: center;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      margin: 10px 0;
      color: #555;
    }
    .otp-wrapper {
      text-align: center;
      margin: 30px 0 20px;
    }
    .otp-box {
      display: inline-block;
      font-size: 36px;
      letter-spacing: 12px;
      font-weight: bold;
      color: #2c3e50;
      background: #f0fbfa;
      padding: 16px 28px;
      border-radius: 10px;
      border: 2px dashed #6BCFC7;
    }
    .expiry {
      text-align: center;
      font-size: 14px;
      color: #e74c3c;
      margin-top: 10px;
    }
    .notice {
      background: #f7fffd;
      border-left: 4px solid #4CAF9E;
      padding: 14px 16px;
      border-radius: 8px;
      font-size: 14px;
      margin: 25px 0 10px;
      color: #34495e;
    }
    .footer {
      padding: 20px;
      font-size: 12px;
      text-align: center;
      color: #7f8c8d;
      background: #f9fdfd;
    }
    @media (max-width: 480px) {
      .otp-box {
        font-size: 28px;
        letter-spacing: 10px;
        padding: 14px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Safe Harbor</div>
      <div class="tagline">Your Safe Space for Mental Well-Being</div>
    </div>

    <div class="content">
      <h1>Reset Your Password</h1>

      <p>Hello ${name},</p>

      <p>
        We received a request to reset your <strong>Safe Harbor</strong> account password.
        Please use the verification code below to continue:
      </p>

      <div class="otp-wrapper">
        <div class="otp-box">${otp}</div>
      </div>

      <div class="expiry">
        ⏳ This code will expire in <strong>5 minutes</strong>.
      </div>

      <div class="notice">
        <strong>Important:</strong> If you did not request a password reset,
        please ignore this email. Your account is safe.
      </div>

      <p>
        Taking care of your security is important to us.
        We're here whenever you need support.
      </p>
    </div>

    <div class="footer">
      <p>This email was sent to ${email}</p>
      <p>Need help? Contact us at <strong>support@safeharbor.com</strong></p>
      <p>© 2025 Safe Harbor. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

// 🔐 Send OTP for Forgot Password
export const SendOtpForPassword = async (name, to, otp) => {
  try {
    const subject = "Safe Harbor Password Reset Code";

    const htmlContent = forgotPasswordOtpTemplate(name, to, otp);

    await transporter.sendMail({
      from: `Safe Harbor <${process.env.NODEMAILER_USER_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log("✅ Password reset OTP sent to:", to);
  } catch (error) {
    console.error("❌ Error sending password reset OTP:", error);
    throw error;
  }
};
