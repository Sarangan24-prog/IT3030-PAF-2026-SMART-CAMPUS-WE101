import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  getAdminNotifications,
  sendNotification,
  broadcastNotification,
  getAllBookings,
  updateBookingStatus,
  getAllResources,
  createResource,
  updateResource,
  deleteResource
} from '../services/api';
import {
  BarChartIcon,
  CalendarIcon,
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
  UploadIcon,
  PinIcon,
  DownloadIcon,
  MonitorIcon,
} from '../components/Icons';
import './AdminDashboard.css';
//booking added 
const TABS = [
  { key: 'overview', label: 'Overview', Icon: BarChartIcon },
  { key: 'bookings', label: 'Bookings', Icon: CalendarIcon },
  { key: 'analytics', label: 'Analytics', Icon: MonitorIcon },
  { key: 'resources', label: 'Facilities', Icon: PinIcon },
  { key: 'users', label: 'Users', Icon: UsersIcon },
  { key: 'notifications', label: 'Notifications', Icon: BellIcon },
  { key: 'send', label: 'Send', Icon: SendIcon },
];

const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab') || 'overview';
  const activeTab = TABS.some((tab) => tab.key === requestedTab) ? requestedTab : 'overview';

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <p className="admin-subtitle">Manage users, bookings, tickets and notifications</p>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'bookings' && <BookingsTab />}
        {activeTab === 'analytics' && <ResourceAnalyticsTab />}
        {activeTab === 'resources' && <ResourcesTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'send' && <SendTab />}
      </div>
    </div>
  );
};

/* ─── Resource Analytics Tab ─── */
const ResourceAnalyticsTab = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const [resourcesRes, bookingsRes] = await Promise.all([
        getAllResources(),
        getAllBookings(),
      ]);
      setAnalytics(buildResourceAnalytics(resourcesRes.data || [], bookingsRes.data || []));
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      setLoadError(status ? `Failed to load resource analytics (${status})` : 'Failed to load resource analytics');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) return <p className="loading-text">Loading resource intelligence...</p>;
  if (!analytics) return <p className="loading-text">{loadError || 'Failed to load resource analytics'}</p>;

  const summary = analytics.summary || {};
  const typeEntries = Object.entries(analytics.byType || {});
  const buildingEntries = Object.entries(analytics.byBuilding || {});
  const bookingStatusEntries = Object.entries(analytics.bookingsByStatus || {});
  const topResources = analytics.topResources || [];
  const recentBookings = analytics.recentBookings || [];
  const maxType = Math.max(...typeEntries.map(([, value]) => value), 1);
  const maxBuilding = Math.max(...buildingEntries.map(([, value]) => value), 1);
  const maxResourceBookings = Math.max(...topResources.map((item) => item.bookingCount), 1);
  const totalBookings = summary.totalBookings || 0;
  const approvedRatio = totalBookings ? Math.round(((summary.approvedBookings || 0) / totalBookings) * 100) : 0;
  const serviceLoad = (summary.pendingBookings || 0) + (summary.outOfServiceResources || 0);

  const metricCards = [
    { label: 'Resource Health', value: `${summary.healthScore || 0}%`, hint: 'Active inventory', tone: 'green' },
    { label: 'Utilization Signal', value: `${summary.utilizationScore || 0}%`, hint: 'Approved demand vs capacity', tone: 'blue' },
    { label: 'Bookable Ratio', value: `${summary.bookableRatio || 0}%`, hint: 'Available for requests', tone: 'amber' },
    { label: 'Total Capacity', value: summary.totalCapacity || 0, hint: 'Seats and device capacity', tone: 'violet' },
  ];

  return (
    <div className="resource-analytics-tab">
      <section className="analytics-hero-panel">
        <div>
          <p className="analytics-kicker">Resource Intelligence Core</p>
          <h3>Campus resource performance</h3>
          <p>
            Live operational analytics for facilities, capacity, booking demand, and service readiness.
          </p>
        </div>
        <div className="analytics-orbit" aria-hidden="true">
          <span />
          <strong>{summary.totalResources || 0}</strong>
          <small>Resources</small>
        </div>
      </section>

      <section className="analytics-command-strip">
        <div className="command-node">
          <span>Readiness</span>
          <strong>{summary.healthScore || 0}%</strong>
          <small>{summary.activeResources || 0} of {summary.totalResources || 0} resources active</small>
        </div>
        <div className="command-node">
          <span>Approval Flow</span>
          <strong>{approvedRatio}%</strong>
          <small>{summary.approvedBookings || 0} approved from {totalBookings} requests</small>
        </div>
        <div className="command-node">
          <span>Attention Queue</span>
          <strong>{serviceLoad}</strong>
          <small>{summary.pendingBookings || 0} pending, {summary.outOfServiceResources || 0} offline</small>
        </div>
        <button className="analytics-refresh-btn" onClick={loadAnalytics} disabled={loading}>
          <RefreshIcon size={15} />
          Refresh
        </button>
      </section>

      <div className="analytics-metric-grid">
        {metricCards.map((card) => (
          <div key={card.label} className={`analytics-metric-card ${card.tone}`}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.hint}</small>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        <section className="analytics-panel inventory-panel">
          <div className="analytics-panel-heading">
            <h4>Inventory Matrix</h4>
            <span>{summary.activeResources || 0} active</span>
          </div>
          <div className="status-rings">
            <div className="status-ring active">
              <strong>{summary.activeResources || 0}</strong>
              <span>Active</span>
            </div>
            <div className="status-ring warning">
              <strong>{summary.outOfServiceResources || 0}</strong>
              <span>Out of service</span>
            </div>
            <div className="status-ring neutral">
              <strong>{summary.bookableResources || 0}</strong>
              <span>Bookable</span>
            </div>
          </div>
          <div className="capacity-band-list">
            {(analytics.capacityBands || []).map((band) => (
              <div key={band.label} className="capacity-band-row">
                <span>{band.label}</span>
                <div>
                  <i style={{ width: `${band.count ? Math.max((band.count / Math.max(summary.totalResources || 1, 1)) * 100, 6) : 0}%` }} />
                </div>
                <strong>{band.count}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="analytics-panel">
          <div className="analytics-panel-heading">
            <h4>Type Distribution</h4>
            <span>{typeEntries.length} classes</span>
          </div>
          <div className="type-bars">
            {typeEntries.map(([type, value]) => (
              <div key={type} className="type-bar-row">
                <span>{formatLabel(type)}</span>
                <div>
                  <i style={{ width: `${value ? Math.max((value / maxType) * 100, 8) : 0}%` }} />
                </div>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="analytics-panel booking-signal-panel">
          <div className="analytics-panel-heading">
            <h4>Booking Signal</h4>
            <span>{totalBookings} requests</span>
          </div>
          <div className="booking-signal-grid">
            {bookingStatusEntries.map(([status, value]) => (
              <div key={status} className={`booking-signal ${status.toLowerCase()}`}>
                <strong>{value}</strong>
                <span>{formatLabel(status)}</span>
                <i style={{ height: `${value ? Math.max((value / Math.max(totalBookings, 1)) * 100, 10) : 0}%` }} />
              </div>
            ))}
          </div>
        </section>

        <section className="analytics-panel">
          <div className="analytics-panel-heading">
            <h4>Building Load</h4>
            <span>{buildingEntries.length} zones</span>
          </div>
          <div className="building-load-list">
            {buildingEntries.map(([building, value]) => (
              <div key={building} className="building-load-row">
                <span>{building}</span>
                <div>
                  <i style={{ width: `${value ? Math.max((value / maxBuilding) * 100, 8) : 0}%` }} />
                </div>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="analytics-grid analytics-grid-lower">
        <section className="analytics-panel">
          <div className="analytics-panel-heading">
            <h4>High Demand Resources</h4>
            <span>Top 5</span>
          </div>
          <div className="top-resource-list">
            {topResources.map((resource, index) => (
              <div key={resource.id || resource.code || resource.name} className="top-resource-row">
                <span className="resource-rank">{index + 1}</span>
                <div className="top-resource-main">
                  <strong>{resource.name}</strong>
                  <small>{resource.code} - {formatLabel(resource.type)} - {resource.building || 'Unassigned'}</small>
                  <div><i style={{ width: `${resource.bookingCount ? Math.max((resource.bookingCount / maxResourceBookings) * 100, 8) : 0}%` }} /></div>
                </div>
                <span className="resource-count">{resource.bookingCount}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="analytics-panel">
          <div className="analytics-panel-heading">
            <h4>Recent Resource Flow</h4>
            <span>Latest bookings</span>
          </div>
          <div className="recent-flow-list">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="recent-flow-row">
                <div>
                  <strong>{booking.resourceName || 'Resource'}</strong>
                  <small>{booking.userName} - {booking.bookingDate || 'Date pending'} - {booking.timeSlot}</small>
                </div>
                <span className={`flow-status ${String(booking.status).toLowerCase()}`}>
                  {formatLabel(booking.status)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const formatLabel = (value) => String(value || '')
  .replaceAll('_', ' ')
  .toLowerCase()
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const buildResourceAnalytics = (resources, bookings) => {
  const countBy = (items, getKey) => items.reduce((acc, item) => {
    const key = getKey(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const totalResources = resources.length;
  const activeResources = resources.filter((item) => item.status === 'ACTIVE').length;
  const outOfServiceResources = resources.filter((item) => item.status === 'OUT_OF_SERVICE').length;
  const bookableResources = resources.filter((item) => item.bookable === true).length;
  const totalCapacity = resources.reduce((sum, item) => sum + (Number(item.capacity) || 0), 0);
  const approvedBookings = bookings.filter((item) => item.status === 'APPROVED').length;
  const pendingBookings = bookings.filter((item) => item.status === 'PENDING').length;
  const rejectedBookings = bookings.filter((item) => item.status === 'REJECTED').length;
  const cancelledBookings = bookings.filter((item) => item.status === 'CANCELLED').length;
  const bookingCounts = countBy(bookings.filter((item) => item.resourceId), (item) => item.resourceId);

  return {
    summary: {
      totalResources,
      activeResources,
      outOfServiceResources,
      bookableResources,
      totalCapacity,
      totalBookings: bookings.length,
      approvedBookings,
      pendingBookings,
      rejectedBookings,
      cancelledBookings,
      healthScore: totalResources ? Math.round((activeResources / totalResources) * 100) : 0,
      bookableRatio: totalResources ? Math.round((bookableResources / totalResources) * 100) : 0,
      utilizationScore: activeResources ? Math.min(100, Math.round((approvedBookings / (activeResources * 8)) * 100)) : 0,
    },
    byType: countBy(resources, (item) => item.type || 'UNCLASSIFIED'),
    byStatus: countBy(resources, (item) => item.status || 'UNKNOWN'),
    byBuilding: countBy(resources, (item) => item.building || 'Unassigned'),
    bookingsByStatus: {
      APPROVED: approvedBookings,
      PENDING: pendingBookings,
      REJECTED: rejectedBookings,
      CANCELLED: cancelledBookings,
    },
    capacityBands: [
      { label: 'Small', count: resources.filter((item) => (Number(item.capacity) || 0) <= 40).length },
      { label: 'Medium', count: resources.filter((item) => (Number(item.capacity) || 0) >= 41 && (Number(item.capacity) || 0) <= 120).length },
      { label: 'Large', count: resources.filter((item) => (Number(item.capacity) || 0) >= 121 && (Number(item.capacity) || 0) <= 300).length },
      { label: 'Arena', count: resources.filter((item) => (Number(item.capacity) || 0) >= 301).length },
    ],
    topResources: resources
      .map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        building: item.building,
        type: item.type || 'UNCLASSIFIED',
        capacity: Number(item.capacity) || 0,
        bookingCount: bookingCounts[item.id] || 0,
      }))
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 5),
    recentBookings: [...bookings]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        referenceId: item.referenceId || 'N/A',
        resourceName: item.resourceName || item.resourceType,
        userName: item.userName || 'Unknown',
        status: item.status || 'UNKNOWN',
        bookingDate: item.bookingDate,
        timeSlot: item.timeSlot || `${item.startTime || 'TBA'} - ${item.endTime || 'TBA'}`,
      })),
  };
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
    { label: 'Total Users', value: stats.totalUsers, Icon: UsersIcon },
    { label: 'Total Notifications', value: stats.totalNotifications, Icon: BellIcon },
    { label: 'Unread Notifications', value: stats.unreadNotifications, Icon: MessageCircleIcon },
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(119, 163, 101); // #77A365
    doc.text('Smart Campus - User Directory', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Registered Users: ${users.length}`, 14, 35);
    
    // Table
    const tableHeaders = [['Name', 'Email', 'Role', 'Joined Date']];
    const tableData = users.map(u => [
      u.name,
      u.email,
      u.role,
      new Date(u.createdAt).toLocaleDateString()
    ]);
    
    autoTable(doc, {
      startY: 45,
      head: tableHeaders,
      body: tableData,
      headStyles: { fillColor: [119, 163, 101], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 45 },
      theme: 'striped'
    });
    
    doc.save(`smart-campus-users-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) return <p className="loading-text">Loading users...</p>;

  return (
    <div className="users-tab">
      <div className="tab-header-actions">
        <h3>User Management</h3>
        <button className="download-btn" onClick={handleDownloadPDF}>
          <DownloadIcon size={16} /> Export Users PDF
        </button>
      </div>
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
    BOOKING_APPROVED: { label: 'Approved', Icon: CheckCircleIcon, color: '#16a34a' },
    BOOKING_REJECTED: { label: 'Rejected', Icon: XCircleIcon, color: '#dc2626' },
    TICKET_STATUS_CHANGED: { label: 'Ticket Update', Icon: RefreshIcon, color: '#d97706' },
    NEW_COMMENT: { label: 'Comment', Icon: MessageCircleIcon, color: '#4361ee' },
    NEW_BOOKING_REQUEST: { label: 'New Booking', Icon: CalendarIcon, color: '#3b82f6' },
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
/* ─── Bookings Tab ─── */
const BookingsTab = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(null);

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

  const handleStatus = async (id, status, rejReason = '') => {
    setProcessing(id);
    try {
      await updateBookingStatus(id, status, rejReason);
      fetchBookings();
      setRejectingId(null);
      setReason('');
    } catch (err) {
      alert('Failed to update booking status');
    } finally {
      setProcessing(null);
    }
  };

  const STATUS_STYLES = {
    PENDING: { bg: '#fef3c7', color: '#d97706' },
    APPROVED: { bg: '#dcfce7', color: '#16a34a' },
    REJECTED: { bg: '#fee2e2', color: '#dc2626' },
    CANCELLED: { bg: '#f1f5f9', color: '#64748b' },
  };

  const filtered = filter === 'ALL'
    ? bookings
    : bookings.filter(b => b.status === filter);

  if (loading) return <p className="loading-text">Loading bookings...</p>;

  return (
    <div className="bookings-tab">

      {/* Filter buttons */}
      <div className="booking-filters">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
            {f === 'PENDING' && bookings.filter(b => b.status === 'PENDING').length > 0 && (
              <span className="filter-badge">
                {bookings.filter(b => b.status === 'PENDING').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-box">
          <CalendarIcon size={30} color="#94a3b8" />
          <p>No bookings found</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>User</th>
                <th>Resource</th>
                <th>Date</th>
                <th>Time</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const s = STATUS_STYLES[b.status] || STATUS_STYLES.PENDING;
                return (
                  <>
                    <tr key={b.id}>
                      <td>
                        <span className="ref-chip">
                          {b.referenceId || 'N/A'}
                        </span>
                      </td>
                      <td>{b.userName || b.userId}</td>
                      <td>{b.resourceType}</td>
                      <td>{b.bookingDate}</td>
                      <td>{b.timeSlot}</td>
                      <td>{b.purpose}</td>
                      <td>
                        <span
                          className="status-chip"
                          style={{ background: s.bg, color: s.color }}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td>
                        {b.status === 'PENDING' && (
                          <div className="action-btns">
                            {/* Approve button */}
                            <button
                              className="approve-btn"
                              disabled={processing === b.id}
                              onClick={() => handleStatus(b.id, 'APPROVED')}
                            >
                              <CheckIcon size={12} /> Approve
                            </button>
                            {/* Reject button */}
                            <button
                              className="reject-btn"
                              disabled={processing === b.id}
                              onClick={() => setRejectingId(b.id)}
                            >
                              <XIcon size={12} /> Reject
                            </button>
                          </div>
                        )}
                        {b.status !== 'PENDING' && (
                          <span className="no-action">—</span>
                        )}
                      </td>
                    </tr>

                    {/* Reject reason row */}
                    {rejectingId === b.id && (
                      <tr key={`${b.id}-reject`} className="reject-reason-row">
                        <td colSpan={8}>
                          <div className="reject-reason-box">
                            <input
                              type="text"
                              placeholder="Enter rejection reason..."
                              value={reason}
                              onChange={e => setReason(e.target.value)}
                            />
                            <button
                              className="confirm-reject-btn"
                              disabled={!reason.trim() || processing === b.id}
                              onClick={() => handleStatus(b.id, 'REJECTED', reason)}
                            >
                              Confirm Reject
                            </button>
                            <button
                              className="cancel-reject-btn"
                              onClick={() => { setRejectingId(null); setReason(''); }}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
/* ─── Resources Tab (Facilities Catalogue Management) ─── */
const ResourcesTab = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '', name: '', type: 'LECTURE_HALL', capacity: 0,
    location: '', building: '', floor: '', status: 'ACTIVE',
    description: '', bookable: true, amenities: '', imageUrl: ''
  });

  const fetchResources = useCallback(async () => {
    try {
      const res = await getAllResources();
      setResources(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ code: '', name: '', type: 'LECTURE_HALL', capacity: 0, location: '', building: '', floor: '', status: 'ACTIVE', description: '', bookable: true, amenities: '', imageUrl: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (res) => {
    setEditingId(res.id);
    setFormData({
      ...res,
      amenities: res.amenities ? res.amenities.join(', ') : '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await deleteResource(id);
        fetchResources();
      } catch (err) { alert('Failed to delete resource'); }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    if (!allowedTypes.includes(file.type)) {
      alert(`❌ Unsupported file type: "${file.type || 'unknown'}". Please upload a JPG, PNG, GIF, or WebP image.`);
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('❌ Image size must be less than 10MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result }));
    };
    reader.onerror = () => {
      alert('❌ Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const onTypeChange = (type) => {
    let capacity = formData.capacity;
    if (type === 'LECTURE_HALL') capacity = 120;
    else if (type === 'AUDITORIUM') capacity = 300;
    setFormData({ ...formData, type, capacity });
  };

  const onBuildingChange = (building) => {
    setFormData({ ...formData, building });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      capacity: parseInt(formData.capacity, 10) || 0,
      amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()).filter(a => a) : [],
    };

    try {
      if (editingId) {
        await updateResource(editingId, payload);
      } else {
        await createResource(payload);
      }
      setShowModal(false);
      fetchResources();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 413) {
        alert('❌ Image too large! Please use an image smaller than 10MB.');
      } else if (status === 400) {
        alert(`❌ Validation Error: ${err?.response?.data?.message || 'Please check all required fields.'}`);
      } else {
        alert(`❌ Failed to save resource: ${err?.response?.data?.error || err.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <div className="resources-admin-tab">
      <div className="tab-header-actions">
        <h3>Managed Facilities</h3>
        <button className="add-btn" onClick={handleOpenAdd}>+ Add New Resource</button>
      </div>

      {loading ? <p className="loading-text">Loading resources...</p> : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Type</th>
                <th>Building - Floor</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No resources found</td></tr>
              ) : resources.map(res => (
                <tr key={res.id}>
                  <td><strong>{res.code}</strong></td>
                  <td>{res.name}</td>
                  <td>{res.type.replaceAll('_', ' ')}</td>
                  <td>{res.building} - {res.floor}</td>
                  <td>{res.capacity > 0 ? res.capacity : 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${res.status.toLowerCase().replace('_', '-')}`}>{res.status.replaceAll('_', ' ')}</span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => handleOpenEdit(res)}>Edit</button>
                      <button className="reject-btn" onClick={() => handleDelete(res.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>{editingId ? 'Edit Resource' : 'Add New Resource'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Code (e.g. LH-001) *</label>
                  <input required placeholder="Code" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Name *</label>
                  <input required placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                 <div className="form-group">
                  <label>Type *</label>
                  <select value={formData.type} onChange={e => onTypeChange(e.target.value)}>
                    <option value="LECTURE_HALL">Lecture Hall</option>
                    <option value="AUDITORIUM">Auditorium</option>
                    <option value="LAB">Lab</option>
                    <option value="MEETING_ROOM">Meeting Room</option>
                    <option value="PROJECTOR">Projector</option>
                    <option value="CAMERA">Camera</option>
                    <option value="MICROPHONE">Microphone</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Capacity</label>
                  <input type="number" min="0" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Building *</label>
                  <select required value={formData.building} onChange={e => onBuildingChange(e.target.value)}>
                    <option value="">-- Select Building --</option>
                    <option value="New Building">New Building</option>
                    <option value="Main Building">Main Building</option>
                    <option value="Engineering Block">Engineering Block</option>
                    <option value="Science Center">Science Center</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Floor *</label>
                  <select 
                    required 
                    value={formData.floor} 
                    onChange={e => setFormData({ ...formData, floor: e.target.value })}
                  >
                    <option value="">-- Select Floor --</option>
                    {formData.building === 'New Building' && Array.from({ length: 12 }, (_, i) => i + 3).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                    {formData.building === 'Main Building' && Array.from({ length: 3 }, (_, i) => i + 3).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                    {formData.building !== 'New Building' && formData.building !== 'Main Building' && Array.from({ length: 10 }, (_, i) => i + 1).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Room/Specific Location *</label>
                  <input required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="form-group full-width">
                  <label>Amenities (Comma separated)</label>
                  <input placeholder="Projector, Whiteboard, A/C" value={formData.amenities} onChange={e => setFormData({ ...formData, amenities: e.target.value })} />
                </div>
                <div className="form-group full-width">
                  <label>Resource Image (Max 10MB) *</label>
                  <div className="custom-file-upload">
                    <input 
                      id="resource-image-upload"
                      type="file" 
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="resource-image-upload" className="file-upload-btn">
                      <UploadIcon size={18} />
                      <span className="file-upload-text">
                        {formData.imageUrl ? 'Change Image' : 'Select Facility Image'}
                      </span>
                    </label>
                    
                    {formData.imageUrl && (
                      <div className="image-preview-wrapper">
                        <img src={formData.imageUrl} alt="Preview" className="glass-preview" />
                        <button type="button" className="remove-img-btn" onClick={() => setFormData({...formData, imageUrl: ''})}>×</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group full-width">
                  <label className="toggle-label">
                    <input type="checkbox" checked={formData.bookable} onChange={e => setFormData({ ...formData, bookable: e.target.checked })} />
                    <span>Is this resource bookable by students?</span>
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">Save Resource</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
