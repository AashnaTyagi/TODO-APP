/**
 * errorHandler.js — Centralized Express error handling middleware
 * Normalizes Mongoose, JWT, and application errors into consistent API responses
 */

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ── Mongoose Validation Error ──────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join('. ');
  }

  // ── Mongoose Duplicate Key Error ──────────────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with this ${field} already exists.`;
  }

  // ── Mongoose CastError (invalid ObjectId) ─────────────────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID format.';
  }

  // ── Log errors in development ──────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR ${statusCode}] ${message}`);
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
