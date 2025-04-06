import React from "react";
import { motion } from "framer-motion";
import "./Navbar.css";

export function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo at left-most corner */}
        <div className="navbar-logo">
          <a href="/">
            {/* Replace '/logo.png' with your logo path */}
            <img src="/logo.png" alt="Logo" />
          </a>
        </div>
        {/* Navigation Links */}
        <div className="navbar-links">
          <a href="/calendar">Calendar</a>
          <a href="/recommendation">Recommendation</a>
          <a href="/community">Community</a>
          <a href="/educational-resources">Educational Resources</a>
          <a href="/my-account">My Account</a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;