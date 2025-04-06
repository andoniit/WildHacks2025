import React, { useState } from 'react';
import './LoginComponent.css'; 
import { Link } from 'react-router-dom';
import { AuthService } from '../services/api.service';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.login(credentials.email, credentials.password);
      
      // Store token
      if (response.data.token) {
        localStorage.setItem('cycleconnect_token', response.data.token);
        // Redirect to dashboard (you can use react-router's navigate here)
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className='wall'></div>
    <form className='form1' id="Login" onSubmit={handleSubmit}>
      {/* Left section of the form */}
      <div className="left">
        <div>
          {/* Welcome message and registration link */}
          <p>Hello, Welcome! to <br></br>CycleConnect</p>
          <span>Don't have an account?</span>
          <Link to="/register">
            <input type="button" value="Register" />
          </Link>
        </div>
      </div>

      {/* Right section of the form */}
      <div className="right">
        <div>
          {/* Login heading */}
          <h1>Login</h1>

          {error && <div className="error-message">{error}</div>}

          {/* Email input field */}
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            value={credentials.email}
            onChange={handleChange}
            required
          />
          
          {/* Password input field */}
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            value={credentials.password}
            onChange={handleChange}
            required
          />
          
          {/* Forgot password link */}
          <Link to="/forgot-password">Forgot Password?</Link>

          {/* Login button */}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
    </form>
    </>
  );
};

export default LoginPage;