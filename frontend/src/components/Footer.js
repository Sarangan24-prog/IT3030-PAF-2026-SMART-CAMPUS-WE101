import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="main-footer">
      <div className="footer-inner">
        {/* Top Section */}
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo">🏫 Smart Campus</span>
            <p className="footer-tagline">
              Simplifying campus operations with smart booking, ticketing, and real-time notifications.
            </p>
          </div>

          <div className="footer-links-group">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/notifications">Notifications</Link></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4>Resources</h4>
            <ul>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4>Contact</h4>
            <ul>
              <li><span>📧 support@smartcampus.com</span></li>
              <li><span>📍 University of Colombo</span></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p className="footer-copy">
            © {currentYear} Smart Campus Operations Hub. All rights reserved.
          </p>
          <p className="footer-credit">
            Built with ❤️ for PAF 2026
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
