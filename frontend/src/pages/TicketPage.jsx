import { useState, useEffect, useCallback } from 'react';
import { createTicket, getMyTickets } from '../services/api';
import { TagIcon, CheckCircleIcon, XCircleIcon, RefreshIcon, MessageCircleIcon } from '../components/Icons';
import './TicketPage.css';

const CATEGORIES = [
  'Network',
  'Equipment',
  'Facility',
  'Academic Support',
  'Other',
];

const STATUS_STYLES = {
  OPEN:        { bg: '#dbeafe', color: '#1d4ed8' },
  IN_PROGRESS: { bg: '#fef3c7', color: '#d97706' },
  RESOLVED:    { bg: '#dcfce7', color: '#16a34a' },
  CLOSED:      { bg: '#f1f5f9', color: '#64748b' },
};

const StatusIcon = ({ status }) => {
  if (status === 'RESOLVED') return <CheckCircleIcon size={13} color="#16a34a" />;
  if (status === 'CLOSED')   return <XCircleIcon size={13} color="#64748b" />;
  if (status === 'IN_PROGRESS') return <RefreshIcon size={13} color="#d97706" />;
  return <TagIcon size={13} color="#1d4ed8" />;
};

const TicketPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category: 'Network', title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await getMyTickets();
      setTickets(res.data);
    } catch {
      // silently fail — user sees empty list
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    setResult(null);
    try {
      await createTicket({
        title: form.title,
        description: form.description,
        category: form.category,
      });
      setResult({ ok: true, msg: 'Ticket raised successfully.' });
      setForm({ category: 'Network', title: '', description: '' });
      fetchTickets();
    } catch {
      setResult({ ok: false, msg: 'Failed to raise ticket. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ticket-page">
      <div className="tp-header">
        <div className="tp-header-icon">
          <TagIcon size={22} color="#77A365" />
        </div>
        <div>
          <h2>Ticket Raising</h2>
          <p>Report issues and track support requests in real time</p>
        </div>
      </div>

      <div className="tp-grid">
        {/* ── Form ── */}
        <div className="tp-form-card">
          <h3>New Support Ticket</h3>
          <form onSubmit={handleSubmit} className="tp-form">
            <div className="tp-field">
              <label htmlFor="tp-cat">Category</label>
              <select
                id="tp-cat"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="tp-field">
              <label htmlFor="tp-title">Title</label>
              <input
                id="tp-title"
                type="text"
                placeholder="e.g. Projector not working in Lab 3"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="tp-field">
              <label htmlFor="tp-desc">Description</label>
              <textarea
                id="tp-desc"
                rows={4}
                placeholder="Describe the issue in detail — location, time, impact..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            {result && (
              <p className={`tp-result ${result.ok ? 'tp-ok' : 'tp-err'}`}>
                {result.ok
                  ? <CheckCircleIcon size={14} color="#16a34a" />
                  : <XCircleIcon size={14} color="#dc2626" />
                }
                {result.msg}
              </p>
            )}
            <button type="submit" className="tp-submit-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>
        </div>

        {/* ── History ── */}
        <div className="tp-history">
          <h3>My Tickets</h3>
          {loading ? (
            <p className="tp-loading">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <div className="tp-empty">
              <div className="tp-empty-icon">
                <TagIcon size={26} color="#94a3b8" />
              </div>
              <p>No tickets yet</p>
              <span>Your support tickets will appear here</span>
            </div>
          ) : (
            <div className="tp-list">
              {tickets.map((t) => {
                const s = STATUS_STYLES[t.status] || STATUS_STYLES.OPEN;
                return (
                  <div key={t.id} className="tp-item">
                    <div className="tp-item-header">
                      <span className="tp-item-title">{t.title}</span>
                      <span className="tp-status-badge" style={{ background: s.bg, color: s.color }}>
                        <StatusIcon status={t.status} />
                        {t.status?.replace('_', ' ')}
                      </span>
                    </div>
                    {t.description && <p className="tp-item-desc">{t.description}</p>}
                    {t.comments?.length > 0 && (
                      <div className="tp-comments">
                        <span className="tp-comments-label">
                          <MessageCircleIcon size={12} color="#64748b" />
                          {t.comments.length} comment{t.comments.length !== 1 ? 's' : ''}
                        </span>
                        {t.comments.slice(-2).map((c, i) => (
                          <div key={i} className="tp-comment">
                            <span>{c.text}</span>
                            <span className="tp-comment-time">
                              {new Date(c.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric',
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="tp-item-date">
                      {new Date(t.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
