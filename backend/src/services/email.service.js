import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter = null;

/**
 * Lazily initialise the Nodemailer transporter the first time an email is
 * sent.  This avoids throwing during startup when SMTP vars are not yet
 * configured.
 */
function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    throw new Error(
      "Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in your .env file."
    );
  }

  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  return transporter;
}

/**
 * Send a password-reset OTP email.
 *
 * @param {string} recipientEmail — the user's email address
 * @param {string} otpCode        — the plain-text 6-digit code
 */
export async function sendOtpEmail(recipientEmail, otpCode) {
  const mail = getTransporter();

  await mail.sendMail({
    from: `"QR Attendance System" <${env.smtpUser}>`,
    to: recipientEmail,
    subject: "Password Reset Verification Code",
    text: [
      "Hello,",
      "",
      "You requested to reset your password.",
      "",
      "Your verification code is:",
      "",
      `  ${otpCode}`,
      "",
      "This code is valid for 10 minutes.",
      "",
      "If you did not request this password reset, please ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f172a; border-radius: 16px; color: #e2e8f0;">
        <h2 style="margin: 0 0 8px; color: #ffffff; font-size: 20px;">Password Reset</h2>
        <p style="margin: 0 0 24px; color: #94a3b8; font-size: 14px;">
          You requested to reset your password. Use the verification code below:
        </p>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #38bdf8;">
            ${otpCode}
          </span>
        </div>
        <p style="margin: 0 0 8px; color: #94a3b8; font-size: 13px;">
          This code is valid for <strong style="color: #ffffff;">10 minutes</strong>.
        </p>
        <p style="margin: 0; color: #64748b; font-size: 12px;">
          If you did not request this password reset, please ignore this email.
        </p>
      </div>
    `,
  });
}
