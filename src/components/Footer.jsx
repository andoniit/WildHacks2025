import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-left">
          <p>&copy; {new Date().getFullYear()} CycleConnect| WildHacks 2025 · Developed by Men Who Respect Women</p>
          <p></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;