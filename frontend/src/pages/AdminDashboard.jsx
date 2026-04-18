import { useState, useEffect, useCallback } from 'react';
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  getAdminNotifications,
  sendNotification,
  broadcastNotification,
  getAllBookings,
  updateBookingStatus,
  getAllTickets,
  updateTicketStatus,
  addTicketComment,
} from '../services/api';
import {
  BarChartIcon,
  CalendarIcon,
  TagIcon,
  UsersIcon,
  BellIcon,
  SendIcon,
  CheckIcon,
  XIcon,
  RadioIcon,
  MessageCircleIcon,
  AlertIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshIcon,
} from '../components/Icons';
import './AdminDashboard.css';

const TABS = [
  { key: 'overview',       label: 'Overview',       Icon: BarChartIcon },
  { key: 'bookings',       label: 'Bookings',       Icon: CalendarIcon },
  { key: 'tickets',        label: 'Tickets',        Icon: TagIcon },
  { key: 'users',          label: 'Users',          Icon: UsersIcon },
  { key: 'notifications',  label: 'Notifications',  Icon: BellIcon },
  { key: 'send',           label: 'Send',           Icon: SendIcon },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <p className="admin-subtitle">Manage users, bookings, tickets and notifications</p>
      </div>

      <div className="admin-tabs">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`tab-btn ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'overview'      && <OverviewTab />}
        {activeTab === 'bookings'      && <BookingsTab />}
        {activeTab === 'tickets'       && <TicketsTab />}
        {activeTab === 'users'         && <UsersTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'send'          && <SendTab />}
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
  if (!stats) return <p className="loading-text">Failed to load stats</p>;

  const statCards = [
    { label: 'Total Users',           value: stats.totalUsers,           Icon: UsersIcon },
    { label: 'Total Notifications',   value: stats.totalNotifications,   Icon: BellIcon },
    { label: 'Unread Notifications',  value: stats.unreadNotifications,  Icon: MessageCircleIcon },
  ];

  return (
    <div className="overview-tab">
      <div className="stats-grid">
        {statCards.map(({ label, value, Icon }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon-box">
              <Icon size={20} color="#ffffff" />
            </div>
            <div>
              <p className="stat-number">{value}</p>
              <p className="stat-label">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="role-breakdown">
        <h3>Role Distribution</h3>
        <div className="role-bars">
          {Object.entries(stats.roleCounts || {}).map(([role, count]) => (
            <div key={role} className="role-row">
              <span className={`role-label role-color-${role.toLowerCase()}`}>{role}</span>
              <div className="role-bar-bg">
                <div
                  className={`role-bar role-bar-${role.toLowerCase()}`}
                  style={{ width: `${Math.max((count / stats.totalUsers) * 100, 8)}%` }}
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

/* ─── Bookings Tab ─── */
const BookingsTab = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await getAllBookings();
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleAction = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const statusMeta = {
    PENDING:  { bg: '#fef3c7', color: '#d97706' },
    APPROVED: { bg: '#dcfce7', color: '#16a34a' },
    REJECTED: { bg: '#fee2e2', color: '#dc2626' },
  };

  if (loading) return <p className="loading-text">Loading bookings...</p>;

  return (
    <div className="bookings-tab">
      {bookings.length === 0 ? (
        <div className="empty-box"><p>No bookings submitted yet</p></div>
      ) : (
        <div className="admin-items-list">
          {bookings.map((b) => {
            const meta = statusMeta[b.status] || statusMeta.PENDING;
            return (
              <div key={b.id} className="admin-item-card">
                <div className="admin-item-header">
                  <div>
                    <span className="admin-item-title">{b.title}</span>
                    <span className="admin-item-user">by {b.userName}</span>
                  </div>
                  <span
                    className="status-badge"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {b.status}
                  </span>
                </div>
                {b.description && <p className="admin-item-desc">{b.description}</p>}
                <div className="admin-item-footer">
                  <span className="admin-item-date">{new Date(b.createdAt).toLocaleString()}</span>
                  {b.status === 'PENDING' && (
                    <div className="action-btns">
                      <button className="approve-btn" onClick={() => handleAction(b.id, 'APPROVED')}>
                        <CheckIcon size={13} />
                        Approve
                      </button>
                      <button className="reject-btn" onClick={() => handleAction(b.id, 'REJECTED')}>
                        <XIcon size={13} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─── Tickets Tab ─── */
const TicketsTab = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});

  const fetchTickets = useCallback(async () => {
    try {
      const res = await getAllTickets();
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateTicketStatus(id, newStatus);
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (ticketId) => {
    const text = commentText[ticketId];
    if (!text || !text.trim()) return;
    try {
      await addTicketComment(ticketId, text);
      setCommentText({ ...commentText, [ticketId]: '' });
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors = {
    OPEN:        '#2563eb',
    IN_PROGRESS: '#d97706',
    RESOLVED:    '#16a34a',
    CLOSED:      '#6b7280',
  };

  if (loading) return <p className="loading-text">Loading tickets...</p>;

  return (
    <div className="tickets-tab">
      {tickets.length === 0 ? (
        <div className="empty-box"><p>No tickets raised yet</p></div>
      ) : (
        <div className="admin-items-list">
          {tickets.map((t) => (
            <div key={t.id} className="admin-item-card">
              <div className="admin-item-header">
                <div>
                  <span className="admin-item-title">{t.title}</span>
                  <span className="admin-item-user">by {t.userName}</span>
                </div>
                <select
                  value={t.status}
                  onChange={(e) => handleStatusChange(t.id, e.target.value)}
                  className="ticket-status-select"
                  style={{ color: statusColors[t.status] }}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
              {t.description && <p className="admin-item-desc">{t.description}</p>}

              {t.comments && t.comments.length > 0 && (
                <div className="ticket-comments">
                  {t.comments.map((c, i) => (
                    <div key={i} className="ticket-comment">
                      <strong>{c.authorName}</strong>: {c.text}
                      <span className="comment-time">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="add-comment">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText[t.id] || ''}
                  onChange={(e) => setCommentText({ ...commentText, [t.id]: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(t.id); }}
                />
                <button onClick={() => handleAddComment(t.id)}>
                  <SendIcon size={13} />
                  Send
                </button>
              </div>

              <span className="admin-item-date">{new Date(t.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      console.error(err);
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
    </div>
  );
};

/* ─── Notifications Tab ─── */
const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminNotifications()
      .then((res) => setNotifications(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const typeConfig = {
    BOOKING_APPROVED:     { label: 'Approved',       Icon: CheckCircleIcon, color: '#16a34a' },
    BOOKING_REJECTED:     { label: 'Rejected',       Icon: XCircleIcon,     color: '#dc2626' },
    TICKET_STATUS_CHANGED:{ label: 'Ticket Update',  Icon: RefreshIcon,     color: '#d97706' },
    NEW_COMMENT:          { label: 'Comment',        Icon: MessageCircleIcon, color: '#4361ee' },
  };

  if (loading) return <p className="loading-text">Loading notifications...</p>;

  return (
    <div className="notifications-tab">
      {notifications.length === 0 ? (
        <div className="empty-box"><p>No notifications in the system</p></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
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
              {notifications.map((n) => {
                const cfg = typeConfig[n.type] || { label: n.type, Icon: BellIcon, color: '#64748b' };
                return (
                  <tr key={n.id}>
                    <td>{n.userName}</td>
                    <td>
                      <span className="type-chip" style={{ color: cfg.color }}>
                        <cfg.Icon size={12} color={cfg.color} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="msg-cell">{n.message}</td>
                    <td>
                      <span className={`status-dot ${n.isRead ? 'read' : 'unread'}`}>
                        {n.isRead ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td>{new Date(n.createdAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ─── Send Tab ─── */
const SendTab = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ userId: '', message: '', type: 'NEW_COMMENT' });
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState({ text: '', ok: null });

  useEffect(() => {
    getAllUsers().then((res) => setUsers(res.data)).catch(console.error);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) { setResult({ text: 'Message is required', ok: false }); return; }
    if (!isBroadcast && !form.userId) { setResult({ text: 'Select a user', ok: false }); return; }

    setSending(true);
    setResult({ text: '', ok: null });
    try {
      if (isBroadcast) {
        const res = await broadcastNotification({ message: form.message, type: form.type });
        setResult({ text: res.data.message, ok: true });
      } else {
        await sendNotification({ userId: form.userId, message: form.message, type: form.type });
        const userName = users.find((u) => u.id === form.userId)?.name || 'user';
        setResult({ text: `Notification sent to ${userName}`, ok: true });
      }
      setForm({ userId: '', message: '', type: 'NEW_COMMENT' });
    } catch (err) {
      setResult({ text: 'Failed to send notification', ok: false });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="send-tab">
      <form onSubmit={handleSend} className="send-form">
        <div className="form-group">
          <label>Notification Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
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
            <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
              <option value="">-- Choose a user --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
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
          />
        </div>

        {result.text && (
          <p className={`send-result ${result.ok ? 'result-ok' : 'result-err'}`}>
            {result.ok
              ? <CheckCircleIcon size={14} color="#16a34a" />
              : <AlertIcon size={14} color="#dc2626" />}
            {result.text}
          </p>
        )}

        <button type="submit" className="send-btn" disabled={sending}>
          {sending ? (
            'Sending...'
          ) : isBroadcast ? (
            <><RadioIcon size={15} /> Broadcast to All</>
          ) : (
            <><SendIcon size={15} /> Send Notification</>
          )}
        </button>
      </form>
    </div>
  );
};

export default AdminDashboard;
