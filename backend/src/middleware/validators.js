/**
 * Express Middleware Validation Utilities for StockSense
 */

// Simple email format regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate presence of required fields in request body
 * @param {Array<string>} requiredKeys 
 */
export const validateRequiredFields = (requiredKeys) => {
  return (req, res, next) => {
    const missing = [];
    for (const key of requiredKeys) {
      if (req.body[key] === undefined || req.body[key] === null || req.body[key] === '') {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required field(s): ${missing.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Validate that item quantities are strictly positive numbers (> 0)
 */
export const validateQuantity = (req, res, next) => {
  const { quantity, lines } = req.body;

  // Single item quantity validation
  if (quantity !== undefined) {
    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a valid number greater than 0',
      });
    }
  }

  // Operation line items array validation
  if (Array.isArray(lines)) {
    if (lines.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Operation must contain at least one line item',
      });
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const qtyNum = Number(line.quantity);
      if (isNaN(qtyNum) || qtyNum <= 0) {
        return res.status(400).json({
          success: false,
          error: `Line ${i + 1} (${line.product_name || 'Item'}): Quantity must be greater than 0`,
        });
      }
    }
  }

  next();
};

/**
 * Validate email format syntax
 */
export const validateEmail = (req, res, next) => {
  const { email } = req.body;
  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address',
    });
  }
  next();
};

/**
 * Valid allowed status transitions state machine
 * Allowed transitions:
 * draft -> waiting, ready, canceled
 * waiting -> ready, canceled
 * ready -> done, canceled
 * done -> (immutable, no transition allowed)
 * canceled -> (immutable)
 */
const ALLOWED_TRANSITIONS = {
  draft: ['waiting', 'ready', 'canceled'],
  waiting: ['ready', 'canceled'],
  ready: ['done', 'canceled'],
  done: [],
  canceled: [],
};

/**
 * Enforce operation status transitions
 * @param {string} currentStatus 
 * @param {string} targetStatus 
 */
export const isValidStatusTransition = (currentStatus, targetStatus) => {
  if (currentStatus === targetStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
};
