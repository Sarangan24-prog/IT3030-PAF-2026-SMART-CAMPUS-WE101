import React, { useState, useEffect, useCallback } from 'react';
import { getAllTickets, assignTechnician, resolveTicket, addTicketComment, updateTicketStatus } from '../services/api';
import { TagIcon, UserIcon, CheckCircleIcon, RefreshIcon, MessageCircleIcon, SearchIcon, ClockIcon } from '../components/Icons';
import TicketTimeline from '../components/TicketTimeline';
import './TicketManagementPage.css';

const TicketManagementPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: 'ALL', priority: 'ALL', search: '' });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [assignForm, setAssignForm] = useState({ technicianName: '', contactDetails: '' });
  const [resolveForm, setResolveForm] = useState({ resolutionNotes: '', resolutionType: 'Fixed' });

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
    if (filter.status !== 'ALL' && t.status !== filter.status) return false;
    if (filter.priority !== 'ALL' && t.priority !== filter.priority) return false;
    if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase()) && !t.referenceId.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await assignTechnician(selectedTicket.id, assignForm);
      alert('Technician assigned.');
      fetchTickets();
      setSelectedTicket(null);
    } catch (err) {
      alert('Assignment failed.');
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    try {
      await resolveTicket(selectedTicket.id, resolveForm);
      alert('Ticket resolved.');
      fetchTickets();
      setSelectedTicket(null);
    } catch (err) {
      alert('Resolution failed.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await addTicketComment(selectedTicket.id, commentText);
      setSelectedTicket(res.data);
      setCommentText('');
      fetchTickets();
    } catch (err) {
      alert('Failed to add comment.');
    }
  };

  return (
    <div className="manage-page">
      <div className="manage-header">
        <div className="manage-title">
          <div className="manage-icon"><RefreshIcon size={24} color="#77A365" /></div>
          <h2>Ticket Management Dashboard</h2>
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
                  <p className="detail-desc">{selectedTicket.description}</p>
                  
                  {selectedTicket.attachments?.length > 0 && (
                    <div className="detail-attachments">
                      <label>Attachments</label>
                      <div className="attachment-previews">
                        {selectedTicket.attachments.map((img, i) => (
                          <img key={i} src={img} alt="attachment" onClick={() => window.open(img)} />
                        ))}
                      </div>
                    </div>
                  )}

                  <hr />
                  
                  <div className="detail-actions">
                    {selectedTicket.status === 'OPEN' && (
                      <div className="action-card">
                        <h4>Assign Technician</h4>
                        <form onSubmit={handleAssign}>
                          <input 
                            placeholder="Technician Name" 
                            required 
                            value={assignForm.technicianName}
                            onChange={(e) => setAssignForm({ ...assignForm, technicianName: e.target.value })}
                          />
                          <input 
                            placeholder="Contact Details" 
                            value={assignForm.contactDetails}
                            onChange={(e) => setAssignForm({ ...assignForm, contactDetails: e.target.value })}
                          />
                          <button type="submit">Assign & Start</button>
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
                    <h4>Communication Log</h4>
                    <div className="comments-list">
                      {selectedTicket.comments?.map((c, i) => (
                        <div key={i} className="comment-bubble">
                          <div className="comment-meta">
                            <strong>{c.authorName}</strong>
                            <span>{new Date(c.createdAt).toLocaleString()}</span>
                          </div>
                          <p>{c.text}</p>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleAddComment} className="comment-form">
                      <input 
                        placeholder="Add a comment or update..." 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                      <button type="submit">Send</button>
                    </form>
                  </div>
                </div>

                <div className="detail-sidebar">
                  <h4>Workflow Timeline</h4>
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
