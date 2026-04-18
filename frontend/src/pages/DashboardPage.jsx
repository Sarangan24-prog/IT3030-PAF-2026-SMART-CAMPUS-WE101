import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  InboxIcon,
  ShieldIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshIcon,
  MessageCircleIcon,
  MailIcon,
  CalendarIcon,
  CheckIcon,
  XIcon,
} from '../components/Icons';
import './DashboardPage.css';

const typeIcons = {
  BOOKING_APPROVED: CheckCircleIcon,
  BOOKING_REJECTED: XCircleIcon,
  TICKET_STATUS_CHANGED: RefreshIcon,
  NEW_COMMENT: MessageCircleIcon,
};

const typeColors = {
  BOOKING_APPROVED: '#10b981',
  BOOKING_REJECTED: '#ef4444',
  TICKET_STATUS_CHANGED: '#f59e0b',
  NEW_COMMENT: '#4361ee',
};

const typeLabels = {
  BOOKING_APPROVED: 'Booking Approved',
  BOOKING_REJECTED: 'Booking Rejected',
  TICKET_STATUS_CHANGED: 'Ticket Updated',
  NEW_COMMENT: 'New Comment',
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    fetchNotifications();
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    fetchNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="dashboard-page" id="dashboard-page">
      {/* Hero */}
      <div className="dash-hero">
        <div className="dash-hero-text">
          <h1>{getGreeting()}, {user?.name || 'User'}</h1>
          <p>Welcome to your Smart Campus Operations Hub</p>
        </div>
        <div className="dash-hero-date">
          <span className="date-display">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        <div className="dash-stat-card" id="stat-notifications">
          <div className="stat-icon-wrap">
            <BellIcon size={20} color="#ffffff" />
          </div>
          <div className="stat-info">
            <p className="stat-number">{notifications.length}</p>
            <p className="stat-label">Notifications</p>
          </div>
        </div>
        <div className="dash-stat-card" id="stat-unread">
          <div className="stat-icon-wrap">
            <InboxIcon size={20} color="#ffffff" />
          </div>
          <div className="stat-info">
            <p className="stat-number">{unreadCount}</p>
            <p className="stat-label">Unread</p>
          </div>
        </div>
        <div className="dash-stat-card" id="stat-role">
          <div className="stat-icon-wrap">
            <ShieldIcon size={20} color="#ffffff" />
          </div>
          <div className="stat-info">
            <p className="stat-number">{user?.role || 'N/A'}</p>
            <p className="stat-label">Your Role</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dash-main-grid">
        {/* Notifications Feed */}
        <div className="dash-primary">
          <div className="section-header">
            <div className="section-title-row">
              <BellIcon size={16} color="#4361ee" />
              <h3 className="section-title">Notifications</h3>
            </div>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={handleMarkAllRead}>
                Mark all as read ({unreadCount})
              </button>
            )}
          </div>

          {loading ? (
            <p className="loading-text">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div className="empty-feed">
              <div className="empty-feed-icon">
                <BellIcon size={28} color="#475569" />
              </div>
              <p>No notifications yet</p>
              <span>You will see updates here when activity occurs</span>
            </div>
          ) : (
            <div className="notif-list">
              {notifications.map((n) => {
                const IconComp = typeIcons[n.type] || BellIcon;
                const iconColor = typeColors[n.type] || '#64748b';
                return (
                  <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                    <div className="notif-icon-wrap" style={{ background: iconColor + '18' }}>
                      <IconComp size={15} color={iconColor} />
                    </div>
                    <div className="notif-body">
                      <span className="notif-type" style={{ color: iconColor }}>
                        {typeLabels[n.type] || n.type}
                      </span>
                      <p className="notif-msg">{n.message}</p>
                      <span className="notif-time">
                        {new Date(n.createdAt).toLocaleString('en-US', {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="notif-actions">
                      {!n.read && (
                        <button
                          className="notif-btn read-btn"
                          onClick={() => handleMarkRead(n.id)}
                          title="Mark as read"
                        >
                          <CheckIcon size={13} />
                        </button>
                      )}
                      <button
                        className="notif-btn del-btn"
                        onClick={() => handleDelete(n.id)}
                        title="Delete"
                      >
                        <XIcon size={13} />
                      </button>
                    </div>
                    {!n.read && <span className="unread-dot" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile Sidebar */}
        <div className="dash-sidebar">
          <div className="dash-card profile-card" id="profile-card">
            <div className="card-header">
              <h3>Profile</h3>
            </div>
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
                  <span className="detail-icon">
                    <MailIcon size={13} color="#64748b" />
                  </span>
                  <span className="detail-text">{user?.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">
                    <CalendarIcon size={13} color="#64748b" />
                  </span>
                  <span className="detail-text">
                    Joined {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="dash-card quick-card">
            <div className="card-header">
              <h3>Quick Access</h3>
            </div>
            <div className="quick-body">
              <button className="quick-link-btn" onClick={() => navigate('/notifications')}>
                <BellIcon size={15} color="#4361ee" />
                <span>All Notifications</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
