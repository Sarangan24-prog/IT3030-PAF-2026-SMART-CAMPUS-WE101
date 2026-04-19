import { useState, useEffect, useCallback } from 'react';
import { createBooking, getMyBookings, cancelBooking } from '../services/api';
import {
  CalendarIcon, CheckCircleIcon, XCircleIcon, RefreshIcon,
  BuildingIcon, UsersIcon, MapPinIcon, SettingsIcon,
  MessageCircleIcon, TagIcon, ChevronRightIcon, CheckIcon,
} from '../components/Icons';
import './BookingPage.css';

const RESOURCES = [
  { type: 'Lecture Hall',    icon: 'building', color: '#3b82f6' },
  { type: 'Laboratory',      icon: 'settings', color: '#8b5cf6' },
  { type: 'Sports Facility', icon: 'mappin',   color: '#f59e0b' },
  { type: 'Auditorium',      icon: 'users',    color: '#ec4899' },
  { type: 'Meeting Room',    icon: 'message',  color: '#10b981' },
  { type: 'Equipment',       icon: 'tag',      color: '#f97316' },
];

const TIME_SLOTS = [
  { label: '08:00 – 10:00', start: '08:00', end: '10:00' },
  { label: '10:00 – 12:00', start: '10:00', end: '12:00' },
  { label: '12:00 – 14:00', start: '12:00', end: '14:00' },
  { label: '14:00 – 16:00', start: '14:00', end: '16:00' },
  { label: '16:00 – 18:00', start: '16:00', end: '18:00' },
  { label: '18:00 – 20:00', start: '18:00', end: '20:00' },
];

const STATUS_STYLES = {
  PENDING:   { bg: '#fef3c7', color: '#d97706' },
  APPROVED:  { bg: '#dcfce7', color: '#16a34a' },
  REJECTED:  { bg: '#fee2e2', color: '#dc2626' },
  CANCELLED: { bg: '#f1f5f9', color: '#64748b' },
};

const ResourceIcon = ({ icon, color, size = 22 }) => {
  if (icon === 'building') return <BuildingIcon size={size} color={color} />;
  if (icon === 'settings') return <SettingsIcon size={size} color={color} />;
  if (icon === 'mappin')   return <MapPinIcon   size={size} color={color} />;
  if (icon === 'users')    return <UsersIcon    size={size} color={color} />;
  if (icon === 'message')  return <MessageCircleIcon size={size} color={color} />;
  return <TagIcon size={size} color={color} />;
};

const StatusIcon = ({ status }) => {
  if (status === 'APPROVED')  return <CheckCircleIcon size={13} color="#16a34a" />;
  if (status === 'REJECTED')  return <XCircleIcon     size={13} color="#dc2626" />;
  if (status === 'CANCELLED') return <XCircleIcon     size={13} color="#64748b" />;
  return <RefreshIcon size={13} color="#d97706" />;
};

const BookingPage = () => {
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [step, setStep]                 = useState(1);
  const [form, setForm]                 = useState({
    resourceType: '', bookingDate: '',
    timeSlot: '', startTime: '', endTime: '',
    title: '', purpose: '', description: '',
    expectedAttendees: '',
  });
  const [submitting, setSubmitting]     = useState(false);
  const [confirmed, setConfirmed]       = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError]               = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      const res = await getMyBookings();
      setBookings(res.data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const canAdvance1 = form.resourceType && form.bookingDate && form.timeSlot;
  const canSubmit   = form.title.trim() && form.purpose.trim();
  const today       = new Date().toISOString().split('T')[0];

  const handleSlotSelect = (slot) => {
    setForm(f => ({
      ...f,
      timeSlot:  slot.label,
      startTime: slot.start,
      endTime:   slot.end,
    }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await createBooking({
        title:             form.title,
        description:       form.description,
        resourceType:      form.resourceType,
        bookingDate:       form.bookingDate,
        timeSlot:          form.timeSlot,
        startTime:         form.startTime,
        endTime:           form.endTime,
        purpose:           form.purpose,
        expectedAttendees: form.expectedAttendees || '0',
      });
      setConfirmed(res.data);
      setStep(3);
      fetchBookings();
    } catch (err) {
      const msg = err.response?.data?.error
        || 'Failed to submit booking. Try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);
      fetchBookings();
    } catch {
      alert('Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const startNew = () => {
    setStep(1);
    setConfirmed(null);
    setError('');
    setForm({
      resourceType: '', bookingDate: '',
      timeSlot: '', startTime: '', endTime: '',
      title: '', purpose: '', description: '',
      expectedAttendees: '',
    });
  };

  return (
    <div className="booking-page">
      <div className="bp-header">
        <div className="bp-header-icon">
          <CalendarIcon size={22} color="#77A365" />
        </div>
        <div>
          <h2>Common Booking</h2>
          <p>Reserve lecture halls, labs, sports facilities and more</p>
        </div>
      </div>

      <div className="bp-grid">
        {/* ── Form ── */}
        <div className="bp-form-card">
          {step < 3 && (
            <div className="bp-steps">
              {[1, 2].map(s => (
                <div key={s} className={`bp-step ${step === s ? 'active' : step > s ? 'done' : ''}`}>
                  <div className="bp-step-dot">
                    {step > s ? <CheckIcon size={10} color="#fff" /> : s}
                  </div>
                  <span>{s === 1 ? 'Select Resource' : 'Details'}</span>
                </div>
              ))}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <>
              <h3>Choose a Resource</h3>
              <div className="bp-resource-grid">
                {RESOURCES.map(r => (
                  <button
                    key={r.type}
                    type="button"
                    className={`bp-resource-card ${form.resourceType === r.type ? 'selected' : ''}`}
                    style={{ '--rc': r.color }}
                    onClick={() => setForm(f => ({ ...f, resourceType: r.type }))}
                  >
                    <div className="bp-rc-icon" style={{ background: `${r.color}22` }}>
                      <ResourceIcon icon={r.icon} color={r.color} size={22} />
                    </div>
                    <span>{r.type}</span>
                  </button>
                ))}
              </div>

              <div className="bp-field bp-field-mt">
                <label>Booking Date</label>
                <input
                  type="date"
                  min={today}
                  value={form.bookingDate}
                  onChange={e => setForm(f => ({ ...f, bookingDate: e.target.value }))}
                />
              </div>

              <div className="bp-field bp-field-mt">
                <label>Time Slot</label>
                <div className="bp-slot-grid">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot.label}
                      type="button"
                      className={`bp-slot ${form.timeSlot === slot.label ? 'selected' : ''}`}
                      onClick={() => handleSlotSelect(slot)}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="bp-next-btn"
                disabled={!canAdvance1}
                onClick={() => setStep(2)}
              >
                Next: Add Details <ChevronRightIcon size={14} color="#fff" />
              </button>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <div className="bp-back-row">
                <button type="button" className="bp-back-btn" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <div className="bp-summary-chip">
                  <span className="bp-chip-res">{form.resourceType}</span>
                  <span className="bp-chip-dot">·</span>
                  <span>{form.bookingDate}</span>
                  <span className="bp-chip-dot">·</span>
                  <span>{form.timeSlot}</span>
                </div>
              </div>

              <h3>Booking Details</h3>

              {/* Error banner */}
              {error && (
                <div className="bp-error-banner">
                  ⚠️ {error}
                </div>
              )}

              <div className="bp-form-fields">
                <div className="bp-field">
                  <label>Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. CS301 Lab Session"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div className="bp-field">
                  <label>Purpose *</label>
                  <input
                    type="text"
                    placeholder="e.g. Group study, Practical exam"
                    value={form.purpose}
                    onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                  />
                </div>
                <div className="bp-field">
                  <label>Expected Attendees</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 25"
                    value={form.expectedAttendees}
                    onChange={e => setForm(f => ({
                      ...f, expectedAttendees: e.target.value
                    }))}
                  />
                </div>
                <div className="bp-field">
                  <label>Additional Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Special requirements..."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>

              <button
                className="bp-next-btn"
                disabled={!canSubmit || submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Submitting...' : 'Submit Booking Request'}
              </button>
            </>
          )}

          {/* Step 3 - Success */}
          {step === 3 && confirmed && (
            <div className="bp-success">
              <div className="bp-success-icon">
                <CheckCircleIcon size={40} color="#77A365" />
              </div>
              <h3>Booking Submitted!</h3>
              <div className="bp-ref-badge">
                {confirmed.referenceId || 'BK-XXXXXX'}
              </div>
              <p className="bp-success-msg">
                Your booking is pending approval. You'll be notified once reviewed.
              </p>
              <div className="bp-success-details">
                <div className="bp-sd-row">
                  <span>Resource</span>
                  <strong>{confirmed.resourceType}</strong>
                </div>
                <div className="bp-sd-row">
                  <span>Date</span>
                  <strong>{confirmed.bookingDate}</strong>
                </div>
                <div className="bp-sd-row">
                  <span>Time</span>
                  <strong>{confirmed.timeSlot}</strong>
                </div>
                <div className="bp-sd-row">
                  <span>Status</span>
                  <strong className="bp-sd-pending">PENDING</strong>
                </div>
              </div>
              <button className="bp-new-btn" onClick={startNew}>
                Make Another Booking
              </button>
            </div>
          )}
        </div>

        {/* ── My Bookings History ── */}
        <div className="bp-history">
          <h3>My Bookings</h3>
          {loading ? (
            <p className="bp-loading">Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <div className="bp-empty">
              <div className="bp-empty-icon">
                <CalendarIcon size={26} color="#94a3b8" />
              </div>
              <p>No bookings yet</p>
              <span>Your booking requests will appear here</span>
            </div>
          ) : (
            <div className="bp-list">
              {bookings.map(b => {
                const s   = STATUS_STYLES[b.status] || STATUS_STYLES.PENDING;
                const res = RESOURCES.find(r => r.type === b.resourceType);
                return (
                  <div key={b.id} className="bp-item">
                    <div className="bp-item-top">
                      {res && (
                        <span
                          className="bp-item-res-chip"
                          style={{ background: `${res.color}1a`, color: res.color }}
                        >
                          {b.resourceType}
                        </span>
                      )}
                      <span
                        className="bp-status-badge"
                        style={{ background: s.bg, color: s.color }}
                      >
                        <StatusIcon status={b.status} />
                        {b.status}
                      </span>
                    </div>

                    <div className="bp-item-title">
                      {b.title || b.resourceType}
                    </div>

                    <div className="bp-item-meta">
                      {b.bookingDate && <span>📅 {b.bookingDate}</span>}
                      {b.timeSlot    && <span>🕐 {b.timeSlot}</span>}
                      {b.referenceId && (
                        <span className="bp-item-ref">{b.referenceId}</span>
                      )}
                    </div>

                    {/* Show rejection reason */}
                    {b.status === 'REJECTED' && b.adminReason && (
                      <div className="bp-rejection-reason">
                        ❌ Reason: {b.adminReason}
                      </div>
                    )}

                    <div className="bp-item-footer">
                      <span className="bp-item-date">
                        Submitted {new Date(b.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </span>

                      {/* Cancel button */}
                      {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                        <button
                          className="bp-cancel-btn"
                          disabled={cancellingId === b.id}
                          onClick={() => handleCancel(b.id)}
                        >
                          {cancellingId === b.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
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

export default BookingPage;