import * as authService from './auth.service.js';

/**
 * Register User Controller
 */
export const handleRegister = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    return res.status(201).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Verify OTP Controller
 */
export const handleVerifyOTP = async (req, res, next) => {
  try {
    const result = await authService.verifyEmailOTP(req.body);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Resend OTP Controller
 */
export const handleResendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.resendVerificationOTP(email);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Login Controller
 */
export const handleLogin = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.requiresVerification) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: error.email,
        error: error.message,
      });
    }
    return res.status(401).json({ success: false, error: error.message });
  }
};

/**
 * Forgot Password Request Controller
 */
export const handleForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Reset Password Controller
 */
export const handleResetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPasswordWithOTP(req.body);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Get User Profile Controller
 */
export const handleGetProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
