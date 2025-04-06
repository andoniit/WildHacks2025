const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendar.controller');
const { validateCalendarEvent } = require('../middleware/validation.middleware');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/calendar
 * @desc    Create a new calendar event
 * @access  Private
 */
router.post(
  '/',
  verifyToken,
  validateCalendarEvent,
  calendarController.createCalendarEvent
);

/**
 * @route   GET /api/calendar
 * @desc    Get all calendar events for a user
 * @access  Private
 */
router.get(
  '/',
  verifyToken,
  calendarController.getCalendarEvents
);

/**
 * @route   PUT /api/calendar
 * @desc    Update all calendar events for a user (bulk update)
 * @access  Private
 */
router.put(
  '/',
  verifyToken,
  calendarController.updateAllCalendarEvents
);

/**
 * @route   PUT /api/calendar/:eventId
 * @desc    Update a calendar event
 * @access  Private
 */
router.put(
  '/:eventId',
  verifyToken,
  validateCalendarEvent,
  calendarController.updateCalendarEvent
);

/**
 * @route   DELETE /api/calendar/:eventId
 * @desc    Delete a calendar event
 * @access  Private
 */
router.delete(
  '/:eventId',
  verifyToken,
  calendarController.deleteCalendarEvent
);

module.exports = router;
