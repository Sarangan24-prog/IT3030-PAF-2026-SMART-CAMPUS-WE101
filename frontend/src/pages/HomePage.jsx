import { Link } from 'react-router-dom';
import { GraduationCapIcon, CheckCircleIcon, UsersIcon, BellIcon, TicketIcon } from '../components/Icons';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Modernizing Campus Life with <span className="text-highlight">Smart Operations</span></h1>
          <p>
            Experience a seamless, efficient, and connected campus environment. 
            Manage your bookings, tickets, and notifications all in one professional hub.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="primary-btn">Join the Platform</Link>
            <Link to="/about" className="secondary-btn">Learn More</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-card">
            <GraduationCapIcon size={120} color="#77A365" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Smart Campus?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><BellIcon size={24} /></div>
            <h3>Real-time Alerts</h3>
            <p>Stay updated with instant notifications for all your campus activities and requests.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><TicketIcon size={24} /></div>
            <h3>Smart Ticketing</h3>
            <p>Efficient issue reporting and tracking system for all campus facilities.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><UsersIcon size={24} /></div>
            <h3>Unified Hub</h3>
            <p>A single point of truth for students, administrators, and technical staff.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to get started?</h2>
          <p>Join thousands of students and staff members using the Smart Campus Hub today.</p>
          <Link to="/register" className="cta-btn">Create Your Account</Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
