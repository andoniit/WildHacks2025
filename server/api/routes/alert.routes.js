const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { validateAlert } = require('../middleware/validation.middleware');
const { 
  createAlert,
  getAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
  getAlertStats
} = require('../controllers/alert.controller');

// Create a new alert
router.post('/', verifyToken, validateAlert, createAlert);

// Get all alerts for a user
router.get('/', verifyToken, getAlerts);

// Get alert statistics
router.get('/stats', verifyToken, getAlertStats);

// Get alert by ID
router.get('/:id', verifyToken, getAlertById);

// Update alert
router.put('/:id', verifyToken, validateAlert, updateAlert);

// Delete alert
router.delete('/:id', verifyToken, deleteAlert);

module.exports = router;
