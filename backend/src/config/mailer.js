import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

/**
 * Send Email Verification OTP to User
 * @param {string} toEmail 
 * @param {string} name 
 * @param {string} otp 
 */
export const sendVerificationEmail = async (toEmail, name, otp) => {
  // Always log OTP to backend console as instant fallback
  console.log(`\n=================================================`);
  console.log(`🔑 [OTP CODE] Verification OTP for ${toEmail}: ${otp}`);
  console.log(`=================================================\n`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { success: true, simulated: true };
  }

  const mailOptions = {
    from: `"StockSense System" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `StockSense Verification Code: ${otp}`,
    text: `Hi ${name},\n\nYour StockSense account verification code is: ${otp}\n\nThis code expires in 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #6366f1; margin-top: 0;">StockSense Account Verification</h2>
        <p style="color: #475569; font-size: 15px;">Welcome ${name},</p>
        <p style="color: #475569; font-size: 14px;">Use the following 6-digit OTP code to verify your StockSense account:</p>
        <div style="background-color: #f1f5f9; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a; padding: 16px; text-align: center; border-radius: 8px; margin: 24px 0; border: 1px solid #cbd5e1;">
          ${otp}
        </div>
        <p style="color: #94a3b8; font-size: 12px;">This code will expire in 15 minutes.</p>
      </div>
    `,
    headers: {
      'X-Mailer': 'StockSense IMS',
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ SMTP email send failed:', error.message);
    return { success: true, fallback: true, otp };
  }
};

/**
 * Send Password Reset OTP to User
 */
export const sendPasswordResetEmail = async (toEmail, name, otp) => {
  console.log(`\n=================================================`);
  console.log(`🔑 [OTP CODE] Password Reset OTP for ${toEmail}: ${otp}`);
  console.log(`=================================================\n`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { success: true, simulated: true };
  }

  const mailOptions = {
    from: `"StockSense Security" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `StockSense Password Reset Code: ${otp}`,
    text: `Hi ${name},\n\nYour StockSense password reset code is: ${otp}\n\nThis code expires in 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #ef4444; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #475569; font-size: 15px;">Hi ${name},</p>
        <p style="color: #475569; font-size: 14px;">Your 6-digit password reset OTP is:</p>
        <div style="background-color: #fee2e2; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #991b1b; padding: 16px; text-align: center; border-radius: 8px; margin: 24px 0; border: 1px solid #fca5a5;">
          ${otp}
        </div>
        <p style="color: #94a3b8; font-size: 12px;">This code will expire in 15 minutes.</p>
      </div>
    `,
    headers: {
      'X-Mailer': 'StockSense IMS Security',
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ SMTP password reset send failed:', error.message);
    return { success: true, fallback: true, otp };
  }
};
