import nodemailer from "nodemailer";

// 1. Configure the transporter once
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 2. A general function for ANY email (like booking confirmations)
export async function sendEmail(to, subject, text) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
    });
    return { success: true, message: "Email sent successfully." };
  } catch (error) {
    console.error("Email error:", error);
    return { error: `Failed to send email: ${error.message}` };
  }
}

// 3. A specific function just for Admin Alerts
export async function sendAdminAlert(subject, text) {
  const adminEmail = process.env.ALERT_EMAIL || process.env.EMAIL_USER;
  return await sendEmail(adminEmail, `🚨 SYSTEM ALERT: ${subject}`, text);
}