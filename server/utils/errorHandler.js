/**
 * Centralized error handling utility
 */
const logger = require('./logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Handler for converting errors to proper API responses
 * @param {Error} err - Error object
 * @param {Object} res - Express response object
 */
const handleError = (err, res) => {
  const { statusCode, message } = err;
  
  // Log error details
  logger.error(`${statusCode || 500} - ${message} - ${err.stack}`);
  
  // Send standardized error response
  res.status(statusCode || 500).json({
    status: 'error',
    statusCode: statusCode || 500,
    message: message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Convert mongoose validation errors to API errors
 * @param {Error} err - Mongoose error
 * @returns {ApiError} - Formatted API error
 */
const convertMongooseError = (err) => {
  let message = 'Validation error';
  let statusCode = 400;
  
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    message = `Invalid input: ${errors.join(', ')}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = `Duplicate value: ${Object.keys(err.keyValue).join(', ')} already exists`;
  }
  
  return new ApiError(statusCode, message);
};

module.exports = {
  ApiError,
  handleError,
  convertMongooseError
};
