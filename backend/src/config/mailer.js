import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create Nodemailer Transporter with fallback to console logging in dev mode
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
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
  const mailOptions = {
    from: `"StockSense" <${process.env.SMTP_USER || 'no-reply@stocksense.com'}>`,
    to: toEmail,
    subject: ' Verify your StockSense Account OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #6366f1;">Welcome to StockSense, ${name}!</h2>
        <p>Thank you for signing up. Please use the following 6-digit verification code to activate your account:</p>
        <div style="background-color: #f3f4f6; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #1f2937; padding: 12px; text-align: center; border-radius: 6px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 13px;">This OTP will expire in 15 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    if (!process.env.SMTP_USER) {
      console.log(`\n=================================================`);
      console.log(`📧 [DEV EMAIL SIMULATION] Verification OTP for ${toEmail}: ${otp}`);
      console.log(`=================================================\n`);
      return { success: true, simulated: true };
    }
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    // Print fallback OTP in dev mode to allow unblocked testing
    console.log(`[FALLBACK DEV OTP] Email to ${toEmail} failed, OTP is: ${otp}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send Password Reset OTP to User
 */
export const sendPasswordResetEmail = async (toEmail, name, otp) => {
  const mailOptions = {
    from: `"StockSense" <${process.env.SMTP_USER || 'no-reply@stocksense.com'}>`,
    to: toEmail,
    subject: ' StockSense Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #ef4444;">Password Reset Request</h2>
        <p>Hi ${name}, your OTP to reset your StockSense account password is:</p>
        <div style="background-color: #fee2e2; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #991b1b; padding: 12px; text-align: center; border-radius: 6px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 13px;">This OTP will expire in 15 minutes.</p>
      </div>
    `,
  };

  try {
    if (!process.env.SMTP_USER) {
      console.log(`\n=================================================`);
      console.log(`📧 [DEV EMAIL SIMULATION] Password Reset OTP for ${toEmail}: ${otp}`);
      console.log(`=================================================\n`);
      return { success: true, simulated: true };
    }
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(' Failed to send password reset email:', error);
    console.log(`[FALLBACK DEV OTP] Email to ${toEmail} failed, OTP is: ${otp}`);
    return { success: false, error: error.message };
  }
};
