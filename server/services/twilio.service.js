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
   * Send a WhatsApp message
   * @param {Number} to - Recipient phone number
   * @param {String} templateName - Name of the template to use
   * @param {Object} data - Custom data to include in the message
   * @returns {Promise} - Twilio message response
   */
  async sendWhatsApp(to, templateName, data = {}) {
    try {
      // Check if Twilio is enabled
      if (!this.twilioEnabled) {
        console.info(`WhatsApp message would be sent to ${to} (TWILIO DISABLED IN DEV MODE)`);
        console.info(`Template: ${templateName}, Data:`, data);
        return { 
          status: 'dev-mode',
          message: 'Twilio is disabled in development mode. WhatsApp not actually sent.' 
        };
      }

      // Skip WhatsApp if we're in development with default sandbox or WhatsApp is not configured
      // This avoids the "Channel not found" error in development
      if (!config.whatsappEnabled) {
        console.info(`WhatsApp messaging is not enabled in config. Skipping WhatsApp for ${to}`);
        return {
          status: 'whatsapp-disabled',
          message: 'WhatsApp messaging is not enabled in configuration.'
        };
      }

      // Get template message
      const templateMessage = config.notificationTemplates[templateName] || config.notificationTemplates.general;
      
      // Personalize message if data is provided
      const message = this._personalizeMessage(templateMessage, data);
      
      // Format the phone number with WhatsApp prefix
      const whatsappTo = this._formatWhatsAppNumber(to);
      
      // Send the WhatsApp message
      const result = await this.client.messages.create({
        body: message,
        from: `whatsapp:${config.whatsappPhoneNumber || config.phoneNumber}`,
        to: whatsappTo
      });
      
      console.log(`WhatsApp message sent to ${whatsappTo}`);
      return result;
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
      // Return an error object instead of throwing
      return {
        status: 'error',
        message: `Failed to send WhatsApp: ${error.message}`,
        error
      };
    }
  }

  /**
   * Send both SMS and WhatsApp notifications
   * @param {Number} to - Recipient phone number
   * @param {String} templateName - Name of the template to use
   * @param {Object} data - Custom data to include in the message
   * @returns {Promise} - Object with sms and whatsapp results
   */
  async sendDualChannelNotification(to, templateName, data = {}) {
    try {
      // Always try to send SMS first
      const smsResult = await this.sendSMS(to, templateName, data);
      
      // Try WhatsApp only if SMS succeeded and WhatsApp is configured
      let whatsappResult = { 
        status: 'skipped',
        message: 'WhatsApp messaging was skipped' 
      };
      
      // Only attempt WhatsApp if SMS worked (unless in dev mode)
      if (smsResult.sid || smsResult.status === 'dev-mode') {
        whatsappResult = await this.sendWhatsApp(to, templateName, data);
      }

      return {
        sms: smsResult,
        whatsapp: whatsappResult
      };
    } catch (error) {
      console.error('Error in dual channel notification:', error);
      return {
        sms: { status: 'error', message: error.message },
        whatsapp: { status: 'error', message: error.message }
      };
    }
  }

  /**
   * Send batch notifications via multiple channels to contacts
   * @param {Array} contacts - Array of contact objects with phone numbers
   * @param {String} templateName - Template name to use
   * @param {Object} data - Data for message personalization
   * @returns {Promise} - Array of notification results
   */
  async sendDualChannelBatchNotifications(contacts, templateName, data = {}) {
    try {
      if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
        console.warn('No contacts provided for batch notifications');
        return [];
      }
      
      // Map each contact to a promise that sends the notification
      const notificationPromises = contacts.map(contact => 
        this.sendDualChannelNotification(
          contact.phoneNumber, 
          templateName, 
          { ...data, contactName: contact.name }
        ).then(result => ({
          contactName: contact.name,
          phoneNumber: contact.phoneNumber,
          result
        }))
        .catch(error => ({
          contactName: contact.name,
          phoneNumber: contact.phoneNumber,
          error: error.message
        }))
      );
      
      // Wait for all notifications to be sent
      return await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Error sending batch notifications:', error);
      throw error;
    }
  }

  /**
   * Helper function to personalize message with data
   * @private
   * @param {String} message - Message template
   * @param {Object} data - Data for personalization
   * @returns {String} - Personalized message
   */
  _personalizeMessage(message, data) {
    let personalizedMsg = message;
    
    // If custom message is provided, use it directly
    if (data.customMessage) {
      return data.customMessage;
    }
    
    // Replace placeholders with actual data
    if (data.userName) {
      personalizedMsg = personalizedMsg.replace(/{{\s*userName\s*}}/g, data.userName);
    }
    
    if (data.daysUntil !== undefined) {
      personalizedMsg = personalizedMsg.replace(/{{\s*daysUntil\s*}}/g, data.daysUntil);
    }
    
    // Replace any other data variables
    Object.keys(data).forEach(key => {
      personalizedMsg = personalizedMsg.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), data[key]);
    });
    
    return personalizedMsg;
  }

  _formatPhoneNumber(phoneNumber) {
    // Add phone number formatting logic here if needed
    return phoneNumber;
  }

  _formatWhatsAppNumber(phoneNumber) {
    // Format for WhatsApp requires 'whatsapp:' prefix
    // Remove any non-numeric characters first
    const cleanNumber = String(phoneNumber).replace(/\D/g, '');
    
    // Check if the number already has the WhatsApp prefix
    if (String(phoneNumber).startsWith('whatsapp:')) {
      return phoneNumber;
    }
    
    // Add country code if not present (assuming US/Canada numbers)
    let formattedNumber = cleanNumber;
    if (!cleanNumber.startsWith('1') && cleanNumber.length === 10) {
      formattedNumber = '1' + cleanNumber;
    }
    
    return `whatsapp:+${formattedNumber}`;
  }
}

module.exports = new TwilioService();
