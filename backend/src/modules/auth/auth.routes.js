import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validateRequiredFields, validateEmail } from '../../middleware/validators.js';
import { authenticate } from '../../middleware/authMiddleware.js';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  validateRequiredFields(['name', 'email', 'password']),
  validateEmail,
  authController.handleRegister
);

// POST /api/auth/verify-otp
router.post(
  '/verify-otp',
  validateRequiredFields(['email', 'otp']),
  validateEmail,
  authController.handleVerifyOTP
);

// POST /api/auth/resend-otp
router.post(
  '/resend-otp',
  validateRequiredFields(['email']),
  validateEmail,
  authController.handleResendOTP
);

// POST /api/auth/login
router.post(
  '/login',
  validateRequiredFields(['email', 'password']),
  validateEmail,
  authController.handleLogin
);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  validateRequiredFields(['email']),
  validateEmail,
  authController.handleForgotPassword
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  validateRequiredFields(['email', 'otp', 'newPassword']),
  validateEmail,
  authController.handleResetPassword
);

// GET /api/auth/me (Protected Profile)
router.get('/me', authenticate, authController.handleGetProfile);

// PUT /api/auth/profile (Update Name & Email)
router.put(
  '/profile',
  authenticate,
  validateRequiredFields(['name', 'email']),
  validateEmail,
  authController.handleUpdateProfile
);

// PUT /api/auth/change-password (Change Password)
router.put(
  '/change-password',
  authenticate,
  validateRequiredFields(['currentPassword', 'newPassword']),
  authController.handleChangePassword
);

export default router;
