import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../services/api';
import {
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshIcon,
  MessageCircleIcon,
  CheckIcon,
  XIcon,
  SettingsIcon,
} from '../components/Icons';
import './NotificationPanel.css';

const typeConfig = {
  BOOKING_APPROVED:      { label: 'Booking Approved',  Icon: CheckCircleIcon,  color: '#16a34a' },
  BOOKING_REJECTED:      { label: 'Booking Rejected',  Icon: XCircleIcon,      color: '#dc2626' },
  TICKET_STATUS_CHANGED: { label: 'Ticket Updated',    Icon: RefreshIcon,      color: '#d97706' },
  NEW_COMMENT:           { label: 'New Comment',       Icon: MessageCircleIcon, color: '#4361ee' },
};

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkRead  = async (id) => { await markNotificationRead(id);    fetchNotifications(); };
  const handleMarkAll   = async ()    => { await markAllNotificationsRead(); fetchNotifications(); };
  const handleDelete    = async (id) => { await deleteNotification(id);       fetchNotifications(); };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="notification-page">
        <p className="loading-text">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notification-page">
      <div className="notification-header">
        <div className="notif-title-row">
          <BellIcon size={18} color="#0f172a" />
          <h2>Notifications</h2>
          {unreadCount > 0 && (
            <span className="unread-pill">{unreadCount} unread</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={handleMarkAll} id="mark-all-read-btn">
              Mark all as read
            </button>
          )}
          <Link
            to="/notification-preferences"
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '8px 14px', borderRadius: '8px',
              background: '#f1f5f9', color: '#475569',
              fontSize: '13px', fontWeight: 500,
              textDecoration: 'none', transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
          >
            <SettingsIcon size={14} />
            Preferences
          </Link>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-box">
            <BellIcon size={28} color="#64748b" />
          </div>
          <p>No notifications yet</p>
          <span>Notifications will appear here when activity occurs</span>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map((n) => {
            const cfg = typeConfig[n.type] || { label: n.type, Icon: BellIcon, color: '#64748b' };
            return (
              <div
                key={n.id}
                className={`notification-item ${!n.read ? 'unread' : ''}`}
              >
                <div
                  className="notif-type-icon"
                  style={{ background: cfg.color + '18' }}
                >
                  <cfg.Icon size={16} color={cfg.color} />
                </div>
                <div className="notification-content">
                  <span className="notification-type" style={{ color: cfg.color }}>
                    {cfg.label}
                  </span>
                  <p className="notification-msg">{n.message}</p>
                  <span className="notification-time">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="notification-actions">
                  {!n.read && (
                    <button
                      className="action-btn read-btn"
                      onClick={() => handleMarkRead(n.id)}
                      title="Mark as read"
                    >
                      <CheckIcon size={13} />
                    </button>
                  )}
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(n.id)}
                    title="Delete"
                  >
                    <XIcon size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
