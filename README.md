# CycleConnect – A Menstrual Support Network

CycleConnect is a web application that helps individuals track their menstrual cycles while fostering a supportive community. It connects users with trusted friends, family, or healthcare professionals for emotional and practical support during different phases of their cycle.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Core Features](#core-features)
3. [Tech Stack Implementation](#tech-stack-implementation)
4. [Example Workflow](#example-workflow)
5. [Why CycleConnect is Unique](#why-cycleconnect-is-unique)
6. [Project Setup & How to Run](#project-setup--how-to-run)
7. [Benefits](#benefits)
8. [Future scope](#future-scope)


---

## Project Overview

**Purpose:**  
CycleConnect goes beyond traditional menstrual tracking by focusing on **building a support network**. Users not only track their periods, symptoms, and moods, but they can also share this information with selected friends, partners, or family members. The application facilitates open communication, understanding, and empathy around menstruation.

---

## Core Features

1. **Cycle Sharing**  
   - Users can share their menstrual cycle details (e.g., period dates, symptoms, mood) with selected contacts (e.g., partners, family members, or friends).  
   - **Example**: A partner receives notifications when PMS symptoms are expected, enabling better emotional support.

2. **Personalized Symptom Tracking**  
   - Users log physical and emotional symptoms (e.g., cramps, fatigue, anxiety) via simple checkboxes or sliders.  
   - The app provides AI-powered insights on patterns and symptom management suggestions.

3. **Community Support Groups**  
   - Anonymous groups based on shared experiences (e.g., endometriosis, PCOS, heavy bleeding).  
   - Users can share tips, ask questions, or provide encouragement in a safe space.

4. **Self-Care Recommendations**  
   - Automated tips for self-care, tailored to symptoms and cycle phase.  
   - **Examples**:  
     - "Try yoga or heat therapy for cramps."  
     - "Consider magnesium-rich foods for PMS."

5. **Educational Resources**  
   - Bite-sized guides on:  
     - Understanding hormonal changes during the cycle.  
     - Managing mood swings naturally.  
     - When to seek medical help for menstrual issues.

6. **Notifications for Partners/Supporters**  
   - Supporters receive notifications like:  
     - "Day 1 of the cycle: Offer extra care today."  
     - "PMS week: Encourage rest and hydration."

---
## Scalibility 
One-Liner for Scalability & Stability:

“Leverage a microservices architecture with containerization, orchestrate in the cloud using auto-scaling and load balancing, implement caching and sharding for databases, enforce secure and compliant APIs, monitor performance in real-time, and deploy globally to ensure resilient, high-performing, and stable operations.”

---

## Tech Stack Implementation

1. **Frontend (React)**  
   - Clean, user-friendly interface for logging symptoms, viewing cycle trends, and managing sharing preferences.

2. **Backend (Node.js + Express)**  
   - REST APIs to handle:  
     - User authentication and data storage.  
     - AI-generated insights using the Gemini AI API.  
     - Notifications for shared contacts.

3. **Database (MongoDB)**  
   - Stores user profiles (cycle data, symptoms, preferences), shared contacts, and community group posts/interactions.

4. **Gemini AI API**  
   - Analyzes symptom logs to provide actionable insights and recommendations.  
   - **Example**: If a user logs "severe cramps," the app suggests heat therapy or consulting a doctor.

---

## Example Workflow

1. A user logs into CycleConnect and sets up a profile with cycle details.  
2. They choose to share cycle updates with their partner and a close friend.  
3. During the luteal phase (PMS), the app sends a notification to the partner:  
   - "*Your partner may experience irritability or fatigue this week. Be supportive!*"  
4. The user logs symptoms like "mood swings" and "cramps."  
5. Gemini AI analyzes these symptoms and recommends:  
   - "*Try mindfulness exercises for mood swings.*"  
6. The user joins an anonymous support group, connecting with others who have similar experiences.

---

## Why CycleConnect is Unique

1. **Emphasis on Support Network:**  
   Goes beyond basic menstrual tracking by promoting open communication between the user and their support circle.

2. **Actionable Insights:**  
   AI-powered tips address real-time symptoms, offering practical ways to manage discomfort or mood changes.

3. **Community Building:**  
   Safe, anonymous forums connect people with shared experiences, fostering understanding and empathy.

---

## Project Setup & How to Run

### Prerequisites
- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- MongoDB (v4.4 or later)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cycleconnect.git
   cd cycleconnect
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the server directory
   - Add the following variables:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/cycleconnect
     JWT_SECRET=your_jwt_secret
     TWILIO_ACCOUNT_SID=your_twilio_sid
     TWILIO_AUTH_TOKEN=your_twilio_token
     TWILIO_PHONE_NUMBER=your_twilio_phone
     GEMINI_API_KEY=your_gemini_api_key
     ```

4. **Set up the frontend**
   ```bash
   cd ../src
   npm install
   ```

5. **Run the application**
   - Start the backend server
     ```bash
     cd server
     npm run dev
     ```
   - Start the frontend development server
     ```bash
     cd src
     npm start
     ```
   - Access the application at `http://localhost:3000`

---

## Benefits

- **For Users:**  
  Emotional support from friends/family, practical advice to manage symptoms effectively.
- **For Supporters:**  
  Guidance on how to be more empathetic and helpful during different menstrual phases.
- **For Communities:**  
  A safe space to connect, share experiences, and provide mutual support.

---

## Future Scope

1. **Advanced AI Integration**
   - Natural language processing for journal entries to identify patterns
   - Retell Ai agent integration

2. **Expanded Health Tracking**
   - Integration with wearable devices to track physiological changes
   - Fertility tracking and planning features
   - Medication tracking and reminders

3. **Enhanced Communication Tools**
   - In-app messaging between users and their support network
   - Video consultation with healthcare providers
   - Group video chat for support groups

4. **Global Accessibility**
   - Multi-language support
   - Culturally sensitive content and recommendations
   - Offline functionality for areas with limited connectivity

5. **Health Professional Portal**
   - Dedicated interface for healthcare providers
   - Secure data sharing with medical professionals
   - Telemedicine integration

6. **Research Contributions**
   - Anonymous, opt-in data sharing for menstrual health research
   - Collaboration with medical institutions to improve menstrual healthcare

---
