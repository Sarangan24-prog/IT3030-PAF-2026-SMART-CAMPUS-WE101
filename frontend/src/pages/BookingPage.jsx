import { useState, useEffect, useCallback } from 'react';
import QRCode from 'react-qr-code';
import { createBooking, getMyBookings, cancelBooking, getAllResources } from '../services/api';
import {
  CalendarIcon, CheckCircleIcon, XCircleIcon, RefreshIcon,
  BuildingIcon, UsersIcon, MapPinIcon, SettingsIcon,
  MessageCircleIcon, TagIcon, ChevronRightIcon, CheckIcon,
} from '../components/Icons';
import './BookingPage.css';

const RESOURCE_STYLES = {
  LECTURE_HALL: { icon: 'building', color: '#3b82f6' },
  LAB: { icon: 'settings', color: '#8b5cf6' },
  AUDITORIUM: { icon: 'users', color: '#ec4899' },
  MEETING_ROOM: { icon: 'message', color: '#10b981' },
  PROJECTOR: { icon: 'tag', color: '#f97316' },
  CAMERA: { icon: 'tag', color: '#f59e0b' },
  MICROPHONE: { icon: 'tag', color: '#64748b' },
  OTHER: { icon: 'mappin', color: '#77A365' },
};

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

const formatResourceType = (type = '') =>
  String(type || 'Resource').replaceAll('_', ' ');

const getResourceStyle = (type) =>
  RESOURCE_STYLES[type] || RESOURCE_STYLES.OTHER;

const BookingPage = () => {
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [resources, setResources]       = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState('');
  const [step, setStep]                 = useState(1);
  const [form, setForm]                 = useState({
    resourceId: '', resourceName: '', resourceType: '', location: '', bookingDate: '',
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

  useEffect(() => {
    const fetchResources = async () => {
      setResourcesLoading(true);
      setResourcesError('');
      try {
        const res = await getAllResources();
        const bookableResources = (res.data || []).filter((resource) =>
          resource.bookable !== false && resource.status !== 'OUT_OF_SERVICE'
        );
        setResources(bookableResources);
      } catch {
        setResourcesError('Failed to load facilities. Please try again.');
      } finally {
        setResourcesLoading(false);
      }
    };

    fetchResources();
  }, []);

  const canAdvance1 = form.resourceId && form.bookingDate && form.timeSlot;
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

  const handleResourceSelect = (resource) => {
    setForm(f => ({
      ...f,
      resourceId: resource.id,
      resourceName: resource.name || resource.code || formatResourceType(resource.type),
      resourceType: resource.type || '',
      location: resource.location || resource.building || '',
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
        resourceId:        form.resourceId,
        resourceName:      form.resourceName,
        location:          form.location,
        
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
      resourceId: '', resourceName: '', resourceType: '', location: '', bookingDate: '',
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
              {resourcesLoading ? (
                <p className="bp-loading bp-resource-loading">Loading facilities...</p>
              ) : resourcesError ? (
                <div className="bp-error-banner">{resourcesError}</div>
              ) : resources.length === 0 ? (
                <div className="bp-empty bp-resource-empty">
                  <div className="bp-empty-icon">
                    <BuildingIcon size={26} color="#94a3b8" />
                  </div>
                  <p>No bookable facilities found</p>
                  <span>Add a facility from Admin Facilities and turn on bookable access.</span>
                </div>
              ) : (
                <div className="bp-resource-grid">
                  {resources.map(r => {
                    const style = getResourceStyle(r.type);
                    const label = r.name || r.code || formatResourceType(r.type);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        className={`bp-resource-card ${form.resourceId === r.id ? 'selected' : ''}`}
                        style={{ '--rc': style.color }}
                        onClick={() => handleResourceSelect(r)}
                      >
                        <div className="bp-rc-icon" style={{ background: `${style.color}22` }}>
                          <ResourceIcon icon={style.icon} color={style.color} size={22} />
                        </div>
                        <span>{label}</span>
                        <small>{formatResourceType(r.type)}{r.building ? ` - ${r.building}` : ''}</small>
                      </button>
                    );
                  })}
                </div>
              )}

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
                  <span className="bp-chip-res">{form.resourceName}</span>
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
                  <strong>{confirmed.resourceName || confirmed.resourceType}</strong>
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
                const style = getResourceStyle(b.resourceType);
                return (
                  <div key={b.id} className="bp-item">
                    <div className="bp-item-top">
                      <span
                        className="bp-item-res-chip"
                        style={{ background: `${style.color}1a`, color: style.color }}
                      >
                        {b.resourceName || formatResourceType(b.resourceType)}
                      </span>
                      <span
                        className="bp-status-badge"
                        style={{ background: s.bg, color: s.color }}
                      >
                        <StatusIcon status={b.status} />
                        {b.status}
                      </span>
                    </div>

                    <div className="bp-item-title">
                      {b.title || b.resourceName || formatResourceType(b.resourceType)}
                    </div>

                    <div className="bp-item-meta">
                      {b.bookingDate && <span>📅 {b.bookingDate}</span>}
                      {b.timeSlot    && <span>🕐 {b.timeSlot}</span>}
                      {b.referenceId && (
                        <span className="bp-item-ref">{b.referenceId}</span>
                      )}
                    </div>
                   {b.status === 'APPROVED' && (
  <div className="bp-qr-section">
    <p className="bp-qr-label">Scan to verify booking</p>
    <QRCode
      value={`http://localhost:3000/verify/${b.id}`}
      size={100}
    />
    <p className="bp-qr-ref">
      {b.referenceId ? b.referenceId : 'BK-' + b.id.slice(-6).toUpperCase()}
    </p>
  </div>


)}

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
