const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  phoneNumber: {
    type: Number,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avgCycleLength: {
    type: Number,
    required: true
  },
  cycleStatus: {
    type: String,
    enum: ['active', 'inactive', 'menstrual', 'follicular', 'ovulation', 'luteal'],
    default: 'inactive'
  },
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

// Create index on email for faster queries
UserSchema.index({ email: 1 });

const User = mongoose.model('User', UserSchema);

module.exports = User;
