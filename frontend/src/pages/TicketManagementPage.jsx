import React, { useState, useEffect, useCallback } from 'react';
import { getAllTickets, assignTechnician, resolveTicket, addTicketComment } from '../services/api';
import { TagIcon, UserIcon, RefreshIcon, SearchIcon, ClockIcon, BellIcon, ImageIcon } from '../components/Icons';
import { useLocation } from 'react-router-dom';
import TicketTimeline from '../components/TicketTimeline';
import { toast } from 'react-toastify';
import './TicketManagementPage.css';

const TicketManagementPage = () => {
  const location = useLocation();
  const currentView = new URLSearchParams(location.search).get('view') || 'overview';
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: 'ALL', priority: 'ALL', search: '' });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [assignForm, setAssignForm] = useState({ technicianName: '', contactDetails: '' });
  const [resolveForm, setResolveForm] = useState({ resolutionNotes: '', resolutionType: 'Fixed' });

  const formatDuration = (start, end) => {
    if (!start) return "--";
    const s = new Date(start);
    const e = end ? new Date(end) : new Date();
    const diff = Math.max(0, e - s);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    return `${mins}m`;
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length
  };

  const fetchTickets = useCallback(async () => {
    try {
      const res = await getAllTickets();
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const filteredTickets = tickets.filter(t => {
    // Tab filtering: Inbox only shows OPEN tickets
    if (currentView === 'inbox' && t.status !== 'OPEN') return false;
    
    if (filter.status !== 'ALL' && t.status !== filter.status) return false;
    if (filter.priority !== 'ALL' && t.priority !== filter.priority) return false;
    if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase()) && !t.referenceId.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignForm.technicianName.trim()) {
      toast.error('Please provide a technician name.');
      return;
    }
    try {
      await assignTechnician(selectedTicket.id, assignForm);
      toast.success('Technician assigned successfully!');
      fetchTickets();
      setSelectedTicket(null);
    } catch (err) {
      toast.error('Assignment failed. Please try again.');
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (resolveForm.resolutionNotes.trim().length < 10) {
      toast.error('Please provide detailed resolution notes (min 10 chars).');
      return;
    }
    try {
      await resolveTicket(selectedTicket.id, resolveForm);
      toast.success('Ticket resolved successfully!');
      fetchTickets();
      setSelectedTicket(null);
    } catch (err) {
      toast.error('Resolution failed. Please try again.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await addTicketComment(selectedTicket.id, commentText);
      setSelectedTicket(res.data);
      setCommentText('');
      toast.success('Comment added.');
      fetchTickets();
    } catch (err) {
      toast.error('Failed to add comment.');
    }
  };

  return (
    <div className="manage-page">
      <div className="manage-header">
        <div className="manage-title">
          <div className="manage-icon">
            {currentView === 'inbox' ? <BellIcon size={24} color="#77A365" /> : <RefreshIcon size={24} color="#77A365" />}
          </div>
          <h2>{currentView === 'inbox' ? 'Ticket Inbox' : 'Ticket Management Dashboard'}</h2>
        </div>

        <div className="manage-stats">
          <div className="stat-card" onClick={() => setFilter({ ...filter, status: 'ALL' })}>
            <label>Total</label>
            <strong>{stats.total}</strong>
          </div>
          <div className="stat-card" onClick={() => setFilter({ ...filter, status: 'OPEN' })}>
            <label>Open</label>
            <strong className="text-open">{stats.open}</strong>
          </div>
          <div className="stat-card" onClick={() => setFilter({ ...filter, status: 'IN_PROGRESS' })}>
            <label>In Progress</label>
            <strong className="text-progress">{stats.inProgress}</strong>
          </div>
          <div className="stat-card" onClick={() => setFilter({ ...filter, status: 'RESOLVED' })}>
            <label>Resolved</label>
            <strong className="text-resolved">{stats.resolved}</strong>
          </div>
        </div>
        
        <div className="manage-filters">
          <div className="filter-group">
            <SearchIcon size={16} color="#64748b" />
            <input 
              type="text" 
              placeholder="Search ID or Title..." 
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
          </div>
          <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select value={filter.priority} onChange={(e) => setFilter({ ...filter, priority: e.target.value })}>
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      <div className="manage-content">
        <div className="manage-list-panel">
          {loading ? <p>Loading tickets...</p> : (
            <div className="manage-list">
              {filteredTickets.map(t => (
                <div 
                  key={t.id} 
                  className={`manage-item ${selectedTicket?.id === t.id ? 'active' : ''}`}
                  onClick={() => setSelectedTicket(t)}
                >
                  <div className="manage-item-info">
                    <span className="manage-item-ref">{t.referenceId}</span>
                    <span className="manage-item-title">{t.title}</span>
                    <div className="manage-item-meta">
                      <span className={`status-dot status-${t.status}`} />
                      <span>{t.status.replace('_', ' ')}</span>
                      <span className="dot">•</span>
                      <span className={`priority-text priority-${t.priority}`}>{t.priority}</span>
                      {t.status === 'OPEN' && (
                        <>
                          <span className="dot">•</span>
                          <span className="sla-timer" title="Time since creation">
                            {formatDuration(t.createdAt)}
                          </span>
                        </>
                      )}
                      {t.status === 'IN_PROGRESS' && t.firstResponseAt && (
                        <>
                          <span className="dot">•</span>
                          <span className="sla-timer" title="Time in progress">
                            {formatDuration(t.firstResponseAt)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <ClockIcon size={14} color="#94a3b8" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="manage-detail-panel">
          {selectedTicket ? (
            <div className="ticket-detail">
              <div className="detail-header">
                <h3>{selectedTicket.title}</h3>
                <span className="detail-ref">{selectedTicket.referenceId}</span>
              </div>

              <div className="detail-tabs">
                <div className="detail-main-info">
                  <div className="detail-section">
                    <div className="section-header">
                      <TagIcon size={18} color="#77A365" />
                      <h4>Incident Ticket Details</h4>
                    </div>
                    <p className="detail-desc">{selectedTicket.description}</p>
                    <div className="detail-meta-grid">
                      <div className="meta-item">
                        <label>Category</label>
                        <span>{selectedTicket.category}</span>
                      </div>
                      <div className="meta-item">
                        <label>Priority</label>
                        <span className={`priority-tag priority-${selectedTicket.priority}`}>{selectedTicket.priority}</span>
                      </div>
                      <div className="meta-item">
                        <label>Reported By</label>
                        <span>{selectedTicket.userName}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedTicket.attachments?.length > 0 && (
                    <div className="detail-section">
                      <div className="section-header">
                        <ImageIcon size={18} color="#77A365" />
                        <h4>Attachments</h4>
                      </div>
                      <div className="attachment-previews">
                        {selectedTicket.attachments.map((img, i) => (
                          <div key={i} className="attachment-card" onClick={() => window.open(img)}>
                            <img src={img} alt="attachment" />
                            <div className="attachment-overlay">View Image</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <hr />
                  
                  <div className="detail-actions">
                    {selectedTicket.status === 'OPEN' && (
                      <div className="action-card assign-card">
                        <div className="section-header">
                          <UserIcon size={18} color="#77A365" />
                          <h4>Assign Technician</h4>
                        </div>
                        <form onSubmit={handleAssign} className="assign-form">
                          <div className="input-group">
                            <UserIcon size={14} color="#94a3b8" />
                            <input 
                              placeholder="Technician Name" 
                              required 
                              value={assignForm.technicianName}
                              onChange={(e) => setAssignForm({ ...assignForm, technicianName: e.target.value })}
                            />
                          </div>
                          <div className="input-group">
                            <BellIcon size={14} color="#94a3b8" />
                            <input 
                              placeholder="Contact Details (Email/Phone)" 
                              value={assignForm.contactDetails}
                              onChange={(e) => setAssignForm({ ...assignForm, contactDetails: e.target.value })}
                            />
                          </div>
                          <button type="submit" className="btn-primary">
                            <span>Assign & Start Work</span>
                            <RefreshIcon size={16} />
                          </button>
                        </form>
                      </div>
                    )}

                    {selectedTicket.status === 'IN_PROGRESS' && (
                      <div className="action-card resolve-card">
                        <h4>Resolve Ticket</h4>
                        <form onSubmit={handleResolve}>
                          <select 
                            value={resolveForm.resolutionType}
                            onChange={(e) => setResolveForm({ ...resolveForm, resolutionType: e.target.value })}
                          >
                            <option>Fixed</option>
                            <option>Workaround</option>
                            <option>Duplicate</option>
                            <option>By Design</option>
                          </select>
                          <textarea 
                            placeholder="Resolution notes..." 
                            required
                            value={resolveForm.resolutionNotes}
                            onChange={(e) => setResolveForm({ ...resolveForm, resolutionNotes: e.target.value })}
                          />
                          <button type="submit">Mark as Resolved</button>
                        </form>
                      </div>
                    )}
                  </div>

                  <div className="detail-comments">
                    <div className="section-header">
                      <BellIcon size={18} color="#77A365" />
                      <h4>Communication Log</h4>
                    </div>
                    <div className="comments-list">
                      {selectedTicket.comments?.length > 0 ? (
                        selectedTicket.comments.map((c, i) => (
                          <div key={i} className="comment-bubble">
                            <div className="comment-meta">
                              <div className="author-info">
                                <div className="author-avatar">{c.authorName.charAt(0).toUpperCase()}</div>
                                <strong>{c.authorName}</strong>
                              </div>
                              <span>{new Date(c.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="comment-body">
                              <p>{c.text}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-comments">No updates yet. Start the conversation!</div>
                      )}
                    </div>
                    <form onSubmit={handleAddComment} className="comment-form">
                      <div className="comment-input-wrapper">
                        <input 
                          placeholder="Type an update or message..." 
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button type="submit" className="btn-send" disabled={!commentText.trim()}>
                          <RefreshIcon size={18} />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="detail-sidebar">
                  <div className="section-header">
                    <ClockIcon size={18} color="#77A365" />
                    <h4>Technician Updates</h4>
                  </div>
                  <TicketTimeline 
                    history={selectedTicket.history} 
                    createdAt={selectedTicket.createdAt} 
                    resolvedAt={selectedTicket.resolvedAt} 
                  />
                  {selectedTicket.technicianName && (
                    <div className="tech-info">
                      <UserIcon size={16} color="#77A365" />
                      <div>
                        <p>Assigned Technician</p>
                        <strong>{selectedTicket.technicianName}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="detail-placeholder">
              <TagIcon size={48} color="#e2e8f0" />
              <p>Select a ticket to view details and manage workflow</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketManagementPage;
