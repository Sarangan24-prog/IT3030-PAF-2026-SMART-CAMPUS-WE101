import React, { useState, useEffect, useCallback } from 'react';
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  getAdminNotifications,
  sendNotification,
  broadcastNotification,
} from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="admin-dashboard">
      <h2>⚙️ Admin Dashboard</h2>

      <div className="admin-tabs">
        {['overview', 'users', 'notifications', 'send'].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && '📊 Overview'}
            {tab === 'users' && '👥 Users'}
            {tab === 'notifications' && '🔔 All Notifications'}
            {tab === 'send' && '📨 Send Notification'}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'send' && <SendTab />}
      </div>
    </div>
  );
};

/* ─── Overview Tab ─── */
const OverviewTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading-text">Loading stats...</p>;
  if (!stats) return <p>Failed to load stats</p>;

  return (
    <div className="overview-tab">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <div>
            <p className="stat-number">{stats.totalUsers}</p>
            <p className="stat-label">Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔔</span>
          <div>
            <p className="stat-number">{stats.totalNotifications}</p>
            <p className="stat-label">Total Notifications</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📩</span>
          <div>
            <p className="stat-number">{stats.unreadNotifications}</p>
            <p className="stat-label">Unread Notifications</p>
          </div>
        </div>
      </div>

      <div className="role-breakdown">
        <h3>Role Distribution</h3>
        <div className="role-bars">
          {Object.entries(stats.roleCounts || {}).map(([role, count]) => (
            <div key={role} className="role-row">
              <span className={`role-label role-color-${role.toLowerCase()}`}>
                {role}
              </span>
              <div className="role-bar-bg">
                <div
                  className={`role-bar role-bar-${role.toLowerCase()}`}
                  style={{
                    width: `${Math.max((count / stats.totalUsers) * 100, 8)}%`,
                  }}
                />
              </div>
              <span className="role-count">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Users Tab ─── */
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update role', err);
    }
  };

  if (loading) return <p className="loading-text">Loading users...</p>;

  return (
    <div className="users-tab">
      <div className="table-wrapper">
        <table className="data-table" id="admin-users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="user-name-cell">
                  <div className="avatar">{u.name?.charAt(0)?.toUpperCase()}</div>
                  {u.name}
                </td>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className={`role-select role-sel-${u.role.toLowerCase()}`}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="TECHNICIAN">TECHNICIAN</option>
                  </select>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && (
        <div className="empty-box"><p>No users found</p></div>
      )}
    </div>
  );
};

/* ─── All Notifications Tab ─── */
const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminNotifications()
      .then((res) => setNotifications(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const typeLabels = {
    BOOKING_APPROVED: '✅ Approved',
    BOOKING_REJECTED: '❌ Rejected',
    TICKET_STATUS_CHANGED: '🔄 Ticket',
    NEW_COMMENT: '💬 Comment',
  };

  if (loading) return <p className="loading-text">Loading notifications...</p>;

  return (
    <div className="notifications-tab">
      {notifications.length === 0 ? (
        <div className="empty-box"><p>No notifications in the system</p></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table" id="admin-notifications-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n.id}>
                  <td>{n.userName}</td>
                  <td>
                    <span className="type-chip">{typeLabels[n.type] || n.type}</span>
                  </td>
                  <td className="msg-cell">{n.message}</td>
                  <td>
                    <span className={`status-dot ${n.isRead ? 'read' : 'unread'}`}>
                      {n.isRead ? 'Read' : 'Unread'}
                    </span>
                  </td>
                  <td>{new Date(n.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ─── Send Notification Tab ─── */
const SendTab = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ userId: '', message: '', type: 'NEW_COMMENT' });
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState('');

  useEffect(() => {
    getAllUsers()
      .then((res) => setUsers(res.data))
      .catch(console.error);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) {
      setResult('⚠️ Message is required');
      return;
    }
    if (!isBroadcast && !form.userId) {
      setResult('⚠️ Select a user');
      return;
    }

    setSending(true);
    setResult('');

    try {
      if (isBroadcast) {
        const res = await broadcastNotification({
          message: form.message,
          type: form.type,
        });
        setResult('✅ ' + res.data.message);
      } else {
        await sendNotification({
          userId: form.userId,
          message: form.message,
          type: form.type,
        });
        const userName = users.find((u) => u.id === form.userId)?.name || 'user';
        setResult(`✅ Notification sent to ${userName}`);
      }
      setForm({ userId: '', message: '', type: 'NEW_COMMENT' });
    } catch (err) {
      setResult('❌ Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="send-tab">
      <form onSubmit={handleSend} className="send-form">
        <div className="form-group">
          <label>Notification Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            id="notif-type-select"
          >
            <option value="BOOKING_APPROVED">Booking Approved</option>
            <option value="BOOKING_REJECTED">Booking Rejected</option>
            <option value="TICKET_STATUS_CHANGED">Ticket Status Changed</option>
            <option value="NEW_COMMENT">New Comment</option>
          </select>
        </div>

        <div className="form-group">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={isBroadcast}
              onChange={(e) => setIsBroadcast(e.target.checked)}
            />
            <span>Broadcast to all users</span>
          </label>
        </div>

        {!isBroadcast && (
          <div className="form-group">
            <label>Select User</label>
            <select
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              id="notif-user-select"
            >
              <option value="">-- Choose a user --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Message</label>
          <textarea
            rows={3}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Enter notification message..."
            id="notif-message-input"
          />
        </div>

        {result && <p className="send-result">{result}</p>}

        <button type="submit" className="send-btn" disabled={sending} id="send-notif-btn">
          {sending ? 'Sending...' : isBroadcast ? '📢 Broadcast' : '📨 Send Notification'}
        </button>
      </form>
    </div>
  );
};

export default AdminDashboard;
