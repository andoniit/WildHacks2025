const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const CycleLog = require('../models/cycleLog.model');
const Contact = require('../models/contact.model');
const { ApiError } = require('../../utils/errorHandler');
const config = require('../../config/app.config');

/**
 * Register a new user - Complete signup after multi-step form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const register = async (req, res, next) => {
  try {
    // Step 1 data: Basic user info
    const { email, name, age, phoneNumber, password } = req.body.user || {};
    
    // Step 2 data: Cycle information
    const { avgCycleLength, lastCycleStart, lastCycleEnd, symptoms, notes } = req.body.cycleInfo || {};
    
    // Step 3 data: Contact information
    const contacts = req.body.contacts || [];
    
    // Validate step 1 data
    if (!email || !name || !age || !phoneNumber || !password) {
      throw new ApiError(400, 'Please provide all required user information');
    }
    
    // Validate step 2 data
    if (!avgCycleLength || !lastCycleStart || !lastCycleEnd) {
      throw new ApiError(400, 'Please provide all required cycle information');
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      throw new ApiError(409, 'User with this email already exists');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = await User.create({
      email,
      name,
      age,
      phoneNumber,
      password: hashedPassword,
      avgCycleLength,
      cycleStatus: 'inactive' // Default status
    });
    
    // Create initial cycle log
    if (lastCycleStart && lastCycleEnd) {
      await CycleLog.create({
        email,
        cycInfo: [{
          startDate: new Date(lastCycleStart),
          endDate: new Date(lastCycleEnd),
          symptoms: symptoms || [],
          notes: notes || ''
        }]
      });
    }
    
    // Create contacts if provided
    if (contacts && contacts.length > 0) {
      const contactsData = {
        email,
        contacts: contacts.map(contact => ({
          name: contact.name,
          phoneNumber: contact.phoneNumber,
          relation: contact.relation,
          notificationPreferences: {
            customAlerts: contact.customAlerts || [],
            receiveUpdates: true
          }
        }))
      };
      
      await Contact.create(contactsData);
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );
    
    // Return user data and token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        email: user.email,
        name: user.name,
        age: user.age,
        phoneNumber: user.phoneNumber,
        avgCycleLength: user.avgCycleLength,
        cycleStatus: user.cycleStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate request
    if (!email || !password) {
      throw new ApiError(400, 'Please provide email and password');
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    // Check if user exists
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }
    
    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );
    
    // Return user data and token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        email: user.email,
        name: user.name,
        age: user.age,
        phoneNumber: user.phoneNumber,
        avgCycleLength: user.avgCycleLength,
        cycleStatus: user.cycleStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = (req, res) => {
  // Client-side should remove the token
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

/**
 * Verify user token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from request
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new ApiError(401, 'No token provided');
    }
    
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Check if user exists
    const user = await User.findOne({ email: decoded.email }).select('-password');
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    } else {
      next(error);
    }
  }
};

/**
 * Forgot password functionality
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Validate request
    if (!email) {
      throw new ApiError(400, 'Please provide email address');
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    // Check if user exists
    if (!user) {
      // We don't want to reveal if a user exists or not for security reasons
      return res.status(200).json({
        success: true,
        message: 'If a user with that email exists, a password reset link has been sent'
      });
    }
    
    // Generate reset token (would typically send via email)
    // For hackathon purposes, we'll just return it in the response
    const resetToken = jwt.sign(
      { email: user.email },
      config.jwtSecret,
      { expiresIn: '15m' } // Short expiration for reset tokens
    );
    
    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent',
      resetToken // In a real app, this would be sent via email, not exposed in the API response
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    // Validate request
    if (!token || !newPassword) {
      throw new ApiError(400, 'Please provide reset token and new password');
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired token');
    }
    
    // Find user by email
    const user = await User.findOne({ email: decoded.email });
    
    // Check if user exists
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user password
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  verifyToken,
  forgotPassword,
  resetPassword
};
