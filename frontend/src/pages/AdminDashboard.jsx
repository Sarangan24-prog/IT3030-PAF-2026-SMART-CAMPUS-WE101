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
  PinIcon,
  DownloadIcon,
} from '../components/Icons';
import './AdminDashboard.css';
//booking added 
const TABS = [
  { key: 'overview', label: 'Overview', Icon: BarChartIcon },
  { key: 'bookings', label: 'Bookings', Icon: CalendarIcon },
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
        {activeTab === 'resources' && <ResourcesTab />}
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
      alert('Failed to save resource. Please check the data.');
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
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                    <option value="LECTURE_HALL">Lecture Hall</option>
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
                  <input required value={formData.building} onChange={e => setFormData({ ...formData, building: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Floor *</label>
                  <input required value={formData.floor} onChange={e => setFormData({ ...formData, floor: e.target.value })} />
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
                  <label>Image URL (Optional)</label>
                  <input placeholder="https://..." value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
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
