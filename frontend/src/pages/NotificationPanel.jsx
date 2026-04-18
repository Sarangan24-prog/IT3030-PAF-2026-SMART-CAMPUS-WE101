import React, { useState, useEffect, useCallback } from 'react';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../services/api';
import './NotificationPanel.css';

const typeLabels = {
  BOOKING_APPROVED: '✅ Booking Approved',
  BOOKING_REJECTED: '❌ Booking Rejected',
  TICKET_STATUS_CHANGED: '🔄 Ticket Updated',
  NEW_COMMENT: '💬 New Comment',
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

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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

  if (loading) {
    return <div className="notification-page"><p>Loading notifications...</p></div>;
  }

  return (
    <div className="notification-page">
      <div className="notification-header">
        <h2>Notifications</h2>
        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={handleMarkAllRead} id="mark-all-read-btn">
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <p>🔔 No notifications yet</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`notification-item ${!n.read ? 'unread' : ''}`}
            >
              <div className="notification-content">
                <span className="notification-type">{typeLabels[n.type] || n.type}</span>
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
                    ✓
                  </button>
                )}
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(n.id)}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
