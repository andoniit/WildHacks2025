const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { validateContact } = require('../middleware/validation.middleware');
const { 
  getContacts, 
  addContact, 
  updateContact, 
  deleteContact,
  updateNotificationPreferences 
} = require('../controllers/contact.controller');

// Get all contacts
router.get('/', verifyToken, getContacts);

// Add new contact
router.post('/', verifyToken, validateContact, addContact);

// Update contact
router.put('/:id', verifyToken, validateContact, updateContact);

// Delete contact
router.delete('/:id', verifyToken, deleteContact);

// Update notification preferences for a contact
router.put('/:id/notifications', verifyToken, updateNotificationPreferences);

module.exports = router;
