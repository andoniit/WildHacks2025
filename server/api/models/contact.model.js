const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Contact Schema
const ContactSchema = new Schema({
  email: {
    type: String,
    required: true,
    ref: 'User',
    index: true  // Add index for faster queries
  },
  contacts: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    phoneNumber: {
      type: Number,
      required: true
    },
    relation: {
      type: String,
      required: true,
      trim: true
    },
    notificationPreferences: {
      customAlerts: {
        type: [String],
        default: []
      },
      receiveUpdates: {
        type: Boolean,
        default: true
      }
    },
    lastNotified: {
      type: Date,
      default: null
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
ContactSchema.index({ email: 1 });

const Contact = mongoose.model('Contact', ContactSchema);

module.exports = Contact;
