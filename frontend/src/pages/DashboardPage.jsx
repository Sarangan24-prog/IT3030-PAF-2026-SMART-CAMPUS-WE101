import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, createBooking, getMyBookings, createTicket, getMyTickets } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);

  useEffect(() => {
    getNotifications()
      .then((res) => setNotifications(res.data))
      .catch(() => {})
      .finally(() => setNotifLoading(false));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentNotifications = notifications.slice(0, 4);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const typeIcons = {
    BOOKING_APPROVED: '✅',
    BOOKING_REJECTED: '❌',
    TICKET_STATUS_CHANGED: '🔄',
    NEW_COMMENT: '💬',
  };

  return (
    <div className="dashboard-page" id="dashboard-page">
      {/* Hero Welcome */}
      <div className="dash-hero">
        <div className="dash-hero-text">
          <h1>{getGreeting()}, {user?.name || 'User'} 👋</h1>
          <p>Welcome to your Smart Campus Operations Hub</p>
        </div>
        <div className="dash-hero-date">
          <span className="date-display">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="dash-stats">
        <div className="dash-stat-card" id="stat-notifications">
          <div className="stat-icon-wrap blue"><span>🔔</span></div>
          <div className="stat-info">
            <p className="stat-number">{notifications.length}</p>
            <p className="stat-label">Notifications</p>
          </div>
        </div>
        <div className="dash-stat-card" id="stat-unread">
          <div className="stat-icon-wrap orange"><span>📩</span></div>
          <div className="stat-info">
            <p className="stat-number">{unreadCount}</p>
            <p className="stat-label">Unread</p>
          </div>
        </div>
        <div className="dash-stat-card" id="stat-role">
          <div className="stat-icon-wrap green"><span>🛡️</span></div>
          <div className="stat-info">
            <p className="stat-number">{user?.role || 'N/A'}</p>
            <p className="stat-label">Your Role</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dash-main-grid">
        {/* Left — Bookings / Tickets */}
        <div className="dash-primary">
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

          {activeTab === 'bookings' && <BookingsSection />}
          {activeTab === 'tickets' && <TicketsSection />}
        </div>

        {/* Right Sidebar */}
        <div className="dash-sidebar">
          {/* Profile Card */}
          <div className="dash-card profile-card" id="profile-card">
            <div className="card-header"><h3>Profile</h3></div>
            <div className="profile-body">
              <div className="profile-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <h4 className="profile-name">{user?.name || 'User'}</h4>
              <span className={`role-chip role-${user?.role?.toLowerCase()}`}>
                {user?.role}
              </span>
              <div className="profile-details">
                <div className="detail-row">
                  <span className="detail-icon">📧</span>
                  <span className="detail-text">{user?.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">📅</span>
                  <span className="detail-text">
                    Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="dash-card activity-card" id="recent-activity">
            <div className="card-header">
              <h3>Notifications</h3>
              <button className="view-all-btn" onClick={() => navigate('/notifications')}>
                View All →
              </button>
            </div>
            <div className="activity-body">
              {notifLoading ? (
                <p className="empty-msg">Loading...</p>
              ) : recentNotifications.length === 0 ? (
                <div className="empty-activity">
                  <span className="empty-icon">🔔</span>
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="activity-list">
                  {recentNotifications.map((n) => (
                    <div key={n.id} className={`activity-item ${!n.read ? 'unread' : ''}`}>
                      <span className="activity-icon">{typeIcons[n.type] || '📌'}</span>
                      <div className="activity-content">
                        <p className="activity-msg">{n.message}</p>
                        <span className="activity-time">
                          {new Date(n.createdAt).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {!n.read && <span className="unread-dot" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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
    PENDING: '#f59e0b',
    APPROVED: '#10b981',
    REJECTED: '#ef4444',
  };

  return (
    <div className="section">
      <h3 className="section-title">Create a Booking</h3>
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

      <h3 className="section-title list-title">Your Bookings</h3>
      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : bookings.length === 0 ? (
        <div className="empty-text">
          <span className="empty-icon-sm">📅</span>
          <p>No bookings yet. Create one above!</p>
        </div>
      ) : (
        <div className="items-list">
          {bookings.map((b) => (
            <div key={b.id} className="item-card">
              <div className="item-top">
                <span className="item-title">{b.title}</span>
                <span
                  className="status-badge"
                  style={{ background: statusColors[b.status] + '18', color: statusColors[b.status] }}
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
    OPEN: '#3b82f6',
    IN_PROGRESS: '#f59e0b',
    RESOLVED: '#10b981',
    CLOSED: '#6b7280',
  };

  return (
    <div className="section">
      <h3 className="section-title">Raise a Ticket</h3>
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

      <h3 className="section-title list-title">Your Tickets</h3>
      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : tickets.length === 0 ? (
        <div className="empty-text">
          <span className="empty-icon-sm">🎫</span>
          <p>No tickets yet. Raise one above!</p>
        </div>
      ) : (
        <div className="items-list">
          {tickets.map((t) => (
            <div key={t.id} className="item-card">
              <div className="item-top">
                <span className="item-title">{t.title}</span>
                <span
                  className="status-badge"
                  style={{ background: statusColors[t.status] + '18', color: statusColors[t.status] }}
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
