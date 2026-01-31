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

// ✅ Just Share Care Welcome Email Template (Purple Theme)
const welcomeEmailTemplate = (name, email) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f6f5ff;
      font-family: Arial, sans-serif;
      color: #2c2c3a;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 12px 30px rgba(132, 115, 232, 0.15);
    }
    .header {
      background: linear-gradient(135deg, #8473E8, #6a5bd6);
      padding: 32px 20px;
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
      color: #edeaff;
      margin-top: 6px;
    }
    .content {
      padding: 32px 26px;
    }
    h1 {
      font-size: 22px;
      margin-bottom: 14px;
      text-align: center;
      color: #3a3475;
    }
    p {
      font-size: 15px;
      line-height: 1.65;
      margin: 12px 0;
      color: #555;
    }
    .welcome-box {
      background: #f3f1ff;
      border-left: 4px solid #8473E8;
      padding: 16px 18px;
      border-radius: 10px;
      margin: 26px 0;
      font-size: 15px;
      color: #3f3a6f;
    }
    .cta-wrapper {
      text-align: center;
      margin: 32px 0;
    }
    .cta-btn {
      display: inline-block;
      padding: 14px 30px;
      font-size: 16px;
      font-weight: bold;
      color: #ffffff;
      background: linear-gradient(135deg, #8473E8, #6a5bd6);
      border-radius: 32px;
      text-decoration: none;
    }
    .cta-btn:hover {
      opacity: 0.92;
    }
    .footer {
      padding: 22px;
      font-size: 12px;
      text-align: center;
      color: #7a78a0;
      background: #faf9ff;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Just Share Care</div>
      <div class="tagline">Your Safe Space for Healthy Well-Being</div>
    </div>

    <div class="content">
      <h1>Welcome to Just Share Care </h1>

      <p>Hello ${name},</p>

     <p>
  We’re really glad you’re here.  
  <strong>Just Share Care</strong> is a trusted space where you can easily
  book appointments with qualified counsellors and receive support
  in a calm, respectful, and confidential environment.
</p>


     <div class="welcome-box">
  🗓️ You can now browse counsellors, book appointments at your
  convenience, and manage your sessions — all from one secure place.
</div>


     <p>
  All appointments are handled with complete confidentiality,
  and you are always in control of your schedule and preferences.
</p>


      <div class="cta-wrapper">
        <a href="#" class="cta-btn">Get Started</a>
      </div>

      <p>
        If you need help at any point, feel free to reach out.
        Your well-being matters to us.
      </p>
    </div>

    <div class="footer">
      <p>This email was sent to ${email}</p>
      <p>Need help? Contact us at <strong>support@safeharbor.com</strong></p>
      <p>© 2026 Just Share Care. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

export const sendWelcomeEmail = async (name, to) => {
  try {
    const subject = "Welcome to Just Share Care ";

    const htmlContent = welcomeEmailTemplate(name, to);

    await transporter.sendMail({
      from: `Just Share Care <${process.env.NODEMAILER_USER_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log("✅ Welcome email sent to:", to);
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    throw error;
  }
};
