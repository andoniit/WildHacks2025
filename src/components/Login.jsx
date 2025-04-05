import React from 'react';

import './LoginComponent.css'; 
import { Link } from 'react-router-dom';
const LoginPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement your login logic here
    console.log("Login form submitted");
  };

  return (
    <>
    <div className='wall'></div>
    <div className='form1' action="" method="post" id="Login" onSubmit={handleSubmit}>
      {/* Left section of the form */}
      <div className="left">
        <div>
          {/* Welcome message and registration link */}
          <p>Hello, Welcome! to <br></br>CycleConnect</p>
          <a href="">Don't have an account?</a>
          <Link to="/register">
          <input  type="submit" value="Register" />
          </Link>
        </div>
      </div>

      {/* Right section of the form */}
      <div className="right">
        <div>
          {/* Login heading */}
          <h1>Login</h1>

          {/* Username input field */}
          <input type="text" name="Username" placeholder="Username" />
          

          {/* Password input field */}
          <input type="password" name="Password" placeholder="Password" />
          

          {/* Forgot password link */}
          <a href="">Forgot Password?</a>

          {/* Login button */}
          <button type="submit">Login</button>

          {/* Social login options */}
          
        </div>
      </div>
    </div>
    
    </>
  );
};

export default LoginPage;