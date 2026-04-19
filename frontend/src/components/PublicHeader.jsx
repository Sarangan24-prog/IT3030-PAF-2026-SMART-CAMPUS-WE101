import { Link } from 'react-router-dom';
import { GraduationCapIcon } from './Icons';
import './PublicHeader.css';

const PublicHeader = () => {
  return (
    <header className="public-header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <div className="logo-icon">
            <GraduationCapIcon size={24} color="#ffffff" />
          </div>
          <span className="logo-text">Smart Campus</span>
        </Link>
        <nav className="header-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About Us</Link>
          <Link to="/contact" className="nav-link">Contact Us</Link>
        </nav>
        <div className="header-auth">
          <Link to="/login" className="login-link">Login</Link>
          <Link to="/register" className="register-btn-header">Sign Up</Link>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
