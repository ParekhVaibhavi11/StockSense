import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../../config/db.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../config/mailer.js';
import { JWT_SECRET } from '../../middleware/authMiddleware.js';

/**
 * Generate a random 6-digit OTP string
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Register a new user and send verification OTP email
 */
export const registerUser = async ({ name, email, password, role = 'warehouse_staff' }) => {
  // Check if user already exists
  const existingRes = await query('SELECT id, is_verified FROM users WHERE email = $1', [email.toLowerCase()]);
  
  if (existingRes.rows.length > 0) {
    const existing = existingRes.rows[0];
    if (existing.is_verified) {
      throw new Error('An account with this email address already exists.');
    } else {
      // User exists but is unverified; generate new OTP and update password/role
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      const passwordHash = await bcrypt.hash(password, 10);

      await query(
        `UPDATE users 
         SET name = $1, password_hash = $2, role = $3, verification_otp = $4, otp_expires_at = $5 
         WHERE id = $6`,
        [name, passwordHash, role, otp, otpExpires, existing.id]
      );

      await sendVerificationEmail(email.toLowerCase(), name, otp);
      return {
        message: 'Account updated. A new verification OTP code has been sent to your email.',
        email: email.toLowerCase(),
        requiresVerification: true,
      };
    }
  }

  // Create new user
  const passwordHash = await bcrypt.hash(password, 10);
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  const insertRes = await query(
    `INSERT INTO users (name, email, password_hash, role, is_verified, verification_otp, otp_expires_at)
     VALUES ($1, $2, $3, $4, FALSE, $5, $6)
     RETURNING id, name, email, role, is_verified`,
    [name, email.toLowerCase(), passwordHash, role, otp, otpExpires]
  );

  const newUser = insertRes.rows[0];

  // Dispatch OTP email
  await sendVerificationEmail(newUser.email, newUser.name, otp);

  return {
    message: 'Registration successful! Please check your email for the 6-digit OTP verification code.',
    user: newUser,
    requiresVerification: true,
  };
};

/**
 * Verify Email using 6-Digit OTP Code
 */
export const verifyEmailOTP = async ({ email, otp }) => {
  const userRes = await query(
    'SELECT id, name, email, role, is_verified, verification_otp, otp_expires_at FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (userRes.rows.length === 0) {
    throw new Error('User account not found.');
  }

  const user = userRes.rows[0];

  if (user.is_verified) {
    return { message: 'Account is already verified. You can log in.', alreadyVerified: true };
  }

  if (user.verification_otp !== otp) {
    throw new Error('Invalid OTP code. Please check your email and try again.');
  }

  if (new Date(user.otp_expires_at) < new Date()) {
    throw new Error('OTP code has expired. Please request a new verification code.');
  }

  // Mark account as verified and clear OTP fields
  await query(
    `UPDATE users 
     SET is_verified = TRUE, verification_otp = NULL, otp_expires_at = NULL 
     WHERE id = $1`,
    [user.id]
  );

  // Generate JWT token upon successful verification
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    message: 'Email verified successfully! Welcome to StockSense.',
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, is_verified: true },
  };
};

/**
 * Resend OTP Code to User Email
 */
export const resendVerificationOTP = async (email) => {
  const userRes = await query('SELECT id, name, email, is_verified FROM users WHERE email = $1', [email.toLowerCase()]);
  if (userRes.rows.length === 0) {
    throw new Error('User account not found.');
  }

  const user = userRes.rows[0];
  if (user.is_verified) {
    throw new Error('Account is already verified.');
  }

  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

  await query(
    'UPDATE users SET verification_otp = $1, otp_expires_at = $2 WHERE id = $3',
    [otp, otpExpires, user.id]
  );

  await sendVerificationEmail(user.email, user.name, otp);

  return { message: 'A new 6-digit OTP verification code has been sent to your email.' };
};

/**
 * Authenticate User Login
 */
export const loginUser = async ({ email, password }) => {
  const userRes = await query(
    'SELECT id, name, email, password_hash, role, is_verified FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (userRes.rows.length === 0) {
    throw new Error('Invalid email or password.');
  }

  const user = userRes.rows[0];

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw new Error('Invalid email or password.');
  }

  if (!user.is_verified) {
    // Generate fresh OTP and prompt user to verify
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await query(
      'UPDATE users SET verification_otp = $1, otp_expires_at = $2 WHERE id = $3',
      [otp, otpExpires, user.id]
    );
    await sendVerificationEmail(user.email, user.name, otp);

    const errorObj = new Error('Email not verified. A fresh OTP code has been sent to your email.');
    errorObj.requiresVerification = true;
    errorObj.email = user.email;
    throw errorObj;
  }

  // Issue JWT Token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    message: 'Login successful.',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
    },
  };
};

/**
 * Initiate Password Reset via Email OTP
 */
export const requestPasswordReset = async (email) => {
  const userRes = await query('SELECT id, name, email FROM users WHERE email = $1', [email.toLowerCase()]);
  if (userRes.rows.length === 0) {
    // Don't reveal account existence for security
    return { message: 'If an account exists with this email, a password reset OTP has been sent.' };
  }

  const user = userRes.rows[0];
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

  await query(
    'UPDATE users SET verification_otp = $1, otp_expires_at = $2 WHERE id = $3',
    [otp, otpExpires, user.id]
  );

  await sendPasswordResetEmail(user.email, user.name, otp);

  return { message: 'If an account exists with this email, a password reset OTP has been sent.' };
};

/**
 * Reset Password using OTP
 */
export const resetPasswordWithOTP = async ({ email, otp, newPassword }) => {
  const userRes = await query(
    'SELECT id, verification_otp, otp_expires_at FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (userRes.rows.length === 0) {
    throw new Error('User not found.');
  }

  const user = userRes.rows[0];

  if (user.verification_otp !== otp) {
    throw new Error('Invalid OTP code.');
  }

  if (new Date(user.otp_expires_at) < new Date()) {
    throw new Error('OTP code has expired.');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await query(
    `UPDATE users 
     SET password_hash = $1, is_verified = TRUE, verification_otp = NULL, otp_expires_at = NULL 
     WHERE id = $2`,
    [passwordHash, user.id]
  );

  return { message: 'Password reset successful! You can now log in with your new password.' };
};

/**
 * Update User Profile (Name & Email)
 */
export const updateUserProfile = async (userId, { name, email }) => {
  if (email) {
    const existing = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [email.toLowerCase(), userId]);
    if (existing.rows.length > 0) {
      throw new Error('This email address is already in use by another account.');
    }
  }

  const result = await query(
    `UPDATE users
     SET name = COALESCE($1, name),
         email = COALESCE($2, email)
     WHERE id = $3
     RETURNING id, name, email, role, is_verified, created_at`,
    [name, email ? email.toLowerCase() : null, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('User account not found.');
  }

  return {
    message: 'Profile updated successfully.',
    user: result.rows[0],
  };
};

/**
 * Change User Password (Requires current password verification)
 */
export const changeUserPassword = async (userId, { currentPassword, newPassword }) => {
  const userRes = await query('SELECT id, password_hash FROM users WHERE id = $1', [userId]);
  if (userRes.rows.length === 0) {
    throw new Error('User account not found.');
  }

  const user = userRes.rows[0];

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    throw new Error('Current password is incorrect. Please try again.');
  }

  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);

  return { message: 'Password changed successfully!' };
};

