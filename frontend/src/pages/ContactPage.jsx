import { useState } from 'react';
import { MailIcon, MapPinIcon, PhoneIcon, SendIcon } from '../components/Icons';
import './ContactPage.css';

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real app, you'd send the data here
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-card">
          <header className="contact-header">
            <div className="contact-logo">
              <MailIcon size={32} color="#ffffff" />
            </div>
            <h1>Get in <span className="text-highlight">Touch</span></h1>
            <p>Have questions or need assistance? Our team is here to support you.</p>
          </header>

          <div className="contact-grid">
            <div className="contact-info">
              <h2>Contact Information</h2>
              <p>We're dedicated to ensuring your Smart Campus experience is seamless and efficient.</p>
              
              <div className="info-items">
                <div className="info-item">
                  <div className="info-icon"><MailIcon size={20} /></div>
                  <div className="info-text">
                    <h4>Email Support</h4>
                    <p>support@smartcampus.com</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><PhoneIcon size={20} /></div>
                  <div className="info-text">
                    <h4>Hotline</h4>
                    <p>+94 11 234 5678</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><MapPinIcon size={20} /></div>
                  <div className="info-text">
                    <h4>Campus Office</h4>
                    <p>University of Colombo, Sri Lanka</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-column">
              {submitted ? (
                <div className="contact-success">
                  <div className="success-icon">✓</div>
                  <h3>Message Dispatched!</h3>
                  <p>Thank you for reaching out. An agent will respond to your inquiry shortly.</p>
                  <button onClick={() => setSubmitted(false)} className="reset-btn">Send Another Message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="Enter your name" required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" placeholder="Enter your email" required />
                  </div>
                  <div className="form-group">
                    <label>Inquiry Message</label>
                    <textarea placeholder="How can we assist you today?" rows="5" required></textarea>
                  </div>
                  <button type="submit" className="submit-btn" id="contact-submit">
                    <span>Send Message</span>
                    <SendIcon size={18} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
