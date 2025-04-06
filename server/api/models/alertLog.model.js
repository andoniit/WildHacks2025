const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Alert Info Schema Definition
 * Embedded subdocument for storing alert information
 */
const alertInfoSchema = new Schema({
  to: {
    type: String,  // 'self' or 'contact'
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  symptoms: {
    type: [String],
    default: []
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Alert Log Schema Definition
 * Main schema for storing alert logs by user
 */
const alertLogSchema = new Schema({
  email: {
    type: String,
    required: true,
    ref: 'User',
    index: true  // Add index for faster queries
  },
  alertInfo: [alertInfoSchema]
}, {
  timestamps: true  // Adds createdAt and updatedAt timestamps to the main document
});

// Pre-save middleware to update timestamps
alertInfoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create model
const AlertLog = mongoose.model('AlertLog', alertLogSchema);

module.exports = AlertLog;
