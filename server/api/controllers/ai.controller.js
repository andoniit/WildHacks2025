const User = require('../models/user.model');
const retellService = require('../../services/retell.service');
const { ApiError } = require('../../utils/errorHandler');

/**
 * Model for storing AI conversations
 * This would typically be in a separate file, but including it here for now
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// AI Conversation Schema
const AiConversationSchema = new Schema({
  email: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  conversationId: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // in seconds
  },
  transcriptSummary: {
    type: String
  },
  emotionalState: {
    type: String,
    enum: ['happy', 'sad', 'neutral', 'anxious', 'stressed', 'calm']
  },
  symptoms: [{
    type: String
  }],
  insights: {
    type: String
  },
  audioUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Create index for faster queries
AiConversationSchema.index({ email: 1, startTime: -1 });

const AiConversation = mongoose.model('AiConversation', AiConversationSchema);

/**
 * Start a new AI conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const startConversation = async (req, res, next) => {
  try {
    const { email } = req.user;
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Start a new conversation with Retell
    const conversationData = await retellService.createConversation({
      userName: user.name,
      cycleStatus: user.cycleStatus,
      userAge: user.age
    });
    
    // Create conversation record in database
    const conversation = await AiConversation.create({
      email,
      conversationId: conversationData.conversationId,
      startTime: new Date()
    });
    
    res.status(200).json({
      success: true,
      message: 'Conversation started',
      conversation: {
        id: conversation._id,
        conversationId: conversation.conversationId,
        startTime: conversation.startTime,
        callUrl: conversationData.callUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * End an AI conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const endConversation = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { conversationId } = req.params;
    
    // Find the conversation
    const conversation = await AiConversation.findOne({
      email,
      conversationId
    });
    
    if (!conversation) {
      throw new ApiError(404, 'Conversation not found');
    }
    
    // End the conversation with Retell
    await retellService.endConversation(conversationId);
    
    // Get the transcript and analyze it
    const transcriptData = await retellService.getTranscript(conversationId);
    
    // Update conversation record with end time and analysis
    conversation.endTime = new Date();
    conversation.duration = Math.round((conversation.endTime - conversation.startTime) / 1000);
    
    if (transcriptData) {
      conversation.transcriptSummary = transcriptData.summary;
      conversation.emotionalState = transcriptData.emotionalState;
      conversation.symptoms = transcriptData.symptoms;
      conversation.insights = transcriptData.insights;
      conversation.audioUrl = transcriptData.audioUrl;
    }
    
    await conversation.save();
    
    res.status(200).json({
      success: true,
      message: 'Conversation ended',
      conversation: {
        id: conversation._id,
        duration: conversation.duration,
        emotionalState: conversation.emotionalState,
        symptoms: conversation.symptoms
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get conversation history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getConversationHistory = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { limit = 10, page = 1 } = req.query;
    
    // Find conversations for the user
    const conversations = await AiConversation.find({ email })
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('conversationId startTime endTime duration emotionalState symptoms insights');
    
    // Get total count for pagination
    const total = await AiConversation.countDocuments({ email });
    
    res.status(200).json({
      success: true,
      conversations,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getConversation = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { conversationId } = req.params;
    
    // Find the conversation
    const conversation = await AiConversation.findOne({
      email,
      _id: conversationId
    });
    
    if (!conversation) {
      throw new ApiError(404, 'Conversation not found');
    }
    
    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Analyze conversation insights
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const analyzeConversationInsights = async (req, res, next) => {
  try {
    const { email } = req.user;
    
    // Get conversations for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const conversations = await AiConversation.find({
      email,
      startTime: { $gte: thirtyDaysAgo }
    }).select('emotionalState symptoms insights startTime');
    
    if (conversations.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No conversations found in the last 30 days',
        insights: {}
      });
    }
    
    // Analyze emotional states
    const emotionalStates = conversations.reduce((acc, conv) => {
      if (conv.emotionalState) {
        acc[conv.emotionalState] = (acc[conv.emotionalState] || 0) + 1;
      }
      return acc;
    }, {});
    
    // Analyze symptoms
    const symptomsCount = {};
    conversations.forEach(conv => {
      if (conv.symptoms && conv.symptoms.length > 0) {
        conv.symptoms.forEach(symptom => {
          symptomsCount[symptom] = (symptomsCount[symptom] || 0) + 1;
        });
      }
    });
    
    // Get top symptoms
    const topSymptoms = Object.entries(symptomsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom, count]) => ({ symptom, count }));
    
    // Calculate dominant emotional state
    const dominantEmotion = Object.entries(emotionalStates)
      .sort((a, b) => b[1] - a[1])
      .map(([state, count]) => ({ state, count }))[0];
    
    res.status(200).json({
      success: true,
      insights: {
        totalConversations: conversations.length,
        emotionalStates,
        dominantEmotion: dominantEmotion?.state || 'neutral',
        topSymptoms,
        conversationFrequency: conversations.length / 30 // average conversations per day
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get personalized recommendation based on calendar data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPersonalizedRecommendation = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { calendarData } = req.body;
    
    if (!calendarData || !Array.isArray(calendarData)) {
      throw new ApiError(400, 'Calendar data is required and must be an array');
    }
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Use Gemini service to get personalized recommendation
    const geminiService = require('../../services/gemini.service');
    
    // Format the user data for Gemini
    const userData = {
      userName: user.name || 'User',
      age: user.age || 25,
      avgCycleLength: user.cycleLength || 28,
      symptoms: [],
      cycles: []
    };
    
    // Parse the calendar data to extract cycle information and symptoms
    if (calendarData.length > 0) {
      // Process calendar entries to extract cycle and symptom information
      const symptoms = new Set();
      
      // Map calendar entries to cycle data format
      calendarData.forEach(entry => {
        // Extract symptoms if category is 'symptom'
        if (entry.category?.toLowerCase() === 'symptom' && entry.title) {
          symptoms.add(entry.title.toLowerCase());
        }
        
        // If this is a period entry, add it to cycles
        if (entry.category?.toLowerCase() === 'period') {
          userData.cycles.push({
            startDate: entry.startDate,
            endDate: entry.endDate || entry.startDate,
            symptoms: []
          });
        }
      });
      
      // Add extracted symptoms to userData
      userData.symptoms = Array.from(symptoms);
    }
    
    // Get recommendation from Gemini
    const recommendation = await geminiService.getSymptomInsights(userData);
    
    // Combine suggestions and recommendations
    let formattedRecommendation = recommendation.suggestions;
    
    if (recommendation.recommendations && recommendation.recommendations.length > 0) {
      formattedRecommendation += '\n\nRecommendations:\n';
      recommendation.recommendations.forEach((rec, index) => {
        formattedRecommendation += `\n${index + 1}. ${rec}`;
      });
    }
    
    res.status(200).json({
      success: true,
      recommendation: formattedRecommendation,
      metadata: {
        basedOn: userData.cycles.length,
        symptoms: userData.symptoms
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startConversation,
  endConversation,
  getConversationHistory,
  getConversation,
  analyzeConversationInsights,
  getPersonalizedRecommendation
};
