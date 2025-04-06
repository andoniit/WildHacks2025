const User = require('../models/user.model');
const CycleLog = require('../models/cycleLog.model');
const geminiService = require('../../services/gemini.service');
const { ApiError } = require('../../utils/errorHandler');

/**
 * Log a new symptom
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const logSymptom = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { date, symptoms, severity, notes } = req.body;
    
    // Validate request
    if (!date || !symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      throw new ApiError(400, 'Please provide date and symptoms');
    }
    
    // Find user's cycle log
    let cycleLog = await CycleLog.findOne({ email });
    
    if (!cycleLog) {
      throw new ApiError(404, 'No cycle data found. Please log a cycle first');
    }
    
    // Find the cycle entry for the given date
    const cycleEntry = cycleLog.cycInfo.find(cycle => {
      const cycleStartDate = new Date(cycle.startDate);
      const cycleEndDate = new Date(cycle.endDate);
      const symptomDate = new Date(date);
      
      return symptomDate >= cycleStartDate && symptomDate <= cycleEndDate;
    });
    
    if (!cycleEntry) {
      // If no cycle entry found for the date, add symptoms to the most recent cycle
      const latestCycle = cycleLog.cycInfo[cycleLog.cycInfo.length - 1];
      
      if (!latestCycle.symptoms) {
        latestCycle.symptoms = [];
      }
      
      // Add new symptoms to the list
      symptoms.forEach(symptom => {
        if (!latestCycle.symptoms.includes(symptom)) {
          latestCycle.symptoms.push(symptom);
        }
      });
      
      // Add notes if provided
      if (notes) {
        latestCycle.notes = latestCycle.notes ? `${latestCycle.notes}\n${notes}` : notes;
      }
    } else {
      // Add symptoms to the found cycle entry
      if (!cycleEntry.symptoms) {
        cycleEntry.symptoms = [];
      }
      
      // Add new symptoms to the list
      symptoms.forEach(symptom => {
        if (!cycleEntry.symptoms.includes(symptom)) {
          cycleEntry.symptoms.push(symptom);
        }
      });
      
      // Add notes if provided
      if (notes) {
        cycleEntry.notes = cycleEntry.notes ? `${cycleEntry.notes}\n${notes}` : notes;
      }
    }
    
    await cycleLog.save();
    
    res.status(201).json({
      success: true,
      message: 'Symptoms logged successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get symptom history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getSymptomHistory = async (req, res, next) => {
  try {
    const { email } = req.user;
    
    // Find cycle log
    const cycleLog = await CycleLog.findOne({ email });
    
    if (!cycleLog || cycleLog.cycInfo.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No symptom history found',
        history: []
      });
    }
    
    // Extract symptoms from cycle entries
    const symptomHistory = cycleLog.cycInfo.map(cycle => ({
      cycleId: cycle._id,
      startDate: cycle.startDate,
      endDate: cycle.endDate,
      symptoms: cycle.symptoms || [],
      notes: cycle.notes || ''
    }));
    
    res.status(200).json({
      success: true,
      history: symptomHistory
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update symptom log
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateSymptomLog = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { cycleId } = req.params;
    const { symptoms, notes } = req.body;
    
    // Find cycle log
    const cycleLog = await CycleLog.findOne({ email });
    
    if (!cycleLog) {
      throw new ApiError(404, 'Cycle log not found');
    }
    
    // Find cycle entry by ID
    const cycleIndex = cycleLog.cycInfo.findIndex(
      cycle => cycle._id.toString() === cycleId
    );
    
    if (cycleIndex === -1) {
      throw new ApiError(404, 'Cycle entry not found');
    }
    
    // Update symptoms if provided
    if (symptoms) {
      cycleLog.cycInfo[cycleIndex].symptoms = symptoms;
    }
    
    // Update notes if provided
    if (notes !== undefined) {
      cycleLog.cycInfo[cycleIndex].notes = notes;
    }
    
    await cycleLog.save();
    
    res.status(200).json({
      success: true,
      message: 'Symptom log updated successfully',
      symptoms: cycleLog.cycInfo[cycleIndex].symptoms,
      notes: cycleLog.cycInfo[cycleIndex].notes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete symptom log
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteSymptomLog = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { cycleId } = req.params;
    
    // Find cycle log
    const cycleLog = await CycleLog.findOne({ email });
    
    if (!cycleLog) {
      throw new ApiError(404, 'Cycle log not found');
    }
    
    // Find cycle entry by ID
    const cycleIndex = cycleLog.cycInfo.findIndex(
      cycle => cycle._id.toString() === cycleId
    );
    
    if (cycleIndex === -1) {
      throw new ApiError(404, 'Cycle entry not found');
    }
    
    // Clear symptoms and notes
    cycleLog.cycInfo[cycleIndex].symptoms = [];
    cycleLog.cycInfo[cycleIndex].notes = '';
    
    await cycleLog.save();
    
    res.status(200).json({
      success: true,
      message: 'Symptom log cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get insights based on symptom history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getSymptomInsights = async (req, res, next) => {
  try {
    const { email } = req.user;
    
    // Get user information
    const user = await User.findOne({ email }).select('name age avgCycleLength');
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Get symptom history
    const cycleLog = await CycleLog.findOne({ email });
    
    if (!cycleLog || cycleLog.cycInfo.length === 0) {
      throw new ApiError(404, 'No symptom history found to analyze');
    }
    
    // Extract all symptoms from recent cycles (last 3)
    const recentCycles = cycleLog.cycInfo.slice(-3);
    
    // Count symptom frequency
    const symptomFrequency = {};
    recentCycles.forEach(cycle => {
      if (cycle.symptoms && cycle.symptoms.length > 0) {
        cycle.symptoms.forEach(symptom => {
          symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1;
        });
      }
    });
    
    // Identify common symptoms
    const commonSymptoms = Object.entries(symptomFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom, count]) => symptom);
    
    // Get AI insights using Gemini
    const insights = await geminiService.getSymptomInsights({
      userName: user.name,
      age: user.age,
      avgCycleLength: user.avgCycleLength,
      symptoms: commonSymptoms,
      cycles: recentCycles.map(cycle => ({
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        symptoms: cycle.symptoms || []
      }))
    });
    
    res.status(200).json({
      success: true,
      commonSymptoms,
      insights: insights.suggestions,
      recommendations: insights.recommendations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  logSymptom,
  getSymptomHistory,
  updateSymptomLog,
  deleteSymptomLog,
  getSymptomInsights
};
