const Contact = require('../models/contact.model');
const { ApiError } = require('../../utils/errorHandler');

/**
 * Get all contacts for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getContacts = async (req, res, next) => {
  try {
    const { email } = req.user;
    
    // Find contacts by user email
    const contactDoc = await Contact.findOne({ email });
    
    if (!contactDoc) {
      return res.status(200).json({
        success: true,
        message: 'No contacts found',
        contacts: []
      });
    }
    
    res.status(200).json({
      success: true,
      contacts: contactDoc.contacts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new contact
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const addContact = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { name, phoneNumber, relation, notificationPreferences } = req.body;
    
    // Create contact object
    const newContact = {
      name,
      phoneNumber,
      relation,
      notificationPreferences: notificationPreferences || {
        customAlerts: [],
        receiveUpdates: true
      }
    };
    
    // Find user's contact document
    let contactDoc = await Contact.findOne({ email });
    
    if (!contactDoc) {
      // Create new contact document if not exist
      contactDoc = await Contact.create({
        email,
        contacts: [newContact]
      });
    } else {
      // Check if contact with same phone number already exists
      const existingContact = contactDoc.contacts.find(
        contact => contact.phoneNumber === phoneNumber
      );
      
      if (existingContact) {
        throw new ApiError(409, 'Contact with this phone number already exists');
      }
      
      // Add new contact to existing document
      contactDoc.contacts.push(newContact);
      await contactDoc.save();
    }
    
    res.status(201).json({
      success: true,
      message: 'Contact added successfully',
      contact: newContact
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing contact
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateContact = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { id } = req.params;
    const { name, phoneNumber, relation, notificationPreferences } = req.body;
    
    // Find contact document
    const contactDoc = await Contact.findOne({ email });
    
    if (!contactDoc) {
      throw new ApiError(404, 'Contact document not found');
    }
    
    // Find contact by ID
    const contactIndex = contactDoc.contacts.findIndex(
      contact => contact._id.toString() === id
    );
    
    if (contactIndex === -1) {
      throw new ApiError(404, 'Contact not found');
    }
    
    // Update contact fields if provided
    if (name) contactDoc.contacts[contactIndex].name = name;
    if (phoneNumber) contactDoc.contacts[contactIndex].phoneNumber = phoneNumber;
    if (relation) contactDoc.contacts[contactIndex].relation = relation;
    
    // Update notification preferences if provided
    if (notificationPreferences) {
      if (notificationPreferences.customAlerts) {
        contactDoc.contacts[contactIndex].notificationPreferences.customAlerts = notificationPreferences.customAlerts;
      }
      if (notificationPreferences.receiveUpdates !== undefined) {
        contactDoc.contacts[contactIndex].notificationPreferences.receiveUpdates = notificationPreferences.receiveUpdates;
      }
    }
    
    await contactDoc.save();
    
    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      contact: contactDoc.contacts[contactIndex]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a contact
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteContact = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { id } = req.params;
    
    // Find contact document
    const contactDoc = await Contact.findOne({ email });
    
    if (!contactDoc) {
      throw new ApiError(404, 'Contact document not found');
    }
    
    // Filter out the contact to be deleted
    const initialLength = contactDoc.contacts.length;
    contactDoc.contacts = contactDoc.contacts.filter(
      contact => contact._id.toString() !== id
    );
    
    if (contactDoc.contacts.length === initialLength) {
      throw new ApiError(404, 'Contact not found');
    }
    
    await contactDoc.save();
    
    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update notification preferences for a contact
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateNotificationPreferences = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { id } = req.params;
    const { customAlerts, receiveUpdates } = req.body;
    
    // Find contact document
    const contactDoc = await Contact.findOne({ email });
    
    if (!contactDoc) {
      throw new ApiError(404, 'Contact document not found');
    }
    
    // Find contact by ID
    const contactIndex = contactDoc.contacts.findIndex(
      contact => contact._id.toString() === id
    );
    
    if (contactIndex === -1) {
      throw new ApiError(404, 'Contact not found');
    }
    
    // Update notification preferences
    if (customAlerts) {
      contactDoc.contacts[contactIndex].notificationPreferences.customAlerts = customAlerts;
    }
    
    if (receiveUpdates !== undefined) {
      contactDoc.contacts[contactIndex].notificationPreferences.receiveUpdates = receiveUpdates;
    }
    
    await contactDoc.save();
    
    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: contactDoc.contacts[contactIndex].notificationPreferences
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  updateNotificationPreferences
};
