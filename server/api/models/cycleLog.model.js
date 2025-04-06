const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Cycle Schema
const CycleLogSchema = new Schema({
  email: {
    type: String,
    required: true,
    ref: 'User',
    index: true  // Add index for faster queries
  },
  cycInfo: [{
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
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

// Ensure email is indexed for faster queries
CycleLogSchema.index({ email: 1 });

const CycleLog = mongoose.model('CycleLog', CycleLogSchema);

module.exports = CycleLog;
