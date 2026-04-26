import { useState, useEffect } from 'react';
import { getNotificationPreferences, updateNotificationPreferences } from '../services/api';
import { toast } from 'react-toastify';
import { BellIcon } from '../components/Icons';
import './NotificationPreferencesPage.css';

const CATEGORIES = [
  {
    key: 'BOOKINGS',
    label: 'Booking Notifications',
    description: 'Alerts when your bookings are approved or rejected by an admin',
    color: '#7c3aed',
  },
  {
    key: 'TICKETS',
    label: 'Ticket Notifications',
    description: 'Updates when your support tickets change status or are resolved',
    color: '#d97706',
  },
  {
    key: 'COMMENTS',
    label: 'Comment Notifications',
    description: 'Alerts when someone adds a comment to your tickets',
    color: '#4361ee',
  },
];

const NotificationPreferencesPage = () => {
  const [preferences, setPreferences] = useState({ BOOKINGS: true, TICKETS: true, COMMENTS: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getNotificationPreferences()
      .then((res) => setPreferences(res.data))
      .catch(() => toast.error('Failed to load preferences'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateNotificationPreferences(preferences);
      toast.success('Preferences saved successfully');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = Object.values(preferences).filter(Boolean).length;

  if (loading) {
    return (
      <div className="np-page">
        <p className="np-loading">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="np-page">
      <div className="np-header">
        <div className="np-title-row">
          <BellIcon size={18} color="#0f172a" />
          <h2>Notification Preferences</h2>
          <span className="np-status-pill">{enabledCount} of {CATEGORIES.length} enabled</span>
        </div>
        <p className="np-subtitle">
          Choose which categories of notifications you want to receive. Disabled categories
          will be silently suppressed — no notification will be created or sent.
        </p>
      </div>

      <div className="np-card-list">
        {CATEGORIES.map((cat) => {
          const enabled = preferences[cat.key] ?? true;
          return (
            <div key={cat.key} className={`np-card ${enabled ? 'enabled' : 'disabled'}`}>
              <div className="np-card-left">
                <div className="np-color-bar" style={{ background: cat.color }} />
                <div className="np-card-text">
                  <span className="np-cat-label">{cat.label}</span>
                  <span className="np-cat-desc">{cat.description}</span>
                </div>
              </div>
              <label className="np-toggle">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => handleToggle(cat.key)}
                />
                <span className="np-slider" />
              </label>
            </div>
          );
        })}
      </div>

      <div className="np-footer">
        <button className="np-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};

export default NotificationPreferencesPage;
