const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { 
  sendNotification, 
  getNotificationHistory,
  updateNotificationSettings,
  sendTestNotification
} = require('../controllers/notification.controller');

// Send notifications to contacts
router.post('/send', verifyToken, sendNotification);

// Get notification history
router.get('/history', verifyToken, getNotificationHistory);

// Update notification settings
router.put('/settings', verifyToken, updateNotificationSettings);

// Test notification to a single contact
router.post('/test', verifyToken, sendTestNotification);

module.exports = router;
