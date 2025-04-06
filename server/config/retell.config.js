module.exports = {
  apiKey: process.env.RETELL_API_KEY,
  voiceId: process.env.RETELL_VOICE_ID || "default",
  baseUrl: process.env.RETELL_BASE_URL || "https://api.retell.io",
  callOptions: {
    recordingEnabled: true,
    languageCode: "en-US",
    fillerAudioEnabled: true
  },
  assistantName: "Sara",
  assistantPersonality: "A supportive and empathetic voice who provides comfort to users during their menstrual cycle. Sara is understanding, patient, and offers helpful tips based on the user's symptoms and feelings."
};
