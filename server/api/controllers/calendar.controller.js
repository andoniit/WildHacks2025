const mongoose = require('mongoose');
const CalendarLog = require('../models/calendarLog.model');
const Contact = require('../models/contact.model'); 
const User = require('../models/user.model'); 
const { ApiError } = require('../../utils/errorHandler');
const twilioService = require('../../services/twilio.service'); 

/**
 * Send notifications to user's contacts about upcoming period
 * @param {String} email - User's email
 * @param {Date} startDate - Period start date
 */
const notifyContactsAboutPeriod = async (email, startDate) => {
  try {
    // Calculate expected next period (28 days after start date)
    const nextPeriodDate = new Date(startDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + 28);
    
    // Calculate days until next period
    const today = new Date();
    const daysUntil = Math.ceil((nextPeriodDate - today) / (1000 * 60 * 60 * 24));
    
    // Find user's full name
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User not found for email: ${email}`);
      return;
    }
    const userName = `${user.firstName} ${user.lastName}`;
    
    // Find all contacts for this user
    const contactData = await Contact.findOne({ email });
    if (!contactData || !contactData.contacts || contactData.contacts.length === 0) {
      console.log(`No contacts found for user: ${email}`);
      return;
    }
    
    console.log(`Sending period notifications to ${contactData.contacts.length} contacts for user: ${email}`);
    
    // Custom message for period notification
    const periodMessage = `${userName} is expected to get her periods in ${daysUntil} days\n\nShe needs your support`;
    
    // Send SMS to each contact that has receiveUpdates enabled
    const notifications = contactData.contacts
      .filter(contact => contact.notificationPreferences.receiveUpdates)
      .map(async (contact) => {
        try {
          // Send custom message directly instead of using a template
          const result = await twilioService.sendSMS(
            contact.phoneNumber, 
            'general', // Using general template type but we'll override the message
            { 
              userName, 
              daysUntil,
              customMessage: periodMessage 
            }
          );
          
          // Update last notified timestamp
          contact.lastNotified = new Date();
          
          return {
            contactName: contact.name,
            status: 'success',
            messageId: result.sid || 'dev-mode'
          };
        } catch (error) {
          console.error(`Failed to send SMS to ${contact.name} (${contact.phoneNumber}):`, error.message);
          return {
            contactName: contact.name,
            status: 'failed',
            error: error.message
          };
        }
      });
    
    // Wait for all notifications to be sent
    const results = await Promise.all(notifications);
    
    // Save updated lastNotified timestamps
    await contactData.save();
    
    console.log(`Period notification results:`, results);
    return results;
  } catch (error) {
    console.error('Error sending period notifications:', error);
    // Don't throw here, as we don't want to interrupt the main flow if notifications fail
  }
};

/**
 * Create a new calendar event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createCalendarEvent = async (req, res, next) => {
  try {
    const { email } = req.user; // Assuming authentication middleware attaches user to req
    const { startDate, endDate, category, title, note } = req.body;

    if (!startDate || !endDate || !category || !title) {
      throw new ApiError(400, 'Start date, end date, category, and title are required fields');
    }

    // Check if user already has a calendar log
    let calendarLog = await CalendarLog.findOne({ email });

    if (calendarLog) {
      // Add new event to existing log
      calendarLog.calendarInfo.push({
        startDate,
        endDate,
        category,
        title,
        note: note || ''
      });
      
      await calendarLog.save();
    } else {
      // Create new calendar log with first event
      calendarLog = await CalendarLog.create({
        email,
        calendarInfo: [{
          startDate,
          endDate,
          category,
          title,
          note: note || ''
        }]
      });
    }

    // Check if this is a Period event and notify contacts if it is
    if (category === 'Period') {
      // Send notifications in the background
      notifyContactsAboutPeriod(email, startDate).catch(error => {
        console.error('Background notification process failed:', error);
      });
    }

    res.status(201).json({
      success: true,
      message: 'Calendar event created successfully',
      data: calendarLog.calendarInfo[calendarLog.calendarInfo.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all calendar events for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getCalendarEvents = async (req, res, next) => {
  try {
    const { email } = req.user; // Assuming authentication middleware attaches user to req
    const { startDateFrom, startDateTo, endDateFrom, endDateTo, category } = req.query;
    
    // Find calendar log for user
    const calendarLog = await CalendarLog.findOne({ email });
    
    if (!calendarLog) {
      return res.status(200).json({
        success: true,
        message: 'No calendar events found',
        data: []
      });
    }
    
    // Filter events based on query parameters if provided
    let events = calendarLog.calendarInfo;
    
    // Filter by start date range
    if (startDateFrom && startDateTo) {
      const start = new Date(startDateFrom);
      const end = new Date(startDateTo);
      events = events.filter(event => 
        new Date(event.startDate) >= start && new Date(event.startDate) <= end
      );
    }
    
    // Filter by end date range
    if (endDateFrom && endDateTo) {
      const start = new Date(endDateFrom);
      const end = new Date(endDateTo);
      events = events.filter(event => 
        new Date(event.endDate) >= start && new Date(event.endDate) <= end
      );
    }
    
    // Filter by category
    if (category) {
      events = events.filter(event => event.category === category);
    }
    
    // Sort events by start date (newest first)
    events.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    
    res.status(200).json({
      success: true,
      message: 'Calendar events retrieved successfully',
      data: events
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a calendar event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateCalendarEvent = async (req, res, next) => {
  try {
    const { email } = req.user; // Assuming authentication middleware attaches user to req
    const { eventId } = req.params;
    const { startDate, endDate, category, title, note } = req.body;

    if (!eventId) {
      throw new ApiError(400, 'Event ID is required');
    }

    // Find calendar log for user
    const calendarLog = await CalendarLog.findOne({ email });
    
    if (!calendarLog) {
      throw new ApiError(404, 'No calendar events found for this user');
    }
    
    // Find index of the event to update
    const eventIndex = calendarLog.calendarInfo.findIndex(
      event => event._id.toString() === eventId
    );
    
    if (eventIndex === -1) {
      throw new ApiError(404, 'Calendar event not found');
    }
    
    // Update event fields if provided
    if (startDate) calendarLog.calendarInfo[eventIndex].startDate = startDate;
    if (endDate) calendarLog.calendarInfo[eventIndex].endDate = endDate;
    if (category) calendarLog.calendarInfo[eventIndex].category = category;
    if (title) calendarLog.calendarInfo[eventIndex].title = title;
    if (note !== undefined) calendarLog.calendarInfo[eventIndex].note = note;
    
    await calendarLog.save();
    
    res.status(200).json({
      success: true,
      message: 'Calendar event updated successfully',
      data: calendarLog.calendarInfo[eventIndex]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a calendar event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteCalendarEvent = async (req, res, next) => {
  try {
    const { email } = req.user; // Assuming authentication middleware attaches user to req
    const { eventId } = req.params;

    if (!eventId) {
      throw new ApiError(400, 'Event ID is required');
    }

    // Find calendar log for user
    const calendarLog = await CalendarLog.findOne({ email });
    
    if (!calendarLog) {
      throw new ApiError(404, 'No calendar events found for this user');
    }
    
    // Find index of the event to delete
    const eventIndex = calendarLog.calendarInfo.findIndex(
      event => event._id.toString() === eventId
    );
    
    if (eventIndex === -1) {
      throw new ApiError(404, 'Calendar event not found');
    }
    
    // Remove the event
    calendarLog.calendarInfo.splice(eventIndex, 1);
    await calendarLog.save();
    
    res.status(200).json({
      success: true,
      message: 'Calendar event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update all calendar events for a user (replace existing ones)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateAllCalendarEvents = async (req, res, next) => {
  try {
    const { email } = req.user; // Get user email from auth middleware
    const { calendarInfo } = req.body; // New calendar events

    if (!calendarInfo || !Array.isArray(calendarInfo)) {
      throw new ApiError(400, 'Calendar information must be provided as an array');
    }

    console.log(`Received ${calendarInfo.length} events for bulk update from user: ${email}`);

    // Validate each calendar event
    for (let i = 0; i < calendarInfo.length; i++) {
      const event = calendarInfo[i];
      
      if (!event.startDate) {
        throw new ApiError(400, `Event at index ${i} is missing startDate`);
      }
      
      if (!event.endDate) {
        throw new ApiError(400, `Event at index ${i} is missing endDate`);
      }
      
      if (!event.category) {
        throw new ApiError(400, `Event at index ${i} is missing category`);
      }
      
      if (!event.title) {
        throw new ApiError(400, `Event at index ${i} is missing title`);
      }
      
      // Convert string dates to Date objects if they're not already
      if (typeof event.startDate === 'string') {
        event.startDate = new Date(event.startDate);
      }
      
      if (typeof event.endDate === 'string') {
        event.endDate = new Date(event.endDate);
      }
      
      // Ensure dates are valid
      if (isNaN(event.startDate.getTime())) {
        throw new ApiError(400, `Event at index ${i} has invalid startDate`);
      }
      
      if (isNaN(event.endDate.getTime())) {
        throw new ApiError(400, `Event at index ${i} has invalid endDate`);
      }
      
      if (event.endDate < event.startDate) {
        throw new ApiError(400, `Event at index ${i}: End date must be after or equal to start date`);
      }
    }

    // Find or create calendar log for user
    let calendarLog = await CalendarLog.findOne({ email });
    let existingEvents = [];
    
    if (calendarLog) {
      // Save existing events before updating
      existingEvents = calendarLog.calendarInfo || [];
      
      // Replace all calendar events
      calendarLog.calendarInfo = calendarInfo;
      await calendarLog.save();
      console.log(`Updated ${calendarInfo.length} events for user: ${email}`);
    } else {
      // Create new calendar log with provided events
      calendarLog = await CalendarLog.create({
        email,
        calendarInfo
      });
      console.log(`Created new calendar with ${calendarInfo.length} events for user: ${email}`);
    }
    
    // Check if a new Period event was added
    const newPeriodEvents = calendarInfo.filter(event => 
      event.category === 'Period' && 
      !existingEvents.some(existingEvent => 
        existingEvent.category === 'Period' &&
        new Date(existingEvent.startDate).getTime() === new Date(event.startDate).getTime()
      )
    );
    
    // If new period events found, notify contacts about the latest one
    if (newPeriodEvents.length > 0) {
      // Sort by start date (most recent first)
      newPeriodEvents.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      
      // Send notifications for the most recent period event
      const latestPeriodEvent = newPeriodEvents[0];
      notifyContactsAboutPeriod(email, latestPeriodEvent.startDate).catch(error => {
        console.error('Background notification process failed:', error);
      });
    }

    res.status(200).json({
      success: true,
      message: 'Calendar events updated successfully',
      data: calendarLog.calendarInfo
    });
  } catch (error) {
    console.error('Error in updateAllCalendarEvents:', error.message);
    next(error);
  }
};

// Export controller functions
module.exports = {
  createCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
  deleteCalendarEvent,
  updateAllCalendarEvents
};
