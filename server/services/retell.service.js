const axios = require('axios');
const config = require('../config/retell.config');
const logger = require('../utils/logger');

/**
 * Service for integrating with Retell's API for voice-based AI conversations
 */
class RetellService {
  constructor() {
    this.api = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Create a new conversation with Retell
   * @param {Object} userData - User data for personalizing the conversation
   * @returns {Object} - Conversation data including ID and call URL
   */
  async createConversation(userData) {
    try {
      const response = await this.api.post('/conversations', {
        voice_id: config.voiceId,
        assistant_name: config.assistantName,
        assistant_personality: config.assistantPersonality,
        recording_enabled: config.callOptions.recordingEnabled,
        language_code: config.callOptions.languageCode,
        filler_audio_enabled: config.callOptions.fillerAudioEnabled,
        metadata: {
          user_name: userData.userName,
          user_age: userData.userAge,
          cycle_status: userData.cycleStatus,
          app: 'CycleConnect'
        }
      });
      
      return {
        conversationId: response.data.conversation_id,
        callUrl: response.data.call_url
      };
    } catch (error) {
      logger.error(`Error creating Retell conversation: ${error.message}`);
      throw new Error(`Failed to create conversation: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * End an active conversation
   * @param {String} conversationId - ID of the conversation to end
   * @returns {Object} - Response from Retell API
   */
  async endConversation(conversationId) {
    try {
      const response = await this.api.post(`/conversations/${conversationId}/end`);
      return response.data;
    } catch (error) {
      logger.error(`Error ending Retell conversation: ${error.message}`);
      throw new Error(`Failed to end conversation: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get the transcript of a conversation
   * @param {String} conversationId - ID of the conversation
   * @returns {Object} - Transcript data and analysis
   */
  async getTranscript(conversationId) {
    try {
      const response = await this.api.get(`/conversations/${conversationId}/transcript`);
      
      // Process transcript for insights
      const transcript = response.data.transcript || '';
      
      // Analyze transcript for user symptoms
      const symptoms = this._extractSymptoms(transcript);
      
      // Analyze emotional state
      const emotionalState = this._analyzeEmotionalState(transcript);
      
      // Generate summary and insights
      const summary = this._generateSummary(transcript);
      const insights = this._generateInsights(transcript, symptoms, emotionalState);
      
      // Get audio recording URL if available
      const audioUrl = response.data.recording_url || null;
      
      return {
        transcript,
        summary,
        emotionalState,
        symptoms,
        insights,
        audioUrl
      };
    } catch (error) {
      logger.error(`Error getting Retell transcript: ${error.message}`);
      throw new Error(`Failed to get transcript: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Extract symptoms from conversation transcript
   * @private
   * @param {String} transcript - Conversation transcript
   * @returns {Array} - Array of identified symptoms
   */
  _extractSymptoms(transcript) {
    // Common menstrual symptoms to look for in the transcript
    const commonSymptoms = [
      'cramps', 'pain', 'headache', 'migraine', 'fatigue', 
      'bloating', 'mood swings', 'irritability', 'anxiety',
      'depression', 'acne', 'breast tenderness', 'insomnia',
      'nausea', 'back pain', 'joint pain', 'heavy flow',
      'spotting', 'cravings', 'dizziness'
    ];
    
    const foundSymptoms = [];
    
    // Search for each symptom in the transcript
    commonSymptoms.forEach(symptom => {
      const regex = new RegExp(`\\b${symptom}\\b`, 'i');
      if (regex.test(transcript)) {
        foundSymptoms.push(symptom);
      }
    });
    
    return [...new Set(foundSymptoms)]; // Remove duplicates
  }

  /**
   * Analyze emotional state from conversation transcript
   * @private
   * @param {String} transcript - Conversation transcript
   * @returns {String} - Detected emotional state
   */
  _analyzeEmotionalState(transcript) {
    // Simplified emotion detection based on keywords
    const emotionKeywords = {
      'happy': ['happy', 'good', 'great', 'excellent', 'joy', 'excited', 'positive'],
      'sad': ['sad', 'unhappy', 'depressed', 'down', 'upset', 'cry', 'tears'],
      'anxious': ['anxious', 'worry', 'nervous', 'stress', 'fear', 'panic', 'concerned'],
      'stressed': ['stressed', 'overwhelmed', 'pressure', 'tension', 'exhausted'],
      'calm': ['calm', 'relaxed', 'peaceful', 'fine', 'okay', 'alright']
    };
    
    // Count occurrences of emotion keywords
    const emotionCounts = {};
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      emotionCounts[emotion] = keywords.reduce((count, keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        const matches = transcript.match(new RegExp(regex, 'g'));
        return count + (matches ? matches.length : 0);
      }, 0);
    });
    
    // Find the dominant emotion
    let dominantEmotion = 'neutral';
    let maxCount = 0;
    
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = emotion;
      }
    });
    
    return dominantEmotion;
  }

  /**
   * Generate a summary of the conversation
   * @private
   * @param {String} transcript - Conversation transcript
   * @returns {String} - Summary of the conversation
   */
  _generateSummary(transcript) {
    // Simple summary generation by extracting key sentences
    // In a real implementation, this would use more sophisticated NLP
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= 3) {
      return transcript; // Return full transcript if it's very short
    }
    
    // Select beginning, middle, and end sentences for a simple summary
    const summary = [
      sentences[0],
      sentences[Math.floor(sentences.length / 2)],
      sentences[sentences.length - 1]
    ].join('. ') + '.';
    
    return summary;
  }

  /**
   * Generate insights from conversation analysis
   * @private
   * @param {String} transcript - Conversation transcript
   * @param {Array} symptoms - Extracted symptoms
   * @param {String} emotionalState - Detected emotional state
   * @returns {String} - Insights and recommendations
   */
  _generateInsights(transcript, symptoms, emotionalState) {
    let insights = 'Based on your conversation with Sara, ';
    
    // Add emotional state insights
    switch (emotionalState) {
      case 'happy':
        insights += "you seem to be in a positive mood. ";
        break;
      case 'sad':
        insights += "you may be feeling down or sad. Consider reaching out to a friend or engaging in self-care activities. ";
        break;
      case 'anxious':
        insights += "you appear to be experiencing anxiety. Deep breathing exercises and meditation might help. ";
        break;
      case 'stressed':
        insights += "you seem to be under stress. Taking breaks and practicing relaxation techniques could be beneficial. ";
        break;
      case 'calm':
        insights += "you appear to be feeling relatively calm. ";
        break;
      default:
        insights += "your emotional state varies. ";
    }
    
    // Add symptom-based insights
    if (symptoms.length > 0) {
      insights += `You mentioned experiencing ${symptoms.join(', ')}. `;
      
      // Add recommendations based on common symptoms
      if (symptoms.includes('cramps') || symptoms.includes('pain')) {
        insights += "Heat therapy or gentle stretching might help with discomfort. ";
      }
      
      if (symptoms.includes('fatigue') || symptoms.includes('insomnia')) {
        insights += "Prioritizing rest and maintaining a consistent sleep schedule could improve your energy levels. ";
      }
      
      if (symptoms.includes('mood swings') || symptoms.includes('irritability') || symptoms.includes('anxiety')) {
        insights += "Mindfulness practices and physical activity might help regulate emotions. ";
      }
    } else {
      insights += "You didn't mention any specific physical symptoms. ";
    }
    
    insights += "Remember that tracking your symptoms consistently can help identify patterns and improve cycle management.";
    
    return insights;
  }
}

module.exports = new RetellService();
