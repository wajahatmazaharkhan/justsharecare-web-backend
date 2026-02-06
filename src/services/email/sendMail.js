import { mailTransporter } from "./mailer.js";

export const sendMail = async ({ to, subject, html }) => {
  try {
    await mailTransporter.sendMail({
      from: `Just Share Care <${process.env.NODEMAILER_USER_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent to:", to);
  } catch (error) {
    console.error("Email error:", error.message);
    throw error;
  }
};
