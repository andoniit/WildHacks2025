const User = require('../models/user.model');
const CycleLog = require('../models/cycleLog.model');
const Contact = require('../models/contact.model');
const CalendarLog = require('../models/calendarLog.model');
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
 * Get user timeline data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getTimelineData = async (req, res, next) => {
  try {
    const { email } = req.user;
    
    // Get user data
    const user = await User.findOne({ email }).select('-password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Fetch cycle data for this user
    const cycleData = await CycleLog.findOne({ email });
    
    // Fetch calendar events
    const calendarData = await CalendarLog.findOne({ email });
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          cycleLength: user.cycleLength,
          periodLength: user.periodLength
        },
        timeline: {
          cycles: cycleData ? cycleData.cycles : [],
          predictions: generatePredictions(user, cycleData),
          calendarEvents: calendarData ? calendarData.calendarInfo : []
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate cycle predictions based on user data
 * @param {Object} user - User object
 * @param {Object} cycleData - Cycle data
 * @returns {Array} - Array of predictions
 */
const generatePredictions = (user, cycleData) => {
  const predictions = [];
  
  // Return empty predictions if there's no cycle data or if cycles array is missing/empty
  if (!cycleData || !cycleData.cycles || cycleData.cycles.length < 2) {
    return predictions;
  }
  
  try {
    const sortedCycles = [...cycleData.cycles].sort((a, b) => 
      new Date(b.startDate) - new Date(a.startDate)
    );
    
    if (sortedCycles.length === 0) {
      return predictions;
    }
    
    const lastCycle = sortedCycles[0];
    const lastStartDate = new Date(lastCycle.startDate);
    
    // Predict next period
    const nextPeriodDate = new Date(lastStartDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + (user.cycleLength || 28));
    
    predictions.push({
      type: 'Period',
      date: nextPeriodDate,
      confidence: sortedCycles.length > 3 ? 'High' : 'Medium'
    });
    
    // Predict ovulation (typically 14 days before next period)
    const ovulationDate = new Date(nextPeriodDate);
    ovulationDate.setDate(nextPeriodDate.getDate() - 14);
    
    // Only add ovulation prediction if it's in the future
    if (ovulationDate > new Date()) {
      predictions.push({
        type: 'Ovulation',
        date: ovulationDate,
        confidence: sortedCycles.length > 3 ? 'Medium' : 'Low'
      });
    }
    
    return predictions;
  } catch (error) {
    console.error('Error generating predictions:', error);
    return predictions; // Return empty predictions array on error
  }
};

// Export controller functions
module.exports = {
  getUserProfile,
  updateUserProfile,
  updateCycleStatus,
  deleteUser,
  getTimelineData
};
