// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginComponent from './components/Login';
import MultiStepForm from './components/MultiStepForm';
import MenstrualTimelinePage from './pages/MenstrualTimelinePage';
import UserProfile from './pages/UserProfile';
import EducationalResources from './pages/EducationalResources';
import Airecmo from './pages/AIRecommendation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginComponent />} />
        <Route path="/register" element={<MultiStepForm />} />
        <Route path="/timeline" element={<MenstrualTimelinePage />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/education" element={<EducationalResources/>} />
        <Route path="/airecommend" element={<Airecmo/>} />



        
      </Routes>
    </Router>
  );
}

export default App;