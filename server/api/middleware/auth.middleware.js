const jwt = require('jsonwebtoken');
const { ApiError } = require('../../utils/errorHandler');
const User = require('../models/user.model');
const config = require('../../config/app.config');

/**
 * Authentication middleware to verify JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Check if user still exists
    const user = await User.findOne({ email: decoded.email });
    
    if (!user) {
      throw new ApiError(401, 'User no longer exists');
    }
    
    // Add user info to request object
    req.user = {
      email: user.email,
      name: user.name
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Token expired'));
    } else {
      next(error);
    }
  }
};

module.exports = {
  verifyToken
};
