import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { createBooking, getMyBookings, createTicket, getMyTickets } from '../services/api';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');

  return (
    <div className="dashboard-page">
      <div className="welcome-card">
        <h3>Welcome, {user?.name || 'User'}! 👋</h3>
        <p>You are logged in as <strong>{user?.role}</strong></p>
      </div>

      <div className="dash-tabs">
        <button
          className={`dash-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          📅 My Bookings
        </button>
        <button
          className={`dash-tab ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          🎫 My Tickets
        </button>
      </div>

      {activeTab === 'bookings' && <BookingsSection userId={user?.id} />}
      {activeTab === 'tickets' && <TicketsSection userId={user?.id} />}
    </div>
  );
};

/* ─── Bookings Section ─── */
const BookingsSection = () => {
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      const res = await getMyBookings();
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setMsg('⚠️ Title is required'); return; }
    setSubmitting(true);
    setMsg('');
    try {
      await createBooking(form);
      setForm({ title: '', description: '' });
      setMsg('✅ Booking submitted! Waiting for admin approval.');
      fetchBookings();
    } catch (err) {
      setMsg('❌ Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors = {
    PENDING: '#ff9800',
    APPROVED: '#4caf50',
    REJECTED: '#f44336',
  };

  return (
    <div className="section">
      <h3>Create a Booking</h3>
      <form onSubmit={handleSubmit} className="create-form">
        <input
          type="text"
          placeholder="Booking title (e.g., Lab Room B2)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          id="booking-title"
        />
        <textarea
          rows={2}
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          id="booking-desc"
        />
        {msg && <p className="form-msg">{msg}</p>}
        <button type="submit" className="submit-btn" disabled={submitting} id="submit-booking">
          {submitting ? 'Submitting...' : '📅 Submit Booking'}
        </button>
      </form>

      <h3 className="list-title">Your Bookings</h3>
      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="empty-text">No bookings yet. Create one above!</p>
      ) : (
        <div className="items-list">
          {bookings.map((b) => (
            <div key={b.id} className="item-card">
              <div className="item-top">
                <span className="item-title">{b.title}</span>
                <span
                  className="status-badge"
                  style={{ background: statusColors[b.status] + '20', color: statusColors[b.status] }}
                >
                  {b.status}
                </span>
              </div>
              {b.description && <p className="item-desc">{b.description}</p>}
              <span className="item-date">{new Date(b.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Tickets Section ─── */
const TicketsSection = () => {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchTickets = useCallback(async () => {
    try {
      const res = await getMyTickets();
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setMsg('⚠️ Title is required'); return; }
    setSubmitting(true);
    setMsg('');
    try {
      await createTicket(form);
      setForm({ title: '', description: '' });
      setMsg('✅ Ticket raised! Admin will review it.');
      fetchTickets();
    } catch (err) {
      setMsg('❌ Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors = {
    OPEN: '#2196f3',
    IN_PROGRESS: '#ff9800',
    RESOLVED: '#4caf50',
    CLOSED: '#9e9e9e',
  };

  return (
    <div className="section">
      <h3>Raise a Ticket</h3>
      <form onSubmit={handleSubmit} className="create-form">
        <input
          type="text"
          placeholder="Ticket title (e.g., WiFi not working in Block A)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          id="ticket-title"
        />
        <textarea
          rows={2}
          placeholder="Describe the issue..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          id="ticket-desc"
        />
        {msg && <p className="form-msg">{msg}</p>}
        <button type="submit" className="submit-btn" disabled={submitting} id="submit-ticket">
          {submitting ? 'Submitting...' : '🎫 Raise Ticket'}
        </button>
      </form>

      <h3 className="list-title">Your Tickets</h3>
      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : tickets.length === 0 ? (
        <p className="empty-text">No tickets yet. Raise one above!</p>
      ) : (
        <div className="items-list">
          {tickets.map((t) => (
            <div key={t.id} className="item-card">
              <div className="item-top">
                <span className="item-title">{t.title}</span>
                <span
                  className="status-badge"
                  style={{ background: statusColors[t.status] + '20', color: statusColors[t.status] }}
                >
                  {t.status.replace('_', ' ')}
                </span>
              </div>
              {t.description && <p className="item-desc">{t.description}</p>}
              {t.comments && t.comments.length > 0 && (
                <div className="comments-section">
                  <span className="comments-label">💬 {t.comments.length} comment(s)</span>
                  {t.comments.map((c, i) => (
                    <div key={i} className="comment-item">
                      <strong>{c.authorName}</strong>: {c.text}
                    </div>
                  ))}
                </div>
              )}
              <span className="item-date">{new Date(t.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
