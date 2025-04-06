const Contact = require('../models/contact.model');
const User = require('../models/user.model');
const twilioService = require('../../services/twilio.service');
const { ApiError } = require('../../utils/errorHandler');

/**
 * Send notification to one or more contacts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const sendNotification = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { contactIds, templateName, customMessage } = req.body;
    
    // Validate request
    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      throw new ApiError(400, 'Please provide at least one contact ID');
    }
    
    if (!templateName && !customMessage) {
      throw new ApiError(400, 'Please provide either a template name or custom message');
    }
    
    // Get user info for personalization
    const user = await User.findOne({ email }).select('name cycleStatus');
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Find contact document
    const contactDoc = await Contact.findOne({ email });
    
    if (!contactDoc) {
      throw new ApiError(404, 'No contacts found');
    }
    
    // Filter contacts by provided IDs
    const selectedContacts = contactDoc.contacts.filter(contact => 
      contactIds.includes(contact._id.toString()) && 
      contact.notificationPreferences.receiveUpdates
    );
    
    if (selectedContacts.length === 0) {
      throw new ApiError(404, 'No eligible contacts found with the provided IDs');
    }
    
    // Prepare data for message personalization
    const messageData = {
      userName: user.name,
      cycleStatus: user.cycleStatus,
      customMessage: customMessage || ''
    };
    
    // Send notifications to selected contacts
    const results = await twilioService.sendBatchNotifications(
      selectedContacts,
      templateName || 'general',
      messageData
    );
    
    // Update lastNotified timestamp for successfully notified contacts
    results.forEach(result => {
      if (result.success) {
        const contactIndex = contactDoc.contacts.findIndex(
          contact => contact._id.toString() === result.contact._id.toString()
        );
        
        if (contactIndex !== -1) {
          contactDoc.contacts[contactIndex].lastNotified = new Date();
        }
      }
    });
    
    await contactDoc.save();
    
    res.status(200).json({
      success: true,
      message: 'Notifications sent',
      results: results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getNotificationHistory = async (req, res, next) => {
  try {
    const { email } = req.user;
    
    // Find contact document
    const contactDoc = await Contact.findOne({ email });
    
    if (!contactDoc) {
      return res.status(200).json({
        success: true,
        message: 'No notification history found',
        history: []
      });
    }
    
    // Build notification history from contacts' lastNotified timestamps
    const history = contactDoc.contacts
      .filter(contact => contact.lastNotified)
      .map(contact => ({
        contactId: contact._id,
        contactName: contact.name,
        phoneNumber: contact.phoneNumber,
        lastNotified: contact.lastNotified
      }))
      .sort((a, b) => new Date(b.lastNotified) - new Date(a.lastNotified));
    
    res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update notification settings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateNotificationSettings = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { globalSettings } = req.body;
    
    // Find all user contacts
    const contactDoc = await Contact.findOne({ email });
    
    if (!contactDoc) {
      throw new ApiError(404, 'No contacts found');
    }
    
    // Update global notification settings for all contacts
    contactDoc.contacts.forEach(contact => {
      if (globalSettings.receiveUpdates !== undefined) {
        contact.notificationPreferences.receiveUpdates = globalSettings.receiveUpdates;
      }
    });
    
    await contactDoc.save();
    
    res.status(200).json({
      success: true,
      message: 'Notification settings updated for all contacts'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send test notification to a single contact
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const sendTestNotification = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { contactId } = req.body;
    
    if (!contactId) {
      throw new ApiError(400, 'Please provide a contact ID');
    }
    
    // Find contact document
    const contactDoc = await Contact.findOne({ email });
    
    if (!contactDoc) {
      throw new ApiError(404, 'No contacts found');
    }
    
    // Find specific contact
    const contact = contactDoc.contacts.find(c => c._id.toString() === contactId);
    
    if (!contact) {
      throw new ApiError(404, 'Contact not found');
    }
    
    // Send test message
    const response = await twilioService.sendSMS(
      contact.phoneNumber,
      'general',
      { 
        customMessage: 'This is a test message from CycleConnect.',
        contactName: contact.name
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Test notification sent',
      messageId: response.sid
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendNotification,
  getNotificationHistory,
  updateNotificationSettings,
  sendTestNotification
};
