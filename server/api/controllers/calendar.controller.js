const CalendarLog = require('../models/calendarLog.model');
const { ApiError } = require('../../utils/errorHandler');

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

// Export controller functions
module.exports = {
  createCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
  deleteCalendarEvent
};
