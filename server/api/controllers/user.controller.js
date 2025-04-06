const User = require('../models/user.model');
const CycleLog = require('../models/cycleLog.model');
const Contact = require('../models/contact.model');
const bcrypt = require('bcryptjs');
const { ApiError } = require('../../utils/errorHandler');

/**
 * Get user profile
 * @param {Object} req - Express request object 
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUserProfile = async (req, res, next) => {
  try {
    const { email } = req.user;
    
    // Find user by email
    const user = await User.findOne({ email }).select('-password');
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateUserProfile = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { name, age, phoneNumber, avgCycleLength, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (age) user.age = age;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (avgCycleLength) user.avgCycleLength = avgCycleLength;
    
    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    
    // Save updated user
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
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
 * Update user cycle status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateCycleStatus = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { cycleStatus } = req.body;
    
    // Validate cycle status
    const validStatuses = ['active', 'inactive', 'menstrual', 'follicular', 'ovulation', 'luteal'];
    if (!validStatuses.includes(cycleStatus)) {
      throw new ApiError(400, 'Invalid cycle status');
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Update cycle status
    user.cycleStatus = cycleStatus;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Cycle status updated successfully',
      cycleStatus: user.cycleStatus
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteUser = async (req, res, next) => {
  try {
    const { email } = req.user;
    
    // Find and delete user
    const user = await User.findOneAndDelete({ email });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Delete all associated data
    await CycleLog.deleteMany({ email });
    await Contact.deleteMany({ email });
    
    res.status(200).json({
      success: true,
      message: 'User account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user dashboard data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getDashboardData = async (req, res, next) => {
  try {
    const { email } = req.user;
    
    // Get user data
    const user = await User.findOne({ email }).select('-password');
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Get recent cycle data
    const cycleData = await CycleLog.findOne({ email });
    
    // Get contacts count
    const contactsData = await Contact.findOne({ email });
    const contactsCount = contactsData ? contactsData.contacts.length : 0;
    
    res.status(200).json({
      success: true,
      dashboard: {
        user: {
          name: user.name,
          cycleStatus: user.cycleStatus,
          avgCycleLength: user.avgCycleLength
        },
        cycleInfo: cycleData ? cycleData.cycInfo.slice(-3) : [], // Last 3 cycles
        contactsCount: contactsCount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateCycleStatus,
  deleteUser,
  getDashboardData
};
