const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Calendar Log Schema
 * Stores events for a specific user
 */
const CalendarLogSchema = new Schema({
  email: {
    type: String,
    required: true,
    ref: 'User',
    index: true  // Add index for faster queries
  },
  calendarInfo: [{
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    note: {
      type: String,
      default: ''
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create model from schema
const CalendarLog = mongoose.model('CalendarLog', CalendarLogSchema);

module.exports = CalendarLog;

