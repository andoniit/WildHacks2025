const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { validateCycleLog } = require('../middleware/validation.middleware');
const { 
  getCycleHistory, 
  addCycleEntry, 
  updateCycleEntry, 
  deleteCycleEntry,
  getPredictions,
  getCurrentCycle
} = require('../controllers/cycle.controller');

// Get cycle history
router.get('/', verifyToken, getCycleHistory);

// Get current cycle
router.get('/current', verifyToken, getCurrentCycle);

// Get cycle predictions
router.get('/predictions', verifyToken, getPredictions);

// Add new cycle entry
router.post('/', verifyToken, validateCycleLog, addCycleEntry);

// Update cycle entry
router.put('/:id', verifyToken, validateCycleLog, updateCycleEntry);

// Delete cycle entry
router.delete('/:id', verifyToken, deleteCycleEntry);

module.exports = router;
