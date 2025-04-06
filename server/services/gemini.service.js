const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

/**
 * Service for integrating with Google's Gemini AI for symptom analysis and insights
 */
class GeminiService {
  constructor() {
    // Initialize Gemini API client
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  /**
   * Get insights and recommendations based on symptom history
   * @param {Object} userData - User data and symptom history
   * @returns {Object} - AI-generated insights and recommendations
   */
  async getSymptomInsights(userData) {
    try {
      // Create prompt with user data and symptoms
      const prompt = this.createInsightPrompt(userData);

      // Generate response from Gemini
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Parse the response
      return this.parseInsightResponse(response);
    } catch (error) {
      logger.error(`Error getting Gemini insights: ${error.message}`);
      
      // Return fallback recommendations if AI fails
      return this.getFallbackInsights(userData.symptoms);
    }
  }

  /**
   * Create a structured prompt for the Gemini AI
   * @private
   * @param {Object} userData - User data and symptom history
   * @returns {String} - Formatted prompt
   */
  createInsightPrompt(userData) {
    return `
You are a supportive menstrual health assistant for the CycleConnect app. Please analyze the following user data and provide personalized insights and self-care recommendations.

USER INFORMATION:
Name: ${userData.userName}
Age: ${userData.age}
Average Cycle Length: ${userData.avgCycleLength} days

RECENT SYMPTOMS:
${userData.symptoms.join(', ')}

RECENT CYCLE HISTORY:
${userData.cycles.map(cycle => `
- Period from ${new Date(cycle.startDate).toLocaleDateString()} to ${new Date(cycle.endDate).toLocaleDateString()}
  Symptoms: ${cycle.symptoms.join(', ') || 'None recorded'}
`).join('\n')}

Based on this information, please provide:
1. A brief analysis of the user's symptom patterns
2. 3-5 specific self-care recommendations to address their common symptoms
3. Any lifestyle adjustments that might help with their specific pattern
4. When they should consider seeking medical advice (if applicable)

Please format your response as JSON with the following structure:
{
  "suggestions": "Your supportive analysis here",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3", "recommendation4", "recommendation5"]
}
`;
  }

  /**
   * Parse the AI response into structured insight data
   * @private
   * @param {String} response - Raw AI response text
   * @returns {Object} - Parsed insights and recommendations
   */
  parseInsightResponse(response) {
    try {
      // Try to extract JSON from the response
      const jsonStart = response.indexOf('{');
      const jsonEnd = response.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = response.substring(jsonStart, jsonEnd);
        return JSON.parse(jsonStr);
      }
      
      // If JSON parsing fails, extract recommendations manually
      const suggestions = response.split('recommendations:')[0] || 'Based on your symptoms, consider gentle self-care practices.';
      const recommendationSection = response.split('recommendations:')[1] || '';
      const recommendations = recommendationSection
        .split(/\d+\./)
        .filter(item => item.trim().length > 0)
        .map(item => item.trim());
      
      return {
        suggestions: suggestions.trim(),
        recommendations: recommendations.length > 0 ? recommendations : this.getDefaultRecommendations()
      };
    } catch (error) {
      logger.error(`Error parsing Gemini response: ${error.message}`);
      return this.getFallbackInsights();
    }
  }

  /**
   * Get fallback insights when AI service fails
   * @private
   * @param {Array} symptoms - User symptoms
   * @returns {Object} - Default insights and recommendations
   */
  getFallbackInsights(symptoms = []) {
    let suggestions = 'Based on your tracked symptoms, here are some general self-care recommendations that might help.';
    let recommendations = this.getDefaultRecommendations();
    
    // Add symptom-specific recommendations
    if (symptoms.includes('cramps') || symptoms.includes('pain')) {
      recommendations.push('Use a heating pad on your lower abdomen to help with cramps');
      recommendations.push('Try gentle yoga or stretching to relieve tension');
    }
    
    if (symptoms.includes('headache') || symptoms.includes('migraine')) {
      recommendations.push('Rest in a dark, quiet room when experiencing headaches');
      recommendations.push('Stay hydrated throughout your cycle, especially before your period');
    }
    
    if (symptoms.includes('mood swings') || symptoms.includes('anxiety') || symptoms.includes('irritability')) {
      recommendations.push('Practice mindfulness meditation to help manage emotional symptoms');
      recommendations.push('Consider keeping a mood journal to identify patterns and triggers');
    }
    
    if (symptoms.includes('fatigue') || symptoms.includes('tiredness')) {
      recommendations.push('Prioritize sleep during your period and aim for 7-8 hours each night');
      recommendations.push('Consider iron-rich foods as fatigue can be related to blood loss');
    }
    
    if (symptoms.includes('bloating')) {
      recommendations.push('Reduce salt intake in the days leading up to your period');
      recommendations.push('Try herbal teas like peppermint or ginger to reduce bloating');
    }
    
    // Limit to 5 recommendations
    recommendations = recommendations.slice(0, 5);
    
    return {
      suggestions,
      recommendations
    };
  }

  /**
   * Get default set of recommendations
   * @private
   * @returns {Array} - Default recommendations
   */
  getDefaultRecommendations() {
    return [
      'Stay hydrated by drinking plenty of water throughout your cycle',
      'Incorporate regular, moderate exercise like walking or swimming',
      'Practice stress management techniques such as deep breathing or meditation',
      'Maintain a balanced diet rich in fruits, vegetables, and whole grains',
      'Ensure you get adequate rest, especially during your period'
    ];
  }
}

module.exports = new GeminiService();
