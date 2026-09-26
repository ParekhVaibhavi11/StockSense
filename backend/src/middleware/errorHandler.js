/**
 * Global Express Error Handling Middleware for StockSense
 */
export const errorHandler = (err, req, res, next) => {
  console.error(`❌ [Error Handler] ${req.method} ${req.originalUrl}:`, err);

  // PostgreSQL Error Code mappings
  if (err.code === '23505') {
    // Unique violation
    return res.status(409).json({
      success: false,
      error: 'Conflict: A record with this unique attribute (e.g. SKU, Email, Code) already exists.',
      detail: err.detail,
    });
  }

  if (err.code === '23514') {
    // Check constraint violation
    return res.status(400).json({
      success: false,
      error: 'Constraint Violation: Stock quantity cannot be negative or drop below 0.',
      detail: err.detail,
    });
  }

  if (err.code === '23503') {
    // Foreign key violation
    return res.status(400).json({
      success: false,
      error: 'Reference Violation: Referenced location, product, or supplier does not exist.',
      detail: err.detail,
    });
  }

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;

  return res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error. Please try again later.',
  });
};
