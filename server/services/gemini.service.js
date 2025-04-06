const OpenAI = require('openai');
const logger = require('../utils/logger');

/**
 * Service for integrating with OpenAI for symptom analysis and insights
 * (Previously used Google's Gemini AI)
 */
class AIService {
  constructor() {
    // Initialize OpenAI client
    this.apiKey = process.env.OPENAI_API_KEY;
    this.openai = new OpenAI({
      apiKey: this.apiKey
    });
    this.model = 'gpt-4o-mini'; // Using gpt-4o-mini model
  }

  /**
   * Get insights and recommendations based on symptom history
   * @param {Object} userData - User data and symptom history
   * @returns {Object} - AI-generated insights and recommendations
   */
  async getSymptomInsights(userData) {
    try {
      // Create prompt with user data and symptoms
      const userPrompt = this.createInsightPrompt(userData);
      
      // Generate response from OpenAI
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { 
            role: "user", 
            content: `You are an expert of menstrual health and are really kind and sweet. Please analyze the following user data and provide personalized insights and self-care recommendations.\n\n${userPrompt}` 
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });
      
      const response = completion.choices[0].message.content;

      // Parse the response
      return this.parseInsightResponse(response);
    } catch (error) {
      logger.error(`Error getting AI insights: ${error.message}`);
      
      // Return fallback recommendations if AI fails
      return this.getFallbackInsights(userData.symptoms);
    }
  }

  /**
   * Create a structured prompt for the AI
   * @private
   * @param {Object} userData - User data and symptom history
   * @returns {String} - Formatted prompt
   */
  createInsightPrompt(userData) {
    return `
    Use time frame, What were the gaps between the menstural cycle, what notes says, what may be the cause of the notes

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
    1. A brief analysis of the user's symptom patterns and give answer in 1000 words
    2. 5-6 specific self-care recommendations to address their common symptoms
    3. Any lifestyle adjustments that might help with their specific pattern
    4. When they should consider seeking medical advice (if applicable)
    5. Look into the internet for more information about the symptoms and give answer in 1000 words

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
      logger.error(`Error parsing AI response: ${error.message}`);
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

module.exports = new AIService();
