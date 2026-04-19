import './AboutPage.css';
import { GraduationCapIcon, CheckCircleIcon } from '../components/Icons';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <div className="about-card">
          <header className="page-header">
            <div className="about-logo">
              <GraduationCapIcon size={32} color="#ffffff" />
            </div>
            <h1>About <span className="text-highlight">Smart Campus</span></h1>
            <p>Revolutionizing university management through digital innovation.</p>
          </header>

          <section className="about-content">
            <div className="about-text">
              <h2>Our Mission</h2>
              <p>
                The Smart Campus Operations Hub was established with a clear goal: to eliminate the bureaucratic
                bottlenecks and paper-heavy processes that often slow down university life. We provide a 
                modern, digital-first platform that connects students, staff, and administrators.
              </p>
              <p>
                By leveraging real-time data and automated workflows, we ensure that campus services are 
                accessible, transparent, and efficient for everyone involved.
              </p>
              
              <div className="values-list">
                <div className="value-item">
                  <CheckCircleIcon size={20} color="#eab308" />
                  <span>Efficiency in everything we build</span>
                </div>
                <div className="value-item">
                  <CheckCircleIcon size={20} color="#eab308" />
                  <span>Transparency for all users</span>
                </div>
                <div className="value-item">
                  <CheckCircleIcon size={20} color="#eab308" />
                  <span>Reliability at scale</span>
                </div>
              </div>
            </div>
            
            <div className="about-image-card">
              <div className="about-icon-orb">
                <GraduationCapIcon size={120} color="rgba(234, 179, 8, 0.4)" />
              </div>
              <div className="stat-box">
                  <span className="stat-number">2026</span>
                  <span className="stat-label">Next Gen Tech</span>
              </div>
            </div>
          </section>

          <section className="team-intro">
            <h2>The Project</h2>
            <p>
              Developed as part of the PAF 2026 assignment, this platform utilizes state-of-the-art 
              <strong> Spring Boot & React</strong> architecture. Our goal is to set a new standard 
              for campus operational hubs globally.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
