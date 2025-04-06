const express = require('express');
const router = express.Router();

// Import controllers
const { 
  getUserProfile, 
  updateUserProfile, 
  updateCycleStatus, 
  deleteUser,
  getTimelineData 
} = require('../controllers/user.controller');

// Import middleware
const { verifyToken } = require('../middleware/auth.middleware');

// Get user profile
router.get('/profile', verifyToken, getUserProfile);

// Update user profile
router.put('/profile', verifyToken, updateUserProfile);

// Update cycle information
router.put('/cycle-info', verifyToken, updateCycleStatus);

// Get timeline data
router.get('/timeline', verifyToken, getTimelineData);

// Delete user account
router.delete('/', verifyToken, deleteUser);

module.exports = router;
