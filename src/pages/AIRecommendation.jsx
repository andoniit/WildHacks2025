import React, { useState } from "react";
import Orb from "../components/Orb";
import "./AIRecommendation.css";
import Footer from "../components/Footer";
import Navbar from "../components/nav";


const AIRecommendation = () => {
  const [submitted, setSubmitted] = useState(false);

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
            <button className="ai-button" onClick={() => setSubmitted(true)}>
              Ask AI Your Personalized Recommendation
            </button>
          </div>
          
        </>
      ) : (
        <div className="response-box">
          <p><strong>Gemini AI Suggests:</strong></p>
          <p>Based on your cycle data, your next predicted period may start on April 28th. Consider increasing magnesium intake during your luteal phase and practicing yoga to reduce cramps.</p>
        </div>
        
      )}
    </div>
    <Footer/>
    </>
    
  );
};

export default AIRecommendation;
