import React from "react";
import { motion } from "framer-motion";
import "./Navbar.css";
import logo from "./assets/7.png";

export function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo at left-most corner */}
        <div className="navbar-logo">
          <a href="/">
            {/* Replace '/logo.png' with your logo path */}
            <img src={logo} alt="Logo" />
          </a>
        </div>
        {/* Navigation Links */}
        <div className="navbar-links">
          <a href="/timeline">Calendar</a>
          <a href="/airecommend">Ai Personal Recommendation</a>
          <a href="/community">Community</a>
          <a href="/education">Educational Resources</a>
          <a href="/userprofile">My Account</a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;