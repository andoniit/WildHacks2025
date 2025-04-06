import React, { useState, useEffect } from "react";
import Orb from "../components/Orb";
import "./AIRecommendation.css";
import Footer from "../components/Footer";
import Navbar from "../components/nav";
import axios from "axios";
import { CalendarService } from "../services/api.service";
import API_ENDPOINTS from "../config/api.config";


const AIRecommendation = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [error, setError] = useState(null);

  const fetchRecommendation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the user's calendar data
      const calendarResponse = await CalendarService.getCalendarEvents();
      const calendarData = calendarResponse.data?.calendarInfo || [];
      
      // Construct the system prompt with the calendar data
      const requestData = {
        calendarData: calendarData
      };
      
      // Send the data to the backend to query Gemini API
      // Use the full API URL from the config rather than a relative path
      const token = localStorage.getItem('cycleconnect_token');
      const response = await axios.post(`${API_ENDPOINTS.AI.RECOMMENDATION}`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      // Set the AI response from Gemini
      setAiResponse(response.data.recommendation);
      setSubmitted(true);
    } catch (err) {
      console.error("Error fetching AI recommendation:", err);
      setError("Failed to get your personalized recommendation. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="ai-rec-wrapper">
      <h2 className="ai-title">Using <span className="highlighted-api">Gemini API</span> to generate personalized recommendation</h2>

      {!submitted ? (
        <>
        
          <div className="orb-section">
            <Orb
              hoverIntensity={0.5}
              rotateOnHover={true}
              hue={0}
              forceHoverState={false}
            />
          </div>
          <div className="button-section">
            {error && <p className="error-message">{error}</p>}
            <button 
              className="ai-button" 
              onClick={fetchRecommendation} 
              disabled={loading}
            >
              {loading ? "Getting Recommendation..." : "Ask AI Your Personalized Recommendation"}
            </button>
          </div>
          
        </>
      ) : (
        <div className="response-box">
          <p><strong>Gemini AI Suggests:</strong></p>
          <p className="response-text">{aiResponse}</p>
          <button 
            className="ai-button back-button" 
            onClick={() => setSubmitted(false)}
          >
            Go Back
          </button>
        </div>
        
      )}
    </div>
    <Footer/>
    </>
    
  );
};

export default AIRecommendation;
