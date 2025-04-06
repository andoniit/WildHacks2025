const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { 
  getUserProfile, 
  updateUserProfile, 
  updateCycleStatus, 
  deleteUser,
  getDashboardData 
} = require('../controllers/user.controller');

// Get user profile
router.get('/profile', verifyToken, getUserProfile);

// Update user profile
router.put('/profile', verifyToken, updateUserProfile);

// Update cycle information
router.put('/cycle-info', verifyToken, updateCycleStatus);

// Get dashboard data
router.get('/dashboard', verifyToken, getDashboardData);

// Delete user account
router.delete('/', verifyToken, deleteUser);

module.exports = router;
