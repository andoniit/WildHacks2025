const twilio = require('twilio');
const config = require('../config/twilio.config');

class TwilioService {
  constructor() {
    this.twilioEnabled = false;
    
    // Validate Twilio credentials before initializing the client
    if (config.accountSid && config.accountSid.startsWith('AC') && config.authToken) {
      try {
        this.client = twilio(config.accountSid, config.authToken);
        this.twilioEnabled = true;
        console.log('Twilio service initialized successfully');
      } catch (error) {
        console.warn('Failed to initialize Twilio client:', error.message);
        console.warn('SMS notifications will be disabled');
      }
    } else {
      console.warn('Twilio credentials missing or invalid. SMS notifications will be disabled.');
      console.warn('To enable SMS, set valid TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env');
    }
  }

  /**
   * Send an SMS notification to a contact
   * @param {Number} to - Recipient phone number
   * @param {String} templateName - Name of the template to use
   * @param {Object} data - Custom data to include in the message
   * @returns {Promise} - Twilio message response
   */
  async sendSMS(to, templateName, data = {}) {
    try {
      // Check if Twilio is enabled
      if (!this.twilioEnabled) {
        console.info(`SMS would be sent to ${to} (TWILIO DISABLED IN DEV MODE)`);
        console.info(`Template: ${templateName}, Data:`, data);
        return { 
          status: 'dev-mode',
          message: 'Twilio is disabled in development mode. SMS not actually sent.' 
        };
      }

      // Get template message
      const templateMessage = config.notificationTemplates[templateName] || config.notificationTemplates.general;
      
      // Personalize message if data is provided
      const message = this._personalizeMessage(templateMessage, data);
      
      // Send the SMS
      const result = await this.client.messages.create({
        body: message,
        from: config.phoneNumber,
        to: this._formatPhoneNumber(to),
        messagingServiceSid: config.messagingServiceSid
      });
      
      return result;
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      throw error;
    }
  }

  /**
   * Send batch notifications to multiple contacts
   * @param {Array} contacts - Array of contact objects with phone numbers
   * @param {String} templateName - Name of the template to use
   * @param {Object} data - Custom data to include in the message
   * @returns {Promise} - Array of responses
   */
  async sendBatchNotifications(contacts, templateName, data = {}) {
    const results = [];
    
    for (const contact of contacts) {
      try {
        const response = await this.sendSMS(contact.phoneNumber, templateName, {
          ...data,
          contactName: contact.name
        });
        
        results.push({
          success: true,
          contact: contact,
          messageId: response.sid
        });
      } catch (error) {
        results.push({
          success: false,
          contact: contact,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Replace placeholders in template message with actual data
   * @private
   * @param {String} template - Message template
   * @param {Object} data - Data to inject into template
   * @returns {String} - Personalized message
   */
  _personalizeMessage(template, data) {
    let message = template;
    
    // Replace placeholders with data values
    for (const [key, value] of Object.entries(data)) {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    return message;
  }

  _formatPhoneNumber(phoneNumber) {
    // Add phone number formatting logic here if needed
    return phoneNumber;
  }
}

module.exports = new TwilioService();
