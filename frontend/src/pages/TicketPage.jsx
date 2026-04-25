import { useState, useEffect, useCallback } from 'react';
import { createTicket, getMyTickets } from '../services/api';
import { TagIcon, CheckCircleIcon, XCircleIcon, RefreshIcon, UserIcon, ImageIcon, ChevronDownIcon, ChevronUpIcon, UploadIcon, XIcon } from '../components/Icons';
import TicketTimeline from '../components/TicketTimeline';
import { toast } from 'react-toastify';
import './TicketPage.css';

const CATEGORIES = ['Network', 'Equipment', 'Facility', 'Academic Support', 'Other'];

const STATUS_STYLES = {
  OPEN:        { bg: '#dbeafe', color: '#1d4ed8' },
  IN_PROGRESS: { bg: '#fef3c7', color: '#d97706' },
  RESOLVED:    { bg: '#dcfce7', color: '#16a34a' },
  CLOSED:      { bg: '#f1f5f9', color: '#64748b' },
  REJECTED:    { bg: '#fee2e2', color: '#dc2626' },
};

const PRIORITY_COLORS = {
  LOW: '#64748b',
  MEDIUM: '#1d4ed8',
  HIGH: '#d97706',
  URGENT: '#dc2626',
};

const StatusIcon = ({ status }) => {
  if (status === 'RESOLVED') return <CheckCircleIcon size={13} color="#16a34a" />;
  if (status === 'CLOSED') return <XCircleIcon size={13} color="#64748b" />;
  if (status === 'REJECTED') return <XCircleIcon size={13} color="#dc2626" />;
  if (status === 'IN_PROGRESS') return <RefreshIcon size={13} color="#d97706" />;
  return <TagIcon size={13} color="#1d4ed8" />;
};

const TicketPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category: 'Network', title: '', description: '', priority: 'MEDIUM', contactDetails: '' });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [errors, setErrors] = useState({});

  const fetchTickets = useCallback(async () => {
    try {
      const res = await getMyTickets();
      setTickets(res.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check total count
    if (images.length + files.length > 3) {
      toast.warning('You can only upload up to 3 images.');
      return;
    }

    const validFiles = [];
    for (const file of files) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" is not an image file.`);
        continue;
      }
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" is too large. Max size is 5MB.`);
        continue;
      }
      validFiles.push(file);
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImages(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));

  const validateForm = () => {
    const newErrors = {};
    if (form.title.trim().length < 5) newErrors.title = 'Title must be at least 5 characters.';
    if (form.description.trim().length < 20) newErrors.description = 'Please provide a more detailed description (min 20 chars).';
    
    const contact = form.contactDetails.trim();
    if (contact) {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
      const isPhone = /^\+?[\d\s-]{10,}$/.test(contact);
      if (!isEmail && !isPhone) newErrors.contactDetails = 'Please enter a valid email or phone number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      await createTicket({ ...form, attachments: images });
      toast.success('Ticket raised successfully!');
      setResult({ ok: true, msg: 'Ticket raised successfully.' });
      setForm({ category: 'Network', title: '', description: '', priority: 'MEDIUM', contactDetails: '' });
      setImages([]);
      setErrors({});
      fetchTickets();
    } catch {
      toast.error('Failed to raise ticket.');
      setResult({ ok: false, msg: 'Failed to raise ticket.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ticket-page">
      <div className="tp-header">
        <div className="tp-header-icon"><TagIcon size={22} color="#77A365" /></div>
        <div>
          <h2>Ticket Raising</h2>
          <p>Report issues and track support requests in real time</p>
        </div>
      </div>

      <div className="tp-grid">
        <div className="tp-form-card">
          <h3>New Support Ticket</h3>
          <form onSubmit={handleSubmit} className="tp-form">
            <div className="tp-field-row">
              <div className="tp-field">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="tp-field">
                <label>Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
            <div className="tp-field">
              <label>Title</label>
              <input 
                type="text" 
                placeholder="Issue title" 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
                className={errors.title ? 'field-error' : ''}
                required 
              />
              {errors.title && <span className="error-msg">{errors.title}</span>}
            </div>
            <div className="tp-field">
              <label>Description</label>
              <textarea 
                rows={3} 
                placeholder="Detailed description..." 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                className={errors.description ? 'field-error' : ''}
              />
              {errors.description && <span className="error-msg">{errors.description}</span>}
            </div>
            <div className="tp-field">
              <label>Contact Details</label>
              <input 
                type="text" 
                placeholder="Phone/Email" 
                value={form.contactDetails} 
                onChange={(e) => setForm({ ...form, contactDetails: e.target.value })} 
                className={errors.contactDetails ? 'field-error' : ''}
              />
              {errors.contactDetails && <span className="error-msg">{errors.contactDetails}</span>}
            </div>
            <div className="tp-field">
              <label>Attachments (Max 3)</label>
              <div className="tp-attachment-container">
                <label className={`tp-upload-zone ${images.length >= 3 ? 'disabled' : ''}`}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleFileChange} 
                    disabled={images.length >= 3} 
                    hidden 
                  />
                  <div className="tp-upload-content">
                    <UploadIcon size={24} color={images.length >= 3 ? '#94a3b8' : '#77A365'} />
                    <span>{images.length >= 3 ? 'Maximum reached' : 'Click to upload images'}</span>
                  </div>
                </label>
                
                {images.length > 0 && (
                  <div className="tp-images-preview">
                    {images.map((img, i) => (
                      <div key={i} className="tp-img-preview">
                        <img src={img} alt="preview" />
                        <button type="button" className="tp-remove-img" onClick={() => removeImage(i)}>
                          <XIcon size={12} color="white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {result && <p className={`tp-result ${result.ok ? 'tp-ok' : 'tp-err'}`}>{result.msg}</p>}
            <button type="submit" className="tp-submit-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>
        </div>

        <div className="tp-history">
          <h3>Support History</h3>
          {loading ? (
            <p className="tp-loading">Loading...</p>
          ) : (
            <div className="tp-list">
              {tickets.length === 0 ? <p className="tp-empty">No tickets yet.</p> : tickets.map((t) => {
                const s = STATUS_STYLES[t.status] || STATUS_STYLES.OPEN;
                const isExpanded = expandedId === t.id;
                return (
                  <div key={t.id} className={`tp-item ${isExpanded ? 'active' : ''}`}>
                    <div className="tp-item-main" onClick={() => setExpandedId(isExpanded ? null : t.id)}>
                      <div className="tp-item-left">
                        <div className="tp-item-title-row">
                          <span className="tp-item-reference">{t.referenceId}</span>
                          <span className="tp-priority-dot" style={{ background: PRIORITY_COLORS[t.priority] }} title={`Priority: ${t.priority}`} />
                          <span className="tp-item-title">{t.title}</span>
                        </div>
                        <div className="tp-item-meta">
                          <span className="tp-status-badge" style={{ background: s.bg, color: s.color }}>
                            <StatusIcon status={t.status} /> {t.status?.replace('_', ' ')}
                          </span>
                          <span className="tp-meta-sep">•</span>
                          <span className="tp-item-date">{new Date(t.createdAt).toLocaleDateString()}</span>
                          {t.attachments?.length > 0 && (
                            <>
                              <span className="tp-meta-sep">•</span>
                              <span className="tp-item-attachment-count">
                                <ImageIcon size={12} color="#64748b" /> {t.attachments.length}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="tp-item-right">
                        <button className="tp-expand-btn">
                          <span>{isExpanded ? 'Hide Details' : 'View History'}</span>
                          {isExpanded ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="tp-item-details">
                        <div className="tp-details-grid">
                          <div className="tp-details-info">
                            <h4>Description</h4>
                            <p>{t.description || "No description provided."}</p>
                            
                            {t.attachments?.length > 0 && (
                              <div className="tp-details-attachments">
                                <h4>Attachments</h4>
                                <div className="tp-attachments-list">
                                  {t.attachments.map((img, i) => (
                                    <img key={i} src={img} alt="attachment" onClick={() => window.open(img)} />
                                  ))}
                                </div>
                              </div>
                            )}

                            <h4>Communication</h4>
                            <div className="tp-mini-comments">
                              {t.comments?.length > 0 ? t.comments.map((c, i) => (
                                <div key={i} className="tp-mini-comment">
                                  <strong>{c.authorName}:</strong> {c.text}
                                </div>
                              )) : <p className="tp-no-comments">No updates yet.</p>}
                            </div>
                          </div>
                          
                          <div className="tp-details-timeline">
                            <h4>Workflow & SLA</h4>
                            <TicketTimeline 
                              history={t.history} 
                              createdAt={t.createdAt} 
                              resolvedAt={t.resolvedAt} 
                            />
                            {t.technicianName && (
                              <div className="tp-tech-assigned">
                                <UserIcon size={14} color="#1d4ed8" />
                                <span>Assigned to Technican: <strong>{t.technicianName}</strong></span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
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
