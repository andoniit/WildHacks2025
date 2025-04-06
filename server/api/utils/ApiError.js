/**
 * Custom API Error class
 * Used for standardizing error responses across the API
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {Object} errors - Additional error details
   * @param {boolean} isOperational - Whether this is an operational error that can be handled
   */
  constructor(statusCode, message, errors = {}, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    this.name = this.constructor.name;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
