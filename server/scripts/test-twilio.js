/**
 * Manual Twilio SMS Test Script
 * 
 * This script allows you to test your Twilio SMS functionality by sending
 * a test message to a specified phone number.
 * 
 * Usage:
 * 1. Make sure you have valid Twilio credentials in your .env file
 * 2. Run this script with: node scripts/test-twilio.js <phone-number>
 * 
 * Example: node scripts/test-twilio.js +15551234567
 */

const twilioService = require('../services/twilio.service');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function testTwilioSMS() {
  if (process.argv.length < 3) {
    console.error('Please provide a phone number as an argument');
    console.error('Usage: node scripts/test-twilio.js <phone-number>');
    console.error('Example: node scripts/test-twilio.js +15551234567');
    process.exit(1);
  }

  const phoneNumber = process.argv[2];
  
  console.log('======================================================');
  console.log('           TWILIO SMS TEST UTILITY                    ');
  console.log('======================================================');
  console.log('Testing Twilio SMS sending with your configuration...');
  console.log(`Target phone number: ${phoneNumber}`);
  
  try {
    // Test standard notification
    console.log('\n1. Testing standard cycle notification...');
    const cycleResult = await twilioService.sendSMS(
      phoneNumber,
      'cycleStart',  // Uses the cycleStart template
      { userName: 'Test User', cycleDate: new Date().toDateString() }
    );
    console.log('Result:', cycleResult);
    
    // Test emergency notification if it exists in your templates
    console.log('\n2. Testing emergency notification...');
    const emergencyResult = await twilioService.sendSMS(
      phoneNumber,
      'emergency',  // Uses the emergency template if it exists
      { userName: 'Test User', contactName: 'Emergency Contact', symptom: 'severe cramps' }
    );
    console.log('Result:', emergencyResult);
    
    // Test batch notifications
    console.log('\n3. Testing batch notifications...');
    const contacts = [
      { name: 'Contact 1', phoneNumber: phoneNumber },
      { name: 'Contact 2', phoneNumber: phoneNumber } // Using same number for test
    ];
    
    const batchResults = await twilioService.sendBatchNotifications(
      contacts,
      'general',  // Uses the general template
      { userName: 'Test User', message: 'This is a test batch notification' }
    );
    console.log('Batch Results:', JSON.stringify(batchResults, null, 2));
    
    console.log('\n======================================================');
    console.log('           TESTS COMPLETED                           ');
    console.log('======================================================');
    
    if (twilioService.twilioEnabled) {
      console.log('✅ SUCCESS: Twilio SMS service is properly configured and working!');
      console.log('Check your phone for test messages.');
    } else {
      console.log('⚠️ NOTICE: Twilio is in development mode (disabled).');
      console.log('Messages were not actually sent to the phone number.');
      console.log('To enable SMS, set valid TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,');
      console.log('and TWILIO_PHONE_NUMBER in your .env file.');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR: Failed to send SMS messages');
    console.error('Error details:', error);
    
    // Provide troubleshooting help
    console.log('\nTroubleshooting tips:');
    console.log('1. Verify your .env file has valid Twilio credentials');
    console.log('2. Make sure TWILIO_ACCOUNT_SID starts with "AC"');
    console.log('3. Check that TWILIO_PHONE_NUMBER is in E.164 format (e.g., +15551234567)');
    console.log('4. Verify your Twilio account has sufficient credits');
    console.log('5. Ensure the destination number is valid and can receive SMS');
  }
}

// Run the test
testTwilioSMS();
