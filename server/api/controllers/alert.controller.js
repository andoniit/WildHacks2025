const AlertLog = require('../models/alertLog.model');
const User = require('../models/user.model');
const Contact = require('../models/contact.model');
const { ApiError } = require('../../utils/errorHandler');
const { sendSMS } = require('../../services/twilio.service');

/**
 * Create a new alert
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createAlert = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { to, symptoms, notes, sendSMS: shouldSendSMS, contactIds } = req.body;
    
    // Create alert entry
    let alertLog = await AlertLog.findOne({ email });
    
    if (!alertLog) {
      alertLog = new AlertLog({ email, alertInfo: [] });
    }
    
    // Create new alert info
    const newAlert = {
      to,
      date: new Date(),
      symptoms: symptoms || [],
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add to alertInfo array
    alertLog.alertInfo.push(newAlert);
    await alertLog.save();
    
    // If SMS should be sent and we have contactIds
    if (shouldSendSMS && contactIds && contactIds.length > 0) {
      // Get user info
      const user = await User.findOne({ email }).select('name');
      
      // Get contacts
      const contactDoc = await Contact.findOne({ email });
      
      if (contactDoc) {
        // Filter contacts by provided contactIds
        const selectedContacts = contactDoc.contacts.filter(
          contact => contactIds.includes(contact._id.toString())
        );
        
        // Send SMS to each contact
        for (const contact of selectedContacts) {
          const message = `ALERT from ${user.name}: ${symptoms.join(', ')}. ${notes}`;
          
          try {
            await sendSMS(contact.phoneNumber, message);
          } catch (error) {
            console.error(`Failed to send SMS to ${contact.name}: ${error.message}`);
            // Continue with other contacts even if one fails
          }
        }
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      alert: newAlert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all alerts for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAlerts = async (req, res, next) => {
  try {
    const { email } = req.user;
    
    // Find alert log
    const alertLog = await AlertLog.findOne({ email });
    
    if (!alertLog) {
      return res.status(200).json({
        success: true,
        alerts: []
      });
    }
    
    // Sort alerts by date descending (newest first)
    const sortedAlerts = [...alertLog.alertInfo].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    
    res.status(200).json({
      success: true,
      alerts: sortedAlerts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get alert details by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAlertById = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { id } = req.params;
    
    // Find alert log
    const alertLog = await AlertLog.findOne({ email });
    
    if (!alertLog) {
      throw new ApiError(404, 'Alert log not found');
    }
    
    // Find alert by ID
    const alert = alertLog.alertInfo.id(id);
    
    if (!alert) {
      throw new ApiError(404, 'Alert not found');
    }
    
    res.status(200).json({
      success: true,
      alert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update alert
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateAlert = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { id } = req.params;
    const { symptoms, notes } = req.body;
    
    // Find alert log
    const alertLog = await AlertLog.findOne({ email });
    
    if (!alertLog) {
      throw new ApiError(404, 'Alert log not found');
    }
    
    // Find alert by ID
    const alert = alertLog.alertInfo.id(id);
    
    if (!alert) {
      throw new ApiError(404, 'Alert not found');
    }
    
    // Update fields
    if (symptoms) alert.symptoms = symptoms;
    if (notes !== undefined) alert.notes = notes;
    alert.updatedAt = new Date();
    
    await alertLog.save();
    
    res.status(200).json({
      success: true,
      message: 'Alert updated successfully',
      alert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete alert
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteAlert = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { id } = req.params;
    
    // Find alert log
    const alertLog = await AlertLog.findOne({ email });
    
    if (!alertLog) {
      throw new ApiError(404, 'Alert log not found');
    }
    
    // Check if alert exists
    const alertExists = alertLog.alertInfo.id(id);
    
    if (!alertExists) {
      throw new ApiError(404, 'Alert not found');
    }
    
    // Remove alert
    alertLog.alertInfo.pull(id);
    await alertLog.save();
    
    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get alert statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAlertStats = async (req, res, next) => {
  try {
    const { email } = req.user;
    
    // Find alert log
    const alertLog = await AlertLog.findOne({ email });
    
    if (!alertLog || alertLog.alertInfo.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          totalAlerts: 0,
          alertsByMonth: [],
          commonSymptoms: []
        }
      });
    }
    
    // Calculate total alerts
    const totalAlerts = alertLog.alertInfo.length;
    
    // Calculate alerts by month
    const alertsByMonth = {};
    alertLog.alertInfo.forEach(alert => {
      const date = new Date(alert.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!alertsByMonth[monthYear]) {
        alertsByMonth[monthYear] = 0;
      }
      
      alertsByMonth[monthYear]++;
    });
    
    // Calculate most common symptoms
    const symptomsCount = {};
    alertLog.alertInfo.forEach(alert => {
      alert.symptoms.forEach(symptom => {
        if (!symptomsCount[symptom]) {
          symptomsCount[symptom] = 0;
        }
        
        symptomsCount[symptom]++;
      });
    });
    
    // Sort symptoms by count
    const commonSymptoms = Object.entries(symptomsCount)
      .map(([symptom, count]) => ({ symptom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Get top 5
    
    res.status(200).json({
      success: true,
      stats: {
        totalAlerts,
        alertsByMonth: Object.entries(alertsByMonth).map(([month, count]) => ({ month, count })),
        commonSymptoms
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAlert,
  getAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
  getAlertStats
};
