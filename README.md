# CycleConnect – A Menstrual Support Network

CycleConnect is a web application that helps individuals track their menstrual cycles while fostering a supportive community. It connects users with trusted friends, family, or healthcare professionals for emotional and practical support during different phases of their cycle.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Core Features](#core-features)
3. [Tech Stack Implementation](#tech-stack-implementation)
4. [Example Workflow](#example-workflow)
5. [Why CycleConnect is Unique](#why-cycleconnect-is-unique)
6. [Benefits](#benefits)
7. [Hackathon Timeline (10 Hours)](#hackathon-timeline-10-hours)
8. [Project Setup & How to Run](#project-setup--how-to-run)
9. [Contributing](#contributing)
10. [License](#license)
11. [Contact](#contact)

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

## Tech Stack Implementation

1. **Frontend (React + Vite)**  
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

## Benefits

- **For Users:**  
  Emotional support from friends/family, practical advice to manage symptoms effectively.
- **For Supporters:**  
  Guidance on how to be more empathetic and helpful during different menstrual phases.
- **For Communities:**  
  A safe space to connect, share experiences, and provide mutual support.

---

## Hackathon Timeline (10 Hours)

1. **Hour 1–2:**  
   - Set up basic React frontend (forms for symptom logging and sharing preferences).
2. **Hour 3–4:**  
   - Develop Node.js/Express backend APIs for data storage and notifications.
3. **Hour 5–6:**  
   - Integrate Gemini AI API to analyze symptoms and generate insights.
4. **Hour 7–8:**  
   - Add basic community group functionality (discussion boards or chat).
5. **Hour 9:**  
   - Implement notifications (via Twilio, email, or similar services).
6. **Hour 10:**  
   - Polish UI/UX, perform testing, and prepare a demo presentation.

---

## Project Setup & How to Run

Make sure you have **Node.js** and **npm** (or **yarn**) installed on your system.

1. **Clone or Download the Repository**
   ```bash
   git clone https://github.com/andoniit/cycleconnect.git