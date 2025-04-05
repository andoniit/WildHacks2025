import React, { useState } from 'react';
import './MultiStepForm.css'; 

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    age: '',
    password: '',
    cycleGap: '',
    latestStart: '',
    latestEnd: '',
    systemNote: '',
    lovedOnes: [{ name: '', phone: '', relation: '' }],
  });

  // Handle changes for input fields in steps 1 and 2
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle changes for dynamic loved ones fields in step 3
  const handleLovedOneChange = (index, e) => {
    const { name, value } = e.target;
    const updatedLovedOnes = [...formData.lovedOnes];
    updatedLovedOnes[index][name] = value;
    setFormData(prev => ({ ...prev, lovedOnes: updatedLovedOnes }));
  };

  // Add a new loved one entry
  const addLovedOne = () => {
    setFormData(prev => ({
      ...prev,
      lovedOnes: [...prev.lovedOnes, { name: '', phone: '', relation: '' }],
    }));
  };

  // Validate current step required fields
  const validateStep = () => {
    if (currentStep === 0) {
      if (!formData.fullName || !formData.phone || !formData.email || !formData.age || !formData.password) {
        alert('Please fill all required fields in Personal Information');
        return false;
      }
    } else if (currentStep === 1) {
      if (!formData.cycleGap || !formData.latestStart || !formData.latestEnd) {
        alert('Please fill all required fields in Cycle Details');
        return false;
      }
    } else if (currentStep === 2) {
      for (let lovedOne of formData.lovedOnes) {
        if (!lovedOne.name || !lovedOne.phone || !lovedOne.relation) {
          alert('Please fill all required fields for each Loved One');
          return false;
        }
      }
    }
    return true;
  };

  // Handle navigation buttons
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep()) {
      console.log('Form submitted with data:', formData);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="success-message">
        <h2>Registration Complete!</h2>
        <p>Thank you for registering with CycleConnect. We have sent a confirmation email with all the details.</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Sidebar with Progress Steps */}
      <div className="sidebar">
        <h1>CycleConnect Registration</h1>
        <div className="progress-steps">
          <div className={`step-item ${currentStep === 0 ? 'active' : currentStep > 0 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-text">Personal Info</div>
          </div>
          <div className={`step-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-text">Cycle Details</div>
          </div>
          <div className={`step-item ${currentStep === 2 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-text">Loved Ones</div>
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="main-content">
        <form onSubmit={handleSubmit}>
          {currentStep === 0 && (
            <div className="form-step active">
              <div className="form-header">
                <h1>Personal Information</h1>
                <p>Please enter your personal details.</p>
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="buttons">
                <button type="button" onClick={handleNext}>Continue</button>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="form-step active">
              <div className="form-header">
                <h1>Cycle Details</h1>
                <p>Please provide your cycle information.</p>
              </div>
              <div className="form-group">
                <label>Average Cycle Gap (days)</label>
                <input
                  type="number"
                  name="cycleGap"
                  placeholder="e.g., 28"
                  value={formData.cycleGap}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Latest Start Date</label>
                <input
                  type="date"
                  name="latestStart"
                  value={formData.latestStart}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Latest End Date</label>
                <input
                  type="date"
                  name="latestEnd"
                  value={formData.latestEnd}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>System Note</label>
                <textarea
                  name="systemNote"
                  placeholder="Any additional note..."
                  value={formData.systemNote}
                  onChange={handleInputChange}
                />
              </div>
              <div className="buttons">
                <button type="button" onClick={handlePrev}>Back</button>
                <button type="button" onClick={handleNext}>Continue</button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="form-step active">
              <div className="form-header">
                <h1>Loved Ones</h1>
                <p>Loved ones you want to share your cycle details with.</p>
              </div>
              {formData.lovedOnes.map((lovedOne, index) => (
                <div key={index} className="loved-one">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter name"
                      value={lovedOne.name}
                      onChange={(e) => handleLovedOneChange(index, e)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter phone number"
                      value={lovedOne.phone}
                      onChange={(e) => handleLovedOneChange(index, e)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Relation</label>
                    <select
                      name="relation"
                      value={lovedOne.relation}
                      onChange={(e) => handleLovedOneChange(index, e)}
                      required
                    >
                      <option value="">Select relation</option>
                      <option value="parents">Parents</option>
                      <option value="partner">Partner</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              ))}
              <div className="buttons">
                <button type="button" onClick={addLovedOne}>Add Another Loved One</button>
                <button type="button" onClick={handlePrev}>Back</button>
                <button type="submit">Complete Registration</button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default MultiStepForm;