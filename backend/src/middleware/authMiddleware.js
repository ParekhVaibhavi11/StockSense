import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'stocksense_super_secret_jwt_key_2026';

/**
 * Authenticate JWT Token from Authorization Header
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Authorization token missing or malformed.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from DB to ensure account is active and verified
    const userRes = await query(
      'SELECT id, name, email, role, is_verified FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token. User not found.',
      });
    }

    req.user = userRes.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Authentication token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token.',
    });
  }
};

/**
 * Enforce that the user account has completed Email OTP Verification
 */
export const requireVerified = (req, res, next) => {
  if (!req.user || !req.user.is_verified) {
    return res.status(403).json({
      success: false,
      error: 'Email verification required. Please verify your email via OTP to continue.',
    });
  }
  next();
};

/**
 * Enforce Role-Based Access Control (RBAC)
 * @param {Array<string>} roles - e.g. ['inventory_manager']
 */
export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden. Action restricted to: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

export { JWT_SECRET };
