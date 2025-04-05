// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginComponent from './components/Login';
import MultiStepForm from './components/MultiStepForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginComponent />} />
        <Route path="/register" element={<MultiStepForm />} />
      </Routes>
    </Router>
  );
}

export default App;