const { ApiError } = require('../../utils/errorHandler');

/**
 * Middleware for validating user registration data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateUserRegistration = (req, res, next) => {
  // Extract user info from the nested structure sent by frontend
  const { user, cycleInfo } = req.body;
  
  if (!user || !cycleInfo) {
    return next(new ApiError(400, 'Missing user or cycle information'));
  }
  
  const { email, name, age, phoneNumber, password } = user;
  const { avgCycleLength, symptoms } = cycleInfo;
  
  // Validate email
  if (!email || !isValidEmail(email)) {
    return next(new ApiError(400, 'Valid email address is required'));
  }
  
  // Validate name
  if (!name || name.trim().length < 2) {
    return next(new ApiError(400, 'Name is required and must be at least 2 characters'));
  }
  
  // Validate age
  if (!age || isNaN(age) || age < 8 || age > 80) {
    return next(new ApiError(400, 'Age must be a number between 8 and 80'));
  }
  
  // Validate phone number
  if (!phoneNumber || phoneNumber.length < 10) {
    return next(new ApiError(400, 'Valid phone number is required'));
  }
  
  // Validate password
  if (!password || password.length < 8) {
    return next(new ApiError(400, 'Password must be at least 8 characters'));
  }
  
  // Validate cycle length
  if (!avgCycleLength || isNaN(avgCycleLength) || avgCycleLength < 21 || avgCycleLength > 40) {
    return next(new ApiError(400, 'Average cycle length must be between 21 and 40 days'));
  }
  
  // Validate symptoms (if provided)
  if (symptoms && !Array.isArray(symptoms)) {
    return next(new ApiError(400, 'Symptoms must be an array'));
  }
  
  next();
};

/**
 * Middleware for validating cycle log data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateCycleLog = (req, res, next) => {
  const { startDate, endDate, symptoms } = req.body;
  
  // Validate dates
  if (!startDate || !isValidDate(startDate)) {
    return next(new ApiError(400, 'Valid start date is required'));
  }
  
  if (!endDate || !isValidDate(endDate)) {
    return next(new ApiError(400, 'Valid end date is required'));
  }
  
  // Check that end date is after start date
  if (new Date(endDate) <= new Date(startDate)) {
    return next(new ApiError(400, 'End date must be after start date'));
  }
  
  // Validate symptoms if provided
  if (symptoms && !Array.isArray(symptoms)) {
    return next(new ApiError(400, 'Symptoms must be an array'));
  }
  
  next();
};

/**
 * Middleware for validating contact data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateContact = (req, res, next) => {
  const { name, phoneNumber, relation, notificationPreferences } = req.body;
  
  // Validate name
  if (!name || name.trim().length < 2) {
    return next(new ApiError(400, 'Contact name is required and must be at least 2 characters'));
  }
  
  // Validate phone number
  if (!phoneNumber || isNaN(phoneNumber)) {
    return next(new ApiError(400, 'Valid contact phone number is required'));
  }
  
  // Validate relation
  if (!relation || relation.trim().length < 2) {
    return next(new ApiError(400, 'Relation is required'));
  }
  
  // Validate notification preferences if provided
  if (notificationPreferences) {
    if (notificationPreferences.customAlerts && !Array.isArray(notificationPreferences.customAlerts)) {
      return next(new ApiError(400, 'Custom alerts must be an array'));
    }
  }
  
  next();
};

/**
 * Validate alert data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateAlert = (req, res, next) => {
  try {
    const { to, symptoms, notes, sendSMS, contactIds } = req.body;
    
    // Validate 'to' field
    if (!to || !['self', 'contact'].includes(to)) {
      throw new ApiError(400, "Field 'to' must be either 'self' or 'contact'");
    }
    
    // Validate symptoms (if provided)
    if (symptoms && !Array.isArray(symptoms)) {
      throw new ApiError(400, "Field 'symptoms' must be an array");
    }
    
    // If sending SMS, validate contactIds
    if (sendSMS && (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0)) {
      throw new ApiError(400, "When sending SMS, 'contactIds' must be a non-empty array");
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware for validating calendar event data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateCalendarEvent = (req, res, next) => {
  const { date, category, title } = req.body;
  
  // Validate date
  if (!date || !isValidDate(date)) {
    return next(new ApiError(400, 'Valid date is required'));
  }
  
  // Validate category
  if (!category || typeof category !== 'string' || category.trim() === '') {
    return next(new ApiError(400, 'Valid category is required'));
  }
  
  // Validate title
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return next(new ApiError(400, 'Valid title is required'));
  }
  
  next();
};

// Helper functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

module.exports = {
  validateUserRegistration,
  validateCycleLog,
  validateContact,
  validateAlert,
  validateCalendarEvent
};
