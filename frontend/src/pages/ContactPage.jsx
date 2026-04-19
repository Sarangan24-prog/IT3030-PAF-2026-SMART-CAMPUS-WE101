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
        <header className="contact-header">
          <h1>Get in <span className="text-highlight">Touch</span></h1>
          <p>Have questions or need assistance? We're here to help.</p>
        </header>

        <div className="contact-grid">
          <div className="contact-info">
            <h2>Contact Information</h2>
            <p>Our team is available to assist you with any platform-related inquiries.</p>
            
            <div className="info-items">
              <div className="info-item">
                <div className="info-icon"><MailIcon size={20} /></div>
                <div>
                  <h4>Email</h4>
                  <p>support@smartcampus.com</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon"><PhoneIcon size={20} /></div>
                <div>
                  <h4>Phone</h4>
                  <p>+94 11 234 5678</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon"><MapPinIcon size={20} /></div>
                <div>
                  <h4>Location</h4>
                  <p>University of Colombo, Sri Lanka</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-card">
            {submitted ? (
              <div className="contact-success">
                <div className="success-icon">✓</div>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We will get back to you shortly.</p>
                <button onClick={() => setSubmitted(false)} className="reset-btn">Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="John Doe" required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="john@example.com" required />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea placeholder="How can we help you?" rows="5" required></textarea>
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
  );
};

export default ContactPage;
