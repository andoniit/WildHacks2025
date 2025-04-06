const CycleLog = require('../models/cycleLog.model');
const User = require('../models/user.model');
const { ApiError } = require('../../utils/errorHandler');
const dateUtils = require('../../utils/dateUtils');

/**
 * Get user's cycle history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getCycleHistory = async (req, res, next) => {
  try {
    const { email } = req.user;
    
    // Find cycle log by email
    const cycleLog = await CycleLog.findOne({ email });
    
    if (!cycleLog) {
      return res.status(200).json({
        success: true,
        message: 'No cycle history found',
        cycles: []
      });
    }
    
    res.status(200).json({
      success: true,
      cycles: cycleLog.cycInfo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add new cycle entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const addCycleEntry = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { startDate, endDate, symptoms, notes } = req.body;
    
    // Create cycle entry
    const newCycle = {
      startDate,
      endDate,
      symptoms: symptoms || [],
      notes: notes || ''
    };
    
    // Find user cycle log
    let cycleLog = await CycleLog.findOne({ email });
    
    if (!cycleLog) {
      // Create new cycle log if not exist
      cycleLog = await CycleLog.create({
        email,
        cycInfo: [newCycle]
      });
    } else {
      // Add new cycle to existing log
      cycleLog.cycInfo.push(newCycle);
      await cycleLog.save();
    }
    
    // Update user cycle status
    const user = await User.findOne({ email });
    if (user) {
      // Calculate cycle length from new entry
      const cycleDuration = dateUtils.daysBetweenDates(startDate, endDate);
      
      // Update average cycle length if significantly different
      if (Math.abs(cycleDuration - user.avgCycleLength) > 5) {
        // Calculate new average from last 3 cycles
        const recentCycles = cycleLog.cycInfo.slice(-3);
        const avgLength = recentCycles.reduce((sum, cycle) => {
          return sum + dateUtils.daysBetweenDates(cycle.startDate, cycle.endDate);
        }, 0) / recentCycles.length;
        
        user.avgCycleLength = Math.round(avgLength);
      }
      
      // Update user cycle status based on current date
      const today = new Date();
      const lastCycle = cycleLog.cycInfo[cycleLog.cycInfo.length - 1];
      
      if (today >= new Date(lastCycle.startDate) && today <= new Date(lastCycle.endDate)) {
        user.cycleStatus = 'menstrual';
      } else {
        // Calculate current phase based on last cycle
        const phaseInfo = dateUtils.determineCyclePhase(
          lastCycle.startDate, 
          user.avgCycleLength, 
          dateUtils.daysBetweenDates(lastCycle.startDate, lastCycle.endDate)
        );
        user.cycleStatus = phaseInfo.phase;
      }
      
      await user.save();
    }
    
    res.status(201).json({
      success: true,
      message: 'Cycle entry added successfully',
      cycle: newCycle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update cycle entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateCycleEntry = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { entryId } = req.params;
    const { startDate, endDate, symptoms, notes } = req.body;
    
    // Find cycle log
    const cycleLog = await CycleLog.findOne({ email });
    
    if (!cycleLog) {
      throw new ApiError(404, 'Cycle log not found');
    }
    
    // Find cycle entry by ID
    const cycleIndex = cycleLog.cycInfo.findIndex(
      cycle => cycle._id.toString() === entryId
    );
    
    if (cycleIndex === -1) {
      throw new ApiError(404, 'Cycle entry not found');
    }
    
    // Update cycle entry
    if (startDate) cycleLog.cycInfo[cycleIndex].startDate = startDate;
    if (endDate) cycleLog.cycInfo[cycleIndex].endDate = endDate;
    if (symptoms) cycleLog.cycInfo[cycleIndex].symptoms = symptoms;
    if (notes !== undefined) cycleLog.cycInfo[cycleIndex].notes = notes;
    
    await cycleLog.save();
    
    res.status(200).json({
      success: true,
      message: 'Cycle entry updated successfully',
      cycle: cycleLog.cycInfo[cycleIndex]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete cycle entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteCycleEntry = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { entryId } = req.params;
    
    // Find cycle log
    const cycleLog = await CycleLog.findOne({ email });
    
    if (!cycleLog) {
      throw new ApiError(404, 'Cycle log not found');
    }
    
    // Filter out the cycle entry to be deleted
    const initialLength = cycleLog.cycInfo.length;
    cycleLog.cycInfo = cycleLog.cycInfo.filter(
      cycle => cycle._id.toString() !== entryId
    );
    
    if (cycleLog.cycInfo.length === initialLength) {
      throw new ApiError(404, 'Cycle entry not found');
    }
    
    await cycleLog.save();
    
    res.status(200).json({
      success: true,
      message: 'Cycle entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get cycle predictions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPredictions = async (req, res, next) => {
  try {
    const { email } = req.user;
    
    // Get user data and cycle history
    const user = await User.findOne({ email });
    const cycleLog = await CycleLog.findOne({ email });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    if (!cycleLog || cycleLog.cycInfo.length === 0) {
      throw new ApiError(404, 'No cycle data found to make predictions');
    }
    
    // Get the most recent cycle
    const latestCycle = cycleLog.cycInfo[cycleLog.cycInfo.length - 1];
    
    // Calculate predictions for next 3 cycles
    const predictions = [];
    let lastPredictedStart = new Date(latestCycle.startDate);
    
    for (let i = 0; i < 3; i++) {
      // Predict next cycle start date
      lastPredictedStart = dateUtils.predictNextCycleStartDate(
        lastPredictedStart, 
        user.avgCycleLength
      );
      
      // Calculate end date based on average period length
      const avgPeriodLength = calculateAveragePeriodLength(cycleLog.cycInfo);
      const predictedEnd = new Date(lastPredictedStart);
      predictedEnd.setDate(predictedEnd.getDate() + avgPeriodLength);
      
      // Add prediction
      predictions.push({
        startDate: dateUtils.formatDate(lastPredictedStart),
        endDate: dateUtils.formatDate(predictedEnd),
        periodPhase: {
          start: dateUtils.formatDate(lastPredictedStart),
          end: dateUtils.formatDate(predictedEnd)
        },
        ovulationPhase: {
          start: dateUtils.formatDate(new Date(lastPredictedStart.setDate(lastPredictedStart.getDate() + user.avgCycleLength - 14))),
          end: dateUtils.formatDate(new Date(lastPredictedStart.setDate(lastPredictedStart.getDate() + 2)))
        }
      });
    }
    
    res.status(200).json({
      success: true,
      predictions,
      currentPhase: user.cycleStatus
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to calculate average period length
 * @param {Array} cycles - Array of cycle entries
 * @returns {Number} - Average period length in days
 */
const calculateAveragePeriodLength = (cycles) => {
  if (!cycles || cycles.length === 0) {
    return 5; // Default average period length
  }
  
  const totalPeriodLength = cycles.reduce((sum, cycle) => {
    return sum + dateUtils.daysBetweenDates(cycle.startDate, cycle.endDate);
  }, 0);
  
  return Math.round(totalPeriodLength / cycles.length);
};

/**
 * Get user's current cycle
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getCurrentCycle = async (req, res, next) => {
  try {
    const { email } = req.user;
    
    // Find cycle log
    const cycleLog = await CycleLog.findOne({ email });
    
    if (!cycleLog || cycleLog.cycInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No cycle data found'
      });
    }
    
    // Get the most recent cycle
    const currentCycle = cycleLog.cycInfo[cycleLog.cycInfo.length - 1];
    
    // Get user for cycle status
    const user = await User.findOne({ email }).select('cycleStatus avgCycleLength');
    
    // Calculate days until next period
    const lastPeriodStart = new Date(currentCycle.startDate);
    const nextPeriodStart = dateUtils.predictNextCycleStartDate(lastPeriodStart, user.avgCycleLength);
    const today = new Date();
    const daysUntilNextPeriod = Math.ceil((nextPeriodStart - today) / (1000 * 60 * 60 * 24));
    
    // Calculate current phase info
    const phaseInfo = dateUtils.determineCyclePhase(
      currentCycle.startDate,
      user.avgCycleLength,
      dateUtils.daysBetweenDates(currentCycle.startDate, currentCycle.endDate)
    );
    
    res.status(200).json({
      success: true,
      currentCycle: {
        ...currentCycle.toObject(),
        cycleStatus: user.cycleStatus,
        currentPhase: phaseInfo.phase,
        daysIntoPhase: phaseInfo.daysIntoPhase,
        daysUntilNextPeriod: daysUntilNextPeriod > 0 ? daysUntilNextPeriod : 0,
        nextPeriodDate: dateUtils.formatDate(nextPeriodStart)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCycleHistory,
  addCycleEntry,
  updateCycleEntry,
  deleteCycleEntry,
  getPredictions,
  getCurrentCycle
};
