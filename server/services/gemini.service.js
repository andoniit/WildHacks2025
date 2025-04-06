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
    You are an expert of menstrual health and are really kind and sweet. Please analyze the following user data and provide personalized insights and self-care recommendations.

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
      "suggestions": "Based on your provided details, it appears that your menstrual cycle is within a typical range, and there are no alarming patterns in terms of duration or intensity of symptoms. This is a good indication that your overall reproductive health is on track. Still, it’s important to continue monitoring any changes and keep maintaining a healthy lifestyle. \n\nHere are some more in-depth insights for you:\n\n1. *Symptom Patterns: If your symptoms (such as cramps, mood swings, or fatigue) are mild and occur around the same days of your cycle each month, it suggests you are experiencing normal hormonal fluctuations. However, if any symptom becomes severe or disrupts your daily life, it’s worth noting and discussing with a healthcare professional.\n\n2. **Lifestyle & Wellness: Keeping track of your diet, exercise, and stress levels can greatly impact how you feel before and during your period. A balanced diet rich in nutrients and moderate exercise can alleviate some premenstrual discomforts.\n\n3. **Healthy Cycle Encouragement: Since your cycle appears normal, it’s beneficial to continue your current health habits. Make sure to stay hydrated, get plenty of sleep, and consider stress-relieving techniques like yoga or meditation. These can contribute to more comfortable menstrual cycles in the long run.\n\n4. **Safe Sex Recommendations (for 18+): If you’re sexually active, practicing safe sex is crucial for preventing sexually transmitted infections (STIs) and unwanted pregnancies. Using condoms or other barrier methods, understanding your fertility window, and discussing birth control options with your partner or healthcare provider can all help ensure a healthy sex life. If you’re interested in more in-depth guidance, you might explore:\n - Planned Parenthood: https://www.plannedparenthood.org\n - CDC’s Contraception Guidance: https://www.cdc.gov/reproductivehealth/contraception/index.htm\n\n5. **When to Seek Medical Advice*: While everything seems normal, you should consider reaching out to a healthcare professional if you notice any major changes, such as prolonged bleeding, unusually heavy flow, missed periods (when not on birth control), or severe pain that disrupts your daily activities. These could indicate underlying issues that may require medical attention.\n\nFor further reading on normal menstrual cycles and self-care strategies, these articles might be helpful:\n - Mayo Clinic on Menstrual Cycle Basics: https://www.mayoclinic.org/healthy-lifestyle/womens-health/in-depth/menstrual-cycle/art-20047186\n - Office on Women’s Health (U.S.) guidance on menstruation: https://www.womenshealth.gov/menstruation\n",
      "recommendations": [
        "Continue tracking your symptoms daily to detect any patterns or changes over time.",
        "Stay hydrated and maintain a balanced diet with plenty of fruits, vegetables, and whole grains.",
        "Incorporate moderate exercise such as walking, stretching, or gentle yoga to reduce menstrual discomfort.",
        "Practice relaxation techniques like deep breathing, meditation, or journaling to manage stress effectively.",
        "If you are 18 or older and sexually active, explore safe sex practices, including barrier methods and regular check-ups for STI screening."
      ]
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
