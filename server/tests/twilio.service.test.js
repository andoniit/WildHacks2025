const twilioService = require('../services/twilio.service');
const config = require('../config/twilio.config');

// Mock the twilio package
jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        sid: 'TEST_MESSAGE_SID',
        status: 'sent',
        dateCreated: new Date(),
        to: '+8722586613'
      })
    }
  }));
});

// Spy on console methods
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('TwilioService', () => {
  describe('sendSMS()', () => {
    it('should send SMS message when Twilio is enabled', async () => {
      // Force twilioEnabled to true for this test
      twilioService.twilioEnabled = true;
      twilioService.client = {
        messages: {
          create: jest.fn().mockResolvedValue({
            sid: 'TEST_MESSAGE_SID',
            status: 'sent'
          })
        }
      };
      
      const result = await twilioService.sendSMS(
        '+8722586613', 
        'cycleStart', 
        { userName: 'Jane' }
      );
      
      expect(twilioService.client.messages.create).toHaveBeenCalled();
      expect(result).toHaveProperty('sid', 'TEST_MESSAGE_SID');
      expect(result).toHaveProperty('status', 'sent');
    });
    
    it('should return dev-mode status when Twilio is disabled', async () => {
      // Force twilioEnabled to false for this test
      twilioService.twilioEnabled = false;
      
      const result = await twilioService.sendSMS(
        '+8722586613', 
        'cycleStart', 
        { userName: 'Jane' }
      );
      
      expect(console.info).toHaveBeenCalled();
      expect(result).toHaveProperty('status', 'dev-mode');
    });
    
    it('should handle errors when sending SMS', async () => {
      // Force twilioEnabled to true but make the client throw an error
      twilioService.twilioEnabled = true;
      twilioService.client = {
        messages: {
          create: jest.fn().mockRejectedValue(new Error('Invalid phone number'))
        }
      };
      
      await expect(
        twilioService.sendSMS('+8722586613', 'cycleStart', { userName: 'Jane' })
      ).rejects.toThrow('Invalid phone number');
      
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('sendBatchNotifications()', () => {
    it('should send SMS to multiple contacts', async () => {
      // Force twilioEnabled to true for this test
      twilioService.twilioEnabled = true;
      twilioService.client = {
        messages: {
          create: jest.fn().mockResolvedValue({
            sid: 'TEST_MESSAGE_SID',
            status: 'sent'
          })
        }
      };
      
      const contacts = [
        { name: 'John', phoneNumber: '+8722586613' },
        { name: 'Sarah', phoneNumber: '+8722586613' }
      ];
      
      const results = await twilioService.sendBatchNotifications(
        contacts, 
        'cycleStart', 
        { userName: 'Jane', cycleDate: '2025-04-05' }
      );
      
      expect(twilioService.client.messages.create).toHaveBeenCalledTimes(2);
      expect(results.length).toBe(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });
    
    it('should handle errors for some contacts in batch', async () => {
      // Force twilioEnabled to true for this test
      twilioService.twilioEnabled = true;
      
      // First call succeeds, second call fails
      const mockCreate = jest.fn()
        .mockResolvedValueOnce({ sid: 'TEST_MESSAGE_SID', status: 'sent' })
        .mockRejectedValueOnce(new Error('Invalid phone number'));
      
      twilioService.client = {
        messages: { create: mockCreate }
      };
      
      const contacts = [
        { name: 'John', phoneNumber: '+8722586613' },
        { name: 'Sarah', phoneNumber: 'invalid' }
      ];
      
      const results = await twilioService.sendBatchNotifications(
        contacts, 
        'cycleStart', 
        { userName: 'Jane' }
      );
      
      expect(twilioService.client.messages.create).toHaveBeenCalledTimes(2);
      expect(results.length).toBe(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBeDefined();
    });
  });
  
  // Manual test helper for development
  describe('Manual testing helper', () => {
    it.skip('MANUAL TEST: should send a real SMS (skipped by default)', async () => {
      // This test is skipped by default to avoid sending real SMS during automated testing
      // To run this test manually: npx jest -t "MANUAL TEST" --no-skip
      
      // You would need real credentials in .env for this test
      const realPhoneNumber = '+8722586613'; // Replace with a real number for testing
      
      const result = await twilioService.sendSMS(
        realPhoneNumber, 
        'cycleStart', 
        { userName: 'Test User' }
      );
      
      console.log('SMS test result:', result);
      expect(result).toBeDefined();
    });
  });
});
