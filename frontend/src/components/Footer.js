import { Link } from 'react-router-dom';
import { GraduationCapIcon, MailIcon, MapPinIcon } from './Icons';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="main-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-icon">
                <GraduationCapIcon size={18} color="#ffffff" />
              </span>
              <span className="footer-logo-text">Smart Campus</span>
            </div>
            <p className="footer-tagline">
              Simplifying campus operations with smart booking, ticketing, and real-time notifications.
            </p>
          </div>

          <div className="footer-links-group">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
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
              <li>
                <span className="footer-contact-item">
                  <MailIcon size={13} color="#64748b" />
                  support@smartcampus.com
                </span>
              </li>
              <li>
                <span className="footer-contact-item">
                  <MapPinIcon size={13} color="#64748b" />
                  University of Colombo
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {currentYear} Smart Campus Operations Hub. All rights reserved.
          </p>
          <p className="footer-credit">
            Built for PAF 2026
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
