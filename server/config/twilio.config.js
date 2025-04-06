module.exports = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
  notificationTemplates: {
    cycleStart: "Day 1 of the cycle: Offer extra care today.",
    pmsWeek: "PMS week: Encourage rest and hydration.",
    ovulation: "Ovulation period: Energy levels may be higher.",
    general: "CycleConnect update: Supporting through the cycle."
  }
};
